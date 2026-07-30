import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Mic, MicOff, Send, Trash2, Volume2, VolumeX } from "lucide-react";

const MAX_SAVED_MESSAGES = 60;
const MAX_SENT_MESSAGES = 12;
const AUTO_SPEAK_KEY = "daler-os-ai-auto-speak";
const LATEST_FORECAST_KEY = "daler-os-ai-forecast-latest";

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

function loadAutoSpeak() {
  try {
    return localStorage.getItem(AUTO_SPEAK_KEY) === "true";
  } catch {
    return false;
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
  const [listening, setListening] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(loadAutoSpeak);
  const recognitionRef = useRef(null);
  const controlled = Array.isArray(valueMessages);
  const messages = controlled ? valueMessages : localMessages;
  const supportsRecognition = typeof window !== "undefined"
    && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const supportsSpeech = typeof window !== "undefined" && "speechSynthesis" in window;

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

  useEffect(() => {
    try {
      localStorage.setItem(AUTO_SPEAK_KEY, String(autoSpeak));
    } catch {
      // Voice playback still works for this session.
    }
  }, [autoSpeak]);

  useEffect(() => {
    if (mode !== "forecast" || !messages.some((message) => message.role === "assistant")) return;
    try {
      localStorage.setItem(LATEST_FORECAST_KEY, JSON.stringify({
        contextLabel,
        context,
        messages: messages.slice(-8),
        updatedAt: new Date().toISOString(),
      }));
    } catch {
      // Forecast chat remains available even if the shared snapshot cannot be saved.
    }
  }, [context, contextLabel, messages, mode]);

  useEffect(() => () => {
    recognitionRef.current?.abort();
    if (supportsSpeech) window.speechSynthesis.cancel();
  }, [supportsSpeech]);

  const sharedContext = useMemo(() => shareOptions
    .filter((item) => shared.includes(item.id))
    .map((item) => `${item.label}: ${item.value}`)
    .join("\n"), [shareOptions, shared]);

  const speak = (text, index) => {
    if (!supportsSpeech || !String(text || "").trim()) return;
    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(String(text));
    utterance.lang = "ru-RU";
    utterance.rate = 1;
    const russianVoice = window.speechSynthesis.getVoices()
      .find((voice) => voice.lang?.toLowerCase().startsWith("ru"));
    if (russianVoice) utterance.voice = russianVoice;
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!supportsRecognition) {
      setError("Голосовой ввод не поддерживается этим браузером");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    const existingDraft = draft.trim();
    recognition.lang = "ru-RU";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join(" ")
        .trim();
      setDraft([existingDraft, transcript].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      const messagesByError = {
        "not-allowed": "Разреши доступ к микрофону в настройках браузера",
        "audio-capture": "Микрофон не найден или занят другим приложением",
        "no-speech": "Речь не распознана. Нажми микрофон и попробуй ещё раз",
      };
      setError(messagesByError[event.error] || "Не удалось распознать речь");
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    recognitionRef.current = recognition;
    setError("");
    setListening(true);
    recognition.start();
  };

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
      if (autoSpeak) speak(payload.text, nextMessages.length);
    } catch (requestError) {
      setError(requestError.message || "Не удалось получить ответ");
    } finally {
      setSending(false);
    }
  };

  const clear = () => {
    if (supportsSpeech) window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setSpeakingIndex(null);
    setListening(false);
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
        <div className="ai-chat-actions">
          {supportsSpeech && <button
            type="button"
            className={`icon-button${autoSpeak ? " active" : ""}`}
            onClick={() => {
              if (autoSpeak) {
                window.speechSynthesis.cancel();
                setSpeakingIndex(null);
              }
              setAutoSpeak((value) => !value);
            }}
            aria-pressed={autoSpeak}
            aria-label={autoSpeak ? "Выключить автоматическое озвучивание" : "Включить автоматическое озвучивание"}
            title={autoSpeak ? "Автоозвучивание включено" : "Автоозвучивание выключено"}
          >{autoSpeak ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}</button>}
          {messages.length > 0 && <button type="button" className="icon-button" onClick={clear} aria-label="Очистить диалог" title="Очистить диалог"><Trash2 size={17} aria-hidden="true" /></button>}
        </div>
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
          <div className="ai-message-head">
            <span>{message.role === "user" ? "Вы" : "DALER ИИ"}</span>
            {message.role === "assistant" && supportsSpeech && <button
              type="button"
              className="ai-message-speak"
              onClick={() => speak(message.content, index)}
              aria-label={speakingIndex === index ? "Остановить озвучивание" : "Озвучить ответ"}
              title={speakingIndex === index ? "Остановить" : "Озвучить ответ"}
            >{speakingIndex === index ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}</button>}
          </div>
          <p>{message.content}</p>
          {message.source?.type === "youtube" && <small className="ai-source">
            {message.source.analysisMode === "video" ? "Проанализированы видеоряд и аудио" : "Проанализированы субтитры"}: {message.source.title}
            {message.source.truncated ? " · длинный текст сокращён" : ""}
          </small>}
        </div>)}
        {sending && <div className="ai-message assistant pending"><div className="ai-message-head"><span>DALER ИИ</span></div><p>Анализирую…</p></div>}
      </div>

      {error && <div className="ai-error" role="alert">{error}</div>}

      <form className={`ai-composer${supportsRecognition ? " has-voice" : ""}`} onSubmit={(event) => { event.preventDefault(); send(draft); }}>
        {supportsRecognition && <button
          type="button"
          className={`voice-button${listening ? " active" : ""}`}
          onClick={toggleListening}
          aria-pressed={listening}
          aria-label={listening ? "Остановить запись" : "Ввести голосом"}
          title={listening ? "Остановить запись" : "Голосовой ввод"}
        >{listening ? <MicOff size={19} aria-hidden="true" /> : <Mic size={19} aria-hidden="true" />}</button>}
        <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={4000} placeholder={mode === "forecast" ? "Что этот прогноз значит для моих решений?" : mode === "business" ? "Опиши решение, рынок, риск или вставь ссылку YouTube…" : "Опиши ситуацию, решение или повторяющийся паттерн…"} />
        <button type="submit" disabled={!draft.trim() || sending} aria-label="Отправить сообщение" title="Отправить"><Send size={18} aria-hidden="true" /></button>
      </form>
      <p className="ai-disclaimer">ИИ помогает структурировать размышление, но не заменяет медицинскую, юридическую или финансовую консультацию.</p>
    </section>
  );
}
