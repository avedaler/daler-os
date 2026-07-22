import { useEffect, useState } from "react";
import { HOBBIES } from "../constants";
import { addDays } from "../lib/date";
import { buildDayIcs, buildReminderText, buildRitualsIcs, downloadFile } from "../lib/ics";
import { loadDay } from "../lib/store";
import Forecast from "./Forecast";
import Settings from "./Settings";
import { Btn, CheckRow, ChoiceChips, Field, Section, SettingsRow, StatusBadge } from "./atoms";

function useStreaks(date) {
  const [streaks, setStreaks] = useState({ noSmoke: 0, noAlcohol: 0 });
  useEffect(() => {
    let active = true;
    (async () => {
      const out = { noSmoke: 0, noAlcohol: 0 };
      for (const key of ["noSmoke", "noAlcohol"]) {
        for (let index = 1; index <= 90; index += 1) {
          const value = await loadDay(addDays(date, -index));
          if (value?.habits?.[key]) out[key] += 1;
          else break;
        }
      }
      if (active) setStreaks(out);
    })();
    return () => { active = false; };
  }, [date]);
  return streaks;
}

export function Development({ s, up, date, compact = false, rail = false }) {
  const setHabit = (patch) => up((previous) => ({ habits: { ...previous.habits, ...patch } }));
  const streaks = useStreaks(date);
  const habits = s.habits;
  const streakLabel = (base, count, on) => `${base}${count + (on ? 1 : 0) > 0 ? ` · серия ${count + (on ? 1 : 0)} дн.` : ""}`;
  const core = <>
    <CheckRow gold on={habits.noSmoke} onClick={() => setHabit({ noSmoke: !habits.noSmoke })} label={streakLabel("Не курил", streaks.noSmoke, habits.noSmoke)} />
    <CheckRow gold on={habits.noAlcohol} onClick={() => setHabit({ noAlcohol: !habits.noAlcohol })} label={streakLabel("Без алкоголя", streaks.noAlcohol, habits.noAlcohol)} />
    <CheckRow on={habits.logic} onClick={() => setHabit({ logic: !habits.logic })} label="20 минут законов логики" meta="навык дня" />
    <CheckRow on={Boolean(habits.comfortExit)} onClick={() => setHabit({ comfortExit: habits.comfortExit ? "" : "✓" })} label="Вышел из зоны комфорта" meta="один конкретный поступок" />
  </>;

  if (rail) return <div className="command-development-list">
    <CheckRow gold on={habits.noSmoke} onClick={() => setHabit({ noSmoke: !habits.noSmoke })} label={streakLabel("Без курения", streaks.noSmoke, habits.noSmoke)} />
    <CheckRow gold on={habits.noAlcohol} onClick={() => setHabit({ noAlcohol: !habits.noAlcohol })} label={streakLabel("Без алкоголя", streaks.noAlcohol, habits.noAlcohol)} />
    <CheckRow on={habits.logic} onClick={() => setHabit({ logic: !habits.logic })} label="Логика · 20 минут" />
  </div>;

  if (compact) return <Section kicker="один шаг сверх операционки" title="Развитие сегодня" className="home-development">
    <div className="development-grid">{core}</div>
    <div className="development-focus"><span className="eyebrow">Личный фокус</span><ChoiceChips options={HOBBIES} value={habits.hobby} onChange={(hobby) => setHabit({ hobby })} /></div>
  </Section>;

  return <Section kicker="ежедневный учет" title="Личное развитие">
    <div className="development-grid">{core}</div>
    {habits.comfortExit && <Field label="Что именно" value={habits.comfortExit === "✓" ? "" : habits.comfortExit} onChange={(comfortExit) => setHabit({ comfortExit: comfortExit || "✓" })} />}
    <CheckRow on={Boolean(habits.social)} onClick={() => setHabit({ social: habits.social ? "" : "✓" })} label="Встреча в высоких кругах" />
    {habits.social && <Field label="С кем и следующий шаг" value={habits.social === "✓" ? "" : habits.social} onChange={(social) => setHabit({ social: social || "✓" })} />}
    <div className="development-focus"><span className="eyebrow">Личный фокус</span><ChoiceChips options={HOBBIES} value={habits.hobby} onChange={(hobby) => setHabit({ hobby })} /></div>
  </Section>;
}

function ExportTools({ date, s, settings, deals }) {
  const [copyMsg, setCopyMsg] = useState("");
  return <Section kicker="печать · календарь · reminders" title="Экспорт дня">
    <div className="button-pair">
      <Btn primary onClick={() => window.print()}>Печать инструкции</Btn>
      <Btn onClick={() => downloadFile(`daler-os-${date}.ics`, buildDayIcs(date, s, settings, deals))}>День в календарь</Btn>
      <Btn onClick={() => downloadFile(`daler-os-rituals-${date}.ics`, buildRitualsIcs(date, settings, 30))}>Ритуалы на 30 дней</Btn>
      <Btn onClick={async () => {
        try {
          await navigator.clipboard.writeText(buildReminderText(date, s, settings, deals));
          setCopyMsg("Скопировано для Apple Reminders");
        } catch { setCopyMsg("Буфер недоступен"); }
        setTimeout(() => setCopyMsg(""), 5000);
      }}>Скопировать для Reminders</Btn>
    </div>
    {copyMsg && <p className="success-copy">{copyMsg}</p>}
  </Section>;
}

const ROUTINE_GROUPS = [
  ["after_wake", "После пробуждения"],
  ["morning_focus", "Через 10–15 минут"],
  ["pre_first_meal", "До первого приема пищи"],
  ["after_first_meal", "После первого приема пищи"],
  ["daytime", "Днем"],
  ["course_daytime", "Днем · по курсу"],
  ["pre_dinner", "Перед ужином"],
  ["pre_sleep", "Перед сном"],
  ["course", "По курсу"],
];

function HealthProfileEditor({ profile, updateProfile }) {
  const medication = profile.medications.find((item) => item.id === "mounjaro");
  const patchMedication = (patch) => updateProfile((current) => ({
    ...current,
    medications: current.medications.map((item) => item.id === "mounjaro" ? { ...item, ...patch } : item),
  }));
  const patchSupplement = (id, patch) => updateProfile((current) => ({
    ...current,
    supplements: current.supplements.map((item) => item.id === id ? { ...item, ...patch } : item),
  }));
  return <div className="profile-editor">
    <Section kicker="текущая схема" title="Ритм питания и воды">
      <div className="profile-status"><StatusBadge tone="gold">завтрак пропущен</StatusBadge><span>Первый stack с едой привязан к первому приему пищи.</span></div>
      <div className="form-grid three">
        <Field label="Подъем" type="time" value={profile.wakeTime} onChange={(wakeTime) => updateProfile({ wakeTime })} />
        <Field label="Вода утром, мл" type="number" min="500" max="700" value={profile.morningWaterTargetMl} onChange={(value) => updateProfile({ morningWaterTargetMl: Math.max(500, Math.min(700, Number(value) || 500)) })} />
        <Field label="Вода за день, мл" type="number" min="1000" max="6000" value={profile.waterTargetMl} onChange={(value) => updateProfile({ waterTargetMl: Number(value) || 3250 })} />
      </div>
    </Section>
    <Section kicker="среда" title="Mounjaro">
      <CheckRow gold on={Boolean(medication?.active)} onClick={() => patchMedication({ active: !medication?.active })} label="Еженедельная отметка включена" />
      <Field label="Текущая доза" value={medication?.dose || ""} onChange={(dose) => patchMedication({ dose: dose || null })} placeholder="Не указана" help="Пустое значение сохраняется без предположений." />
    </Section>
    <Section kicker="редактируемый список" title="Добавки по времени">
      <div className="routine-editor-list">
        {ROUTINE_GROUPS.map(([timing, label]) => {
          const items = profile.supplements.filter((item) => item.timing === timing && !item.legacy);
          if (!items.length) return null;
          return <details className="routine-editor-group" key={timing} open={["after_wake", "morning_focus"].includes(timing)}>
            <summary>{label}<span>{items.filter((item) => item.active).length}/{items.length}</span></summary>
            <div>{items.map((item) => <div className="supplement-edit-row" key={item.id}>
              <CheckRow on={item.active} onClick={() => patchSupplement(item.id, { active: !item.active })} label={item.name} meta={item.instructions} />
              <Field label="Доза" value={item.dose || ""} onChange={(dose) => patchSupplement(item.id, { dose: dose || null, confirmedByUser: true })} placeholder="Не указана" />
            </div>)}</div>
          </details>;
        })}
      </div>
    </Section>
  </div>;
}

const TRAINING_DAYS = [
  ["monday", "Понедельник"], ["tuesday", "Вторник"], ["wednesday", "Среда"], ["thursday", "Четверг"],
  ["friday", "Пятница"], ["saturday", "Суббота"], ["sunday", "Воскресенье"],
];
const TRAINING_TYPES = [
  { label: "Силовая", value: "strength" }, { label: "Плавание / Zone 2", value: "swim" },
  { label: "Восстановление", value: "recovery" }, { label: "Отдых", value: "rest" },
];

function TrainingPlanEditor({ plan, updatePlan }) {
  const patchDay = (dayKey, patch) => updatePlan((current) => ({ ...current, days: { ...current.days, [dayKey]: { ...current.days[dayKey], ...patch } } }));
  const program = plan.program || {};
  const guidance = program.guidance || {};
  const exerciseMeta = (exercise) => [
    exercise.sets ? `${exercise.sets} × ${exercise.reps}` : exercise.reps,
    exercise.restSec ? `отдых ${exercise.restSec} сек` : "",
    exercise.note || "",
  ].filter(Boolean).join(" · ");
  const actionWord = (count) => count === 1 ? "действие" : count >= 2 && count <= 4 ? "действия" : "действий";
  return <>
    <Section kicker="рост мышц и сила" title={`${program.strengthDays || 4} силовых дня · ${program.durationWeeks || 12} недель`}>
      <div className="training-program-metrics">
        <div><span>Подходы</span><strong>{guidance.sets || "3–4 рабочих"}</strong></div>
        <div><span>Повторения</span><strong>{guidance.reps || "6–12"}</strong></div>
        <div><span>Запас</span><strong>{guidance.reserve || "1–2 RIR"}</strong></div>
        <div><span>Сон</span><strong>{guidance.sleep || "7–8 часов"}</strong></div>
      </div>
      <div className="training-program-guidance">
        <p><strong>Принципы:</strong> {(program.principles || []).join(" · ")}</p>
        <p><strong>Кардио:</strong> {guidance.cardio}</p>
        <p><strong>Питание:</strong> белок {guidance.protein}</p>
      </div>
    </Section>
    <Section kicker="адаптивная неделя" title="Тренировочный план">
      <div className="training-plan-list">{TRAINING_DAYS.map(([dayKey, label]) => {
        const session = plan.days[dayKey];
        const exercises = Array.isArray(session.exercises) ? session.exercises : [];
        return <div className="training-plan-day" key={dayKey}>
          <div className="training-plan-row">
            <div><strong>{label}</strong><small>{session.title || session.focus.replaceAll("_", " ")}</small><span>{session.subtitle}</span></div>
            <ChoiceChips options={TRAINING_TYPES} value={session.type} onChange={(type) => patchDay(dayKey, { type })} />
            <Field label="Минут" type="number" min="0" max="180" value={session.duration} onChange={(duration) => patchDay(dayKey, { duration: Number(duration) || 0, durationLabel: "" })} />
          </div>
          {exercises.length > 0 && <details className="training-day-details">
            <summary>План · {exercises.length} {actionWord(exercises.length)}</summary>
            <div>{exercises.map((exercise, index) => <div className="training-day-exercise" key={exercise.id}>
              <span>{index + 1}</span><strong>{exercise.name}</strong><small>{exerciseMeta(exercise)}</small>
            </div>)}</div>
          </details>}
        </div>;
      })}</div>
      <details className="training-reference">
        <summary>Открыть исходную схему</summary>
        <img loading="lazy" src={`${import.meta.env.BASE_URL}training-program.jpg`} alt="Программа тренировок: рост мышц и сила, четыре дня в неделю" />
      </details>
    </Section>
    <Section kicker="опционально" title="Холодное погружение">
      <CheckRow on={plan.safetyProfile.coldExposureAcknowledged} onClick={() => updatePlan((current) => ({ ...current, safetyProfile: { ...current.safetyProfile, coldExposureAcknowledged: !current.safetyProfile.coldExposureAcknowledged } }))} label="Правила безопасности подтверждены" meta="Только в дни плавания или восстановления; не сразу после силовой." />
    </Section>
  </>;
}

const MORE_GROUPS = [
  ["Фокус", [["forecast", "Расчет дня и периода", "Луна, личный день, окна и риски"], ["development", "Развитие", "Привычки, серии и личный фокус"]]],
  ["Режим", [["health", "Схема здоровья", "Mounjaro по средам и текущий stack"], ["training", "Тренировочная неделя", "Нагрузка, восстановление и замены"]]],
  ["Данные и доступ", [["export", "Экспорт и печать", "Календарь, Reminders и инструкция"], ["settings", "Настройки", "Расписание, синхронизация и блокировка"]]],
];

export default function More({ initialView = "", s, up, date, today, deals, settings, upSettings, healthProfile, updateHealthProfile, trainingPlan, updateTrainingPlan, onLock }) {
  const [view, setView] = useState(initialView);
  useEffect(() => {
    if (initialView) setView(initialView);
  }, [initialView]);
  if (view) return <div className="more-detail">
    <button type="button" className="back-action" onClick={() => setView("")}>Назад к системе</button>
    {view === "development" && <Development s={s} up={up} date={date} />}
    {view === "health" && <HealthProfileEditor profile={healthProfile} updateProfile={updateHealthProfile} />}
    {view === "training" && <TrainingPlanEditor plan={trainingPlan} updatePlan={updateTrainingPlan} />}
    {view === "forecast" && <Forecast today={today} />}
    {view === "export" && <ExportTools date={date} s={s} settings={settings} deals={deals} />}
    {view === "settings" && <Settings settings={settings} upSettings={upSettings} date={date} onLock={onLock} />}
  </div>;

  return <div className="more-index">{MORE_GROUPS.map(([group, items]) => <Section kicker={group} key={group} className="settings-group">
    {items.map(([key, title, description]) => <SettingsRow key={key} title={title} description={description} onClick={() => setView(key)} />)}
  </Section>)}</div>;
}
