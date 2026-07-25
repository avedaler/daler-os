import { useState } from "react";
import { ChevronRight, Plus, Search, X } from "lucide-react";
import { Btn, CheckRow, ChoiceChips, Field, Section, StatusBadge } from "./atoms";
import { CODE_CATEGORIES, codeSession, displayCodeText } from "../lib/code";
import { downloadFile } from "../lib/ics";

const TRAITS = ["Спокойный", "Дисциплинированный", "Решительный", "Терпеливый", "Стратегический", "Надёжный", "Физически сильный", "Честный с собой", "Сфокусированный", "Последовательный"];
const LANGUAGES = [{ label: "Русский", value: "ru" }, { label: "Английский", value: "en" }, { label: "Оба языка", value: "bilingual" }];
const CATEGORY_LABELS = { Calm: "Спокойствие", Focus: "Фокус", Execution: "Исполнение", Wealth: "Богатство", Leadership: "Лидерство", Health: "Здоровье", Time: "Время" };
const SCORE_LABELS = [
  ["energyScore", "Энергия"],
  ["focusScore", "Фокус"],
  ["calmScore", "Спокойствие"],
  ["confidenceScore", "Уверенность"],
  ["disciplineScore", "Дисциплина"],
  ["emotionalPressureScore", "Давление"],
];

function currentLaw(code, session) {
  return code.laws.find((item) => item.id === (session?.activeLawId || code.activeLawId)) || code.laws[0];
}

function CodeOnboarding({ code, updateCode, date }) {
  const [step, setStep] = useState(0);
  const [traits, setTraits] = useState(code.profile.traits);
  const [lawId, setLawId] = useState(code.activeLawId);
  const [triggerId, setTriggerId] = useState("pressure");
  const [duration, setDuration] = useState(code.settings.duration);
  const [mainMove, setMainMove] = useState("");
  const complete = () => {
    const next = codeSession(code, date);
    updateCode({
      ...code,
      onboardingComplete: true,
      activeLawId: lawId,
      activeLawSince: date,
      profile: { ...code.profile, traits },
      settings: { ...code.settings, duration },
      sessions: {
        ...code.sessions,
        [date]: { ...next, activeLawId: lawId, expectedTriggerId: triggerId, mainMoveText: mainMove.trim() },
      },
    });
  };
  return <div className="code-onboarding">
    <div className="code-onboarding-progress"><span style={{ width: `${((step + 1) / 6) * 100}%` }} /><small>{step + 1} / 6</small></div>
    {step === 0 && <Section kicker="КОД" title="Код сознания основателя">
      <blockquote className="code-principle">Реальность не меняется от одних слов.<br />Меняется человек.<br />Другие решения создают другую жизнь.</blockquote>
      <Btn primary onClick={() => setStep(1)}>Начать настройку</Btn>
    </Section>}
    {step === 1 && <Section kicker="Личность" title="Каким человеком ты должен быть?">
      <ChoiceChips multi options={TRAITS} value={traits} onChange={setTraits} />
      <Btn primary onClick={() => setStep(2)}>Продолжить</Btn>
    </Section>}
    {step === 2 && <Section kicker="Закон" title="Выбери первый закон">
      <div className="code-choice-list">{code.laws.slice(0, 6).map((item) => <button type="button" className={lawId === item.id ? "selected" : ""} onClick={() => setLawId(item.id)} key={item.id}><strong>{item.ru}</strong><span>{item.en}</span></button>)}</div>
      <Btn primary onClick={() => setStep(3)}>Продолжить</Btn>
    </Section>}
    {step === 3 && <Section kicker="Триггер" title="Выбери первую реакцию">
      <div className="code-choice-list">{code.triggers.map((item) => <button type="button" className={triggerId === item.id ? "selected" : ""} onClick={() => setTriggerId(item.id)} key={item.id}><strong>{item.responseRu}</strong><span>{item.responseEn}</span></button>)}</div>
      <Btn primary onClick={() => setStep(4)}>Продолжить</Btn>
    </Section>}
    {step === 4 && <Section kicker="Длительность" title="Длительность ежедневного протокола">
      <ChoiceChips options={[2, 3, 5].map((value) => ({ label: `${value} минуты`, value }))} value={duration} onChange={setDuration} />
      <Btn primary onClick={() => setStep(5)}>Продолжить</Btn>
    </Section>}
    {step === 5 && <Section kicker="Главный ход" title="Какое действие сегодня докажет, что это не просто слова?">
      <Field label="Главный ход" value={mainMove} onChange={setMainMove} placeholder="Одно наблюдаемое действие" />
      <Btn primary disabled={!mainMove.trim()} onClick={complete}>Активировать Кодекс</Btn>
    </Section>}
  </div>;
}

function Protocol({ code, updateCode, date, tasks = [], updateTask }) {
  const session = codeSession(code, date);
  const law = currentLaw(code, session);
  const mode = code.settings.languageMode;
  const trigger = code.triggers.find((item) => item.id === session.expectedTriggerId) || code.triggers[0];
  const patch = (values) => updateCode({ ...code, sessions: { ...code.sessions, [date]: { ...session, ...values } } });
  const finishMorning = () => patch({ morningCompletedAt: new Date().toISOString(), chosenResponse: session.chosenResponse || trigger?.responseRu || "" });
  const linkTask = (linkedTaskId) => {
    const task = tasks.find((item) => item.id === linkedTaskId);
    patch({ linkedTaskId, mainMoveText: task?.title || session.mainMoveText });
  };
  const finishMove = () => {
    patch({ mainMoveCompletedAt: new Date().toISOString() });
    if (session.linkedTaskId) updateTask?.(session.linkedTaskId, { done: true });
  };
  return <div className="code-protocol">
    <Section kicker="Закон недели" title={displayCodeText(law, mode)}>
      <p className="quiet-copy">{law.practice}</p>
      <Btn onClick={() => updateCode({ ...code, activeLawSince: date })}>Продлить ещё на неделю</Btn>
      <div className="code-score-grid">{SCORE_LABELS.map(([key, label]) => <label key={key}><span>{label}</span><input type="range" min="1" max="5" value={session[key]} onChange={(event) => patch({ [key]: Number(event.target.value) })} /><strong>{session[key]}</strong></label>)}</div>
    </Section>
    <Section kicker={`${code.settings.duration} минуты`} title="Утренний протокол">
      <div className="code-statements">{code.identityStatements.filter((item) => session.identityStatementIds.includes(item.id)).map((item) => <p key={item.id}>{displayCodeText(item, mode)}</p>)}</div>
      <Field label="Главный ход" value={session.mainMoveText} onChange={(mainMoveText) => patch({ mainMoveText })} placeholder="Одно действие, которое создаёт доказательство" />
      {tasks.length > 0 && <label className="field"><span className="flabel">Связать с задачей</span><select className="input" value={session.linkedTaskId} onChange={(event) => linkTask(event.target.value)}><option value="">Без связи</option>{tasks.map((task) => <option key={task.id} value={task.id}>{task.title}</option>)}</select></label>}
      <label className="field"><span className="flabel">Ожидаемый триггер</span><select className="input" value={session.expectedTriggerId} onChange={(event) => patch({ expectedTriggerId: event.target.value })}>{code.triggers.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{displayCodeText(item, mode)}</option>)}</select></label>
      <Field label="Выбранная реакция" value={session.chosenResponse} onChange={(chosenResponse) => patch({ chosenResponse })} placeholder={trigger?.responseRu} />
      <div className="button-pair"><Btn primary disabled={Boolean(session.morningCompletedAt)} onClick={finishMorning}>{session.morningCompletedAt ? "Утро завершено" : "Завершить утро"}</Btn><Btn disabled={!session.mainMoveText || Boolean(session.mainMoveCompletedAt)} onClick={finishMove}>{session.mainMoveCompletedAt ? "Главный ход выполнен" : "Главный ход выполнен"}</Btn></div>
    </Section>
    <Section kicker="Доказательство" title="Вечерний разбор">
      <Field label="Поведенческое доказательство" value={session.behavioralProof} onChange={(behavioralProof) => patch({ behavioralProof })} placeholder="Что ты сделал, а не намеревался сделать?" />
      <Field label="Урок дня" value={session.dayLesson} onChange={(dayLesson) => patch({ dayLesson })} />
      <Field label="Корректировка на завтра" value={session.tomorrowAdjustment} onChange={(tomorrowAdjustment) => patch({ tomorrowAdjustment })} />
      <Btn primary disabled={!session.behavioralProof.trim() || Boolean(session.eveningCompletedAt)} onClick={() => patch({ eveningCompletedAt: new Date().toISOString() })}>{session.eveningCompletedAt ? "День закрыт" : "Закрыть разбор"}</Btn>
    </Section>
  </div>;
}

function EditableLibrary({ title, kicker, items, updateItems, kind, mode, activeId, onActivate }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const filtered = items.filter((item) => {
    const text = Object.values(item).join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) && (!category || item.category === category);
  });
  const patch = (id, values) => updateItems(items.map((item) => item.id === id ? { ...item, ...values } : item));
  const add = () => updateItems([...items, kind === "law"
    ? { id: `law-${Date.now()}`, category: "Execution", ru: "Новый закон", en: "New law", practice: "", active: true, favorite: false }
    : kind === "identity"
      ? { id: `identity-${Date.now()}`, ru: "Новое утверждение", en: "New statement", active: true }
      : { id: `trigger-${Date.now()}`, labelRu: "Новый триггер", labelEn: "New trigger", responseRu: "Пауза. Решение.", responseEn: "Pause. Decision.", active: true }]);
  return <Section kicker={kicker} title={title} action={<Btn onClick={add}><Plus size={15} />Добавить</Btn>}>
    <div className="code-library-tools"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск" /></label>{kind === "law" && <select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Все категории</option>{CODE_CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select>}</div>
    <div className="code-library">{filtered.map((item) => <details key={item.id}>
      <summary><span><strong>{displayCodeText(item, mode)}</strong><small>{item.category ? CATEGORY_LABELS[item.category] : (item.active ? "активно" : "неактивно")}</small></span><ChevronRight size={16} /></summary>
      <div className="code-editor">
        {kind === "trigger" ? <><Field label="Триггер на русском" value={item.labelRu} onChange={(labelRu) => patch(item.id, { labelRu })} /><Field label="Перевод триггера" value={item.labelEn} onChange={(labelEn) => patch(item.id, { labelEn })} /><Field label="Реакция на русском" value={item.responseRu} onChange={(responseRu) => patch(item.id, { responseRu })} /><Field label="Перевод реакции" value={item.responseEn} onChange={(responseEn) => patch(item.id, { responseEn })} /></> : <><Field label="Текст на русском" value={item.ru} onChange={(ru) => patch(item.id, { ru })} /><Field label="Перевод" value={item.en} onChange={(en) => patch(item.id, { en })} />{kind === "law" && <><Field label="Практика" value={item.practice} onChange={(practice) => patch(item.id, { practice })} /><ChoiceChips options={CODE_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABELS[value] }))} value={item.category} onChange={(categoryValue) => patch(item.id, { category: categoryValue })} />{onActivate && <Btn primary={activeId !== item.id} disabled={activeId === item.id} onClick={() => onActivate(item.id)}>{activeId === item.id ? "Закон недели" : "Сделать законом недели"}</Btn>}</>}</>}
        <CheckRow on={item.active} onClick={() => patch(item.id, { active: !item.active })} label="Активно" />
        <button type="button" className="icon-delete" aria-label="Удалить" onClick={() => updateItems(items.filter((entry) => entry.id !== item.id))}><X size={16} /></button>
      </div>
    </details>)}</div>
  </Section>;
}

function Reviews({ code, updateCode }) {
  const [review, setReview] = useState({ evidence: "", trigger: "", lesson: "", nextCommitment: "" });
  const sessions = Object.values(code.sessions).sort((a, b) => b.date.localeCompare(a.date));
  const completed = sessions.filter((item) => item.mainMoveCompletedAt).length;
  const evidence = sessions.filter((item) => item.behavioralProof?.trim()).length;
  const rate = sessions.length ? Math.round((completed / sessions.length) * 100) : 0;
  return <div className="code-review">
    <Section kicker="самооценка · наблюдаемый паттерн" title="Исполнение">
      <div className="code-metrics"><div><strong>{sessions.length}</strong><span>дней</span></div><div><strong>{rate}%</strong><span>Главный ход</span></div><div><strong>{evidence}</strong><span>доказательств</span></div></div>
      {!sessions.length && <p className="quiet-copy">Недостаточно данных. Заверши первый дневной протокол.</p>}
    </Section>
    <Section kicker="Лента доказательств" title="История поведения">
      <div className="code-evidence-list">{sessions.slice(0, 30).map((item) => <div key={item.date}><span>{item.date}</span><strong>{item.mainMoveText || "Главный ход не задан"}</strong><p>{item.behavioralProof || "Доказательство не зафиксировано"}</p></div>)}</div>
    </Section>
    <Section kicker="Еженедельный обзор" title="Факты, не намерения">
      <Field label="Главное доказательство недели" value={review.evidence} onChange={(evidenceValue) => setReview({ ...review, evidence: evidenceValue })} />
      <Field label="Повторяющийся триггер" value={review.trigger} onChange={(trigger) => setReview({ ...review, trigger })} />
      <Field label="Чему научила неделя" value={review.lesson} onChange={(lesson) => setReview({ ...review, lesson })} />
      <Field label="Одно обязательство на следующую неделю" value={review.nextCommitment} onChange={(nextCommitment) => setReview({ ...review, nextCommitment })} />
      <Btn primary disabled={!review.evidence.trim()} onClick={() => {
        updateCode({ ...code, weeklyReviews: [...code.weeklyReviews, { id: `review-${Date.now()}`, createdAt: new Date().toISOString(), ...review }] });
        setReview({ evidence: "", trigger: "", lesson: "", nextCommitment: "" });
      }}>Сохранить обзор</Btn>
      {code.weeklyReviews.length > 0 && <p className="quiet-copy">Сохранено обзоров: {code.weeklyReviews.length}</p>}
    </Section>
    <Section kicker="Конституция" title="Версии Конституции">
      <Field label="Текущая версия" rows={6} value={code.constitution.current} onChange={(current) => updateCode({ ...code, constitution: { ...code.constitution, current } })} />
      <Btn onClick={() => updateCode({ ...code, constitution: { ...code.constitution, versions: [...code.constitution.versions, { id: `v${code.constitution.versions.length + 1}`, createdAt: new Date().toISOString(), text: code.constitution.current }] } })}>Сохранить новую версию</Btn>
      <p className="quiet-copy">{code.constitution.versions.length} сохранённых версий</p>
    </Section>
  </div>;
}

function CodeSettings({ code, updateCode }) {
  const settings = code.settings;
  const patch = (values) => updateCode({ ...code, settings: { ...settings, ...values } });
  return <Section kicker="Персонализация" title="Настройки Кодекса">
    <span className="eyebrow">Язык</span><ChoiceChips options={LANGUAGES} value={settings.languageMode} onChange={(languageMode) => patch({ languageMode })} />
    <span className="eyebrow">Длительность</span><ChoiceChips options={[2, 3, 5].map((value) => ({ label: `${value} мин`, value }))} value={settings.duration} onChange={(duration) => patch({ duration })} />
    <div className="form-grid two"><Field label="Утверждений в день" type="number" min="1" max="6" value={settings.statementCount} onChange={(value) => patch({ statementCount: Math.max(1, Math.min(6, Number(value) || 3)) })} /><label className="field"><span className="flabel">Тон</span><select className="input" value={settings.tone} onChange={(event) => patch({ tone: event.target.value })}><option value="firm">Твёрдый</option><option value="calm">Спокойный</option><option value="direct">Прямой</option></select></label></div>
    <CheckRow on={settings.automaticWeeklyLaw} onClick={() => patch({ automaticWeeklyLaw: !settings.automaticWeeklyLaw })} label="Автоматический закон недели" />
    <CheckRow on={settings.spiritualLanguage} onClick={() => patch({ spiritualLanguage: !settings.spiritualLanguage })} label="Поэтический духовный язык" meta="Метафора, не гарантированный механизм." />
    <div className="button-pair">
      <Btn onClick={() => downloadFile("daler-os-code.json", JSON.stringify(code, null, 2), "application/json;charset=utf-8")}>Экспорт JSON</Btn>
      <Btn onClick={() => {
        const activeLaws = code.laws.filter((item) => item.active).map((item) => `## ${item.ru}\n${item.practice || ""}`).join("\n\n");
        const identity = code.identityStatements.filter((item) => item.active).map((item) => `- ${item.ru}`).join("\n");
        downloadFile("daler-os-code.md", `# КОД\n\n${code.constitution.current}\n\n# Законы\n\n${activeLaws}\n\n# Личность\n\n${identity}\n`, "text/markdown;charset=utf-8");
      }}>Экспорт Markdown</Btn>
    </div>
  </Section>;
}

export function CodeDashboardCard({ code, updateCode, date, tasks = [], updateTask, onOpen }) {
  const session = codeSession(code, date);
  const law = currentLaw(code, session);
  if (!code.onboardingComplete) return <section className="code-dashboard-card"><div><span className="eyebrow">КОД</span><strong>Кодекс ещё не активирован</strong><p>Слова должны быть подтверждены поведением.</p></div><Btn primary onClick={onOpen}>Начать настройку</Btn></section>;
  return <section className="code-dashboard-card">
    <div className="code-dashboard-law"><span className="eyebrow">Закон недели</span><strong>{displayCodeText(law, code.settings.languageMode)}</strong></div>
    <div className="code-dashboard-move"><span className="eyebrow">Главный ход</span><strong>{session.mainMoveText || "Не задан"}</strong></div>
    <div className="code-dashboard-status"><span className={session.morningCompletedAt ? "done" : ""}>Утро</span><span className={session.mainMoveCompletedAt ? "done" : ""}>Ход</span><span className={session.eveningCompletedAt ? "done" : ""}>Вечер</span></div>
    <div className="button-pair"><Btn primary onClick={onOpen}>Открыть протокол</Btn>{session.mainMoveText && !session.mainMoveCompletedAt && <Btn onClick={() => {
      const next = { ...session, mainMoveCompletedAt: new Date().toISOString() };
      updateCode({ ...code, sessions: { ...code.sessions, [date]: next } });
      if (session.linkedTaskId) updateTask?.(session.linkedTaskId, { done: true });
    }}>Зафиксировать доказательство</Btn>}</div>
  </section>;
}

export default function Code({ code, updateCode, date, tasks = [], updateTask }) {
  const [view, setView] = useState("protocol");
  const mode = code.settings.languageMode;
  if (!code.onboardingComplete) return <CodeOnboarding code={code} updateCode={updateCode} date={date} />;
  const views = [
    ["protocol", "Сегодня"], ["laws", "Законы"], ["identity", "Личность"], ["triggers", "Триггеры"], ["reviews", "Обзор"], ["settings", "Настройки"],
  ];
  return <div className="code-screen">
    <header className="code-header"><div><span className="eyebrow">ПРОТОКОЛ СОЗНАНИЯ ОСНОВАТЕЛЯ</span><h2>КОД</h2><p>Личность → Внимание → Решение → Действие → Доказательство</p></div><StatusBadge tone="gold">{CATEGORY_LABELS[currentLaw(code, codeSession(code, date)).category]}</StatusBadge></header>
    <nav className="seg" aria-label="Разделы Кодекса">{views.map(([key, label]) => <button type="button" key={key} className={view === key ? "on" : ""} onClick={() => setView(key)}>{label}</button>)}</nav>
    {view === "protocol" && <Protocol code={code} updateCode={updateCode} date={date} tasks={tasks} updateTask={updateTask} />}
    {view === "laws" && <EditableLibrary title="Законы" kicker="еженедельная практика" kind="law" mode={mode} items={code.laws} activeId={code.activeLawId} onActivate={(activeLawId) => updateCode({ ...code, activeLawId, activeLawSince: date })} updateItems={(laws) => updateCode({ ...code, laws })} />}
    {view === "identity" && <EditableLibrary title="Библиотека личности" kicker="кто действует" kind="identity" mode={mode} items={code.identityStatements} updateItems={(identityStatements) => updateCode({ ...code, identityStatements })} />}
    {view === "triggers" && <EditableLibrary title="Триггеры поведения" kicker="пауза → решение" kind="trigger" mode={mode} items={code.triggers} updateItems={(triggers) => updateCode({ ...code, triggers })} />}
    {view === "reviews" && <Reviews code={code} updateCode={updateCode} />}
    {view === "settings" && <CodeSettings code={code} updateCode={updateCode} />}
  </div>;
}
