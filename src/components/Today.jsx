import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { migrateDay, primaryOutcomeText } from "../constants";
import { addDays } from "../lib/date";
import { loadDay } from "../lib/store";
import { StatusBadge } from "./atoms";
import { DailyColumnsGrid, DailyCompass } from "./DailyColumns";

function phaseForTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const hour = hours + (minutes || 0) / 60;
  return hour < 9 ? "morning" : hour < 10.5 ? "sport" : hour < 19 ? "work" : "evening";
}

function selectedDayLabel(date, today) {
  if (date === today) return "Сегодня";
  if (date === addDays(today, 1)) return "Завтра";
  if (date === addDays(today, -1)) return "Вчера";
  return date < today ? "Прошедший день" : "Будущий день";
}

function DaySwitcher({ date, today, setDate, started }) {
  const tomorrow = addDays(today, 1);
  return (
    <section className="day-switcher" aria-label="Выбор рабочего дня">
      <div className="day-switcher-main">
        <button type="button" className="day-switcher-icon" title="Предыдущий день" aria-label="Предыдущий день" onClick={() => setDate(addDays(date, -1))}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <label className="day-switcher-picker">
          <CalendarDays size={18} aria-hidden="true" />
          <span><small>{selectedDayLabel(date, today)}</small><input type="date" value={date} aria-label="Выбрать день" onInput={(event) => setDate(event.currentTarget.value)} /></span>
        </label>
        <button type="button" className="day-switcher-icon" title="Следующий день" aria-label="Следующий день" onClick={() => setDate(addDays(date, 1))}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="day-switcher-presets" role="group" aria-label="Быстрый выбор дня">
        <button type="button" className={date === today ? "active" : ""} aria-pressed={date === today} onClick={() => setDate(today)}>Сегодня</button>
        <button type="button" className={date === tomorrow ? "active" : ""} aria-pressed={date === tomorrow} onClick={() => setDate(tomorrow)}>Завтра</button>
      </div>
      <StatusBadge tone={started ? "green" : "gold"}>{started ? "день запущен" : "к запуску"}</StatusBadge>
    </section>
  );
}

export default function Today({
  s,
  up,
  deals,
  setDeals,
  date,
  today,
  setDate,
  time,
  northStar,
  healthProfile,
  trainingPlan,
  updateTrainingPlan,
}) {
  const [yesterdayOutcome, setYesterdayOutcome] = useState("");
  const [phase, setPhase] = useState(() => phaseForTime(time));

  useEffect(() => {
    let active = true;
    (async () => {
      const raw = await loadDay(addDays(date, -1));
      if (!active) return;
      if (!raw) return setYesterdayOutcome("");
      const day = migrateDay(raw);
      setYesterdayOutcome(day.primaryOutcome.status !== "done" ? primaryOutcomeText(day.primaryOutcome) : "");
    })();
    return () => { active = false; };
  }, [date]);

  useEffect(() => setPhase(date === today ? phaseForTime(time) : "morning"), [date, today]);

  return (
    <div className="today-screen">
      <DaySwitcher date={date} today={today} setDate={setDate} started={s.dayStarted} />
      <DailyCompass s={s} up={up} date={date} today={today} northStar={northStar} deals={deals} yesterdayOutcome={yesterdayOutcome} onContinue={() => setPhase(date === today ? phaseForTime(time) : "morning")} />
      <DailyColumnsGrid
        s={s}
        up={up}
        date={date}
        deals={deals}
        setDeals={setDeals}
        northStar={northStar}
        profile={healthProfile}
        plan={trainingPlan}
        updatePlan={updateTrainingPlan}
        phase={phase}
        setPhase={setPhase}
      />
    </div>
  );
}
