import { useState, useEffect, useRef } from "react";
import { C, FONT } from "../constants";

// Таймер считает от wall-clock и хранит состояние в localStorage:
// переживает переключение вкладок, перезагрузку и троттлинг фоновой вкладки.
const KEY = "daleros:architect-timer";
const FULL = 60 * 60;

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; }
}
function store(v) {
  if (v) localStorage.setItem(KEY, JSON.stringify(v));
  else localStorage.removeItem(KEY);
}
function remaining(t) {
  if (!t) return FULL;
  if (t.pausedLeft != null) return t.pausedLeft;
  return Math.max(0, Math.round((t.endsAt - Date.now()) / 1000));
}

export default function ArchitectTimer({ onComplete }) {
  const [t, setT] = useState(load);
  const [, forceTick] = useState(0);
  const doneRef = useRef(false);
  const running = !!t && t.pausedLeft == null;
  const left = remaining(t);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && left <= 0 && !doneRef.current) {
      doneRef.current = true;
      setT(null);
      store(null);
      onComplete();
    }
  }, [running, left, onComplete]);

  const start = () => {
    const base = left > 0 && left < FULL ? left : FULL;
    const next = { endsAt: Date.now() + base * 1000, pausedLeft: null };
    doneRef.current = false;
    setT(next);
    store(next);
  };
  const pause = () => {
    const next = { endsAt: 0, pausedLeft: left };
    setT(next);
    store(next);
  };
  const reset = () => {
    doneRef.current = false;
    setT(null);
    store(null);
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", flexWrap: "wrap" }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 34, color: running ? C.gold : C.ivory, letterSpacing: ".04em" }}>{mm}:{ss}</div>
      <button onClick={running ? pause : start} style={{ background: running ? "transparent" : "rgba(200,164,92,.12)", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: 4, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontFamily: FONT.sans }}>
        {running ? "Пауза" : left < FULL && left > 0 ? "Продолжить" : "Начать час"}
      </button>
      <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 4, padding: "7px 12px", cursor: "pointer", fontSize: 13 }}>Сброс</button>
      {running && <span style={{ fontSize: 12, color: C.muted }}>идёт — можно переключать вкладки, таймер не собьётся</span>}
    </div>
  );
}
