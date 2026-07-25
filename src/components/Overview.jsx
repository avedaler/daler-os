import { useEffect, useState } from "react";
import { migrateDay, primaryOutcomeText } from "../constants";
import { addDays, weekday } from "../lib/date";
import { dayScore } from "../lib/score";
import { loadDay } from "../lib/store";
import CeoReview from "./CeoReview";
import AchievementsCalendar from "./AchievementsCalendar";
import Week from "./Week";
import { Btn, EmptyState, StatusBadge } from "./atoms";

function ArchivePanel({ date, setDate, today }) {
  const [day, setDay] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    (async () => {
      const raw = await loadDay(date);
      if (!active) return;
      setDay(raw ? migrateDay(raw) : null);
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [date]);

  const score = day ? dayScore(day) : null;
  return <div className="archive-panel">
    <div className="archive-controls">
      <Btn onClick={() => setDate(addDays(date, -1))} aria-label="Предыдущий день">Назад</Btn>
      <label className="archive-date"><span>Дата</span><input className="input" type="date" value={date} max={today} onChange={(event) => setDate(event.target.value)} /></label>
      <Btn onClick={() => setDate(addDays(date, 1))} disabled={date >= today} aria-label="Следующий день">Вперёд</Btn>
      {date !== today && <Btn onClick={() => setDate(today)}>Сегодня</Btn>}
    </div>
    {!loaded ? null : !day ? <EmptyState title="День не заполнен" text="Для этой даты пока нет сохраненной записи." /> : <div className="archive-day">
      <div className="archive-score"><span>Баланс дня</span><strong>{score.pts}<small> / {score.max}</small></strong><StatusBadge tone={day.shutdown ? "green" : "neutral"}>{day.shutdown ? "закрыт" : "не закрыт"}</StatusBadge></div>
      <div className="archive-facts">
        <div><span>Главный результат</span><strong>{primaryOutcomeText(day.primaryOutcome) || "Не задан"}</strong><small>{day.primaryOutcome.status}</small></div>
        <div><span>Утро</span><strong>{day.dailyProtocol.morning.waterMl || 0} мл воды</strong><small>{day.dailyProtocol.morning.supplementEvents.length} отметок схемы</small></div>
        <div><span>Тренировка</span><strong>{day.dailyProtocol.training.status || "planned"}</strong><small>{day.dailyProtocol.training.plannedSessionId || "не выбрана"}</small></div>
        <div><span>Победа дня</span><strong>{day.dailyProtocol.evening.mainWin || day.wins[0] || "Не зафиксирована"}</strong><small>{day.dailyProtocol.evening.outcomeStatus || day.primaryOutcome.status}</small></div>
      </div>
    </div>}
  </div>;
}

export default function Overview({ date, setDate, today, sub, setSub }) {
  const isFriday = weekday(date) === 5;
  const tabs = [
    ["week", "Неделя"],
    ["ceo", isFriday ? "CEO-review · сегодня" : "CEO-review"],
    ["calendar", "Календарь"],
    ["archive", "Архив"],
  ];
  return <>
    <div className="seg" role="tablist" aria-label="Обзор исполнения">
      {tabs.map(([key, label]) => <button type="button" role="tab" aria-selected={sub === key} key={key} onClick={() => setSub(key)} className={sub === key ? "on" : ""}>{label}</button>)}
    </div>
    {sub === "week" && <Week date={date} />}
    {sub === "ceo" && <CeoReview date={date} />}
    {sub === "calendar" && <AchievementsCalendar date={date} today={today} />}
    {sub === "archive" && <ArchivePanel date={date} setDate={setDate} today={today} />}
  </>;
}
