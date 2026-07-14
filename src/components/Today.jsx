import { useEffect, useState } from "react";
import { migrateDay, primaryOutcomeText } from "../constants";
import { addDays } from "../lib/date";
import { loadDay } from "../lib/store";
import { DailyColumnsGrid, DailyCompass } from "./DailyColumns";

function phaseForTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  const hour = hours + (minutes || 0) / 60;
  return hour < 9 ? "morning" : hour < 10.5 ? "sport" : hour < 19 ? "work" : "evening";
}

export default function Today({
  s,
  up,
  deals,
  setDeals,
  date,
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

  useEffect(() => setPhase(phaseForTime(time)), [date]);

  return (
    <div className="today-screen">
      <DailyCompass s={s} up={up} date={date} northStar={northStar} deals={deals} yesterdayOutcome={yesterdayOutcome} onContinue={() => setPhase(phaseForTime(time))} />
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
