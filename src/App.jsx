import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, Moon, Sun } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  defaultHealthProfile,
  defaultTrainingPlan,
  emptyDay,
  migrateDay,
  migrateHealthProfile,
  migrateTrainingPlan,
} from "./constants";
import { addDays, isoWeek, klNow, prettyDate } from "./lib/date";
import { dayScore, morningProgress } from "./lib/score";
import {
  daysSinceExport,
  loadDay,
  loadDeals,
  loadHealthProfile,
  loadSettings,
  loadTrainingPlan,
  loadWeek,
  saveDay,
  saveDeals,
  saveHealthProfile,
  saveSettings,
  saveTrainingPlan,
} from "./lib/store";
import { startScheduler } from "./lib/notify";
import Today from "./components/Today";
import Deals, { dealStatus } from "./components/Deals";
import Overview from "./components/Overview";
import More from "./components/More";
import LockScreen from "./components/LockScreen";
import PrintSheet from "./components/PrintSheet";
import { hasLock, isUnlockedThisSession } from "./lib/lock";
import { cloudConfigured, currentUser, syncAll } from "./lib/cloud";

const NAV = [
  ["today", "Сегодня"],
  ["deals", "Сделки"],
  ["review", "Обзор"],
  ["more", "Ещё"],
];

const PAGE_TITLES = {
  today: "Сегодня",
  deals: "Сделки",
  review: "Обзор исполнения",
  more: "Система",
};

const THEME_STORAGE_KEY = "daler-os-theme";
const CLOUD_REFRESH_MS = 30000;

function normalizeTheme(value) {
  return value === "light" ? "light" : "dark";
}

function storedTheme() {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "dark";
  }
}

function dayKicker(date, today) {
  if (date === today) return "Сегодня";
  if (date === addDays(today, 1)) return "Завтра";
  if (date === addDays(today, -1)) return "Вчера";
  return "Выбранный день";
}

async function loadWorkspaceSnapshot(date) {
  const [rawDay, rawSettings, rawDeals, rawProfile, rawPlan, previousReview] = await Promise.all([
    loadDay(date),
    loadSettings(),
    loadDeals(),
    loadHealthProfile(),
    loadTrainingPlan(),
    loadWeek(isoWeek(addDays(date, -7))),
  ]);
  const nextSettings = {
    ...DEFAULT_SETTINGS,
    ...(rawSettings || {}),
    theme: normalizeTheme(rawSettings?.theme || storedTheme()),
  };
  return {
    day: migrateDay(rawDay),
    settings: nextSettings,
    deals: rawDeals,
    healthProfile: migrateHealthProfile(rawProfile, nextSettings),
    trainingPlan: migrateTrainingPlan(rawPlan),
    northStar: previousReview?.nextWeek?.trim() || "",
  };
}

export default function App() {
  const [locked, setLocked] = useState(() => hasLock() && !isUnlockedThisSession());
  const [now, setNow] = useState(klNow());
  const [date, setDate] = useState(now.date);
  const [tab, setTab] = useState("today");
  const [reviewView, setReviewView] = useState("week");
  const [s, setS] = useState(emptyDay());
  const [deals, setDealsState] = useState([]);
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, theme: storedTheme() }));
  const [healthProfile, setHealthProfile] = useState(defaultHealthProfile());
  const [trainingPlan, setTrainingPlan] = useState(defaultTrainingPlan());
  const [northStar, setNorthStar] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadedDate, setLoadedDate] = useState("");
  const [saveState, setSaveState] = useState("");
  const [syncNote, setSyncNote] = useState("");
  const saveTimer = useRef(null);
  const settingsRef = useRef(settings);
  const dayRef = useRef(s);
  const dateRef = useRef(date);
  const loadedRef = useRef(loaded);
  const loadedDateRef = useRef(loadedDate);
  const syncedOnce = useRef(false);
  const skipSave = useRef(true);
  settingsRef.current = settings;
  dayRef.current = s;
  dateRef.current = date;
  loadedRef.current = loaded;
  loadedDateRef.current = loadedDate;

  const applyWorkspaceSnapshot = useCallback((snapshot, targetDate) => {
    if (!snapshot || dateRef.current !== targetDate) return false;
    skipSave.current = true;
    setS(snapshot.day);
    setSettings(snapshot.settings);
    setDealsState(snapshot.deals);
    setHealthProfile(snapshot.healthProfile);
    setTrainingPlan(snapshot.trainingPlan);
    setNorthStar(snapshot.northStar);
    return true;
  }, []);

  useEffect(() => {
    const theme = normalizeTheme(settings.theme);
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "light" ? "#f2f4f2" : "#101112");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch { /* settings remain available in IndexedDB */ }
  }, [settings.theme]);

  const selectDate = useCallback((nextDate) => {
    const currentDate = dateRef.current;
    if (!nextDate || nextDate === currentDate) return;
    clearTimeout(saveTimer.current);
    if (loadedRef.current && loadedDateRef.current === currentDate) {
      saveDay(currentDate, dayRef.current)
        .then(() => setSaveState("сохранено"))
        .catch(() => setSaveState("ошибка сохранения"));
    }
    setDate(nextDate);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = klNow();
      setNow((previous) => {
        if (previous.date !== next.date && dateRef.current === previous.date) selectDate(next.date);
        return next;
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [selectDate]);

  useEffect(() => startScheduler(() => settingsRef.current), []);

  useEffect(() => {
    let active = true;
    setLoaded(false);
    setLoadedDate("");
    (async () => {
      if (!syncedOnce.current && cloudConfigured()) {
        syncedOnce.current = true;
        try {
          if (await currentUser()) {
            setSyncNote("синхронизация…");
            const result = await Promise.race([
              syncAll(),
              new Promise((resolve) => setTimeout(() => resolve({ ok: false, reason: "timeout" }), 6000)),
            ]);
            if (active) setSyncNote(result.ok ? (result.pulled ? `получено ${result.pulled}` : "синхронизировано") : "");
          }
        } catch { /* offline-first */ }
      }

      try {
        const snapshot = await loadWorkspaceSnapshot(date);
        if (!active) return;
        applyWorkspaceSnapshot(snapshot, date);
      } finally {
        if (active) {
          setLoadedDate(date);
          setLoaded(true);
        }
      }
    })();
    return () => { active = false; };
  }, [date, applyWorkspaceSnapshot]);

  useEffect(() => {
    let active = true;
    let syncing = false;
    const refreshFromCloud = async () => {
      if (!active || syncing || document.visibilityState === "hidden" || !cloudConfigured()) return;
      syncing = true;
      try {
        if (!await currentUser()) return;
        setSyncNote("синхронизация…");
        const result = await Promise.race([
          syncAll(),
          new Promise((resolve) => setTimeout(() => resolve({ ok: false, reason: "timeout" }), 6000)),
        ]);
        if (!active) return;
        if (result.ok && result.pulled > 0) {
          const targetDate = dateRef.current;
          const snapshot = await loadWorkspaceSnapshot(targetDate);
          if (active && applyWorkspaceSnapshot(snapshot, targetDate)) {
            setSyncNote(`обновлено ${result.pulled}`);
            return;
          }
        }
        setSyncNote(result.ok ? "синхронизировано" : "");
      } catch {
        if (active) setSyncNote("");
      } finally {
        syncing = false;
      }
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshFromCloud();
    };
    const timer = window.setInterval(refreshFromCloud, CLOUD_REFRESH_MS);
    window.addEventListener("focus", refreshFromCloud);
    window.addEventListener("online", refreshFromCloud);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshFromCloud);
      window.removeEventListener("online", refreshFromCloud);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [applyWorkspaceSnapshot]);

  useEffect(() => {
    if (!loaded || loadedDate !== date) return undefined;
    if (skipSave.current) {
      skipSave.current = false;
      return undefined;
    }
    setSaveState("сохранение…");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await saveDay(date, s);
        setSaveState("сохранено");
      } catch {
        setSaveState("ошибка сохранения");
      }
    }, 450);
    return () => clearTimeout(saveTimer.current);
  }, [s, loaded, loadedDate, date]);

  const up = useCallback((patch) => setS((previous) => ({
    ...previous,
    ...(typeof patch === "function" ? patch(previous) : patch),
  })), []);

  const setDeals = useCallback((next) => {
    setDealsState(next);
    saveDeals(next);
  }, []);

  const upSettings = useCallback((patch) => {
    setSettings((previous) => {
      const next = { ...previous, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const updateHealthProfile = useCallback((patch) => {
    setHealthProfile((previous) => {
      const next = typeof patch === "function" ? patch(previous) : { ...previous, ...patch };
      saveHealthProfile(next);
      return next;
    });
  }, []);

  const updateTrainingPlan = useCallback((patch) => {
    setTrainingPlan((previous) => {
      const next = typeof patch === "function" ? patch(previous) : { ...previous, ...patch };
      saveTrainingPlan(next);
      return next;
    });
  }, []);

  const { pts, max } = dayScore(s);
  const morning = morningProgress(s);
  const dealsAttention = deals.filter((deal) => ["overdue", "today", "nostep"].includes(dealStatus(deal, now.date).kind)).length;
  const navBadge = {
    today: s.dayStarted ? pts : `${morning.done}/${morning.max}`,
    deals: dealsAttention || "",
    review: "",
    more: daysSinceExport() >= 7 ? "!" : "",
  };

  const navigate = (nextTab) => {
    setTab(nextTab);
  };

  const goHome = () => {
    setTab("today");
    selectDate(now.date);
  };

  if (locked) return <LockScreen onUnlock={() => setLocked(false)} />;
  if (!loaded) return <div className="app-loading">Загрузка DALER OS…</div>;

  return (
    <>
      <PrintSheet date={date} s={s} settings={settings} deals={deals} northStar={northStar} />
      <div id="app-root" className="app-shell">
        <aside className="desktop-sidebar">
          <button type="button" className="brand" onClick={goHome} aria-label="DALER OS — на главную" title="На главную">
            <Compass size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className="brand-wordmark">DALER <b>OS</b></span>
          </button>
          <nav aria-label="Основная навигация">
            {NAV.map(([key, label]) => <button type="button" key={key} className={tab === key ? "active" : ""} onClick={() => navigate(key)}><span>{label}</span>{navBadge[key] !== "" && <b>{navBadge[key]}</b>}</button>)}
          </nav>
          <p>Спокойный разум.<br />Ясные решения.<br />Быстрое исполнение.</p>
        </aside>

        <main className={`workspace ${tab === "today" ? "workspace-wide" : ""}`}>
          <header className="page-header">
            <div>
              <button type="button" className="mobile-brand" onClick={goHome} aria-label="DALER OS — на главную" title="На главную">
                <Compass size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>DALER <b>OS</b></span>
              </button>
              <span className="kicker">{tab === "today" ? dayKicker(date, now.date) : "DALER OS"} · Kuala Lumpur</span>
              <h1>{tab === "today" ? prettyDate(date) : PAGE_TITLES[tab]}</h1>
              {tab !== "today" && <span className="header-date">{prettyDate(date)}</span>}
            </div>
            <div className="header-status">
              <div className="theme-switch" role="group" aria-label="Цветовая тема">
                <button type="button" className={settings.theme !== "light" ? "active" : ""} aria-pressed={settings.theme !== "light"} aria-label="Тёмная тема" title="Тёмная тема" onClick={() => upSettings({ theme: "dark" })}><Moon size={15} aria-hidden="true" /></button>
                <button type="button" className={settings.theme === "light" ? "active" : ""} aria-pressed={settings.theme === "light"} aria-label="Светлая тема" title="Светлая тема" onClick={() => upSettings({ theme: "light" })}><Sun size={15} aria-hidden="true" /></button>
              </div>
              <span className="sync-pill"><i />{saveState || syncNote || "локально сохранено"}</span>
              <button type="button" className="score-pill" aria-label={`Баланс дня ${pts} из ${max}`}><strong>{pts}</strong><span>/ {max}</span></button>
            </div>
          </header>

          {tab === "today" && <Today s={s} up={up} deals={deals} setDeals={setDeals} date={date} today={now.date} setDate={selectDate} time={now.time} northStar={northStar} healthProfile={healthProfile} trainingPlan={trainingPlan} updateTrainingPlan={updateTrainingPlan} />}
          {tab === "deals" && <div className="standard-page"><Deals deals={deals} setDeals={setDeals} today={now.date} /></div>}
          {tab === "review" && <div className="standard-page"><Overview date={date} setDate={selectDate} today={now.date} sub={reviewView} setSub={setReviewView} /></div>}
          {tab === "more" && <div className="standard-page"><More s={s} up={up} date={date} today={now.date} deals={deals} settings={settings} upSettings={upSettings} healthProfile={healthProfile} updateHealthProfile={updateHealthProfile} trainingPlan={trainingPlan} updateTrainingPlan={updateTrainingPlan} onLock={() => setLocked(true)} /></div>}
        </main>

        <nav className="mobile-bottom-nav" aria-label="Основная навигация">
          {NAV.map(([key, label]) => <button type="button" key={key} className={tab === key ? "active" : ""} onClick={() => navigate(key)}><span>{label}</span>{navBadge[key] !== "" && <b>{navBadge[key]}</b>}</button>)}
        </nav>
      </div>
    </>
  );
}
