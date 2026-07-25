// Генерация .ics (Apple/Google Calendar) и текста для Apple Reminders.
import { STAGES, primaryOutcomeText } from "../constants";

const esc = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const dt = (iso, hhmm) => `${iso.replace(/-/g, "")}T${hhmm.replace(":", "")}00`;
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";

const VTZ = `BEGIN:VTIMEZONE
TZID:Asia/Kuala_Lumpur
BEGIN:STANDARD
DTSTART:19700101T000000
TZOFFSETFROM:+0800
TZOFFSETTO:+0800
TZNAME:+08
END:STANDARD
END:VTIMEZONE`;

function vevent({ uid, iso, start, minutes, title, desc, rrule, allDay }) {
  const L = ["BEGIN:VEVENT", `UID:${uid}@daler-os`, `DTSTAMP:${stamp()}`];
  if (allDay) {
    L.push(`DTSTART;VALUE=DATE:${iso.replace(/-/g, "")}`);
  } else {
    const [h, m] = start.split(":").map(Number);
    const endM = h * 60 + m + minutes;
    const end = `${String(Math.floor(endM / 60) % 24).padStart(2, "0")}:${String(endM % 60).padStart(2, "0")}`;
    L.push(`DTSTART;TZID=Asia/Kuala_Lumpur:${dt(iso, start)}`);
    L.push(`DTEND;TZID=Asia/Kuala_Lumpur:${dt(iso, end)}`);
  }
  if (rrule) L.push(`RRULE:${rrule}`);
  L.push(`SUMMARY:${esc(title)}`);
  if (desc) L.push(`DESCRIPTION:${esc(desc)}`);
  L.push("BEGIN:VALARM", "TRIGGER:-PT5M", "ACTION:DISPLAY", `DESCRIPTION:${esc(title)}`, "END:VALARM", "END:VEVENT");
  return L.join("\r\n");
}

function wrap(events) {
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//DALER OS//RU", "CALSCALE:GREGORIAN", VTZ, ...events, "END:VCALENDAR"].join("\r\n");
}

export function buildTaskIcs(task) {
  const iso = task.date || new Date().toISOString().slice(0, 10);
  return wrap([vevent({
    uid: `task-${task.id || iso}-${iso}`,
    iso,
    start: task.time || "09:00",
    minutes: Number(task.minutes) || 30,
    allDay: !task.time,
    title: task.title || "DALER OS · Задача",
    desc: task.notes || "",
  })]);
}

// События одного дня: ритуалы + фокус + сделки с шагом на эту дату
export function buildDayIcs(iso, s, settings, deals) {
  const ev = [];
  const outcome = primaryOutcomeText(s.primaryOutcome);
  ev.push(vevent({
    uid: `morning-${iso}`, iso, start: settings.morningTime || "07:30", minutes: 20,
    title: "DALER OS · Утренний ритуал",
    desc: [outcome && `Результат дня: ${outcome}`, s.dailyProtocol?.compass?.noToday && `Нет: ${s.dailyProtocol.compass.noToday}`].filter(Boolean).join("\n") || "Состояние, главный результат, одно «нет»",
  }));
  ev.push(vevent({
    uid: `architect-${iso}`, iso, start: settings.architectTime || "15:00", minutes: 60,
    title: "DALER OS · Час Архитектора",
    desc: (outcome ? `Фокус: ${outcome}\n` : "") + "Без телефона и встреч. Выход — артефакт: решение / memo / список.",
  }));
  ev.push(vevent({
    uid: `shutdown-${iso}`, iso, start: settings.shutdownTime || "21:30", minutes: 20,
    title: "DALER OS · Shutdown",
    desc: "Результат, решение по незавершённому, одна победа и shutdown.",
  }));
  for (const d of deals.filter((d) => d.nextDate === iso && d.stage < 9)) {
    ev.push(vevent({
      uid: `deal-${d.id}-${iso}`, iso, allDay: true,
      title: `Сделка: ${d.name} — ${d.nextStep || "следующий шаг"}`,
      desc: `Стадия: ${STAGES[d.stage]}${d.blocker ? `\nБлокер: ${d.blocker}` : ""}`,
    }));
  }
  for (const task of s.dailyProtocol?.work?.tasks || []) {
    ev.push(vevent({
      uid: `task-${task.id || iso}-${iso}`, iso,
      start: task.time || "09:00", minutes: Number(task.minutes) || 30, allDay: !task.time,
      title: task.title || "DALER OS · Задача", desc: task.notes || "",
    }));
  }
  return wrap(ev);
}

// Повторяющиеся ритуалы на N дней вперёд (одним импортом)
export function buildRitualsIcs(iso, settings, days = 30) {
  const rr = `FREQ=DAILY;COUNT=${days}`;
  return wrap([
    vevent({ uid: `r-morning-${iso}`, iso, start: settings.morningTime || "07:30", minutes: 20, title: "DALER OS · Утренний ритуал", desc: "Состояние, результат дня, «только Далер», одно «нет» — до телефона.", rrule: rr }),
    vevent({ uid: `r-architect-${iso}`, iso, start: settings.architectTime || "15:00", minutes: 60, title: "DALER OS · Час Архитектора", desc: "Неприкосновенно. Выход — артефакт.", rrule: rr }),
    vevent({ uid: `r-shutdown-${iso}`, iso, start: settings.shutdownTime || "21:30", minutes: 20, title: "DALER OS · Shutdown", desc: "Результат, одна победа, регистры и shutdown.", rrule: rr }),
    vevent({ uid: `r-ceo-${iso}`, iso, start: "17:00", minutes: 45, title: "DALER OS · CEO-review (пятница)", desc: "5 вопросов Master OS + North Star следующей недели.", rrule: `FREQ=WEEKLY;BYDAY=FR;COUNT=${Math.ceil(days / 7)}` }),
  ]);
}

// Текст для Apple Reminders: вставка разбивает строки на отдельные напоминания
export function buildReminderText(iso, s, settings, deals) {
  const L = [];
  const outcome = primaryOutcomeText(s.primaryOutcome);
  L.push(`Утренний ритуал ${settings.morningTime || "07:30"}`);
  if (outcome) L.push(`Результат дня: ${outcome}`);
  L.push(`Час Архитектора ${settings.architectTime || "15:00"} — артефакт на выходе`);
  for (const d of deals.filter((d) => d.nextDate && d.nextDate <= iso && d.stage < 9)) {
    L.push(`Сделка ${d.name}: ${d.nextStep || "двинуть стадию"}`);
  }
  L.push("Спорт: выполнить рекомендацию по готовности");
  L.push(`Shutdown ${settings.shutdownTime || "21:30"}`);
  return L.join("\n");
}

export function downloadFile(name, content, mime = "text/calendar;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
