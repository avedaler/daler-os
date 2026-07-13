import { useState, useRef, useEffect } from "react";
import { C, FONT } from "../constants";
import { verifyPin, markUnlocked, hasBiometric, biometricUnlock } from "../lib/lock";

export default function LockScreen({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);
  const bio = hasBiometric();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async () => {
    if (!pin || busy) return;
    setBusy(true);
    if (await verifyPin(pin)) {
      markUnlocked();
      onUnlock();
    } else {
      setError("Неверный PIN");
      setPin("");
      setTimeout(() => setError(""), 2000);
    }
    setBusy(false);
  };

  const tryBio = async () => {
    setBusy(true);
    if (await biometricUnlock()) {
      markUnlocked();
      onUnlock();
    } else {
      setError("Биометрия не подтверждена — введи PIN");
      setTimeout(() => setError(""), 2500);
    }
    setBusy(false);
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, height: 3, marginBottom: 26 }} />
        <div style={{ fontFamily: FONT.serif, fontSize: 32, color: C.ivory, letterSpacing: ".02em" }}>
          DALER <span style={{ color: C.gold }}>OS</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 6, marginBottom: 28, fontFamily: FONT.mono, letterSpacing: ".1em", textTransform: "uppercase" }}>
          идентификация
        </div>
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          placeholder="PIN"
          aria-label="PIN-код"
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{
            width: "100%", boxSizing: "border-box", textAlign: "center",
            background: C.panel2, border: `1px solid ${error ? C.red : C.line}`, borderRadius: 6,
            color: C.ivory, padding: "14px 16px", fontSize: 22, fontFamily: FONT.mono, letterSpacing: ".4em",
          }}
        />
        <div style={{ minHeight: 22, fontSize: 13, color: C.red, marginTop: 8 }}>{error}</div>
        <button onClick={submit} disabled={busy} style={{
          width: "100%", marginTop: 4, background: "rgba(200,164,92,.12)", border: `1px solid ${C.gold}`,
          color: C.gold, borderRadius: 6, padding: "13px 16px", cursor: "pointer", fontSize: 15, fontFamily: FONT.sans, minHeight: 48,
        }}>Войти</button>
        {bio && (
          <button onClick={tryBio} disabled={busy} style={{
            width: "100%", marginTop: 10, background: "transparent", border: `1px solid ${C.line}`,
            color: C.muted, borderRadius: 6, padding: "12px 16px", cursor: "pointer", fontSize: 14, minHeight: 46,
          }}>Face ID / Touch ID</button>
        )}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 22, lineHeight: 1.6 }}>
          Данные хранятся только на этом устройстве. Сброс PIN без входа невозможен —
          только очисткой данных сайта (история при этом будет удалена, держи JSON-бэкап).
        </div>
        <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}`, height: 3, marginTop: 26 }} />
      </div>
    </div>
  );
}
