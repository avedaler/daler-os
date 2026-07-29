import { YoutubeTranscript } from "youtube-transcript";

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtu.be"]);
const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseYouTubeId(value) {
  const text = String(value || "");
  const urlMatch = text.match(/https?:\/\/[^\s<>"']+/i);
  if (!urlMatch) return "";
  try {
    const url = new URL(urlMatch[0].replace(/[),.;!?]+$/, ""));
    if (!YOUTUBE_HOSTS.has(url.hostname.toLowerCase())) return "";
    const candidate = url.hostname.includes("youtu.be")
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v")
        || (url.pathname.startsWith("/shorts/") ? url.pathname.split("/")[2] : "")
        || (url.pathname.startsWith("/live/") ? url.pathname.split("/")[2] : "");
    return VIDEO_ID_PATTERN.test(candidate || "") ? candidate : "";
  } catch {
    return "";
  }
}

function extractBalanced(source, marker, opener, closer) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) return "";
  const start = source.indexOf(opener, markerIndex + marker.length);
  if (start < 0) return "";
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === "\"") inString = false;
      continue;
    }
    if (char === "\"") inString = true;
    else if (char === opener) depth += 1;
    else if (char === closer) {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }
  return "";
}

export function parseCaptionTracks(html) {
  const raw = extractBalanced(html, "\"captionTracks\":", "[", "]");
  if (!raw) return [];
  try {
    const tracks = JSON.parse(raw);
    return Array.isArray(tracks) ? tracks.filter((item) => item?.baseUrl) : [];
  } catch {
    return [];
  }
}

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${String(value || "")}"`);
  } catch {
    return String(value || "");
  }
}

function videoTitle(html) {
  const match = html.match(/"title":"((?:\\.|[^"\\])*)","lengthSeconds"/);
  return match ? decodeJsonString(match[1]) : "Видео YouTube";
}

function timestamp(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(Number(milliseconds || 0) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function captionsToText(payload) {
  const rows = [];
  for (const event of payload?.events || []) {
    const text = (event?.segs || []).map((segment) => segment?.utf8 || "").join("").replace(/\s+/g, " ").trim();
    if (text) rows.push(`[${timestamp(event.tStartMs)}] ${text}`);
  }
  return rows.join("\n");
}

export async function getYoutubeTranscript(videoId, { maxCharacters = 60000 } = {}) {
  if (!VIDEO_ID_PATTERN.test(videoId || "")) throw new Error("Некорректная ссылка YouTube");
  const url = `https://www.youtube.com/watch?v=${videoId}&hl=ru`;
  const [segments, pageResponse] = await Promise.all([
    YoutubeTranscript.fetchTranscript(videoId),
    fetch(url, {
      headers: {
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.7",
        "User-Agent": "Mozilla/5.0 (compatible; DALER-OS/3.0; +https://daler-os.vercel.app)",
      },
    }).catch(() => null),
  ]);
  if (!segments?.length) throw new Error("У видео нет доступных субтитров");
  const multiplier = Math.max(...segments.map((item) => Number(item.offset || 0))) > 10000 ? 1 : 1000;
  const fullText = segments
    .map((item) => `[${timestamp(Number(item.offset || 0) * multiplier)}] ${String(item.text || "").replace(/\s+/g, " ").trim()}`)
    .filter((line) => !line.endsWith("] "))
    .join("\n");
  if (!fullText) throw new Error("Субтитры видео пусты");
  const html = pageResponse?.ok ? await pageResponse.text() : "";

  return {
    videoId,
    url,
    title: videoTitle(html),
    language: segments[0]?.lang || "",
    transcript: fullText.slice(0, maxCharacters),
    truncated: fullText.length > maxCharacters,
  };
}
