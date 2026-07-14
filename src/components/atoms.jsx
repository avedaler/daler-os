export const Rule = ({ double }) => (
  double ? <div className="rule-double" /> : <div className="rule" />
);

export const Check = ({ on, onClick, gold, label = "Отметить" }) => (
  <button type="button" onClick={onClick} aria-label={label} aria-pressed={on}
    className={`box-solo${on ? " on" : ""}${!gold && on ? " green" : ""}`}>✓</button>
);

export const Field = ({ label, value = "", onChange, placeholder, rows, type = "text", disabled, help, min, max }) => (
  <label className="field">
    {label ? <span className="flabel">{label}</span> : null}
    {rows ? (
      <textarea className="input" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled} />
    ) : (
      <input className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} min={min} max={max} />
    )}
    {help && <span className="field-help">{help}</span>}
  </label>
);

export const Section = ({ title, kicker, children, className = "", action }) => (
  <section className={`card fade-in ${className}`.trim()}>
    {(kicker || action) && <div className="section-meta">{kicker && <span className="kicker">{kicker}</span>}{action}</div>}
    {title && <h2 className="card-title">{title}</h2>}
    {children}
  </section>
);

export const CheckRow = ({ on, onClick, label, gold, disabled, meta }) => (
  <button type="button" onClick={onClick} aria-pressed={on} disabled={disabled}
    className={`checkrow${on ? " on" : ""}${gold ? " gold" : ""}`}>
    <span aria-hidden="true" className="box">✓</span>
    <span className="check-copy"><span className="lbl">{label}</span>{meta && <span className="check-meta">{meta}</span>}</span>
  </button>
);

export const ChoiceChips = ({ options, value, onChange, multi, green, disabled }) => {
  const normalized = options.map((option) => typeof option === "string" ? { value: option, label: option } : option);
  const isOn = (option) => multi ? (value || []).includes(option.value) : value === option.value;
  const toggle = (option) => {
    if (disabled || option.disabled) return;
    if (multi) {
      const current = value || [];
      onChange(current.includes(option.value) ? current.filter((item) => item !== option.value) : [...current, option.value]);
    } else {
      onChange(option.allowEmpty && value === option.value ? "" : option.value);
    }
  };
  return (
    <div className="chips" role={multi ? "group" : "radiogroup"}>
      {normalized.map((option) => (
        <button key={option.value} type="button" onClick={() => toggle(option)}
          role={multi ? "checkbox" : "radio"} aria-checked={isOn(option)} disabled={disabled || option.disabled}
          className={`chip${isOn(option) ? " on" : ""}${green ? " green" : ""}`}>{option.label}</button>
      ))}
    </div>
  );
};

export const Btn = ({ onClick, children, primary, big, disabled, className = "", type = "button" }) => (
  <button type={type} onClick={onClick} disabled={disabled}
    className={`btn${primary ? " primary" : ""}${big ? " big" : ""} ${className}`.trim()}>{children}</button>
);

export const StatusBadge = ({ tone = "neutral", children }) => (
  <span className={`status-badge ${tone}`}>{children}</span>
);

export const QuickCheckTile = ({ label, on, onClick, meta, disabled }) => (
  <button type="button" className={`quick-tile${on ? " on" : ""}`} onClick={onClick} aria-pressed={on} disabled={disabled}>
    <span className="quick-mark" aria-hidden="true">{on ? "✓" : ""}</span>
    <span className="quick-label">{label}</span>
    {meta && <span className="quick-meta">{meta}</span>}
  </button>
);

export const ActionRow = ({ title, meta, badge, children, danger }) => (
  <div className={`action-row${danger ? " danger" : ""}`}>
    <div className="action-copy"><strong>{title}</strong>{meta && <span>{meta}</span>}</div>
    {badge}
    {children && <div className="action-controls">{children}</div>}
  </div>
);

export const EmptyState = ({ title, text, action }) => (
  <div className="empty-state"><strong>{title}</strong>{text && <span>{text}</span>}{action}</div>
);

export const SettingsRow = ({ title, description, onClick, trailing, expanded }) => (
  <button type="button" className="settings-row" onClick={onClick} aria-expanded={expanded}>
    <span><strong>{title}</strong>{description && <small>{description}</small>}</span>
    <span className="settings-trailing">{trailing || "›"}</span>
  </button>
);
