const MAX_BINARY_BYTES = 2_200_000;
const MAX_TEXT_CHARS = 120_000;
export const MAX_CHAT_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_PAYLOAD_CHARS = 3_200_000;
export const CHAT_ATTACHMENT_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  ".txt",
  ".md",
  ".csv",
  ".json",
].join(",");

const TEXT_EXTENSIONS = /\.(txt|md|csv|json)$/i;
const TEXT_MEDIA_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
]);
const BINARY_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

function canvasBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function compressedImage(file) {
  if (file.size <= MAX_BINARY_BYTES) return file;
  if (file.type === "image/gif") throw new Error("GIF больше 2,2 МБ. Уменьши файл перед отправкой");
  if (typeof createImageBitmap !== "function") throw new Error("Изображение больше 2,2 МБ. Уменьши его перед отправкой");

  const bitmap = await createImageBitmap(file);
  const attempts = [
    { maxSide: 1800, quality: 0.82 },
    { maxSide: 1400, quality: 0.74 },
    { maxSide: 1100, quality: 0.68 },
  ];
  try {
    for (const attempt of attempts) {
      const scale = Math.min(1, attempt.maxSide / Math.max(bitmap.width, bitmap.height));
      const width = Math.max(1, Math.round(bitmap.width * scale));
      const height = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
      const blob = await canvasBlob(canvas, "image/jpeg", attempt.quality);
      if (blob && blob.size <= MAX_BINARY_BYTES) {
        const baseName = file.name.replace(/\.[^.]+$/, "") || "изображение";
        return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
      }
    }
  } finally {
    bitmap.close();
  }
  throw new Error("Не удалось уменьшить изображение до 2,2 МБ");
}

export function attachmentPayloadSize(attachment) {
  return String(attachment?.data || attachment?.content || "").length;
}

export function attachmentMeta(attachment) {
  return {
    name: String(attachment?.name || "Файл").slice(0, 180),
    mediaType: String(attachment?.mediaType || "").slice(0, 100),
    size: Math.max(0, Number(attachment?.size) || 0),
    kind: attachment?.kind === "text" ? "text" : attachment?.kind === "image" ? "image" : "file",
  };
}

export function persistableMessages(messages) {
  return (Array.isArray(messages) ? messages : []).map((message) => ({
    ...message,
    attachments: Array.isArray(message.attachments)
      ? message.attachments.map(attachmentMeta).slice(0, MAX_CHAT_ATTACHMENTS)
      : [],
  }));
}

export async function prepareChatAttachment(originalFile) {
  const file = originalFile.type.startsWith("image/") ? await compressedImage(originalFile) : originalFile;
  const isText = TEXT_MEDIA_TYPES.has(file.type) || (!file.type && TEXT_EXTENSIONS.test(file.name));
  if (isText) {
    if (file.size > 300_000) throw new Error(`${file.name}: текстовый файл слишком большой`);
    const content = (await file.text()).slice(0, MAX_TEXT_CHARS);
    if (!content.trim()) throw new Error(`${file.name}: файл пустой`);
    return {
      id: newId(),
      name: file.name,
      mediaType: file.type || "text/plain",
      size: file.size,
      kind: "text",
      content,
    };
  }
  if (!BINARY_MEDIA_TYPES.has(file.type)) throw new Error(`${file.name}: этот формат пока не поддерживается`);
  if (file.size > MAX_BINARY_BYTES) throw new Error(`${file.name}: файл больше 2,2 МБ`);
  return {
    id: newId(),
    name: file.name,
    mediaType: file.type,
    size: file.size,
    kind: file.type.startsWith("image/") ? "image" : "file",
    data: await fileAsDataUrl(file),
  };
}

export function formatAttachmentSize(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} Б`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} КБ`;
  return `${(value / (1024 * 1024)).toFixed(1)} МБ`;
}
