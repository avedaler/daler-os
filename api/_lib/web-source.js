import { lookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import * as cheerio from "cheerio";

const MAX_RESPONSE_BYTES = 1_500_000;
const MAX_CONTENT_CHARS = 60_000;
const MAX_REDIRECTS = 3;
const ALLOWED_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "text/plain",
  "text/markdown",
  "application/json",
];

function sourceError(message, statusCode = 422) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function ipv4Parts(address) {
  const parts = String(address).split(".").map(Number);
  return parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)
    ? parts
    : null;
}

export function isPrivateAddress(address) {
  const value = String(address || "").toLowerCase().split("%")[0];
  const family = isIP(value);
  if (family === 4) {
    const parts = ipv4Parts(value);
    if (!parts) return true;
    const [a, b] = parts;
    return a === 0
      || a === 10
      || a === 127
      || (a === 100 && b >= 64 && b <= 127)
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 168))
      || (a === 198 && (b === 18 || b === 19))
      || a >= 224;
  }
  if (family === 6) {
    if (value === "::" || value === "::1") return true;
    if (value.startsWith("::ffff:")) return isPrivateAddress(value.slice(7));
    const first = Number.parseInt(value.split(":")[0] || "0", 16);
    return (first & 0xfe00) === 0xfc00
      || (first & 0xffc0) === 0xfe80
      || (first & 0xff00) === 0xff00
      || value.startsWith("2001:db8:");
  }
  return true;
}

export function validatePublicUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    throw sourceError("Ссылка имеет некорректный формат", 400);
  }
  if (!["http:", "https:"].includes(url.protocol)) throw sourceError("Поддерживаются только публичные HTTP и HTTPS ссылки", 400);
  if (url.username || url.password) throw sourceError("Ссылки с логином или паролем не поддерживаются", 400);
  if ((url.protocol === "https:" && url.port && url.port !== "443") || (url.protocol === "http:" && url.port && url.port !== "80")) {
    throw sourceError("Ссылки на нестандартные порты не поддерживаются", 400);
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname === "localhost" || hostname.endsWith(".local") || hostname.endsWith(".internal")) {
    throw sourceError("Локальные и внутренние ссылки недоступны", 400);
  }
  if (isIP(hostname) && isPrivateAddress(hostname)) throw sourceError("Локальные и внутренние адреса недоступны", 400);
  url.hash = "";
  return url;
}

async function resolvePublicAddress(hostname) {
  if (isIP(hostname)) return { address: hostname, family: isIP(hostname) };
  let addresses;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw sourceError("Не удалось найти сайт по этой ссылке");
  }
  if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) {
    throw sourceError("Ссылка ведёт на недоступный внутренний адрес", 400);
  }
  return addresses[0];
}

async function requestPage(url) {
  const resolved = await resolvePublicAddress(url.hostname);
  const transport = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const request = transport.get(url, {
      headers: {
        Accept: "text/html,application/xhtml+xml,text/plain,application/json;q=0.8",
        "Accept-Encoding": "identity",
        "User-Agent": "DALER-OS/3.0 (+https://daler-os.vercel.app)",
      },
      lookup: (_hostname, options, callback) => options?.all
        ? callback(null, [resolved])
        : callback(null, resolved.address, resolved.family),
      timeout: 12_000,
    }, (response) => {
      const status = response.statusCode || 0;
      if (status >= 300 && status < 400 && response.headers.location) {
        response.resume();
        resolve({ redirect: new URL(response.headers.location, url) });
        return;
      }
      if (status < 200 || status >= 300) {
        response.resume();
        reject(sourceError(`Сайт вернул ошибку ${status || "без кода"}`));
        return;
      }
      const contentType = String(response.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
      if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
        response.resume();
        reject(sourceError(contentType === "application/pdf"
          ? "PDF по ссылке пока не читается. Прикрепи PDF к ИИ-диалогу"
          : "По ссылке нет поддерживаемого текстового материала"));
        return;
      }
      const declaredLength = Number(response.headers["content-length"] || 0);
      if (declaredLength > MAX_RESPONSE_BYTES) {
        response.resume();
        reject(sourceError("Страница слишком большая для безопасного анализа", 413));
        return;
      }
      const chunks = [];
      let size = 0;
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size > MAX_RESPONSE_BYTES) {
          request.destroy(sourceError("Страница слишком большая для безопасного анализа", 413));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => resolve({
        buffer: Buffer.concat(chunks),
        contentType,
        finalUrl: url,
      }));
    });
    request.on("timeout", () => request.destroy(sourceError("Сайт отвечает слишком долго")));
    request.on("error", (error) => reject(error.statusCode ? error : sourceError("Не удалось прочитать страницу")));
  });
}

function cleanPiece(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function extractReadableHtml(buffer, url = "https://example.com/") {
  const html = Buffer.isBuffer(buffer) ? buffer.toString("utf8") : String(buffer || "");
  const $ = cheerio.load(html);
  $("script, style, noscript, svg, canvas, iframe, nav, footer, form, dialog, [aria-hidden='true']").remove();
  const title = cleanPiece(
    $("meta[property='og:title']").attr("content")
      || $("meta[name='twitter:title']").attr("content")
      || $("title").first().text()
      || $("h1").first().text()
  ).slice(0, 240);
  const root = $("article").first().length
    ? $("article").first()
    : $("main").first().length
      ? $("main").first()
      : $("body");
  const pieces = [];
  const seen = new Set();
  root.find("h1, h2, h3, h4, p, li, blockquote, pre, td").each((_index, element) => {
    const piece = cleanPiece($(element).text());
    if (piece.length < 20 || seen.has(piece)) return;
    seen.add(piece);
    pieces.push(piece);
  });
  const fallback = cleanPiece(root.text());
  const content = (pieces.length ? pieces.join("\n") : fallback).slice(0, MAX_CONTENT_CHARS);
  if (content.length < 80) throw sourceError("На странице недостаточно доступного текста");
  return {
    title: title || new URL(url).hostname,
    content,
    truncated: (pieces.length ? pieces.join("\n") : fallback).length > MAX_CONTENT_CHARS,
  };
}

export async function fetchPublicWebSource(value) {
  let url = validatePublicUrl(value);
  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const result = await requestPage(url);
    if (result.redirect) {
      if (redirectCount === MAX_REDIRECTS) throw sourceError("Слишком много перенаправлений");
      url = validatePublicUrl(result.redirect.toString());
      continue;
    }
    if (result.contentType === "text/html" || result.contentType === "application/xhtml+xml") {
      const parsed = extractReadableHtml(result.buffer, result.finalUrl.toString());
      return {
        type: "web",
        title: parsed.title,
        url: result.finalUrl.toString(),
        content: parsed.content,
        truncated: parsed.truncated,
      };
    }
    const content = result.buffer.toString("utf8").replace(/\0/g, "").trim().slice(0, MAX_CONTENT_CHARS);
    if (content.length < 20) throw sourceError("По ссылке нет доступного текста");
    return {
      type: "web",
      title: result.finalUrl.hostname,
      url: result.finalUrl.toString(),
      content,
      truncated: result.buffer.length > MAX_CONTENT_CHARS,
    };
  }
  throw sourceError("Не удалось прочитать ссылку");
}
