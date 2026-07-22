import { useEffect, useMemo, useState } from "react";
import { migrateDay } from "../constants";
import { calendarMetrics, dailyEvents } from "../lib/achievements";
import { addDays, MO_NOM } from "../lib/date";
import { listDays, loadDay } from "../lib/store";
import { Btn, EmptyState } from "./atoms";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS_GENITIVE = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function pluralize(value, one, few, many) {
  const mod100 = value % 100;
  const mod10 = value % 10;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function monthStart(iso) {
  return `${iso.slice(0, 7)}-01`;
}

function shiftMonth(iso, amount) {
  const [year, month] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + amount, 1)).toISOString().slice(0, 10);
}

function monthGrid(iso) {
  const [year, month] = iso.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  const start = addDays(iso, -mondayOffset);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function formatSelected(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return `${day} ${MONTHS_GENITIVE[month - 1]} ${year}`;
}

function shortEvent(event) {
  if (event.id === "no-smoke") return "Без курения";
  if (event.id === "no-alcohol") return "Без алкоголя";
  if (event.id === "primary-outcome") return "Результат";
  if (event.id === "training") return "Тренировка";
  if (event.id === "shutdown") return "День закрыт";
  return event.label;
}

export default function AchievementsCalendar({ date, today }) {
  const [month, setMonth] = useState(() => monthStart(date));
  const [selected, setSelected] = useState(date);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const grid = useMemo(() => monthGrid(month), [month]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      const available = await listDays();
      const wanted = available.filter((iso) => iso >= grid[0] && iso <= grid[grid.length - 1]);
      const loaded = await Promise.all(wanted.map(async (iso) => [iso, migrateDay(await loadDay(iso))]));
      if (!active) return;
      setRecords(Object.fromEntries(loaded));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [grid]);

  const eventsByDate = useMemo(() => Object.fromEntries(Object.entries(records).map(([iso, day]) => [iso, dailyEvents(day)])), [records]);
  const currentMonthEvents = useMemo(() => Object.fromEntries(Object.entries(eventsByDate).filter(([iso]) => iso.slice(0, 7) === month.slice(0, 7))), [eventsByDate, month]);
  const metrics = useMemo(() => calendarMetrics(currentMonthEvents), [currentMonthEvents]);
  const selectedEvents = eventsByDate[selected] || [];

  const goMonth = (amount) => {
    const next = shiftMonth(month, amount);
    setMonth(next);
    setSelected(next);
  };
  const goToday = () => {
    setMonth(monthStart(today));
    setSelected(today);
  };

  const [year, monthNumber] = month.split("-").map(Number);
  return <section className="achievement-calendar" aria-label="Календарь событий и достижений">
    <div className="calendar-toolbar">
      <div>
        <span className="eyebrow">История исполнения</span>
        <h2>{MO_NOM[monthNumber - 1]} {year}</h2>
      </div>
      <div className="calendar-toolbar-actions">
        <Btn onClick={() => goMonth(-1)} aria-label="Предыдущий месяц" title="Предыдущий месяц">←</Btn>
        <Btn onClick={goToday}>Сегодня</Btn>
        <Btn onClick={() => goMonth(1)} aria-label="Следующий месяц" title="Следующий месяц">→</Btn>
      </div>
    </div>

    <div className="calendar-metrics" aria-label="Итоги месяца">
      <div><span>Без курения</span><strong>{metrics.noSmoke}</strong><small>{pluralize(metrics.noSmoke, "день", "дня", "дней")}</small></div>
      <div><span>Без алкоголя</span><strong>{metrics.noAlcohol}</strong><small>{pluralize(metrics.noAlcohol, "день", "дня", "дней")}</small></div>
      <div><span>Тренировки</span><strong>{metrics.training}</strong><small>{pluralize(metrics.training, "день", "дня", "дней")}</small></div>
      <div><span>Результаты</span><strong>{metrics.outcomes}</strong><small>закрыто</small></div>
      <div><span>Shutdown</span><strong>{metrics.shutdowns}</strong><small>{pluralize(metrics.shutdowns, "день", "дня", "дней")}</small></div>
      <div><span>Все события</span><strong>{metrics.total}</strong><small>{pluralize(metrics.total, "отметка", "отметки", "отметок")}</small></div>
    </div>

    <div className="calendar-layout">
      <div className="calendar-grid" aria-busy={loading}>
        {WEEKDAYS.map((weekday) => <div className="calendar-weekday" key={weekday}>{weekday}</div>)}
        {grid.map((iso) => {
          const events = eventsByDate[iso] || [];
          const outside = iso.slice(0, 7) !== month.slice(0, 7);
          return <button
            type="button"
            key={iso}
            className={`calendar-day${outside ? " outside" : ""}${iso === selected ? " selected" : ""}${iso === today ? " today" : ""}`}
            onClick={() => setSelected(iso)}
            aria-label={`${formatSelected(iso)}. ${events.length} ${pluralize(events.length, "событие", "события", "событий")}`}
            aria-pressed={iso === selected}
          >
            <span className="calendar-day-number">{Number(iso.slice(8))}</span>
            <span className="calendar-day-events">
              {events.slice(0, 2).map((event) => <span className={`calendar-event-marker ${event.tone}`} key={event.id}><i />{shortEvent(event)}</span>)}
              {events.length > 2 && <span className="calendar-more">+{events.length - 2}</span>}
            </span>
          </button>;
        })}
      </div>

      <aside className="calendar-detail" aria-live="polite">
        <div className="calendar-detail-head">
          <span className="eyebrow">{formatSelected(selected)}</span>
          <strong>{selectedEvents.length} {pluralize(selectedEvents.length, "событие", "события", "событий")}</strong>
        </div>
        {loading ? <p className="quiet-copy">Загружаю историю…</p> : selectedEvents.length === 0 ? (
          <EmptyState title="Нет отметок" text="В этот день события и достижения ещё не зафиксированы." />
        ) : (
          <div className="calendar-event-list">
            {selectedEvents.map((event) => <div className={`calendar-event-row ${event.tone}`} key={event.id}>
              <i />
              <div><strong>{event.label}</strong><span>{event.category}</span>{event.detail && <p>{event.detail}</p>}</div>
            </div>)}
          </div>
        )}
      </aside>
    </div>
  </section>;
}
