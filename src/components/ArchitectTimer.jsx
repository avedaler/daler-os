import { useState, useEffect, useRef } from "react";
import { C, FONT } from "../constants";

export default function ArchitectTimer({ onComplete }) {
  const [left, setLeft] = useState(60 * 60);
  const [run, setRun] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (run) {
      ref.current = setInterval(() => setLeft((l) => {
        if (l <= 1) { clearInterval(ref.current); setRun(false); onComplete(); return 0; }
        return l - 1;
      }), 1000);
    }
    return () => clearInterval(ref.current);
  }, [run, onComplete]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", flexWrap: "wrap" }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 34, color: run ? C.gold : C.ivory, letterSpacing: ".04em" }}>{mm}:{ss}</div>
      <button onClick={() => setRun(!run)} style={{ background: run ? "transparent" : "rgba(200,164,92,.12)", border: `1px solid ${C.gold}`, color: C.gold, borderRadius: 4, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontFamily: FONT.sans }}>
        {run ? "Пауза" : left < 3600 && left > 0 ? "Продолжить" : "Начать час"}
      </button>
      <button onClick={() => { setRun(false); setLeft(3600); }} style={{ background: "transparent", border: `1px solid ${C.line}`, color: C.muted, borderRadius: 4, padding: "7px 12px", cursor: "pointer", fontSize: 13 }}>Сброс</button>
    </div>
  );
}
