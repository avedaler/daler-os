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
    ["today", "Сегодня", s.dayStarted ? `${pts}` : `${mp.done}/${mp.max}`, "◉"],
    ["deals", "Сделки", dealsAttn ? `${dealsAttn}!` : null, "⬦"],
    ["overview", "Обзор", null, "▤"],
    ["more", "Ещё", backupStale ? "!" : null, "☰"],
  ];

  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;

  if (!loaded) return <div style={{ background: C.bg, minHeight: "100vh", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans }}>Загрузка…</div>;

  const arrowBtn = (label, onClick, aria) => (
    <button onClick={onClick} aria-label={aria} style={{
      background: "rgba(255,255,255,.02)", border: "1px solid var(--line-strong)", color: "var(--muted)",
      borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 12, lineHeight: 1,
    }}>{label}</button>
  );

  return (
    <>
    <PrintSheet date={date} s={s} settings={settings} deals={deals} northStar={northStar} />
    <div id="app-root" style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 120px" }}>
        {/* MASTHEAD */}
        <Rule double />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 2px", gap: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: FONT.serif, fontSize: 27, letterSpacing: ".04em" }}>
              DALER <span style={{ color: C.gold }}>OS</span>
            </div>
            <div style={{ fontSize: 13, color: isToday ? C.muted : C.gold, marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {arrowBtn("◀", () => setDate(addDays(date, -1)), "Предыдущий день")}
              <span style={{ letterSpacing: ".01em" }}>{prettyDate(date)}{isToday && <span className="num" style={{ color: "var(--muted)" }}> · {now.time}</span>}</span>
              {arrowBtn("▶", () => setDate(addDays(date, 1)), "Следующий день")}
              {!isToday && (
                <button onClick={() => setDate(now.date)} className="chip on" style={{ minHeight: 32, padding: "4px 14px", fontSize: 12 }}>
                  АРХИВ — к сегодня
                </button>
              )}
            </div>
            <div className="kicker" style={{ marginTop: 8 }}>
              личный день {num.pd} · {saveState || syncNote || "kuala lumpur"}
            </div>
          </div>
          <div className={`ring${pts >= 8 ? " good" : ""}`} style={{ "--p": (pts / max) * 100 }} role="img" aria-label={`Баланс дня ${pts} из ${max}`}>
            <span className="val">{pts}</span>
            <span className="cap">ИЗ {max}</span>
          </div>
        </div>
        <Rule double />

        {northStar && (
          <div className="northstar" style={{ marginTop: 14 }}>
            <span className="kicker">north star</span>
            <span style={{ fontSize: 14.5, fontFamily: FONT.serif }}>{northStar}</span>
          </div>
        )}

        <div style={{ height: 18 }} />

        {tab === "today" && <Today s={s} up={up} deals={deals} setDeals={setDeals} today={now.date} date={date} time={now.time} northStar={northStar} goDeals={() => setTab("deals")} />}
        {tab === "deals" && <Deals deals={deals} setDeals={setDeals} today={now.date} />}
        {tab === "overview" && <Overview date={date} />}
        {tab === "more" && <More s={s} up={up} date={date} today={now.date} deals={deals} settings={settings} upSettings={upSettings} onLock={() => setLocked(true)} />}
      </div>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <nav className="navbar" aria-label="Основная навигация">
        <div className="inner">
          {tabs.map(([k, label, b, glyph]) => (
            <button key={k} onClick={() => setTab(k)} aria-label={label} className={tab === k ? "on" : ""}>
              <span className="glyph" aria-hidden>{glyph}</span>
              <span>{label}</span>
              {b && <span className={`badge${String(b).includes("!") ? " alert" : ""}`}>{b}</span>}
            </button>
          ))}
        </div>
      </nav>
    </div>
    </>
  );
}
