import { useState, useEffect } from "react";
import { C, FONT, HOBBIES } from "../constants";
import { Section, Field, CheckRow, Btn } from "./atoms";
import Forecast from "./Forecast";
import Settings from "./Settings";
import { loadDay } from "../lib/store";
import { addDays } from "../lib/date";
import { buildDayIcs, buildRitualsIcs, buildReminderText, downloadFile } from "../lib/ics";

function useStreaks(date) {
  const [streaks, setStreaks] = useState({ noSmoke: 0, noAlcohol: 0 });
  useEffect(() => {
    (async () => {
      const out = { noSmoke: 0, noAlcohol: 0 };
      for (const key of ["noSmoke", "noAlcohol"]) {
        for (let i = 1; i <= 90; i++) {
          const v = await loadDay(addDays(date, -i));
          if (v?.habits?.[key]) out[key]++;
          else break;
        }
      }
      setStreaks(out);
    })();
  }, [date]);
  return streaks;
}

function Development({ s, up, date }) {
  const setHabit = (patch) => up((prev) => ({ habits: { ...prev.habits, ...patch } }));
  const streaks = useStreaks(date);
  const h = s.habits;
  const streakLabel = (base, n, on) => `${base}${n + (on ? 1 : 0) > 0 ? ` · серия ${n + (on ? 1 : 0)} дн.` : ""}`;
  return (
    <Section kicker="ежедневный учёт · не конкурирует с бизнесом" title="Личное развитие">
      <CheckRow gold on={h.noSmoke} onClick={() => setHabit({ noSmoke: !h.noSmoke })} label={streakLabel("Не курил", streaks.noSmoke, h.noSmoke)} />
      <CheckRow gold on={h.noAlcohol} onClick={() => setHabit({ noAlcohol: !h.noAlcohol })} label={streakLabel("Не пил", streaks.noAlcohol, h.noAlcohol)} />
      <div style={{ borderTop: `1px solid ${C.line}`, margin: "10px 0", paddingTop: 10 }}>
        <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.gold, fontFamily: FONT.mono, marginBottom: 6 }}>Цель — срочно: бицепс и грудь</div>
        <CheckRow on={h.biceps} onClick={() => setHabit({ biceps: !h.biceps })} label="Бицепс прокачан" />
        <CheckRow on={h.chest} onClick={() => setHabit({ chest: !h.chest })} label="Грудь прокачана" />
      </div>
      <CheckRow on={h.logic} onClick={() => setHabit({ logic: !h.logic })} label="Изучал законы логики (20 минут)" />
      <CheckRow on={!!h.comfortExit} onClick={() => setHabit({ comfortExit: h.comfortExit ? "" : "✓" })} label="Вышел из зоны комфорта" />
      {h.comfortExit && <Field label="Что именно (опционально)" value={h.comfortExit === "✓" ? "" : h.comfortExit} onChange={(v) => setHabit({ comfortExit: v || "✓" })} placeholder="Коротко" />}
      <CheckRow on={!!h.social} onClick={() => setHabit({ social: h.social ? "" : "✓" })} label="Встреча в высоких кругах" />
      {h.social && <Field label="С кем и следующий шаг (опционально)" value={h.social === "✓" ? "" : h.social} onChange={(v) => setHabit({ social: v || "✓" })} placeholder="Имя, круг, шаг" />}
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, marginBottom: 8 }}>Хобби сегодня</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {HOBBIES.map((hb) => (
            <button key={hb} onClick={() => setHabit({ hobby: h.hobby === hb ? "" : hb })} style={{
              padding: "9px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13, minHeight: 42,
              border: `1px solid ${h.hobby === hb ? C.green : C.line}`,
              background: h.hobby === hb ? "rgba(111,175,135,.12)" : "transparent",
              color: h.hobby === hb ? C.green : C.muted, fontFamily: FONT.sans,
            }}>{hb}{h.hobby === hb ? " ✓" : ""}</button>
          ))}
        </div>
      </div>
    </Section>
  );
}

function ExportTools({ date, s, settings, deals }) {
  const [copyMsg, setCopyMsg] = useState("");
  return (
    <Section kicker="печать · календарь · reminders" title="Инструкция на день — наружу">
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <Btn primary onClick={() => window.print()}>🖨 Печать инструкции дня</Btn>
        <Btn onClick={() => downloadFile(`daler-os-${date}.ics`, buildDayIcs(date, s, settings, deals))}>📆 День в календарь</Btn>
        <Btn onClick={() => downloadFile(`daler-os-rituals-${date}.ics`, buildRitualsIcs(date, settings, 30))}>📆 Ритуалы на 30 дней</Btn>
        <Btn onClick={async () => {
          try {
            await navigator.clipboard.writeText(buildReminderText(date, s, settings, deals));
            setCopyMsg("Скопировано — вставь в Apple Reminders, строки станут напоминаниями");
          } catch { setCopyMsg("Буфер недоступен"); }
          setTimeout(() => setCopyMsg(""), 5000);
        }}>Скопировать для Reminders</Btn>
      </div>
      {copyMsg && <div style={{ fontSize: 13, color: C.green }}>{copyMsg}</div>}
    </Section>
  );
}

const SUBS = [
  ["dev", "Развитие"],
  ["forecast", "Расчёт"],
  ["export", "Экспорт"],
  ["settings", "Настройки"],
];

export default function More({ s, up, date, today, deals, settings, upSettings, onLock }) {
  const [sub, setSub] = useState("dev");
  return (
    <>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {SUBS.map(([k, label]) => (
          <button key={k} onClick={() => setSub(k)} style={{
            padding: "9px 16px", borderRadius: 4, cursor: "pointer", fontSize: 14, minHeight: 42,
            border: `1px solid ${sub === k ? C.gold : C.line}`,
            background: sub === k ? "rgba(200,164,92,.12)" : "transparent",
            color: sub === k ? C.gold : C.muted, fontFamily: FONT.sans,
          }}>{label}</button>
        ))}
      </div>
      {sub === "dev" && <Development s={s} up={up} date={date} />}
      {sub === "forecast" && <Forecast today={today} />}
      {sub === "export" && <ExportTools date={date} s={s} settings={settings} deals={deals} />}
      {sub === "settings" && <Settings settings={settings} upSettings={upSettings} date={date} onLock={onLock} />}
    </>
  );
}
