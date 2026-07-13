import { C, FONT } from "../constants";

export const Rule = ({ double }) => (
  <div style={{ borderTop: `1px solid ${C.line}`, borderBottom: double ? `1px solid ${C.line}` : "none", height: double ? 3 : 0, margin: "2px 0" }} />
);

export const Check = ({ on, onClick, gold }) => (
  <button onClick={onClick} aria-label="toggle" aria-pressed={on} style={{
    width: 26, height: 26, minWidth: 26, borderRadius: 3, cursor: "pointer",
    border: `1px solid ${on ? (gold ? C.gold : C.green) : C.line}`,
    background: on ? (gold ? "rgba(200,164,92,.15)" : "rgba(111,175,135,.12)") : "transparent",
    color: on ? (gold ? C.gold : C.green) : C.muted,
    fontSize: 13, lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center",
  }}>{on ? "✓" : ""}</button>
);

export const Field = ({ label, value, onChange, placeholder, rows }) => (
  <label style={{ display: "block", marginBottom: 14 }}>
    <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 6, fontFamily: FONT.mono }}>{label}</div>
    {rows ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{ width: "100%", boxSizing: "border-box", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "10px 12px", fontSize: 14, fontFamily: FONT.sans, resize: "vertical" }} />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", boxSizing: "border-box", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "10px 12px", fontSize: 14, fontFamily: FONT.sans }} />
    )}
  </label>
);

export const Section = ({ title, kicker, children }) => (
  <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 6, padding: "18px 18px 12px", marginBottom: 16 }}>
    {kicker && <div style={{ fontSize: 10, letterSpacing: ".14em", color: C.goldDim, textTransform: "uppercase", fontFamily: FONT.mono, marginBottom: 4 }}>{kicker}</div>}
    <div style={{ fontFamily: FONT.serif, fontSize: 19, color: C.ivory, marginBottom: 12 }}>{title}</div>
    {children}
  </div>
);

// Полностью кликабельная строка-чекбокс: вся строка — кнопка, высота ≥48
export const CheckRow = ({ on, onClick, label, gold }) => {
  const color = on ? (gold ? C.gold : C.green) : C.line;
  return (
    <button onClick={onClick} aria-label={typeof label === "string" ? label : "пункт"} aria-pressed={on} style={{
      display: "flex", gap: 12, alignItems: "center", width: "100%", minHeight: 48,
      background: on ? (gold ? "rgba(200,164,92,.06)" : "rgba(111,175,135,.06)") : "transparent",
      border: "none", borderRadius: 4, padding: "6px 8px", marginBottom: 4, cursor: "pointer",
      textAlign: "left", fontFamily: FONT.sans, transition: "background .15s",
    }}>
      <span aria-hidden style={{
        width: 26, height: 26, minWidth: 26, borderRadius: 3, border: `1px solid ${color}`,
        background: on ? (gold ? "rgba(200,164,92,.15)" : "rgba(111,175,135,.12)") : "transparent",
        color: on ? (gold ? C.gold : C.green) : "transparent",
        fontSize: 14, lineHeight: "24px", textAlign: "center",
      }}>✓</span>
      <span style={{ fontSize: 14, color: on ? C.ivory : C.muted }}>{label}</span>
    </button>
  );
};

// Единый компонент выбора: одиночный или множественный
export const ChoiceChips = ({ options, value, onChange, multi, green }) => {
  const isOn = (o) => (multi ? (value || []).includes(o) : value === o);
  const toggle = (o) => {
    if (multi) {
      const cur = value || [];
      onChange(cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o]);
    } else {
      onChange(value === o ? "" : o);
    }
  };
  const activeC = green ? C.green : C.gold;
  const activeBg = green ? "rgba(111,175,135,.12)" : "rgba(200,164,92,.12)";
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button key={o} onClick={() => toggle(o)} aria-pressed={isOn(o)} style={{
          padding: "10px 16px", borderRadius: 4, cursor: "pointer", fontSize: 14, minHeight: 44,
          border: `1px solid ${isOn(o) ? activeC : C.line}`,
          background: isOn(o) ? activeBg : "transparent",
          color: isOn(o) ? activeC : C.muted, fontFamily: FONT.sans,
        }}>{o}{isOn(o) ? " ✓" : ""}</button>
      ))}
    </div>
  );
};

export const Btn = ({ onClick, children, primary }) => (
  <button onClick={onClick} style={{
    background: primary ? "rgba(200,164,92,.12)" : "transparent",
    border: `1px solid ${primary ? C.gold : C.line}`,
    color: primary ? C.gold : C.muted,
    borderRadius: 4, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontFamily: FONT.sans,
  }}>{children}</button>
);
