import { useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  CircleMinus,
  CircleStop,
  ExternalLink,
  FlaskConical,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from "lucide-react";
import { aiCloudContext } from "../lib/cloud";
import {
  developmentKnowledgeContext,
  experimentSignal,
} from "../lib/development";
import AiChat from "./AiChat";
import { Btn, Field, Section, StatusBadge } from "./atoms";

const EMPTY_DRAFT = { title: "", url: "", content: "" };
const YOUTUBE_URL_PATTERN = /(?:youtube\.com|youtu\.be)/i;
const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/gi;
const QUALITY_LABELS = {
  strong: "сильная база",
  moderate: "умеренная база",
  weak: "слабая база",
  unknown: "не подтверждено",
};
const SUPPORT_LABELS = {
  supported: "поддержано источником",
  plausible: "правдоподобно",
  unsupported: "не подтверждено",
};
const RESULT_OPTIONS = [
  { value: "better", label: "Лучше", Icon: ThumbsUp },
  { value: "same", label: "Без изменений", Icon: CircleMinus },
  { value: "worse", label: "Хуже", Icon: ThumbsDown },
];
const VERDICT_OPTIONS = [
  { value: "works", label: "Работает" },
  { value: "mixed", label: "Смешанно" },
  { value: "no_effect", label: "Не работает" },
  { value: "harmful", label: "Остановить" },
];
const VERDICT_LABELS = Object.fromEntries(VERDICT_OPTIONS.map((item) => [item.value, item.label]));

function newId(prefix) {
  return globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cleanDetectedUrl(value) {
  return String(value || "").replace(/[.,;:!?]+$/, "");
}

export default function DevelopmentAdvisor({
  knowledge,
  updateKnowledge,
  messages,
  updateMessages,
  shareOptions,
  date,
}) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [checkInNotes, setCheckInNotes] = useState({});
  const learningUrlsRef = useRef(new Set());
  const resources = knowledge?.resources || [];
  const experiments = knowledge?.experiments || [];
  const activeExperiments = experiments.filter((item) => item.status === "active");
  const completedExperiments = experiments.filter((item) => item.status !== "active").slice(-8).reverse();
  const aiContext = useMemo(() => developmentKnowledgeContext(knowledge), [knowledge]);

  const patchDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const extractSource = async (sourceDraft, { automatic = false } = {}) => {
    const url = cleanDetectedUrl(sourceDraft.url);
    const content = String(sourceDraft.content || "").trim();
    if (!url && !content) {
      setError("Добавь публичную ссылку или заметку");
      return null;
    }
    if (url && resources.some((resource) => resource.url === url)) {
      if (!automatic) setNotice("Эта ссылка уже сохранена в базе развития");
      return null;
    }
    if (url && learningUrlsRef.current.has(url)) return null;
    if (url) learningUrlsRef.current.add(url);
    if (!automatic) {
      setExtracting(true);
      setError("");
      setNotice("");
    } else {
      setNotice("Нашёл новую ссылку в диалоге. Извлекаю практики в базу развития…");
    }
    try {
      const cloud = await aiCloudContext();
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "development",
          task: "ingest",
          messages: [{ role: "user", content: "Оцени источник и извлеки практики для личного эксперимента." }],
          resource: {
            type: YOUTUBE_URL_PATTERN.test(url) ? "youtube" : url ? "article" : "note",
            title: sourceDraft.title || "",
            url,
            content,
          },
          cloud,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.knowledge) throw new Error(payload.error || "Не удалось изучить источник");
      const source = payload.source || null;
      const resourceId = newId("development-source");
      const resource = {
        id: resourceId,
        type: YOUTUBE_URL_PATTERN.test(url) ? "youtube" : url ? "article" : "note",
        title: sourceDraft.title?.trim() || source?.title || "Источник без названия",
        url: url || source?.url || "",
        ...payload.knowledge,
        practices: (payload.knowledge.practices || []).map((practice) => ({
          ...practice,
          id: newId("development-practice"),
        })),
        createdAt: new Date().toISOString(),
        sourceMeta: source,
      };
      updateKnowledge((current) => ({
        ...current,
        resources: [
          ...(current?.resources || []).filter((item) => !resource.url || item.url !== resource.url),
          resource,
        ],
      }));
      if (!automatic) setDraft(EMPTY_DRAFT);
      setNotice(`«${resource.title}» изучен: найдено практик ${resource.practices.length}. ИИ будет учитывать источник автоматически`);
      return resource;
    } catch (requestError) {
      setError(requestError.message || "Не удалось изучить источник");
      return null;
    } finally {
      if (url) learningUrlsRef.current.delete(url);
      if (!automatic) setExtracting(false);
    }
  };

  const learnLinksFromMessage = ({ content }) => {
    const urls = [...new Set((String(content || "").match(URL_PATTERN) || []).map(cleanDetectedUrl))].slice(0, 3);
    for (const url of urls) extractSource({ title: "", url, content: "" }, { automatic: true });
  };

  const removeResource = (id) => {
    updateKnowledge((current) => ({
      ...current,
      resources: (current?.resources || []).filter((item) => item.id !== id),
    }));
  };

  const startExperiment = (resource, practice) => {
    if (activeExperiments.some((item) => item.practiceId === practice.id)) {
      setNotice("Эта практика уже проверяется");
      return;
    }
    if (activeExperiments.length >= 3) {
      setError("Одновременно можно проверять не больше трёх практик");
      return;
    }
    const experiment = {
      id: newId("development-experiment"),
      resourceId: resource.id,
      practiceId: practice.id,
      title: practice.title,
      protocol: practice.protocol,
      metric: practice.metric,
      durationDays: practice.durationDays,
      status: "active",
      startedAt: date,
      endedAt: "",
      verdict: "untested",
      reflection: "",
      checkIns: [],
    };
    updateKnowledge((current) => ({
      ...current,
      experiments: [...(current?.experiments || []), experiment],
    }));
    setError("");
    setNotice(`Эксперимент «${practice.title}» запущен на ${practice.durationDays} дней`);
  };

  const recordCheckIn = (experimentId, result) => {
    const note = String(checkInNotes[experimentId] || "").trim();
    updateKnowledge((current) => ({
      ...current,
      experiments: (current?.experiments || []).map((experiment) => {
        if (experiment.id !== experimentId) return experiment;
        const checkIn = {
          id: newId("development-check"),
          date,
          result,
          note,
        };
        return {
          ...experiment,
          checkIns: [...(experiment.checkIns || []).filter((item) => item.date !== date), checkIn],
        };
      }),
    }));
    setCheckInNotes((current) => ({ ...current, [experimentId]: "" }));
    setNotice("Результат дня сохранён");
  };

  const finishExperiment = (experimentId, verdict) => {
    const experiment = experiments.find((item) => item.id === experimentId);
    if (verdict !== "harmful" && (experiment?.checkIns?.length || 0) < 3) {
      setError("Для вывода нужно минимум три дневные отметки. Раньше можно только остановить практику");
      return;
    }
    updateKnowledge((current) => ({
      ...current,
      experiments: (current?.experiments || []).map((experiment) => experiment.id === experimentId ? {
        ...experiment,
        status: verdict === "harmful" ? "stopped" : "completed",
        verdict,
        endedAt: date,
      } : experiment),
    }));
    setError("");
    setNotice("Эксперимент закрыт. ИИ учтёт результат в следующих рекомендациях");
  };

  return <div className="development-advisor">
    <Section kicker="источник → оценка → практика → проверка" title="Лаборатория развития">
      <div className="development-source-form">
        <Field
          label="Ссылка"
          value={draft.url}
          onChange={(url) => patchDraft({ url: cleanDetectedUrl(url) })}
          placeholder="YouTube, статья или публичная веб-страница"
        />
        <Field
          label="Название, необязательно"
          value={draft.title}
          onChange={(title) => patchDraft({ title })}
          placeholder="ИИ определит автоматически"
        />
        <label className="field development-source-note">
          <span>Что тебе важно проверить, необязательно</span>
          <textarea
            rows={3}
            maxLength={6000}
            value={draft.content}
            onChange={(event) => patchDraft({ content: event.target.value })}
            placeholder="Контекст, сомнение или заметка без ссылки…"
          />
        </label>
        <div className="development-source-actions">
          <Btn primary onClick={() => extractSource(draft)} disabled={extracting}>
            <Sparkles size={16} aria-hidden="true" />
            {extracting ? "Анализирую…" : "Изучить и сохранить"}
          </Btn>
        </div>
        {notice && <p className="business-notice">{notice}</p>}
        {error && <p className="ai-error" role="alert">{error}</p>}
        <small className="business-privacy">
          ИИ отделяет утверждения от доказательств, не принимает советы на веру и сохраняет только структурированный конспект. Публичные ссылки из диалога также добавляются автоматически.
        </small>
      </div>

      <div className="business-library">
        <div className="business-library-head">
          <span className="eyebrow"><BookOpenCheck size={14} aria-hidden="true" />Изученные источники</span>
          <strong>{resources.length}</strong>
        </div>
        {resources.length === 0 && <p className="business-empty">Добавь первую ссылку. ИИ оценит качество идей и предложит короткие проверяемые практики.</p>}
        {resources.slice().reverse().map((resource) => <details className="business-resource development-resource" key={resource.id}>
          <summary>
            <span>
              <small>{resource.type === "youtube" ? "YouTube" : resource.type === "note" ? "Заметка" : "Статья"} · {QUALITY_LABELS[resource.quality?.level] || QUALITY_LABELS.unknown}</small>
              <strong>{resource.title}</strong>
            </span>
            <button type="button" className="icon-button" onClick={(event) => { event.preventDefault(); removeResource(resource.id); }} aria-label={`Удалить ${resource.title}`} title="Удалить источник"><Trash2 size={16} aria-hidden="true" /></button>
          </summary>
          <div>
            {resource.url && <a className="development-source-link" href={resource.url} target="_blank" rel="noreferrer">Открыть источник <ExternalLink size={13} aria-hidden="true" /></a>}
            {resource.summary && <p>{resource.summary}</p>}
            {resource.quality?.reason && <div className="business-knowledge-row"><strong>Надёжность</strong><span>{resource.quality.reason}</span></div>}
            {resource.claims?.length > 0 && <div className="business-knowledge-row"><strong>Утверждения</strong><span>{resource.claims.map((claim) => `${claim.text} (${SUPPORT_LABELS[claim.support] || claim.support})`).join(" · ")}</span></div>}
            {resource.warnings?.length > 0 && <div className="business-knowledge-row"><strong>Ограничения</strong><span>{resource.warnings.join(" · ")}</span></div>}
            {resource.practices?.length > 0 && <div className="development-practice-list">
              {resource.practices.map((practice) => <div className="development-practice" key={practice.id}>
                <div>
                  <strong>{practice.title}</strong>
                  <span>{practice.protocol}</span>
                  <small>{practice.durationDays} дн. · метрика: {practice.metric}</small>
                </div>
                <Btn onClick={() => startExperiment(resource, practice)} disabled={activeExperiments.some((item) => item.practiceId === practice.id)}>
                  <FlaskConical size={15} aria-hidden="true" />
                  {activeExperiments.some((item) => item.practiceId === practice.id) ? "В процессе" : "Проверить"}
                </Btn>
              </div>)}
            </div>}
          </div>
        </details>)}
      </div>
    </Section>

    <Section kicker="факт → эффект → вывод" title="Личные эксперименты">
      {activeExperiments.length === 0 && <p className="business-empty">Выбери одну практику из источника и проверь её на себе. Рекомендация станет полезной только после фактов.</p>}
      <div className="development-experiment-list">
        {activeExperiments.map((experiment) => <div className="development-experiment" key={experiment.id}>
          <header>
            <div><StatusBadge tone="gold">отметок {experiment.checkIns?.length || 0} · план {experiment.durationDays} дн.</StatusBadge><strong>{experiment.title}</strong></div>
            <span>{experimentSignal(experiment)}</span>
          </header>
          <p>{experiment.protocol}</p>
          <small>Метрика: {experiment.metric}</small>
          <Field
            label="Факт или наблюдение сегодня"
            value={checkInNotes[experiment.id] || ""}
            onChange={(value) => setCheckInNotes((current) => ({ ...current, [experiment.id]: value }))}
            placeholder="Что сделал и что изменилось?"
          />
          <div className="development-result-actions" role="group" aria-label={`Результат ${experiment.title}`}>
            {RESULT_OPTIONS.map(({ value, label, Icon }) => <Btn key={value} onClick={() => recordCheckIn(experiment.id, value)}><Icon size={15} aria-hidden="true" />{label}</Btn>)}
          </div>
          {experiment.checkIns?.length > 0 && <div className="development-checkins">
            {experiment.checkIns.slice(-5).reverse().map((checkIn) => <span key={checkIn.id}><b>{checkIn.date}</b>{RESULT_OPTIONS.find((item) => item.value === checkIn.result)?.label}{checkIn.note ? ` · ${checkIn.note}` : ""}</span>)}
          </div>}
          <details className="development-finish">
            <summary>Завершить и оценить</summary>
            <div>
              {VERDICT_OPTIONS.map(({ value, label }) => <Btn key={value} onClick={() => finishExperiment(experiment.id, value)}>{value === "harmful" && <CircleStop size={15} aria-hidden="true" />}{label}</Btn>)}
            </div>
          </details>
        </div>)}
      </div>
      {completedExperiments.length > 0 && <details className="development-history">
        <summary>Завершённые эксперименты · {experiments.length - activeExperiments.length}</summary>
        <div>{completedExperiments.map((experiment) => <span key={experiment.id}><strong>{experiment.title}</strong><small>{experiment.endedAt || experiment.startedAt} · {VERDICT_LABELS[experiment.verdict] || "Без вывода"} · отметок {experiment.checkIns?.length || 0}</small></span>)}</div>
      </details>}
    </Section>

    <AiChat
      mode="development"
      title="Диалог о личном развитии"
      description="ИИ использует изученные источники и результаты экспериментов, сравнивает советы с фактами и предлагает следующий проверяемый шаг."
      context={aiContext}
      valueMessages={messages}
      onMessagesChange={updateMessages}
      onUserMessage={learnLinksFromMessage}
      shareOptions={shareOptions}
      quickPrompts={[
        "Какая из сохранённых практик сейчас даст самый полезный тест?",
        "Проанализируй мои эксперименты: что действительно работает, а где данных мало?",
        "Найди противоречия между источниками и предложи безопасный способ проверки.",
      ]}
    />
  </div>;
}
