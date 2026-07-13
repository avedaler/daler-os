import { useState, useEffect, useRef, useCallback } from "react";
import { C, FONT, emptyDay, migrateDay, DEFAULT_SETTINGS } from "./constants";
import { klNow, prettyDate, addDays, isoWeek } from "./lib/date";
import { personalDay } from "./lib/numerology";
import { dayScore, morningProgress } from "./lib/score";
import { loadDay, saveDay, loadSettings, saveSettings, loadDeals, saveDeals, loadWeek, daysSinceExport } from "./lib/store";
import { startScheduler } from "./lib/notify";
import { Rule } from "./components/atoms";
import Today from "./components/Today";
import Deals from "./components/Deals";
import { dealStatus } from "./components/Deals";
import Overview from "./components/Overview";
import More from "./components/More";
import LockScreen from "./components/LockScreen";
import PrintSheet from "./components/PrintSheet";
import { hasLock, isUnlockedThisSession } from "./lib/lock";
import { cloudConfigured, currentUser, syncAll } from "./lib/cloud";

export default function App() {
  const [locked, setLocked] = useState(() => hasLock() && !isUnlockedThisSession());
  const [now, setNow] = useState(klNow());
  const [date, setDate] = useState(now.date);
  const [tab, setTab] = useState("today");
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
        if (prev.date !== n.date) setDate((d) => (d === prev.date ? n.date : d));
        return n;
      });
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const syncedOnce = useRef(false);
  const [syncNote, setSyncNote] = useState("");
  const skipSave = useRef(true);

  useEffect(() => {
    (async () => {
      if (!syncedOnce.current && cloudConfigured()) {
        syncedOnce.current = true;
        try {
          if (await currentUser()) {
            setSyncNote("синхронизация…");
            const r = await Promise.race([syncAll(), new Promise((rs) => setTimeout(() => rs({ ok: false, reason: "таймаут" }), 6000))]);
            setSyncNote(r.ok ? (r.pulled ? `облако: получено ${r.pulled}` : "облако: актуально") : "");
            setTimeout(() => setSyncNote(""), 3000);
          }
        } catch { /* офлайн */ }
      }
      try {
        const v = await loadDay(date);
        skipSave.current = true;
        setS(v ? migrateDay(v) : emptyDay());
        const st = await loadSettings();
        if (st) setSettings({ ...DEFAULT_SETTINGS, ...st });
        setDealsState(await loadDeals());
        const prevReview = await loadWeek(isoWeek(addDays(date, -7)));
        setNorthStar(prevReview?.nextWeek?.trim() || "");
      } catch { /* первый запуск */ }
      setLoaded(true);
    })();
  }, [date]);

  useEffect(() => startScheduler(() => settingsRef.current), []);

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
  const mp = morningProgress(s);
  const backupStale = daysSinceExport() >= 7;
  const dealsAttn = deals.filter((d) => ["overdue", "today", "nostep"].includes(dealStatus(d, now.date).kind)).length;

  const tabs = [
    ["today", "Сегодня", s.dayStarted ? `${pts}` : `${mp.done}/${mp.max}`],
    ["deals", "Сделки", dealsAttn ? `${dealsAttn}!` : null],
    ["overview", "Обзор", null],
    ["more", "Ещё", backupStale ? "!" : null],
  ];

  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;

  if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans }}>Загрузка…</div>;

  const navBtn = (label, onClick, aria) => (
    <button onClick={onClick} aria-label={aria} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontSize: 13, minHeight: 30 }}>{label}</button>
  );

  return (
    <>
    <PrintSheet date={date} s={s} settings={settings} deals={deals} northStar={northStar} />
    <div id="app-root" style={{ background: C.bg, minHeight: "100vh", color: C.ivory, fontFamily: FONT.sans }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "22px 16px 110px" }}>
        {/* LEDGER HEADER */}
        <Rule double />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "12px 2px", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontSize: 24, letterSpacing: ".02em" }}>
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
            <div style={{ fontSize: 10, color: C.muted }}>день {num.pd} · {saveState || syncNote}</div>
          </div>
        </div>
        <Rule double />

        {northStar && (
          <div style={{ marginTop: 12, border: `1px solid ${C.goldDim}`, borderRadius: 6, padding: "9px 14px", display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, letterSpacing: ".14em", color: C.goldDim, textTransform: "uppercase", fontFamily: FONT.mono }}>north star</span>
            <span style={{ fontSize: 14, color: C.ivory }}>{northStar}</span>
          </div>
        )}

        <div style={{ height: 16 }} />

        {tab === "today" && <Today s={s} up={up} deals={deals} setDeals={setDeals} today={now.date} date={date} time={now.time} northStar={northStar} goDeals={() => setTab("deals")} />}
        {tab === "deals" && <Deals deals={deals} setDeals={setDeals} today={now.date} />}
        {tab === "overview" && <Overview date={date} />}
        {tab === "more" && <More s={s} up={up} date={date} today={now.date} deals={deals} settings={settings} upSettings={upSettings} onLock={() => setLocked(true)} />}
      </div>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 10,
        background: "rgba(12,15,20,.96)", backdropFilter: "blur(8px)",
        borderTop: `1px solid ${C.line}`, paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex" }}>
          {tabs.map(([k, label, b]) => (
            <button key={k} onClick={() => setTab(k)} aria-label={label} style={{
              flex: 1, minHeight: 56, cursor: "pointer", fontSize: 14, fontFamily: FONT.sans,
              background: "transparent", border: "none",
              borderTop: `2px solid ${tab === k ? C.gold : "transparent"}`,
              color: tab === k ? C.gold : C.muted,
            }}>
              {label}
              {b && <span style={{ fontSize: 10, fontFamily: FONT.mono, marginLeft: 5, color: String(b).includes("!") ? C.red : tab === k ? C.gold : C.muted }}>{b}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
    </>
  );
}
