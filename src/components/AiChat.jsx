import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send, Trash2 } from "lucide-react";

const MAX_SAVED_MESSAGES = 60;
const MAX_SENT_MESSAGES = 12;

function loadMessages(storageKey) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "[]");
    return Array.isArray(value)
      ? value.filter((item) => ["user", "assistant"].includes(item?.role) && typeof item?.content === "string").slice(-MAX_SAVED_MESSAGES)
      : [];
  } catch {
    return [];
  }
}

export default function AiChat({
  mode,
  title,
  description,
  context = "",
  contextLabel = "",
  storageKey,
  quickPrompts = [],
  shareOptions = [],
  valueMessages,
  onMessagesChange,
}) {
  const [localMessages, setLocalMessages] = useState(() => loadMessages(storageKey));
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [shared, setShared] = useState([]);
  const controlled = Array.isArray(valueMessages);
  const messages = controlled ? valueMessages : localMessages;

  const commitMessages = (nextOrPatch) => {
    if (controlled) onMessagesChange?.(nextOrPatch);
    else setLocalMessages(nextOrPatch);
  };

  useEffect(() => {
    if (controlled || !storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages.slice(-MAX_SAVED_MESSAGES)));
    } catch {
      // The chat remains available for this session if storage is unavailable.
    }
  }, [controlled, messages, storageKey]);

  const sharedContext = useMemo(() => shareOptions
    .filter((item) => shared.includes(item.id))
    .map((item) => `${item.label}: ${item.value}`)
    .join("\n"), [shareOptions, shared]);

  const send = async (text) => {
    const content = String(text || "").trim();
    if (!content || sending) return;
    const userMessage = { role: "user", content };
    const nextMessages = [...messages, userMessage];
    commitMessages(nextMessages);
    setDraft("");
    setError("");
    setSending(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          messages: nextMessages.slice(-MAX_SENT_MESSAGES),
          context: [context, sharedContext].filter(Boolean).join("\n\n"),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.text) throw new Error(payload.error || "ИИ сейчас недоступен");
      commitMessages((current) => [...current, { role: "assistant", content: payload.text, source: payload.source || null }]);
    } catch (requestError) {
      setError(requestError.message || "Не удалось получить ответ");
    } finally {
      setSending(false);
    }
  };

  const clear = () => {
    commitMessages([]);
    setError("");
    if (controlled || !storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Nothing else to clear.
    }
  };

  return (
    <section className="ai-chat" aria-label={title}>
      <header className="ai-chat-head">
        <div>
          <span className="eyebrow"><MessageCircle size={15} aria-hidden="true" />ИИ-диалог</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {messages.length > 0 && <button type="button" className="icon-button" onClick={clear} aria-label="Очистить диалог" title="Очистить диалог"><Trash2 size={17} aria-hidden="true" /></button>}
      </header>

      {contextLabel && <div className="ai-context-note"><strong>Контекст:</strong> {contextLabel}</div>}

      {shareOptions.length > 0 && <div className="ai-share">
        <span className="eyebrow">Что передать ИИ</span>
        <div className="chips" role="group" aria-label="Выбор данных для ИИ">
          {shareOptions.map((item) => {
            const selected = shared.includes(item.id);
            return <button
              type="button"
              role="checkbox"
              aria-checked={selected}
              className={`chip${selected ? " on" : ""}`}
              key={item.id}
              onClick={() => setShared((current) => selected ? current.filter((id) => id !== item.id) : [...current, item.id])}
            >{item.label}</button>;
          })}
        </div>
        <small>{shared.length ? "Передаются только выбранные категории и сообщения этого диалога." : "Личные данные не выбраны. ИИ увидит только написанное в диалоге."}</small>
      </div>}

      <div className="ai-messages" aria-live="polite">
        {messages.length === 0 && <div className="ai-empty">
          <p>Начни с конкретного вопроса. Ответ будет коротким, практичным и на русском.</p>
          <div>{quickPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => send(prompt)}>{prompt}</button>)}</div>
        </div>}
        {messages.map((message, index) => <div className={`ai-message ${message.role}`} key={`${message.role}-${index}`}>
          <span>{message.role === "user" ? "Вы" : "DALER ИИ"}</span>
          <p>{message.content}</p>
          {message.source?.type === "youtube" && <small className="ai-source">
            {message.source.analysisMode === "video" ? "Проанализированы видеоряд и аудио" : "Проанализированы субтитры"}: {message.source.title}
            {message.source.truncated ? " · длинный текст сокращён" : ""}
          </small>}
        </div>)}
        {sending && <div className="ai-message assistant pending"><span>DALER ИИ</span><p>Анализирую…</p></div>}
      </div>

      {error && <div className="ai-error" role="alert">{error}. Повтори попытку после публикации или проверь подключение ИИ.</div>}

      <form className="ai-composer" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={4000} placeholder={mode === "forecast" ? "Что этот прогноз значит для моих решений?" : mode === "business" ? "Опиши решение, рынок, риск или вставь ссылку YouTube…" : "Опиши ситуацию, решение или повторяющийся паттерн…"} />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Отправить сообщение" title="Отправить"><Send size={18} aria-hidden="true" /></button>
      </form>
      <p className="ai-disclaimer">ИИ помогает структурировать размышление, но не заменяет медицинскую, юридическую или финансовую консультацию.</p>
    </section>
  );
}
