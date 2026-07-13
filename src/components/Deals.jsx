import { useState } from "react";
import { C, FONT, STAGES, emptyDeal } from "../constants";
import { Section, Field, Btn } from "./atoms";

const stageColor = (i) => (i >= 7 ? C.green : i >= 6 ? C.gold : C.muted);

// Статус срока: просрочено (красный) · сегодня (золотой) · нет шага (предупреждение)
export function dealStatus(d, today) {
  if (d.stage >= 9) return { kind: "done" };
  if (!d.nextStep?.trim() || !d.nextDate) return { kind: "nostep", color: C.gold, label: "СЛЕДУЮЩИЙ ШАГ НЕ НАЗНАЧЕН" };
  if (d.nextDate < today) return { kind: "overdue", color: C.red, label: "ПРОСРОЧЕНО" };
  if (d.nextDate === today) return { kind: "today", color: C.gold, label: "СЕГОДНЯ" };
  return { kind: "ok" };
}

function DealCard({ d, today, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const st = dealStatus(d, today);
  const borderC = st.kind === "overdue" ? C.red : st.kind === "today" ? C.gold : C.line;
  return (
    <div style={{ border: `1px solid ${borderC}`, borderRadius: 6, padding: "12px 14px", marginBottom: 10, background: C.panel2 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap", cursor: "pointer" }} onClick={() => setOpen(!open)}>
        <div>
          <span style={{ fontFamily: FONT.serif, fontSize: 16, color: C.ivory }}>{d.name || "Без названия"}</span>
          {d.company && <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>{d.company}</span>}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
          {d.amount && <span style={{ fontFamily: FONT.mono, fontSize: 13, color: C.gold }}>{d.amount}</span>}
          <span style={{ fontFamily: FONT.mono, fontSize: 11, color: stageColor(d.stage), border: `1px solid ${stageColor(d.stage)}`, borderRadius: 3, padding: "2px 8px" }}>{STAGES[d.stage]}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: st.color || C.muted, marginTop: 6 }}>
        {d.nextStep ? `→ ${d.nextStep}` : "→ следующий шаг не задан"}
        {d.nextDate && ` · ${d.nextDate}`}
        {st.label && ` · ${st.label}`}
      </div>
      {d.blocker && <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>Блокер: {d.blocker}</div>}
      {open && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Название" value={d.name} onChange={(v) => onChange({ name: v })} />
            <Field label="Компания" value={d.company} onChange={(v) => onChange({ company: v })} />
            <Field label="Контакт" value={d.contact} onChange={(v) => onChange({ contact: v })} />
            <Field label="Потенциал (сумма)" value={d.amount} onChange={(v) => onChange({ amount: v })} placeholder="$500k" />
          </div>
          <label style={{ display: "block", marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 6, fontFamily: FONT.mono }}>Стадия</div>
            <select value={d.stage} onChange={(e) => onChange({ stage: Number(e.target.value) })}
              style={{ width: "100%", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "10px 12px", fontSize: 14, fontFamily: FONT.sans }}>
              {STAGES.map((st, i) => <option key={st} value={i}>{i + 1}. {st}</option>)}
            </select>
          </label>
          <Field label="Следующий шаг (конкретное действие)" value={d.nextStep} onChange={(v) => onChange({ nextStep: v })} placeholder="Отправить term sheet до пятницы" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <label style={{ display: "block", marginBottom: 14 }}>
              <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 6, fontFamily: FONT.mono }}>Дата следующего шага</div>
              <input type="date" value={d.nextDate} onChange={(e) => onChange({ nextDate: e.target.value })}
                style={{ width: "100%", boxSizing: "border-box", background: C.panel, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "9px 12px", fontSize: 14, fontFamily: FONT.mono, colorScheme: "dark" }} />
            </label>
            <Field label="Блокер" value={d.blocker} onChange={(v) => onChange({ blocker: v })} placeholder="Что мешает" />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            {d.stage < 9 ? (
              <Btn primary onClick={() => onChange({ stage: d.stage + 1 })}>Стадия выше → {STAGES[d.stage + 1]}</Btn>
            ) : <span style={{ color: C.green, fontSize: 13, alignSelf: "center" }}>Recurring — сделка работает</span>}
            <Btn onClick={() => { if (confirm(`Удалить сделку «${d.name}»?`)) onDelete(); }}>Удалить</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// Быстрый выбор срока
function DateChips({ value, onChange, today }) {
  const friday = (() => { let d = today; for (let i = 1; i <= 7; i++) { d = addDaysIso(today, i); if (new Date(d + "T00:00:00Z").getUTCDay() === 5) break; } return d; })();
  const opts = [["Сегодня", today], ["Завтра", addDaysIso(today, 1)], ["Пятница", friday], ["След. неделя", addDaysIso(today, 7)]];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {opts.map(([label, iso]) => (
        <button key={label} onClick={() => onChange(iso)} style={{
          padding: "8px 12px", borderRadius: 4, cursor: "pointer", fontSize: 13, minHeight: 40,
          border: `1px solid ${value === iso ? C.gold : C.line}`,
          background: value === iso ? "rgba(200,164,92,.12)" : "transparent",
          color: value === iso ? C.gold : C.muted, fontFamily: FONT.sans,
        }}>{label}</button>
      ))}
      <input type="date" value={value} aria-label="Дата шага" onChange={(e) => onChange(e.target.value)}
        style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "8px 10px", fontSize: 13, fontFamily: FONT.mono, colorScheme: "dark" }} />
    </div>
  );
}

function addDaysIso(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  return dt.toISOString().slice(0, 10);
}

export default function Deals({ deals, setDeals, today }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(emptyDeal());

  const update = (id, patch) =>
    setDeals(deals.map((d) => (d.id === id ? { ...d, ...patch, updated: today } : d)));
  const remove = (id) => setDeals(deals.filter((d) => d.id !== id));
  const add = () => {
    if (!draft.name.trim()) return;
    setDeals([...deals, { ...draft, id: `deal-${Date.now()}`, updated: today }]);
    setDraft(emptyDeal());
    setAdding(false);
  };

  const rank = (d) => {
    const st = dealStatus(d, today);
    return st.kind === "overdue" ? 0 : st.kind === "today" ? 1 : st.kind === "nostep" ? 2 : 3;
  };
  const sorted = [...deals].sort((a, b) => rank(a) - rank(b) || ((a.nextDate || "9999") < (b.nextDate || "9999") ? -1 : 1));

  const pipeline = deals.filter((d) => d.stage >= 6).length;
  const nOverdue = deals.filter((d) => dealStatus(d, today).kind === "overdue").length;
  const nToday = deals.filter((d) => dealStatus(d, today).kind === "today").length;

  return (
    <>
      <Section kicker="signed → paid → live → recurring" title="Сделки">
        <div style={{ display: "flex", gap: 20, marginBottom: 14, fontFamily: FONT.mono, fontSize: 12, color: C.muted, flexWrap: "wrap" }}>
          <span>Всего: <span style={{ color: C.ivory }}>{deals.length}</span></span>
          <span>Signed+: <span style={{ color: C.green }}>{pipeline}</span></span>
          <span>Просрочено: <span style={{ color: C.red }}>{nOverdue}</span></span>
          <span>Сегодня: <span style={{ color: C.gold }}>{nToday}</span></span>
        </div>
        {sorted.map((d) => (
          <DealCard key={d.id} d={d} today={today} onChange={(p) => update(d.id, p)} onDelete={() => remove(d.id)} />
        ))}
        {deals.length === 0 && !adding && (
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>Сделок пока нет. Every deal needs a next step — добавь первую.</div>
        )}
        {adding ? (
          <div style={{ border: `1px solid ${C.goldDim}`, borderRadius: 6, padding: 14, marginTop: 6 }}>
            <Field label="Название" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Ovanti financing" />
            <Field label="Следующий шаг" value={draft.nextStep} onChange={(v) => setDraft({ ...draft, nextStep: v })} placeholder="Конкретное действие, не «продолжить общение»" />
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, marginBottom: 8 }}>Когда сделать</div>
            <div style={{ marginBottom: 14 }}>
              <DateChips value={draft.nextDate} onChange={(v) => setDraft({ ...draft, nextDate: v })} today={today} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn primary onClick={add}>Добавить сделку</Btn>
              <Btn onClick={() => setAdding(false)}>Отмена</Btn>
            </div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Компания, контакт, сумма, блокер — потом, внутри карточки.</div>
          </div>
        ) : (
          <Btn primary onClick={() => setAdding(true)}>+ Новая сделка</Btn>
        )}
      </Section>
      <div style={{ fontSize: 12, color: C.muted, padding: "0 4px" }}>
        Правило: encounters ≠ сделки. Стадия двигается только фактом — отправлено, подписано, оплачено, запущено.
      </div>
    </>
  );
}
