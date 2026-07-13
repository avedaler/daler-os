import { useState, useEffect, useRef, useCallback } from "react";
import { C, FONT, emptyDay, DEFAULT_SETTINGS } from "./constants";
import { klNow, prettyDate, weekday, isoWeek, addDays } from "./lib/date";
import { personalDay } from "./lib/numerology";
import { dayScore, tabProgress } from "./lib/score";
import { loadDay, saveDay, loadSettings, saveSettings, loadDeals, saveDeals, loadWeek, daysSinceExport } from "./lib/store";
import { startScheduler } from "./lib/notify";
import { Rule } from "./components/atoms";
import Morning from "./components/Morning";
import Day from "./components/Day";
import Evening from "./components/Evening";
import Week from "./components/Week";
import CeoReview from "./components/CeoReview";
import Deals from "./components/Deals";
import Forecast from "./components/Forecast";
import Settings from "./components/Settings";

export default function App() {
  const [now, setNow] = useState(klNow());
  const [date, setDate] = useState(now.date); // просматриваемая дата (может быть архивной)
  const [tab, setTab] = useState("morning");
  const [s, setS] = useState(emptyDay());
  const [deals, setDealsState] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [northStar, setNorthStar] = useState("");
  const [saveState, setSaveState] = useState("");
  const saveTimer = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const isToday = date === now.date;

  useEffect(() => {
    const t = setInterval(() => {
      const n = klNow();
      setNow((prev) => {
        // полночь: если смотрели «сегодня», переключаемся на новый день
        if (prev.date !== n.date) setDate((d) => (d === prev.date ? n.date : d));
        return n;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  // загрузка дня, настроек, сделок, North Star прошлой недели
  const skipSave = useRef(true);
  useEffect(() => {
    (async () => {
      try {
        const v = await loadDay(date);
        skipSave.current = true;
        setS(v ? { ...emptyDay(), ...v } : emptyDay());
        const st = await loadSettings();
        if (st) setSettings({ ...DEFAULT_SETTINGS, ...st });
        setDealsState(await loadDeals());
        const prevReview = await loadWeek(isoWeek(addDays(date, -7)));
        setNorthStar(prevReview?.nextWeek?.trim() || "");
      } catch { /* первый запуск */ }
      setLoaded(true);
    })();
  }, [date]);

  // планировщик напоминаний
  useEffect(() => startScheduler(() => settingsRef.current), []);

  // debounce-сохранение: реагирует на любое изменение s, кроме только что загруженного
  useEffect(() => {
    if (!loaded) return;
    if (skipSave.current) { skipSave.current = false; return; }
    setSaveState("…");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDay(date, s);
        setSaveState("сохранено");
        setTimeout(() => setSaveState(""), 1500);
      } catch { setSaveState("ошибка сохранения"); }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [s, loaded, date]);

  // функциональное обновление — быстрые последовательные действия не теряются;
  // patch может быть объектом или функцией prev => patch
  const up = useCallback((patch) => setS((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) })), []);

  const upSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const setDeals = (next) => {
    setDealsState(next);
    saveDeals(next);
  };

  const num = personalDay(date);
  const { pts, max } = dayScore(s);
  const prog = tabProgress(s);
  const isFriday = weekday(now.date) === 5;
  const backupStale = daysSinceExport() >= 7;
  const dealsDue = deals.filter((d) => d.nextDate && d.nextDate <= now.date && d.stage < 9).length;

  const badge = (p) => `${p.done}/${p.max}`;
  const tabs = [
    ["morning", "Утро", badge(prog.morning)],
    ["day", "День", badge(prog.day)],
    ["evening", "Вечер", badge(prog.evening)],
    ["deals", "Сделки", dealsDue ? `${dealsDue}!` : null],
    ["forecast", "Расчёт", null],
    ["week", "Неделя", null],
    ["ceo", "CEO", isFriday ? "due" : null],
    ["settings", "⚙", backupStale ? "!" : null],
  ];

  if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans }}>Загрузка…</div>;

  const navBtn = (label, onClick, aria) => (
    <button onClick={onClick} aria-label={aria} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 13, minHeight: 30 }}>{label}</button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ivory, fontFamily: FONT.sans, paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 16px 60px" }}>
        {/* LEDGER HEADER */}
        <Rule double />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 2px", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontSize: 26, letterSpacing: ".02em" }}>
              DALER <span style={{ color: C.gold }}>OS</span>
            </div>
            <div style={{ fontSize: 13, color: isToday ? C.muted : C.gold, marginTop: 4, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {navBtn("◀", () => setDate(addDays(date, -1)), "Предыдущий день")}
              <span>{prettyDate(date)}{isToday && ` · ${now.time} KL`}</span>
              {navBtn("▶", () => setDate(addDays(date, 1)), "Следующий день")}
              {!isToday && (
                <button onClick={() => setDate(now.date)} style={{ background: "rgba(200,164,92,.12)", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
                  АРХИВ — к сегодня
                </button>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", fontFamily: FONT.mono }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: ".1em" }}>БАЛАНС ДНЯ</div>
            <div style={{ fontSize: 24, color: pts >= 8 ? C.green : pts >= 5 ? C.gold : C.muted }}>{pts}<span style={{ color: C.muted, fontSize: 15 }}>/{max}</span></div>
            <div style={{ fontSize: 10, color: C.muted }}>личный день {num.pd} · месяц {num.pm} · год {num.py}</div>
          </div>
        </div>
        <Rule double />

        {/* NORTH STAR из CEO-review прошлой недели */}
        {northStar && (
          <div style={{ marginTop: 14, border: `1px solid ${C.goldDim}`, borderRadius: 6, padding: "10px 14px", display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, letterSpacing: ".14em", color: C.goldDim, textTransform: "uppercase", fontFamily: FONT.mono }}>north star недели</span>
            <span style={{ fontSize: 14, color: C.ivory }}>{northStar}</span>
          </div>
        )}

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, margin: "16px 0 20px", flexWrap: "wrap" }}>
          {tabs.map(([k, label, b]) => (
            <button key={k} onClick={() => setTab(k)} aria-label={k === "settings" ? "Настройки" : label} style={{
              padding: "8px 14px", borderRadius: 4, cursor: "pointer", fontSize: 14, minHeight: 40,
              border: `1px solid ${tab === k ? C.gold : C.line}`,
              background: tab === k ? "rgba(200,164,92,.12)" : "transparent",
              color: tab === k ? C.gold : C.muted, fontFamily: FONT.sans,
            }}>
              {label}
              {b && <span style={{ fontSize: 10, fontFamily: FONT.mono, marginLeft: 6, color: b.includes("!") || b === "due" ? C.red : C.muted }}>{b}</span>}
            </button>
          ))}
          <div style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>{saveState}</div>
        </div>

        {tab === "morning" && <Morning s={s} up={up} date={date} settings={settings} upSettings={upSettings} />}
        {tab === "day" && <Day s={s} up={up} deals={deals} today={now.date} goDeals={() => setTab("deals")} />}
        {tab === "evening" && <Evening s={s} up={up} />}
        {tab === "deals" && <Deals deals={deals} setDeals={setDeals} today={now.date} />}
        {tab === "forecast" && <Forecast today={now.date} />}
        {tab === "week" && <Week date={date} />}
        {tab === "ceo" && <CeoReview date={date} />}
        {tab === "settings" && <Settings settings={settings} upSettings={upSettings} date={date} />}
      </div>
    </div>
  );
}
