import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Check, ExternalLink, MessageCircle, Mic, MicOff, Pencil, Send, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { aiCloudContext } from "../lib/cloud";

const MAX_SAVED_MESSAGES = 60;
const MAX_SENT_MESSAGES = 12;
const AUTO_SPEAK_KEY = "daler-os-ai-auto-speak";
const LATEST_FORECAST_KEY = "daler-os-ai-forecast-latest";
const MODEL_STORAGE_KEY = "daler-os-ai-model";
const FALLBACK_MODEL_OPTIONS = [
  { id: "openai/gpt-5.6-sol", name: "GPT-5.6 Sol", provider: "openai" },
  { id: "openai/gpt-5.6-terra", name: "GPT-5.6 Terra", provider: "openai" },
  { id: "openai/gpt-5.6-luna", name: "GPT-5.6 Luna", provider: "openai" },
  { id: "openai/gpt-5.4", name: "GPT-5.4", provider: "openai" },
  { id: "anthropic/claude-opus-4.8", name: "Claude Opus 4.8", provider: "anthropic" },
  { id: "anthropic/claude-opus-4.6", name: "Claude Opus 4.6", provider: "anthropic" },
  { id: "anthropic/claude-sonnet-4.6", name: "Claude Sonnet 4.6", provider: "anthropic" },
  { id: "anthropic/claude-haiku-4.5", name: "Claude Haiku 4.5", provider: "anthropic" },
];

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

function loadSelectedModel() {
  try {
    return localStorage.getItem(MODEL_STORAGE_KEY) || "";
  } catch {
    return "";
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [selectedModel, setSelectedModel] = useState(loadSelectedModel);
  const [modelOptions, setModelOptions] = useState(FALLBACK_MODEL_OPTIONS);
  const [connections, setConnections] = useState({ gateway: true, openai: false, anthropic: false });
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
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
    } catch {
      // The selected model remains active for this session.
    }
  }, [selectedModel]);

  useEffect(() => {
    let active = true;
    fetch("/api/ai-chat", { method: "GET", headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Каталог моделей недоступен")))
      .then((payload) => {
        if (!active) return;
        if (Array.isArray(payload.models) && payload.models.length) setModelOptions(payload.models);
        if (payload.connections && typeof payload.connections === "object") {
          setConnections({
            gateway: payload.connections.gateway !== false,
            openai: Boolean(payload.connections.openai),
            anthropic: Boolean(payload.connections.anthropic),
          });
        }
      })
      .catch(() => {
        // The verified fallback list keeps model selection available offline.
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    aiCloudContext()
      .then(async (cloud) => {
        if (!cloud) return null;
        const response = await fetch("/api/ai-connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", cloud }),
        });
        return response.ok ? response.json() : null;
      })
      .then((payload) => {
        if (!active || !payload?.connections) return;
        setConnections((current) => ({ ...current, ...payload.connections }));
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

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
  const modelLabels = useMemo(() => new Map(modelOptions.map((item) => [item.id, item.name])), [modelOptions]);
  const openAiModels = modelOptions.filter((item) => item.provider === "openai");
  const anthropicModels = modelOptions.filter((item) => item.provider === "anthropic");

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

  const requestReply = async (nextMessages) => {
    setError("");
    setSending(true);

    try {
      const cloud = await aiCloudContext();
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          model: selectedModel,
          messages: nextMessages.slice(-MAX_SENT_MESSAGES),
          context: [context, sharedContext].filter(Boolean).join("\n\n"),
          cloud,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.text) throw new Error(payload.error || "ИИ сейчас недоступен");
      commitMessages((current) => [...current, {
        role: "assistant",
        content: payload.text,
        model: payload.model || selectedModel || null,
        source: payload.source || null,
      }]);
      if (autoSpeak) speak(payload.text, nextMessages.length);
    } catch (requestError) {
      setError(requestError.message || "Не удалось получить ответ");
    } finally {
      setSending(false);
    }
  };

  const send = async (text) => {
    const content = String(text || "").trim();
    if (!content || sending) return;
    const nextMessages = [...messages, { role: "user", content }];
    commitMessages(nextMessages);
    setDraft("");
    await requestReply(nextMessages);
  };

  const beginEdit = (index) => {
    if (sending) return;
    setEditingIndex(index);
    setEditingDraft(messages[index]?.content || "");
    setError("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingDraft("");
  };

  const saveEdit = async () => {
    const content = editingDraft.trim();
    if (editingIndex === null || !content || sending) return;
    const nextMessages = messages
      .slice(0, editingIndex + 1)
      .map((message, index) => index === editingIndex ? { ...message, content } : message);
    commitMessages(nextMessages);
    cancelEdit();
    await requestReply(nextMessages);
  };

  const clear = () => {
    if (supportsSpeech) window.speechSynthesis.cancel();
    recognitionRef.current?.abort();
    setSpeakingIndex(null);
    setListening(false);
    cancelEdit();
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

      <div className="ai-model-bar">
        <label>
          <span><Bot size={15} aria-hidden="true" />Модель ответа</span>
          <select value={selectedModel} onChange={(event) => setSelectedModel(event.target.value)} disabled={sending}>
            <option value="">Авто · DALER ИИ</option>
            {selectedModel && !modelOptions.some((item) => item.id === selectedModel) && <option value={selectedModel}>{selectedModel}</option>}
            <optgroup label="OpenAI · ChatGPT">
              {openAiModels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </optgroup>
            <optgroup label="Anthropic · Claude">
              {anthropicModels.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </optgroup>
          </select>
        </label>
        <details className="ai-connection">
          <summary>Подключение API</summary>
          <div>
            <p>Подписки ChatGPT и Claude не включают API. Для собственного биллинга добавь отдельные ключи в «Ещё → Настройки → OpenAI и Claude».</p>
            <span>OpenAI: {connections.openai ? "собственный ключ подключён" : "через Vercel Gateway"}</span>
            <span>Anthropic: {connections.anthropic ? "собственный ключ подключён" : "через Vercel Gateway"}</span>
            <div>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer">Ключ OpenAI <ExternalLink size={13} aria-hidden="true" /></a>
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer">Ключ Anthropic <ExternalLink size={13} aria-hidden="true" /></a>
              <a href="https://vercel.com/docs/ai-gateway/authentication-and-byok/byok" target="_blank" rel="noreferrer">Подключение BYOK <ExternalLink size={13} aria-hidden="true" /></a>
            </div>
          </div>
        </details>
      </div>

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
        {messages.map((message, index) => <div className={`ai-message ${message.role}${editingIndex === index ? " editing" : ""}`} key={`${message.role}-${index}`}>
          <div className="ai-message-head">
            <span>{message.role === "user" ? "Вы" : "DALER ИИ"}</span>
            <span className="ai-message-tools">
              {message.role === "user" && editingIndex !== index && <button
                type="button"
                className="ai-message-action"
                onClick={() => beginEdit(index)}
                disabled={sending}
                aria-label="Редактировать сообщение"
                title="Редактировать сообщение"
              ><Pencil size={14} aria-hidden="true" /></button>}
              {message.role === "assistant" && supportsSpeech && <button
                type="button"
                className="ai-message-action"
                onClick={() => speak(message.content, index)}
                aria-label={speakingIndex === index ? "Остановить озвучивание" : "Озвучить ответ"}
                title={speakingIndex === index ? "Остановить" : "Озвучить ответ"}
              >{speakingIndex === index ? <VolumeX size={15} aria-hidden="true" /> : <Volume2 size={15} aria-hidden="true" />}</button>}
            </span>
          </div>
          {editingIndex === index ? <div className="ai-message-editor">
            <textarea
              autoFocus
              value={editingDraft}
              onChange={(event) => setEditingDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") cancelEdit();
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  saveEdit();
                }
              }}
              rows={4}
              maxLength={4000}
              aria-label="Изменить сообщение"
            />
            <small>Следующие ответы будут удалены и сформированы заново.</small>
            <div className="ai-message-edit-actions">
              <button type="button" onClick={cancelEdit} aria-label="Отменить редактирование" title="Отменить"><X size={16} aria-hidden="true" /></button>
              <button type="button" className="confirm" onClick={saveEdit} disabled={!editingDraft.trim()} aria-label="Сохранить и обновить ответ" title="Сохранить и обновить ответ"><Check size={16} aria-hidden="true" /></button>
            </div>
          </div> : <p>{message.content}</p>}
          {message.source?.type === "youtube" && <small className="ai-source">
            {message.source.analysisMode === "video" ? "Проанализированы видеоряд и аудио" : "Проанализированы субтитры"}: {message.source.title}
            {message.source.truncated ? " · длинный текст сокращён" : ""}
          </small>}
          {message.role === "assistant" && message.model && <small className="ai-model-used">Модель: {modelLabels.get(message.model) || message.model}</small>}
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
