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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
        <div className="rule-double" style={{ marginBottom: 30 }} />
        <div style={{ fontFamily: FONT.serif, fontSize: 34, color: C.ivory, letterSpacing: ".04em" }}>
          DALER <span style={{ color: C.gold }}>OS</span>
        </div>
        <div className="kicker" style={{ marginTop: 8, marginBottom: 32 }}>идентификация</div>
        <input
          ref={inputRef}
          className="input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={pin}
          placeholder="PIN"
          aria-label="PIN-код"
          onChange={(e) => setPin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          style={{
            textAlign: "center", fontSize: 22, fontFamily: FONT.mono, letterSpacing: ".4em",
            borderColor: error ? C.red : undefined,
          }}
        />
        <div style={{ minHeight: 22, fontSize: 13, color: C.red, marginTop: 8 }}>{error}</div>
        <button onClick={submit} disabled={busy} className="btn primary big">Войти</button>
        {bio && (
          <button onClick={tryBio} disabled={busy} className="btn big" style={{ marginTop: 10 }}>Face ID / Touch ID</button>
        )}
        <div style={{ fontSize: 11, color: C.muted, marginTop: 24, lineHeight: 1.6 }}>
          Данные хранятся только на этом устройстве. Сброс PIN без входа невозможен —
          только очисткой данных сайта (история при этом будет удалена, держи JSON-бэкап).
        </div>
        <div className="rule-double" style={{ marginTop: 30 }} />
      </div>
    </div>
  );
}
