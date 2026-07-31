const MAX_RESOURCES = 60;
const MAX_EXPERIMENTS = 80;
const MAX_LIST_ITEMS = 8;

const cleanText = (value, max = 3000) => String(value || "").trim().slice(0, max);
const cleanList = (value, max = MAX_LIST_ITEMS) => Array.isArray(value)
  ? value.map((item) => cleanText(item, 500)).filter(Boolean).slice(0, max)
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

const QUALITY_LEVELS = new Set(["strong", "moderate", "weak", "unknown"]);
const CLAIM_SUPPORT = new Set(["supported", "plausible", "unsupported"]);
const EXPERIMENT_STATUS = new Set(["active", "completed", "stopped"]);
const CHECK_RESULTS = new Set(["better", "same", "worse"]);
const VERDICTS = new Set(["untested", "works", "mixed", "no_effect", "harmful"]);

export function emptyDevelopmentKnowledge() {
  return { version: 1, resources: [], experiments: [] };
}

function migratePractice(item, resourceIndex, practiceIndex) {
  return {
    id: cleanText(item?.id, 120) || `practice-${resourceIndex}-${practiceIndex}`,
    title: cleanText(item?.title, 240) || "Практика без названия",
    protocol: cleanText(item?.protocol),
    durationDays: Math.max(3, Math.min(90, Number(item?.durationDays) || 14)),
    metric: cleanText(item?.metric, 500) || "Факт выполнения и субъективный эффект",
    evidence: QUALITY_LEVELS.has(item?.evidence) ? item.evidence : "unknown",
    risks: cleanList(item?.risks, 6),
  };
}

export function migrateDevelopmentKnowledge(value) {
  const resources = Array.isArray(value?.resources) ? value.resources : [];
  const experiments = Array.isArray(value?.experiments) ? value.experiments : [];
  return {
    version: 1,
    resources: resources
      .filter((item) => item && typeof item === "object")
      .slice(-MAX_RESOURCES)
      .map((item, resourceIndex) => ({
        id: cleanText(item.id, 120) || `development-resource-${Date.now()}-${resourceIndex}`,
        type: ["youtube", "article", "note"].includes(item.type) ? item.type : "article",
        title: cleanText(item.title, 240) || "Источник без названия",
        url: cleanText(item.url, 1000),
        summary: cleanText(item.summary),
        quality: {
          level: QUALITY_LEVELS.has(item.quality?.level) ? item.quality.level : "unknown",
          reason: cleanText(item.quality?.reason, 800),
        },
        claims: Array.isArray(item.claims) ? item.claims
          .filter((claim) => claim && typeof claim === "object")
          .slice(0, 8)
          .map((claim) => ({
            text: cleanText(claim.text, 700),
            support: CLAIM_SUPPORT.has(claim.support) ? claim.support : "plausible",
          }))
          .filter((claim) => claim.text) : [],
        practices: Array.isArray(item.practices)
          ? item.practices.slice(0, 8).map((practice, practiceIndex) => migratePractice(practice, resourceIndex, practiceIndex))
          : [],
        warnings: cleanList(item.warnings, 8),
        createdAt: cleanText(item.createdAt, 80) || new Date().toISOString(),
        sourceMeta: item.sourceMeta && typeof item.sourceMeta === "object" ? {
          type: cleanText(item.sourceMeta.type, 40),
          title: cleanText(item.sourceMeta.title, 240),
          url: cleanText(item.sourceMeta.url, 1000),
          language: cleanText(item.sourceMeta.language, 40),
          truncated: Boolean(item.sourceMeta.truncated),
          analysisMode: ["video", "captions", "web"].includes(item.sourceMeta.analysisMode)
            ? item.sourceMeta.analysisMode
            : "web",
        } : null,
      })),
    experiments: experiments
      .filter((item) => item && typeof item === "object")
      .slice(-MAX_EXPERIMENTS)
      .map((item, index) => ({
        id: cleanText(item.id, 120) || `development-experiment-${Date.now()}-${index}`,
        resourceId: cleanText(item.resourceId, 120),
        practiceId: cleanText(item.practiceId, 120),
        title: cleanText(item.title, 240) || "Личный эксперимент",
        protocol: cleanText(item.protocol),
        metric: cleanText(item.metric, 500),
        durationDays: Math.max(3, Math.min(90, Number(item.durationDays) || 14)),
        status: EXPERIMENT_STATUS.has(item.status) ? item.status : "active",
        startedAt: cleanText(item.startedAt, 40) || new Date().toISOString().slice(0, 10),
        endedAt: cleanText(item.endedAt, 40),
        verdict: VERDICTS.has(item.verdict) ? item.verdict : "untested",
        reflection: cleanText(item.reflection, 1200),
        checkIns: Array.isArray(item.checkIns) ? item.checkIns
          .filter((checkIn) => checkIn && typeof checkIn === "object" && CHECK_RESULTS.has(checkIn.result))
          .slice(-90)
          .map((checkIn, checkIndex) => ({
            id: cleanText(checkIn.id, 120) || `check-${index}-${checkIndex}`,
            date: cleanText(checkIn.date, 20),
            result: checkIn.result,
            note: cleanText(checkIn.note, 700),
          })) : [],
      })),
  };
}

export function migrateDevelopmentChat(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string")
    .slice(-60)
    .map((item) => {
      const model = cleanText(item.model, 120);
      return {
        role: item.role,
        content: cleanText(item.content, 20000),
        ...(model ? { model } : {}),
        source: item.source && typeof item.source === "object" ? item.source : null,
        attachments: cleanAttachmentMeta(item.attachments),
      };
    });
}

export function developmentResourceContext(resource) {
  return [
    `Источник: ${resource.title}`,
    resource.url && `Ссылка: ${resource.url}`,
    resource.summary && `Конспект: ${resource.summary}`,
    `Качество источника: ${resource.quality?.level || "unknown"}${resource.quality?.reason ? ` — ${resource.quality.reason}` : ""}`,
    resource.claims?.length && `Утверждения: ${resource.claims.map((claim) => `${claim.text} [${claim.support}]`).join("; ")}`,
    resource.practices?.length && `Практики: ${resource.practices.map((practice) => `${practice.title}: ${practice.protocol}; тест ${practice.durationDays} дн.; метрика: ${practice.metric}; доказательность: ${practice.evidence}`).join("; ")}`,
    resource.warnings?.length && `Ограничения: ${resource.warnings.join("; ")}`,
  ].filter(Boolean).join("\n");
}

export function experimentSignal(experiment) {
  const checkIns = experiment?.checkIns || [];
  if (checkIns.length < 3) return "Недостаточно данных";
  const better = checkIns.filter((item) => item.result === "better").length;
  const worse = checkIns.filter((item) => item.result === "worse").length;
  if (better - worse >= 2) return "Предварительно работает";
  if (worse - better >= 2) return "Предварительно не работает";
  return "Результат смешанный";
}

export function developmentKnowledgeContext(knowledge) {
  const resources = (knowledge?.resources || []).slice(-20);
  const experiments = knowledge?.experiments || [];
  return [
    resources.length && `СОХРАНЁННАЯ БАЗА РАЗВИТИЯ:\n${resources.map(developmentResourceContext).join("\n\n")}`,
    experiments.length && `ЛИЧНЫЕ ЭКСПЕРИМЕНТЫ:\n${experiments.slice(-30).map((experiment) => [
      `${experiment.title} [${experiment.status}; ${experiment.verdict}; ${experimentSignal(experiment)}]`,
      `Протокол: ${experiment.protocol}`,
      `Метрика: ${experiment.metric}`,
      `Отметки: ${(experiment.checkIns || []).map((item) => `${item.date}: ${item.result}${item.note ? ` — ${item.note}` : ""}`).join("; ") || "нет"}`,
      experiment.reflection && `Вывод пользователя: ${experiment.reflection}`,
    ].filter(Boolean).join("\n")).join("\n\n")}`,
  ].filter(Boolean).join("\n\n").slice(0, 60_000);
}
