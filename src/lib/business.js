const MAX_RESOURCES = 80;
const MAX_LIST_ITEMS = 10;
const MAX_TEXT_LENGTH = 3000;

const cleanText = (value, max = MAX_TEXT_LENGTH) => String(value || "").trim().slice(0, max);
const cleanList = (value) => Array.isArray(value)
  ? value.map((item) => cleanText(item, 500)).filter(Boolean).slice(0, MAX_LIST_ITEMS)
  : [];
const cleanAttachmentMeta = (value) => Array.isArray(value)
  ? value
    .filter((item) => item && typeof item === "object")
    .slice(0, 4)
    .map((item) => ({
      name: cleanText(item.name, 180) || "Файл",
      mediaType: cleanText(item.mediaType, 100),
      size: Math.max(0, Number(item.size) || 0),
      kind: ["text", "image", "file"].includes(item.kind) ? item.kind : "file",
    }))
  : [];

export function emptyBusinessKnowledge() {
  return { version: 1, resources: [] };
}

export function migrateBusinessKnowledge(value) {
  const resources = Array.isArray(value?.resources) ? value.resources : [];
  return {
    version: 1,
    resources: resources
      .filter((item) => item && typeof item === "object")
      .slice(-MAX_RESOURCES)
      .map((item, index) => ({
        id: cleanText(item.id, 120) || `resource-${Date.now()}-${index}`,
        type: ["book", "youtube", "article", "note"].includes(item.type) ? item.type : "note",
        title: cleanText(item.title, 240) || "Источник без названия",
        url: cleanText(item.url, 1000),
        summary: cleanText(item.summary),
        skills: cleanList(item.skills),
        principles: cleanList(item.principles),
        frameworks: cleanList(item.frameworks),
        decisionQuestions: cleanList(item.decisionQuestions),
        createdAt: cleanText(item.createdAt, 80) || new Date().toISOString(),
        sourceMeta: item.sourceMeta && typeof item.sourceMeta === "object" ? {
          type: cleanText(item.sourceMeta.type, 40),
          title: cleanText(item.sourceMeta.title, 240),
          url: cleanText(item.sourceMeta.url, 1000),
          language: cleanText(item.sourceMeta.language, 40),
          truncated: Boolean(item.sourceMeta.truncated),
          analysisMode: item.sourceMeta.analysisMode === "video" ? "video" : "captions",
        } : null,
      })),
  };
}

export function migrateBusinessChat(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string")
    .slice(-60)
    .map((item) => {
      const model = cleanText(item.model, 120);
      return {
        role: item.role,
        content: cleanText(item.content, 12000),
        ...(model ? { model } : {}),
        source: item.source && typeof item.source === "object" ? item.source : null,
        attachments: cleanAttachmentMeta(item.attachments),
      };
    });
}

export function businessResourceContext(resource) {
  return [
    `Источник: ${resource.title}`,
    resource.type && `Тип: ${resource.type}`,
    resource.url && `Ссылка: ${resource.url}`,
    resource.summary && `Краткое содержание: ${resource.summary}`,
    resource.skills?.length && `Навыки: ${resource.skills.join("; ")}`,
    resource.principles?.length && `Принципы: ${resource.principles.join("; ")}`,
    resource.frameworks?.length && `Модели: ${resource.frameworks.join("; ")}`,
    resource.decisionQuestions?.length && `Вопросы для решений: ${resource.decisionQuestions.join("; ")}`,
  ].filter(Boolean).join("\n");
}
