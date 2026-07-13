import { useState, useEffect, useRef, useCallback } from "react";
import { C, FONT, emptyDay, DEFAULT_SETTINGS } from "./constants";
import { klNow, prettyDate, weekday } from "./lib/date";
import { personalDay } from "./lib/numerology";
import { dayScore } from "./lib/score";
import { loadDay, saveDay, loadSettings, saveSettings } from "./lib/store";
import { startScheduler } from "./lib/notify";
import { Rule } from "./components/atoms";
import Morning from "./components/Morning";
import Day from "./components/Day";
import Evening from "./components/Evening";
import Week from "./components/Week";
import CeoReview from "./components/CeoReview";
import Settings from "./components/Settings";

export default function App() {
  const [{ date, time }, setNow] = useState(klNow());
  const [tab, setTab] = useState("morning");
  const [s, setS] = useState(emptyDay());
  const [loaded, setLoaded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saveState, setSaveState] = useState("");
  const saveTimer = useRef(null);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const t = setInterval(() => setNow(klNow()), 30000);
    return () => clearInterval(t);
  }, []);

  // загрузка дня и настроек
  useEffect(() => {
    (async () => {
      try {
        const v = await loadDay(date);
        setS(v ? { ...emptyDay(), ...v } : emptyDay());
        const st = await loadSettings();
        if (st) setSettings({ ...DEFAULT_SETTINGS, ...st });
      } catch { /* первый запуск */ }
      setLoaded(true);
    })();
  }, [date]);

  // планировщик напоминаний
  useEffect(() => startScheduler(() => settingsRef.current), []);

  // debounce-сохранение дня
  const save = useCallback((next) => {
    setS(next);
    clearTimeout(saveTimer.current);
    setSaveState("…");
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDay(date, next);
        setSaveState("сохранено");
        setTimeout(() => setSaveState(""), 1500);
      } catch { setSaveState("ошибка сохранения"); }
    }, 600);
  }, [date]);

  const up = (patch) => save({ ...s, ...patch });

  const upSettings = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  const num = personalDay(date);
  const { pts, max } = dayScore(s);
  const isFriday = weekday(date) === 5;

  const tabs = [
    ["morning", "Утро"],
    ["day", "День"],
    ["evening", "Вечер"],
    ["week", "Неделя"],
    ["ceo", isFriday ? "CEO ●" : "CEO"],
    ["settings", "⚙"],
  ];

  if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans }}>Загрузка…</div>;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.ivory, fontFamily: FONT.sans }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "26px 16px 60px" }}>
        {/* LEDGER HEADER */}
        <Rule double />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 2px", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontSize: 26, letterSpacing: ".02em" }}>
              DALER <span style={{ color: C.gold }}>OS</span>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{prettyDate(date)} · {time} KL</div>
          </div>
          <div style={{ textAlign: "right", fontFamily: FONT.mono }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: ".1em" }}>БАЛАНС ДНЯ</div>
            <div style={{ fontSize: 24, color: pts >= 8 ? C.green : pts >= 5 ? C.gold : C.muted }}>{pts}<span style={{ color: C.muted, fontSize: 15 }}>/{max}</span></div>
            <div style={{ fontSize: 10, color: C.muted }}>личный день {num.pd} · месяц {num.pm} · год {num.py}</div>
          </div>
        </div>
        <Rule double />

        {/* TABS */}
        <div style={{ display: "flex", gap: 6, margin: "16px 0 20px", flexWrap: "wrap" }}>
          {tabs.map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontSize: 14,
              border: `1px solid ${tab === k ? C.gold : C.line}`,
              background: tab === k ? "rgba(200,164,92,.12)" : "transparent",
              color: tab === k ? C.gold : C.muted, fontFamily: FONT.sans,
            }}>{label}</button>
          ))}
          <div style={{ marginLeft: "auto", alignSelf: "center", fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>{saveState}</div>
        </div>

        {tab === "morning" && <Morning s={s} up={up} date={date} />}
        {tab === "day" && <Day s={s} up={up} />}
        {tab === "evening" && <Evening s={s} up={up} />}
        {tab === "week" && <Week date={date} />}
        {tab === "ceo" && <CeoReview date={date} />}
        {tab === "settings" && <Settings settings={settings} upSettings={upSettings} date={date} />}
      </div>
    </div>
  );
}
