import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  Droplets,
  Dumbbell,
  FileText,
  Moon,
  Pill,
  Sun,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  AFFIRMATIONS,
  ARTIFACT_TYPES,
  DECLARATION,
  MISS_ACTIONS,
  MISS_REASONS,
  REFUSAL_OPTIONS,
  STATE_OPTIONS,
  STAGES,
  primaryOutcomeText,
  withPrimaryOutcome,
} from "../constants";
import { computeAstro } from "../lib/astro";
import { addDays, weekday } from "../lib/date";
import { dealStatus } from "./Deals";
import { TodayForecast } from "./Forecast";
import { Development } from "./More";
import {
  ActionRow,
  Btn,
  CheckRow,
  ChoiceChips,
  Field,
  QuickCheckTile,
  Section,
  StatusBadge,
} from "./atoms";

const STATE_VALUES = STATE_OPTIONS.map((label, index) => ({
  label,
  value: ["low", "collected", "strong", "overloaded"][index],
}));

const OUTCOME_STATUS = [
  { label: "Запланировано", value: "planned" },
  { label: "В работе", value: "in_progress" },
  { label: "Заблокировано", value: "blocked" },
  { label: "Выполнено", value: "done" },
];

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_LABELS = {
  monday: "Понедельник", tuesday: "Вторник", wednesday: "Среда", thursday: "Четверг",
  friday: "Пятница", saturday: "Суббота", sunday: "Воскресенье",
};
const SESSION_LABELS = {
  strength: "Силовая", swim: "Плавание / Zone 2", recovery: "Восстановление", rest: "Отдых / семья",
};
const FOCUS_LABELS = {
  shoulders_arms: "Плечи + руки", zone2_technique: "Аэробная работа и техника", chest_back: "Грудь + спина",
  walk_mobility: "Ходьба + mobility", legs_core: "Ноги + core", zone2: "Спокойный аэробный объём", family_reset: "Прогулка и reset",
};
const EXERCISES = {
  shoulders_arms: ["Жим над головой", "Вертикальная тяга", "Подъёмы в стороны", "Бицепс", "Трицепс"],
  chest_back: ["Горизонтальный жим", "Тяга к поясу", "Вертикальная тяга", "Fly / cable", "Задняя дельта"],
  legs_core: ["Присед / leg press", "Romanian deadlift", "Выпады", "Сгибание ног", "Plank / carry"],
  zone2_technique: ["Разминка", "Техника", "Спокойные отрезки", "Заминка"],
  zone2: ["Разминка", "Zone 2", "Техника дыхания", "Заминка"],
  walk_mobility: ["Ходьба", "Mobility", "Лёгкая разгрузка"],
  family_reset: ["Прогулка без обязательной тренировки"],
};
const SUPPLEMENT_GROUP_LABELS = {
  hydration: "Гидратация",
  focus: "Фокус и энергия",
  metabolic: "Метаболический шаг",
  vitamins: "Витамины и минералы",
  cellular: "Клеточная поддержка",
  performance: "Производительность и восстановление",
  digestion: "Пищеварение",
  other: "Остальное",
};

function useCountdown(endAt) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!endAt || Number(endAt) <= Date.now()) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endAt]);
  const left = Math.max(0, Number(endAt || 0) - now);
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return { left, label: `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` };
}

function astroAdvice(date) {
  const astro = computeAstro(date);
  if (astro.cautions.some((item) => item.planet === "Меркурий")) return "Перепроверь redlines, цифры и письменные договорённости.";
  if (astro.cautions.some((item) => item.planet === "Марс")) return "Не отвечай импульсивно: сначала выясни мотив и ограничение.";
  if (astro.retro.includes("Меркурий")) return "Зафиксируй owner, дату и следующий шаг письменно.";
  if (astro.phaseAngle > 200) return "Закрывай хвосты и собирай подтверждения вместо новых историй.";
  if (astro.windows.length) return "Используй окно для переговоров, но решение опирай на факты.";
  return "Собери информацию и держи фактический приоритет выше контекста.";
}

export function TimelineBlock({ id, title, summary, active, complete, children, className = "", bare = false, guidance = null }) {
  const [open, setOpen] = useState(active);
  useEffect(() => setOpen(active), [active]);
  if (bare) return (
    <section className={`focus-phase-panel ${id}${complete ? " is-complete" : ""} ${className}`.trim()}>
      <div className={`focus-phase-head${guidance ? " has-guidance" : ""}`}>
        <div><span className="eyebrow">{title} сейчас</span><h2>{summary}</h2></div>
        {guidance}
        {complete && <StatusBadge tone="green">завершено</StatusBadge>}
      </div>
      <div className="focus-phase-content">{children}</div>
    </section>
  );
  return (
    <section className={`timeline-block ${id}${open ? " is-open" : ""}${active ? " is-current" : ""}${complete ? " is-complete" : ""} ${className}`.trim()}>
      <button type="button" className="timeline-heading" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span><span className="timeline-dot" aria-hidden="true" /><strong>{title}</strong><small>{summary}</small></span>
        <span aria-hidden="true">{complete ? "✓" : open ? "−" : "+"}</span>
      </button>
      <div className="timeline-content">{children}</div>
    </section>
  );
}

export function DailyCompass({ s, up, date, today, northStar, deals, yesterdayOutcome, onContinue }) {
  const protocol = s.dailyProtocol;
  const outcome = s.primaryOutcome;
  const text = primaryOutcomeText(outcome);
  const [editingState, setEditingState] = useState(!protocol.compass.stateBand);
  const dueDeal = deals.find((deal) => ["overdue", "today"].includes(dealStatus(deal, date).kind) && deal.nextStep);
  const suggestions = [
    northStar && { label: `North Star: ${northStar}`, text: northStar, source: "north-star" },
    dueDeal && { label: `${dueDeal.name}: ${dueDeal.nextStep}`, text: `${dueDeal.name}: ${dueDeal.nextStep}`, source: "deal", dealId: dueDeal.id },
    yesterdayOutcome && { label: `Вчера не завершено: ${yesterdayOutcome}`, text: yesterdayOutcome, source: "yesterday" },
  ].filter(Boolean);
  const updateCompass = (patch) => up((prev) => ({ dailyProtocol: { ...prev.dailyProtocol, compass: { ...prev.dailyProtocol.compass, ...patch } } }));
  const updateOutcome = (patch) => up((prev) => ({
    primaryOutcome: withPrimaryOutcome(prev.primaryOutcome, patch),
    chairmanOnly: patch.chairmanOnly ?? prev.chairmanOnly,
  }));

  const primaryAction = () => {
    if (!s.dayStarted) up({ dayStarted: true });
    onContinue?.();
  };

  return (
    <section className={`command-compass${s.dayStarted ? " is-started" : ""}`}>
      <div className="command-compass-state">
        <div className="command-compass-label"><Compass size={19} aria-hidden="true" /><span className="eyebrow">Состояние</span></div>
        {protocol.compass.stateBand && !editingState ? <button type="button" className="command-state-summary" onClick={() => setEditingState(true)}>
          <span><strong>{STATE_VALUES.find((item) => item.value === protocol.compass.stateBand)?.label}</strong><small>спокойствие · фокус · решимость</small></span><span>Изменить</span>
        </button> : <ChoiceChips options={STATE_VALUES} value={protocol.compass.stateBand} onChange={(stateBand) => { updateCompass({ stateBand }); setEditingState(false); }} />}
      </div>

      <div className="command-outcome">
        <div className="outcome-head"><span className="eyebrow">Главный результат дня</span>{text && <StatusBadge tone="gold">единственный фокус</StatusBadge>}</div>
        {!text && suggestions.length > 0 && <div className="suggestion-stack">{suggestions.map((item) => <button type="button" key={item.label} onClick={() => updateOutcome({ text: item.text, source: item.source, dealId: item.dealId || null })}>{item.label}</button>)}</div>}
        <Field label="Один измеримый факт" value={text} onChange={(value) => updateOutcome({ text: value, source: "custom" })} placeholder="Подписано / оплачено / запущено" rows={2} />
        {!s.dayStarted && <details className="command-compass-options">
          <summary>Условия и одно «нет»</summary>
          <CheckRow gold on={outcome.chairmanOnly} onClick={() => updateOutcome({ chairmanOnly: !outcome.chairmanOnly })} label="Требуется лично моё участие" />
          <ChoiceChips options={REFUSAL_OPTIONS} value={protocol.compass.noToday} onChange={(noToday) => updateCompass({ noToday })} />
        </details>}
      </div>

      <div className="command-start">
        <span className="eyebrow">{s.dayStarted ? "День запущен" : "Готовность"}</span>
        <Btn primary big disabled={!protocol.compass.stateBand || !text.trim()} onClick={primaryAction}>
          {s.dayStarted ? "Продолжить фокус" : date === today ? "Начать сегодня" : "Запустить выбранный день"}<ArrowRight size={17} aria-hidden="true" />
        </Btn>
        {!s.dayStarted && <small>Сначала состояние и один измеримый факт.</small>}
      </div>
    </section>
  );
}

export function MedicationSequenceCard({ date, morning, updateMorning, medication }) {
  if (!medication || weekday(date) !== 3) return null;
  const takeMedication = () => {
    const now = Date.now();
    updateMorning({
      medicationStatus: "taken",
      medicationTakenAt: now,
      medicationGateEndsAt: null,
      medicationTimerCompleted: true,
      medicationEvents: [...morning.medicationEvents, { medicationId: medication.id, status: "taken", at: new Date(now).toISOString() }],
    });
  };
  return (
    <div className="medication-card">
      <div className="medication-title"><div><span>MOUNJARO · СРЕДА</span><small>еженедельная отметка по текущему назначению</small></div><StatusBadge tone="neutral">{medication.dose || "доза не указана"}</StatusBadge></div>
      {morning.medicationStatus === "pending" ? (
        <ChoiceChips options={[
          { label: "Принято", value: "taken" },
          { label: "Не сегодня", value: "not_planned" },
          { label: "Пропущено", value: "skipped" },
        ]} value="" onChange={(status) => status === "taken" ? takeMedication() : updateMorning({ medicationStatus: status, medicationTimerCompleted: true, medicationGateEndsAt: null })} />
      ) : (
        <div className="medication-result">
          <StatusBadge tone={morning.medicationStatus === "taken" ? "green" : "amber"}>
            {morning.medicationStatus === "taken" ? "Принято" : morning.medicationStatus === "skipped" ? "Пропущено" : "Не сегодня"}
          </StatusBadge>
          <button type="button" onClick={() => updateMorning({ medicationStatus: "pending", medicationTimerCompleted: false, medicationGateEndsAt: null })}>Отменить</button>
        </div>
      )}
    </div>
  );
}

export function WaterTracker({ value, target, disabled, onChange, label = "Вода" }) {
  const percent = Math.min(100, Math.round((value / target) * 100));
  return (
    <div className={`water-tracker${disabled ? " locked" : ""}`}>
      <div className="tracker-head"><span>{label}</span><strong>{value} / {target} мл</strong></div>
      <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
      <div className="button-pair"><Btn disabled={disabled} onClick={() => onChange(Math.min(target, value + 250))}>+250 мл</Btn><Btn disabled={disabled} onClick={() => onChange(Math.min(target, value + 500))}>+500 мл</Btn></div>
    </div>
  );
}

export function SupplementChecklist({ profile, morning, updateMorning, disabled = false, timings, title, note }) {
  const allowed = Array.isArray(timings) ? timings : [timings];
  const visible = profile.supplements.filter((item) => item.active && allowed.includes(item.timing));
  const toggle = (id) => {
    const current = morning.supplementEvents || [];
    updateMorning({ supplementEvents: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
  };
  const toggleGroup = (items) => {
    const current = morning.supplementEvents || [];
    const ids = items.map((item) => item.id);
    const allDone = ids.every((id) => current.includes(id));
    updateMorning({ supplementEvents: allDone ? current.filter((id) => !ids.includes(id)) : [...new Set([...current, ...ids])] });
  };
  if (visible.length === 0) return null;
  const grouped = visible.reduce((result, item) => {
    const key = item.group || "other";
    if (!result[key]) result[key] = [];
    result[key].push(item);
    return result;
  }, {});
  const showGroupLabels = Object.keys(grouped).length > 1;
  return (
    <div className="routine-group">
      {title && <div className="routine-heading"><span className="eyebrow">{title}</span>{note && <small>{note}</small>}</div>}
      <div className="supplement-list">
        {Object.entries(grouped).map(([group, items]) => {
          const allDone = items.every((item) => morning.supplementEvents.includes(item.id));
          return <div className="supplement-pack" key={group}>
          {(showGroupLabels || items.length > 1) && <div className="supplement-pack-head"><span className="supplement-pack-title">{SUPPLEMENT_GROUP_LABELS[group] || group}</span><button type="button" onClick={() => toggleGroup(items)}>{allDone ? "Снять группу" : "Отметить группу"}</button></div>}
          {items.map((item) => <CheckRow key={item.id} disabled={disabled} on={morning.supplementEvents.includes(item.id)} onClick={() => toggle(item.id)}
            label={`${item.name}${item.dose ? ` · ${item.dose}` : ""}`}
            meta={item.instructions || (item.conditional ? "только если идет курс / выполнено условие" : "текущая схема")} />)}
        </div>;
        })}
      </div>
    </div>
  );
}

export function ConditionalProteinCard({ profile, morning, updateMorning, disabled, hasTraining }) {
  if (!profile.protein.enabled) return null;
  const needsPlan = ["unsure", "needed"].includes(morning.proteinDecision) && hasTraining;
  return (
    <div className="protein-card">
      <span className="eyebrow">Белка в еде сегодня достаточно?</span>
      <ChoiceChips disabled={disabled} options={[
        { label: "Да", value: "enough" }, { label: "Не уверен", value: "unsure" }, { label: "Нет", value: "needed" },
      ]} value={morning.proteinDecision} onChange={(proteinDecision) => updateMorning({ proteinDecision })} />
      {needsPlan && <><p>Условная порция из профиля: {profile.protein.defaultServing}. Не является обязательным ежедневным действием.</p>
        <ChoiceChips options={[
          { label: "После тренировки", value: "post_workout" }, { label: "Позже", value: "later" }, { label: "Не сегодня", value: "skip" },
        ]} value={morning.proteinPlan} onChange={(proteinPlan) => updateMorning({ proteinPlan })} />
      </>}
    </div>
  );
}

export function MorningColumn({ s, up, profile, date, active, bare = false, guidance = null }) {
  const morning = s.dailyProtocol.morning;
  const medication = profile.medications.find((item) => item.id === "mounjaro" && item.active);
  const updateMorning = (patch) => up((prev) => ({ dailyProtocol: { ...prev.dailyProtocol, morning: { ...prev.dailyProtocol.morning, ...patch } } }));
  const hasTraining = !["rest", "recovery"].includes(s.dailyProtocol.training.plannedSessionId);
  const mounjaroDue = medication && weekday(date) === 3;
  const electrolytesDone = morning.supplementEvents.includes("electrolytes");
  const complete = morning.waterMl >= 500 && electrolytesDone && (!mounjaroDue || morning.medicationStatus !== "pending");
  return (
    <TimelineBlock id="morning" title="Утро" summary="Быстрый запуск без завтрака" active={active} complete={complete} bare={bare} guidance={guidance}>
      <MedicationSequenceCard date={date} morning={morning} updateMorning={updateMorning} medication={medication} />
      <div className="routine-group first">
        <div className="routine-heading"><span className="eyebrow">После пробуждения</span><small>первый шаг дня</small></div>
        <WaterTracker value={morning.waterMl} target={profile.morningWaterTargetMl || 700} onChange={(waterMl) => updateMorning({ waterMl })} label="Вода · цель 500–700 мл" />
        <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="after_wake" />
      </div>
      <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="morning_focus" title="Через 10–15 минут" note="вместе с кофе с небольшим количеством молока" />
      <div className="coffee-row"><span className="eyebrow">Кофе с небольшим количеством молока</span><ChoiceChips options={[{ label: "Выпито", value: "done" }, { label: "Без кофе", value: "skipped" }]} value={morning.coffee} onChange={(coffee) => updateMorning({ coffee })} /></div>
      <div className="quick-grid three">
        <QuickCheckTile label="Дневной свет" on={morning.light} onClick={() => updateMorning({ light: !morning.light })} />
        <QuickCheckTile label="Дыхание" meta="2–3 минуты" on={morning.breathwork} onClick={() => updateMorning({ breathwork: !morning.breathwork })} />
        <QuickCheckTile label="Душ" meta="тёплый → прохладный" on={morning.rinse} onClick={() => updateMorning({ rinse: !morning.rinse })} />
      </div>
      <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="pre_first_meal" title="После утренней тренировки" note="за 15–20 минут до первого приема пищи" />
      <details className="column-details">
        <summary>После первого приема пищи</summary>
        <div className="detail-stack">
          <p className="quiet-copy">Завтрак пропущен. Этот stack привязан к первому приему пищи, а не к фиксированному утреннему времени.</p>
          <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="after_first_meal" />
          <ConditionalProteinCard profile={profile} morning={morning} updateMorning={updateMorning} hasTraining={hasTraining} />
        </div>
      </details>
      <details className="column-details">
        <summary>Днем</summary>
        <div className="detail-stack">
          <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings={["daytime", "course_daytime"]} />
        </div>
      </details>
    </TimelineBlock>
  );
}

function plannedSession(date, plan, protocolTraining) {
  const dayKey = DAY_KEYS[weekday(date)];
  const override = plan.userOverrides[date];
  const base = override || plan.days[dayKey];
  let session = { ...base, dayKey };
  let reason = `План ${DAY_LABELS[dayKey].toLowerCase()}: ${FOCUS_LABELS[session.focus]}.`;
  if (protocolTraining.readiness === "pain") {
    session = { type: "recovery", focus: "walk_mobility", duration: 25, dayKey };
    reason = "Отмечена боль: тяжёлая нагрузка снята. Восстановление и консультация специалиста при необходимости.";
  } else if (protocolTraining.readiness === "tired" && session.type === "strength") {
    session = { ...session, duration: 35, shortened: true };
    reason = "Низкая готовность: сокращённая силовая без попытки наверстать пропуск.";
  }
  const yesterday = addDays(date, -1);
  const previousHeavy = plan.history.some((item) => item.date === yesterday && item.type === "strength" && item.status === "done");
  if (previousHeavy && session.type === "strength") {
    session = { type: "recovery", focus: "walk_mobility", duration: 30, dayKey };
    reason = "Вчера была тяжёлая силовая: сегодня восстановление, без двух тяжёлых сессий подряд.";
  }
  return { session, reason };
}

export function TrainingRecommendationCard({ date, plan, protocolTraining, updateTraining, updatePlan }) {
  const { session, reason } = plannedSession(date, plan, protocolTraining);
  const [details, setDetails] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const coldEligible = ["swim", "recovery"].includes(session.type) && !protocolTraining.painFlag;
  const exercises = EXERCISES[session.focus] || [];
  const start = () => updateTraining({ status: "started", plannedSessionId: session.type, recommendationReason: reason });
  const complete = () => {
    updateTraining({ status: "done", plannedSessionId: session.type, recommendationReason: reason });
    updatePlan((current) => ({
      ...current,
      history: [...current.history.filter((item) => item.date !== date), { date, type: session.type, focus: session.focus, status: "done", at: new Date().toISOString() }],
    }));
  };
  const swap = (dayKey) => updatePlan((current) => ({
    ...current,
    userOverrides: { ...current.userOverrides, [date]: { ...current.days[dayKey], swappedFrom: DAY_KEYS[weekday(date)], sourceDay: dayKey } },
    history: [...current.history, { date, action: "swap", to: dayKey, at: new Date().toISOString() }],
  }));
  return (
    <div className="training-card">
      <div className="training-title"><div><span className="eyebrow">Рекомендация сегодня</span><h3>{SESSION_LABELS[session.type]}</h3><p>{FOCUS_LABELS[session.focus]} · {session.duration || 0} минут</p></div><StatusBadge tone={session.type === "strength" ? "gold" : "green"}>{session.shortened ? "сокращено" : "по плану"}</StatusBadge></div>
      <div className="why-today"><strong>Почему сегодня:</strong> {reason}</div>
      <span className="eyebrow">Готовность</span>
      <ChoiceChips options={[
        { label: "Готов", value: "ready" }, { label: "Средне", value: "medium" }, { label: "Устал", value: "tired" }, { label: "Есть боль", value: "pain" },
      ]} value={protocolTraining.readiness} onChange={(readiness) => updateTraining({ readiness, painFlag: readiness === "pain" })} />
      <div className="training-actions">
        <Btn primary onClick={start}>Начать</Btn><Btn onClick={() => updateTraining({ status: "shortened" })}>Сократить</Btn><Btn onClick={() => setSwapOpen((value) => !value)}>Заменить</Btn><Btn onClick={complete}>Завершено</Btn>
      </div>
      {swapOpen && <div className="swap-sheet"><span className="eyebrow">Поменять на план другого дня</span><ChoiceChips options={Object.keys(DAY_LABELS).map((key) => ({ label: DAY_LABELS[key], value: key }))} value="" onChange={(key) => { swap(key); setSwapOpen(false); }} /></div>}
      <button type="button" className="text-action" onClick={() => setDetails((value) => !value)}>{details ? "Скрыть план" : "Подробнее"}</button>
      {details && <ul className="exercise-list">{exercises.slice(0, 6).map((exercise) => <li key={exercise}>{exercise}</li>)}</ul>}
      <div className="cold-row">
        <div><strong>Cold plunge · опционально</strong><span>{coldEligible ? "Допустимо в swim / recovery день после safety acknowledgement." : "Сегодня не рекомендуется: не сразу после силовой на рост мышц."}</span></div>
        {coldEligible && plan.safetyProfile.coldExposureAcknowledged ? (
          <ChoiceChips options={[{ label: "Сделано", value: "done" }, { label: "Пропустить", value: "skipped" }]} value={protocolTraining.coldExposure} onChange={(coldExposure) => updateTraining({ coldExposure })} />
        ) : coldEligible ? (
          <Btn onClick={() => updatePlan((current) => ({ ...current, safetyProfile: { ...current.safetyProfile, coldExposureAcknowledged: true } }))}>Принять правила безопасности</Btn>
        ) : <StatusBadge tone="neutral">не сегодня</StatusBadge>}
      </div>
    </div>
  );
}

export function SportColumn({ s, up, date, plan, updatePlan, active, bare = false, guidance = null }) {
  const training = s.dailyProtocol.training;
  const updateTraining = (patch) => up((prev) => ({ dailyProtocol: { ...prev.dailyProtocol, training: { ...prev.dailyProtocol.training, ...patch } } }));
  return (
    <TimelineBlock id="sport" title="Спорт" summary={training.status === "done" ? "Тренировка завершена" : "Одна рекомендация по готовности"} active={active} complete={training.status === "done"} bare={bare} guidance={guidance}>
      <TrainingRecommendationCard date={date} plan={plan} protocolTraining={training} updateTraining={updateTraining} updatePlan={updatePlan} />
    </TimelineBlock>
  );
}

function priorityScore(deal, today, northStar) {
  const status = dealStatus(deal, today).kind;
  let score = status === "overdue" ? 100 : status === "today" ? 80 : status === "nostep" ? 30 : 10;
  if (["revenue", "contract", "recovery", "legal"].includes(deal.priorityType)) score += 20;
  if (deal.chairmanOnly) score += 15;
  if (deal.blocker) score += 10;
  if (northStar && `${deal.name} ${deal.project}`.toLowerCase().includes(northStar.toLowerCase().split(" ")[0])) score += 5;
  return score;
}

export function DeepWorkLauncher({ work, updateWork, outcome }) {
  const countdown = useCountdown(work.deepWorkEndsAt);
  const start = (minutes) => {
    const now = Date.now();
    updateWork({ deepWorkMinutes: minutes, deepWorkStatus: "running", deepWorkStartedAt: now, deepWorkEndsAt: now + minutes * 60000 });
  };
  if (work.deepWorkStatus === "running" && countdown.left > 0) {
    return <div className="deep-work-running"><div><span className="eyebrow">Глубокий блок</span><strong>{countdown.label}</strong><p>{outcome || "Главный результат"}</p></div><Btn onClick={() => updateWork({ deepWorkStatus: "paused" })}>Пауза</Btn></div>;
  }
  return (
    <div className="deep-work-launcher">
      <span className="eyebrow">Первый глубокий блок</span>
      <p>Один материал. Телефон закрыт. На выходе — отправленный документ, решение или подтверждение.</p>
      <div className="button-pair"><Btn primary onClick={() => start(60)}>60 минут</Btn><Btn onClick={() => start(75)}>75</Btn><Btn onClick={() => start(90)}>90</Btn></div>
    </div>
  );
}

export function WorkPriorityStack({ deals, setDeals, today, northStar, compact = false }) {
  const priorities = [...deals].sort((a, b) => priorityScore(b, today, northStar) - priorityScore(a, today, northStar)).slice(0, 3);
  const updateDeal = (deal, patch) => setDeals(deals.map((item) => item.id === deal.id ? { ...item, ...patch, updated: today } : item));
  return (
    <div className={`priority-stack${compact ? " command-priority-stack" : ""}`}>
      <div className="stack-heading"><div><span className="eyebrow">P0 / P1</span><h3>Три движения</h3></div><span>{priorities.length} из 3</span></div>
      {priorities.map((deal) => {
        const status = dealStatus(deal, today);
        const tone = status.kind === "overdue" ? "red" : status.kind === "today" ? "amber" : status.kind === "nostep" ? "amber" : "neutral";
        if (compact) return <div className={`command-deal-row${status.kind === "overdue" ? " danger" : ""}`} key={deal.id}>
          <div className="command-deal-copy"><strong>{deal.name}</strong><span>{deal.nextStep || "Следующий шаг не назначен"}{deal.owner ? ` · ${deal.owner}` : ""}</span></div>
          <StatusBadge tone={tone}>{status.label || STAGES[deal.stage]}</StatusBadge>
          <div className="command-deal-actions">
            <button type="button" title="Отметить движение" aria-label={`Отметить движение: ${deal.name}`} onClick={() => updateDeal(deal, { movementCount: (deal.movementCount || 0) + 1 })}><Check size={16} /></button>
            <button type="button" title="Перенести на завтра" aria-label={`Перенести на завтра: ${deal.name}`} onClick={() => updateDeal(deal, { nextDate: addDays(today, 1) })}><CalendarDays size={16} /></button>
            <button type="button" title="Отметить блокер" aria-label={`Отметить блокер: ${deal.name}`} onClick={() => updateDeal(deal, { blocker: deal.blocker || "Требует решения" })}><TriangleAlert size={16} /></button>
          </div>
        </div>;
        return <ActionRow key={deal.id} title={deal.name} meta={`${deal.nextStep || "Следующий шаг не назначен"}${deal.owner ? ` · ${deal.owner}` : ""}`} badge={<StatusBadge tone={tone}>{status.label || STAGES[deal.stage]}</StatusBadge>} danger={status.kind === "overdue"}>
          <Btn primary onClick={() => updateDeal(deal, { movementCount: (deal.movementCount || 0) + 1 })}>Отметить движение</Btn>
          <Btn onClick={() => updateDeal(deal, { nextDate: addDays(today, 1) })}>Завтра</Btn>
          <Btn onClick={() => updateDeal(deal, { blocker: deal.blocker || "Требует решения" })}>Блокер</Btn>
        </ActionRow>;
      })}
      {priorities.length === 0 && <p className="quiet-copy">Нет сделок с назначенным движением. Добавь next action в разделе «Сделки».</p>}
    </div>
  );
}

export function MeetingPrepSheet({ value, onChange, onClose }) {
  const prep = value || { outcome: "", decisionMaker: "", questions: "", minimum: "", nextAction: "", owner: "", date: "" };
  const set = (patch) => onChange({ ...prep, ...patch });
  return (
    <div className="meeting-sheet">
      <div className="sheet-head"><div><span className="eyebrow">Подготовка к встрече</span><h3>Решение, не разговор</h3></div><button type="button" onClick={onClose} aria-label="Закрыть подготовку">×</button></div>
      <div className="form-grid two"><Field label="Нужный исход" value={prep.outcome} onChange={(outcome) => set({ outcome })} /><Field label="Кто принимает решение" value={prep.decisionMaker} onChange={(decisionMaker) => set({ decisionMaker })} /></div>
      <Field label="Три главных вопроса" value={prep.questions} onChange={(questions) => set({ questions })} rows={2} />
      <Field label="Минимально приемлемый результат" value={prep.minimum} onChange={(minimum) => set({ minimum })} />
      <div className="form-grid three"><Field label="Следующий шаг" value={prep.nextAction} onChange={(nextAction) => set({ nextAction })} /><Field label="Ответственный" value={prep.owner} onChange={(owner) => set({ owner })} /><Field label="Дата" type="date" value={prep.date} onChange={(date) => set({ date })} /></div>
      <p className="quiet-copy">Движение фиксируется только после next action + ответственный + дата.</p>
    </div>
  );
}

export function WorkColumn({ s, up, deals, setDeals, today, northStar, active, bare = false, guidance = null }) {
  const work = s.dailyProtocol.work;
  const outcome = s.primaryOutcome;
  const text = primaryOutcomeText(outcome);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const updateWork = (patch) => up((prev) => ({ dailyProtocol: { ...prev.dailyProtocol, work: { ...prev.dailyProtocol.work, ...patch } } }));
  const updateOutcome = (patch) => up((prev) => ({ primaryOutcome: withPrimaryOutcome(prev.primaryOutcome, patch), outcomeStatus: patch.status || prev.outcomeStatus }));
  const chairman = deals.filter((deal) => deal.chairmanOnly).slice(0, 3);
  const advice = astroAdvice(today);
  return (
    <TimelineBlock id="work" title="Работа" summary={bare ? "Фокус, сделки и подготовка" : text || "Главный результат ещё не задан"} active={active} complete={outcome.status === "done"} className="work-dominant" bare={bare} guidance={guidance}>
      {bare ? <div className="work-phase-status"><div><span className="eyebrow">Статус результата</span><p>{text ? "Результат задан в Компасе. Здесь только исполнение." : "Сначала задай измеримый результат в Компасе."}</p></div><ChoiceChips green options={OUTCOME_STATUS} value={outcome.status} onChange={(status) => updateOutcome({ status })} /></div> : <div className="work-outcome">
        <div className="outcome-head"><span className="eyebrow">Главный результат</span>{outcome.dueAt && <span className="num">{outcome.dueAt}</span>}</div>
        <h2>{text || "Задай результат в Компасе дня"}</h2>
        <ChoiceChips green options={OUTCOME_STATUS} value={outcome.status} onChange={(status) => updateOutcome({ status })} />
      </div>}
      <DeepWorkLauncher work={work} updateWork={updateWork} outcome={text} />
      <WorkPriorityStack deals={deals} setDeals={setDeals} today={today} northStar={northStar} compact={bare} />
      {(outcome.chairmanOnly || chairman.length > 0) && <Section kicker="Только Далер" title="Действия личного уровня" className="nested-section">
        {outcome.chairmanOnly && <ActionRow title={text || "Главный результат"} meta="Личное решение / closing"><Btn onClick={() => updateOutcome({ status: "done" })}>Готово</Btn></ActionRow>}
        {chairman.map((deal) => <ActionRow key={deal.id} title={deal.nextStep || deal.name} meta={`${deal.name}${deal.nextDate ? ` · ${deal.nextDate}` : ""}`}><Btn onClick={() => setDeals(deals.map((item) => item.id === deal.id ? { ...item, movementCount: (item.movementCount || 0) + 1 } : item))}>Готово</Btn></ActionRow>)}
      </Section>}
      {bare ? <div className="work-tools command-work-tools">
        <Btn onClick={() => setMeetingOpen(true)}>Подготовить встречу</Btn>
        <details className="command-artifacts">
          <summary><FileText size={16} aria-hidden="true" />Артефакт<ChevronDown size={15} aria-hidden="true" /></summary>
          <ChoiceChips options={ARTIFACT_TYPES} value={s.artifactType} onChange={(artifactType) => { up({ artifactType }); updateWork({ artifact: artifactType }); }} />
        </details>
      </div> : <div className="work-tools"><Btn onClick={() => setMeetingOpen(true)}>Подготовить встречу</Btn><ChoiceChips options={ARTIFACT_TYPES} value={s.artifactType} onChange={(artifactType) => { up({ artifactType }); updateWork({ artifact: artifactType }); }} /></div>}
      {meetingOpen && <MeetingPrepSheet value={work.meetingPrep} onChange={(meetingPrep) => updateWork({ meetingPrep })} onClose={() => setMeetingOpen(false)} />}
      {!bare && <><div className="leadership-prompt"><span className="eyebrow">Совет по развитию</span><strong>{deals.some((deal) => deal.blocker) ? "Говори последним — сначала выясни мотив и ограничение." : "Не выигрывай спор; получи решение и следующий шаг."}</strong></div><div className="work-context"><span>Контекст, не команда</span><p>{advice}</p></div></>}
    </TimelineBlock>
  );
}

export function EveningShutdownSheet({ s, up, deals, profile, active, bare = false, guidance = null }) {
  const evening = s.dailyProtocol.evening;
  const morning = s.dailyProtocol.morning;
  const outcome = s.primaryOutcome;
  const updateEvening = (patch) => up((prev) => ({ dailyProtocol: { ...prev.dailyProtocol, evening: { ...prev.dailyProtocol.evening, ...patch } }, shutdown: patch.shutdown ?? prev.shutdown }));
  const updateMorning = (patch) => up((prev) => ({ dailyProtocol: { ...prev.dailyProtocol, morning: { ...prev.dailyProtocol.morning, ...patch } } }));
  const setStatus = (status) => up((prev) => ({
    primaryOutcome: withPrimaryOutcome(prev.primaryOutcome, { status }),
    outcomeStatus: status === "missed" ? "no" : status,
    proofDone: status === "done",
    dailyProtocol: { ...prev.dailyProtocol, evening: { ...prev.dailyProtocol.evening, outcomeStatus: status } },
  }));
  const unresolved = ["partial", "missed", "blocked"].includes(evening.outcomeStatus || outcome.status);
  const movedDeal = deals.find((deal) => (deal.movementCount || 0) > 0);
  const suggestedWin = outcome.status === "done" ? primaryOutcomeText(outcome) : movedDeal ? `${movedDeal.name}: движение зафиксировано` : s.artifactType ? `Артефакт: ${s.artifactType}` : "";
  const registryItems = [
    ["dealRegisterUpdated", "Deal Register обновлён"],
    ["recoveryRegisterUpdated", "Recovery Register обновлён"],
    ["materialsClosed", "Материалы закрыты"],
  ];
  const complete = evening.shutdown;
  return (
    <TimelineBlock id="evening" title="Вечер" summary={complete ? "Рабочий день закрыт" : "Закрыть за 60–90 секунд"} active={active} complete={complete} bare={bare} guidance={guidance}>
      <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="pre_dinner" title="Перед ужином" note="условный шаг" />
      <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="pre_sleep" title="За 1–2 часа до сна" />
      <details className="column-details">
        <summary>По курсу</summary>
        <SupplementChecklist profile={profile} morning={morning} updateMorning={updateMorning} timings="course" />
      </details>
      <span className="eyebrow">Результат дня</span>
      <ChoiceChips green options={[{ label: "Выполнено", value: "done" }, { label: "Частично", value: "partial" }, { label: "Не выполнено", value: "missed" }]} value={evening.outcomeStatus || outcome.status} onChange={setStatus} />
      {unresolved && <div className="evening-resolution"><span className="eyebrow">Почему</span><ChoiceChips options={MISS_REASONS} value={evening.missReason || ""} onChange={(missReason) => updateEvening({ missReason })} /><span className="eyebrow">Решение</span><ChoiceChips options={MISS_ACTIONS} value={evening.resolution || ""} onChange={(resolution) => updateEvening({ resolution })} /></div>}
      <div className="win-row"><span className="eyebrow">Главная победа</span>{suggestedWin && !evening.mainWin && <button type="button" className="suggest-win" onClick={() => updateEvening({ mainWin: suggestedWin })}>{suggestedWin}</button>}<Field label="Один факт" value={evening.mainWin || ""} onChange={(mainWin) => { updateEvening({ mainWin }); up((prev) => ({ wins: [mainWin, ...prev.wins.slice(1)] })); }} placeholder="Только если сегодня изменена реальность" /></div>
      <div><span className="eyebrow">Делегировать / прекратить</span><ChoiceChips options={[{ label: "Делегировать", value: "delegate" }, { label: "Прекратить", value: "stop" }, { label: "Ничего сегодня", value: "none" }]} value={evening.delegateOrStop || ""} onChange={(delegateOrStop) => updateEvening({ delegateOrStop })} /></div>
      {["delegate", "stop"].includes(evening.delegateOrStop) && <Field label="Короткая заметка" value={evening.delegateNote} onChange={(delegateNote) => updateEvening({ delegateNote })} />}
      <details className="column-details"><summary>Регистры и восстановление</summary><div className="detail-stack">{registryItems.map(([key, label]) => <CheckRow key={key} on={evening[key]} onClick={() => updateEvening({ [key]: !evening[key] })} label={label} />)}<CheckRow on={evening.familyPresence} onClick={() => updateEvening({ familyPresence: !evening.familyPresence })} label="Время с близкими без телефона" /><CheckRow on={evening.noAlcohol} onClick={() => updateEvening({ noAlcohol: !evening.noAlcohol })} label="Без алкоголя" /><CheckRow on={evening.eveningWalk} onClick={() => updateEvening({ eveningWalk: !evening.eveningWalk })} label="Вечерняя прогулка / разгрузка" /><CheckRow on={evening.sleepReady} onClick={() => updateEvening({ sleepReady: !evening.sleepReady })} label="Подготовка ко сну · цель 7+ часов" /></div></details>
      <Btn primary big onClick={() => updateEvening({ shutdown: true })} disabled={!evening.outcomeStatus && !["done", "partial", "missed"].includes(outcome.status)}>Закрыть рабочий день и перейти в личное время</Btn>
    </TimelineBlock>
  );
}

const PHASES = [
  { id: "morning", label: "Утро", Icon: Sun },
  { id: "sport", label: "Спорт", Icon: Dumbbell },
  { id: "work", label: "Работа", Icon: BriefcaseBusiness },
  { id: "evening", label: "Вечер", Icon: Moon },
];

function phaseCounts(s, profile, date, deals) {
  const morning = s.dailyProtocol.morning;
  const training = s.dailyProtocol.training;
  const work = s.dailyProtocol.work;
  const evening = s.dailyProtocol.evening;
  const focusIds = profile.supplements.filter((item) => item.active && item.timing === "morning_focus").map((item) => item.id);
  const hydrationDone = morning.waterMl >= 500 && morning.supplementEvents.includes("electrolytes");
  const focusDone = morning.coffee !== "pending" && focusIds.every((id) => morning.supplementEvents.includes(id));
  const resetDone = morning.light && morning.breathwork && morning.rinse;
  const weeklyMedicationDone = weekday(date) !== 3 || morning.medicationStatus !== "pending";
  const workSignals = [
    ["in_progress", "done", "partial"].includes(s.primaryOutcome.status),
    work.deepWorkStatus !== "idle",
    deals.some((deal) => (deal.movementCount || 0) > 0) || Boolean(work.artifact || work.meetingPrep),
  ];
  const eveningSignals = [
    Boolean(evening.outcomeStatus),
    Boolean(evening.mainWin),
    evening.noAlcohol || evening.familyPresence || evening.eveningWalk || evening.sleepReady,
    evening.shutdown,
  ];
  return {
    morning: { done: [hydrationDone, focusDone, resetDone, weeklyMedicationDone].filter(Boolean).length, max: 4 },
    sport: { done: training.status === "done" ? 1 : 0, max: 1 },
    work: { done: workSignals.filter(Boolean).length, max: 3 },
    evening: { done: eveningSignals.filter(Boolean).length, max: 4 },
  };
}

function CommandPhaseTabs({ phase, setPhase, counts }) {
  return <div className="command-phase-tabs" role="tablist" aria-label="Этапы дня">
    {PHASES.map(({ id, label, Icon }) => <button type="button" role="tab" aria-selected={phase === id} className={phase === id ? "active" : ""} key={id} onClick={() => setPhase(id)}>
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
      <small>{counts[id].done}/{counts[id].max}</small>
    </button>)}
  </div>;
}

function TodayHealthRail({ s, profile, setPhase }) {
  const morning = s.dailyProtocol.morning;
  const training = s.dailyProtocol.training;
  const activeSupplements = profile.supplements.filter((item) => item.active);
  const supplementCount = new Set(morning.supplementEvents).size;
  const trainingLabel = training.status === "done" ? "Завершена" : training.status === "started" ? "Начата" : training.status === "shortened" ? "Сокращена" : "Запланирована";
  const rows = [
    { id: "water", label: "Вода", value: `${morning.waterMl || 0} / ${profile.morningWaterTargetMl || 700} мл`, Icon: Droplets, phase: "morning" },
    { id: "supplements", label: "Добавки", value: `${supplementCount} / ${activeSupplements.length}`, Icon: Pill, phase: "morning" },
    { id: "training", label: "Тренировка", value: trainingLabel, Icon: Activity, phase: "sport" },
  ];
  return <section className="command-rail-section">
    <div className="command-rail-heading"><span className="eyebrow">Здоровье</span><StatusBadge tone="neutral">сводка</StatusBadge></div>
    <div className="command-health-list">{rows.map(({ id, label, value, Icon, phase: nextPhase }) => <button type="button" key={id} onClick={() => setPhase(nextPhase)}>
      <Icon size={17} aria-hidden="true" /><span>{label}</span><strong>{value}</strong><ChevronDown size={15} aria-hidden="true" />
    </button>)}</div>
  </section>;
}

function CommandRail({ s, up, date, profile, setPhase }) {
  const [open, setOpen] = useState(false);
  return <aside className={`command-rail${open ? " open" : ""}`}>
    <button type="button" className="command-rail-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span><span className="eyebrow">Сводка дня</span><strong>Контекст, здоровье, развитие</strong></span><ChevronDown size={18} aria-hidden="true" />
    </button>
    <div className="command-rail-content">
      <TodayForecast date={date} compact />
      <TodayHealthRail s={s} profile={profile} setPhase={setPhase} />
      <section className="command-rail-section">
        <div className="command-rail-heading"><span className="eyebrow">Развитие</span><StatusBadge tone="neutral">сегодня</StatusBadge></div>
        <Development s={s} up={up} date={date} rail />
      </section>
    </div>
  </aside>;
}

function FullRitualPrompt({ s, up }) {
  const [open, setOpen] = useState(false);
  const affirmations = AFFIRMATIONS.map((_, index) => Boolean(s.aff?.[index]));
  const ritualTotal = AFFIRMATIONS.length + 1;
  const doneCount = affirmations.filter(Boolean).length + (s.decl ? 1 : 0);
  const nextAffirmation = AFFIRMATIONS[affirmations.findIndex((done) => !done)];
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);
  const toggleAffirmation = (index) => up((prev) => ({
    aff: AFFIRMATIONS.map((_, itemIndex) => itemIndex === index ? !prev.aff?.[itemIndex] : Boolean(prev.aff?.[itemIndex])),
  }));
  return <>
    <button type="button" className="command-ritual-prompt" aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <BookOpen size={18} aria-hidden="true" />
      <span><span className="eyebrow">Полный ритуал · {doneCount}/{ritualTotal}</span><strong>{doneCount === ritualTotal ? "Аффирмации и Декларация завершены" : nextAffirmation ? `«${nextAffirmation}»` : "Декларация · прочитать вслух"}</strong></span>
      <span>Открыть</span>
    </button>
    {open && <div className="ritual-modal-backdrop" onMouseDown={() => setOpen(false)}>
      <section className="ritual-modal" role="dialog" aria-modal="true" aria-labelledby="full-ritual-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="ritual-modal-head">
          <div><span className="eyebrow">Полный ритуал</span><h2 id="full-ritual-title">Аффирмации и Декларация</h2></div>
          <button type="button" title="Закрыть" aria-label="Закрыть полный ритуал" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>
        <div className="ritual-progress"><span style={{ width: `${(doneCount / ritualTotal) * 100}%` }} /><small>{doneCount} из {ritualTotal}</small></div>
        <div className="ritual-affirmations">
          <span className="eyebrow">Аффирмации</span>
          {AFFIRMATIONS.map((affirmation, index) => <CheckRow key={affirmation} gold on={affirmations[index]} onClick={() => toggleAffirmation(index)} label={`«${affirmation}»`} />)}
        </div>
        <div className="ritual-declaration">
          <span className="eyebrow">Декларация</span>
          <p>{DECLARATION}</p>
          <CheckRow gold on={s.decl} onClick={() => up({ decl: !s.decl })} label="Прочитано вслух, принято" />
        </div>
        <Btn primary onClick={() => setOpen(false)}>Готово</Btn>
      </section>
    </div>}
  </>;
}

export function DailyColumnsGrid({ s, up, date, deals, setDeals, northStar, profile, plan, updatePlan, phase, setPhase }) {
  const counts = phaseCounts(s, profile, date, deals);
  const guidance = <FullRitualPrompt s={s} up={up} />;
  return (
    <div className="command-day-board">
      <CommandPhaseTabs phase={phase} setPhase={setPhase} counts={counts} />
      <div className="command-board-layout">
        <div className="command-active-phase" role="tabpanel">
          {phase === "morning" && <MorningColumn s={s} up={up} profile={profile} date={date} active bare guidance={guidance} />}
          {phase === "sport" && <SportColumn s={s} up={up} date={date} plan={plan} updatePlan={updatePlan} active bare guidance={guidance} />}
          {phase === "work" && <WorkColumn s={s} up={up} deals={deals} setDeals={setDeals} today={date} northStar={northStar} active bare guidance={guidance} />}
          {phase === "evening" && <EveningShutdownSheet s={s} up={up} deals={deals} profile={profile} active bare guidance={guidance} />}
        </div>
        <CommandRail s={s} up={up} date={date} profile={profile} setPhase={setPhase} />
      </div>
      {phase !== "evening" && <button type="button" className="evening-next-strip" onClick={() => setPhase("evening")}>
        <Moon size={23} aria-hidden="true" /><span><small className="eyebrow">Вечер · следующий шаг</small><strong>{s.dailyProtocol.evening.shutdown ? "Рабочий день закрыт" : "Закрыть день за 60–90 секунд"}</strong></span><span>Открыть <ArrowRight size={17} aria-hidden="true" /></span>
      </button>}
    </div>
  );
}
