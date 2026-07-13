// Атомы дизайн-системы: классы из styles.css, API прежний.
export const Rule = ({ double }) => (
  double ? <div className="rule-double" /> : <div style={{ borderTop: "1px solid var(--line)" }} />
);

export const Check = ({ on, onClick, gold }) => (
  <button onClick={onClick} aria-label="отметка" aria-pressed={on}
    className={`box-solo${on ? " on" : ""}${!gold && on ? " green" : ""}`}>✓</button>
);

export const Field = ({ label, value, onChange, placeholder, rows }) => (
  <label className="field">
    {label ? <div className="flabel">{label}</div> : null}
    {rows ? (
      <textarea className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} />
    ) : (
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    )}
  </label>
);

export const Section = ({ title, kicker, children }) => (
  <section className="card fade-in">
    {kicker && <div className="kicker" style={{ marginBottom: 5 }}>{kicker}</div>}
    <div className="card-title" style={{ marginBottom: 14 }}>{title}</div>
    {children}
  </section>
);

export const CheckRow = ({ on, onClick, label, gold }) => (
  <button onClick={onClick} aria-label={typeof label === "string" ? label : "пункт"} aria-pressed={on}
    className={`checkrow${on ? " on" : ""}${gold ? " gold" : ""}`}>
    <span aria-hidden className="box">✓</span>
    <span className="lbl">{label}</span>
  </button>
);

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
  return (
    <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button key={o} onClick={() => toggle(o)} aria-pressed={isOn(o)}
          className={`chip${isOn(o) ? " on" : ""}${green ? " green" : ""}`}>{o}</button>
      ))}
    </div>
  );
};

export const Btn = ({ onClick, children, primary, big, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={`btn${primary ? " primary" : ""}${big ? " big" : ""}`}>{children}</button>
);
