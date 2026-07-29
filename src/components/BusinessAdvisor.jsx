import { useMemo, useRef, useState } from "react";
import { BookOpen, BrainCircuit, FileText, Plus, Trash2, Upload, Youtube } from "lucide-react";
import { businessResourceContext } from "../lib/business";
import AiChat from "./AiChat";
import { Btn, Field, Section } from "./atoms";

const SOURCE_TYPES = [
  { value: "book", label: "Книга", Icon: BookOpen },
  { value: "youtube", label: "YouTube", Icon: Youtube },
  { value: "article", label: "Статья", Icon: FileText },
  { value: "note", label: "Заметка", Icon: BrainCircuit },
];

const TYPE_LABELS = Object.fromEntries(SOURCE_TYPES.map((item) => [item.value, item.label]));
const EMPTY_DRAFT = { type: "note", title: "", url: "", content: "" };

function newId() {
  return globalThis.crypto?.randomUUID?.() || `knowledge-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function BusinessAdvisor({
  knowledge,
  updateKnowledge,
  messages,
  updateMessages,
}) {
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);
  const resources = knowledge?.resources || [];

  const shareOptions = useMemo(() => resources.map((resource) => ({
    id: resource.id,
    label: resource.title,
    value: businessResourceContext(resource),
  })), [resources]);

  const patchDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));

  const readFile = async (file) => {
    if (!file) return;
    setError("");
    if (file.size > 1_500_000) {
      setError("Файл больше 1,5 МБ. Загрузи конспект или нужный фрагмент");
      return;
    }
    if (!/\.(txt|md|csv|json)$/i.test(file.name)) {
      setError("Сейчас поддерживаются текстовые файлы: TXT, MD, CSV и JSON");
      return;
    }
    try {
      const content = await file.text();
      patchDraft({ content, title: draft.title || file.name.replace(/\.[^.]+$/, "") });
      setNotice(`Файл «${file.name}» подготовлен к извлечению знаний`);
    } catch {
      setError("Не удалось прочитать файл");
    }
  };

  const extractKnowledge = async () => {
    const hasYoutube = draft.type === "youtube" && /(?:youtube\.com|youtu\.be)/i.test(draft.url || draft.content);
    if (!draft.content.trim() && !hasYoutube) {
      setError("Добавь текст, конспект или ссылку YouTube");
      return;
    }
    setExtracting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "business",
          task: "ingest",
          messages: [{ role: "user", content: "Извлеки и структурируй знания из этого источника." }],
          resource: draft,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.knowledge) throw new Error(payload.error || "Не удалось извлечь знания");
      const source = payload.source || null;
      const resource = {
        id: newId(),
        type: draft.type,
        title: draft.title.trim() || source?.title || "Источник без названия",
        url: draft.url.trim() || source?.url || "",
        ...payload.knowledge,
        createdAt: new Date().toISOString(),
        sourceMeta: source,
      };
      updateKnowledge((current) => ({
        ...current,
        resources: [...(current?.resources || []).filter((item) => item.id !== resource.id), resource],
      }));
      setDraft({ ...EMPTY_DRAFT, type: draft.type });
      setNotice(`Знания из «${resource.title}» сохранены и доступны для анализа`);
    } catch (requestError) {
      setError(requestError.message || "Не удалось сохранить знания");
    } finally {
      setExtracting(false);
    }
  };

  const removeResource = (id) => {
    updateKnowledge((current) => ({
      ...current,
      resources: (current?.resources || []).filter((item) => item.id !== id),
    }));
  };

  return <div className="business-advisor">
    <Section kicker="источник → извлечение → сохранение → применение" title="База бизнес-знаний">
      <div className="business-agent-flow" aria-label="Этапы обработки знаний">
        {["Источник", "Извлечение", "Сохранение", "Применение"].map((label, index) => <div key={label}><span>{index + 1}</span><strong>{label}</strong></div>)}
      </div>

      <div className="business-source-types" role="radiogroup" aria-label="Тип источника">
        {SOURCE_TYPES.map(({ value, label, Icon }) => <button
          type="button"
          role="radio"
          aria-checked={draft.type === value}
          className={draft.type === value ? "active" : ""}
          key={value}
          onClick={() => patchDraft({ type: value })}
        ><Icon size={16} aria-hidden="true" />{label}</button>)}
      </div>

      <div className="business-source-form">
        <Field label="Название источника" value={draft.title} onChange={(title) => patchDraft({ title })} placeholder="Например: Хорошая стратегия, плохая стратегия" />
        <Field label={draft.type === "youtube" ? "Ссылка YouTube" : "Ссылка, если есть"} value={draft.url} onChange={(url) => patchDraft({ url })} placeholder="https://…" />
        <label className="field business-source-content">
          <span>{draft.type === "youtube" ? "Дополнительный контекст, необязательно" : "Текст, конспект или фрагмент"}</span>
          <textarea
            rows={7}
            maxLength={60000}
            value={draft.content}
            onChange={(event) => patchDraft({ content: event.target.value })}
            placeholder={draft.type === "youtube" ? "Для видео достаточно ссылки с доступными субтитрами." : "Вставь заметки или ключевой фрагмент источника…"}
          />
        </label>
        <input ref={fileRef} type="file" accept=".txt,.md,.csv,.json,text/plain,text/markdown,application/json" hidden onChange={(event) => readFile(event.target.files?.[0])} />
        <div className="business-source-actions">
          <Btn onClick={() => fileRef.current?.click()}><Upload size={16} aria-hidden="true" />Загрузить текст</Btn>
          <Btn primary onClick={extractKnowledge} disabled={extracting}><Plus size={16} aria-hidden="true" />{extracting ? "Извлекаю знания…" : "Извлечь и сохранить"}</Btn>
        </div>
        {notice && <p className="business-notice">{notice}</p>}
        {error && <p className="ai-error" role="alert">{error}</p>}
        <small className="business-privacy">Сохраняется структурированный конспект, а не полный текст источника. Для YouTube анализируется речь из субтитров; визуальный ряд пока не распознаётся.</small>
      </div>

      <div className="business-library">
        <div className="business-library-head"><span className="eyebrow">Сохранённые знания</span><strong>{resources.length}</strong></div>
        {resources.length === 0 && <p className="business-empty">Добавь первый источник. После извлечения его можно будет выборочно подключать к решениям.</p>}
        {resources.map((resource) => <details className="business-resource" key={resource.id}>
          <summary>
            <span><small>{TYPE_LABELS[resource.type] || "Источник"}</small><strong>{resource.title}</strong></span>
            <button type="button" className="icon-button" onClick={(event) => { event.preventDefault(); removeResource(resource.id); }} aria-label={`Удалить ${resource.title}`} title="Удалить источник"><Trash2 size={16} aria-hidden="true" /></button>
          </summary>
          <div>
            {resource.summary && <p>{resource.summary}</p>}
            {resource.skills?.length > 0 && <div className="business-knowledge-row"><strong>Навыки</strong><span>{resource.skills.join(" · ")}</span></div>}
            {resource.principles?.length > 0 && <div className="business-knowledge-row"><strong>Принципы</strong><span>{resource.principles.join(" · ")}</span></div>}
            {resource.frameworks?.length > 0 && <div className="business-knowledge-row"><strong>Модели</strong><span>{resource.frameworks.join(" · ")}</span></div>}
            {resource.decisionQuestions?.length > 0 && <div className="business-knowledge-row"><strong>Вопросы для решений</strong><span>{resource.decisionQuestions.join(" · ")}</span></div>}
          </div>
        </details>)}
      </div>
    </Section>

    <AiChat
      mode="business"
      title="Бизнес-анализ и решения"
      description="Проверяет гипотезы, альтернативы и риски. Выбери нужные источники, чтобы применить сохранённые знания."
      valueMessages={messages}
      onMessagesChange={updateMessages}
      shareOptions={shareOptions}
      quickPrompts={[
        "Разложи моё решение на варианты, критерии и риски.",
        "Проверь мою бизнес-гипотезу и предложи самый дешёвый тест.",
        "Какие конкурирующие объяснения я сейчас игнорирую?",
      ]}
    />
  </div>;
}
