import { useState } from "react";
import { C, FONT, STAGES, emptyDeal } from "../constants";
import { Section, Field, Btn } from "./atoms";

const stageColor = (i) => (i >= 7 ? C.green : i >= 6 ? C.gold : C.muted);

function DealCard({ d, today, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const overdue = d.nextDate && d.nextDate <= today && d.stage < 9;
  return (
    <div style={{ border: `1px solid ${overdue ? C.red : C.line}`, borderRadius: 6, padding: "12px 14px", marginBottom: 10, background: C.panel2 }}>
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
      <div style={{ fontSize: 13, color: overdue ? C.red : C.muted, marginTop: 6 }}>
        {d.nextStep ? `→ ${d.nextStep}` : "→ следующий шаг не задан"}
        {d.nextDate && ` · ${d.nextDate}`}
        {overdue && " · ТРЕБУЕТ ДВИЖЕНИЯ"}
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

  const sorted = [...deals].sort((a, b) => {
    const ao = a.nextDate && a.nextDate <= today && a.stage < 9 ? 0 : 1;
    const bo = b.nextDate && b.nextDate <= today && b.stage < 9 ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return (a.nextDate || "9999") < (b.nextDate || "9999") ? -1 : 1;
  });

  const pipeline = deals.filter((d) => d.stage >= 6).length;

  return (
    <>
      <Section kicker="signed → paid → live → recurring" title="Сделки">
        <div style={{ display: "flex", gap: 20, marginBottom: 14, fontFamily: FONT.mono, fontSize: 12, color: C.muted, flexWrap: "wrap" }}>
          <span>Всего: <span style={{ color: C.ivory }}>{deals.length}</span></span>
          <span>Signed+: <span style={{ color: C.green }}>{pipeline}</span></span>
          <span>Требуют движения: <span style={{ color: C.red }}>{deals.filter((d) => d.nextDate && d.nextDate <= today && d.stage < 9).length}</span></span>
        </div>
        {sorted.map((d) => (
          <DealCard key={d.id} d={d} today={today} onChange={(p) => update(d.id, p)} onDelete={() => remove(d.id)} />
        ))}
        {deals.length === 0 && !adding && (
          <div style={{ color: C.muted, fontSize: 14, marginBottom: 12 }}>Сделок пока нет. Every deal needs a next step — добавь первую.</div>
        )}
        {adding ? (
          <div style={{ border: `1px solid ${C.goldDim}`, borderRadius: 6, padding: 14, marginTop: 6 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Название" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} placeholder="Ovanti financing" />
              <Field label="Компания / сторона" value={draft.company} onChange={(v) => setDraft({ ...draft, company: v })} />
            </div>
            <Field label="Следующий шаг" value={draft.nextStep} onChange={(v) => setDraft({ ...draft, nextStep: v })} placeholder="Конкретное действие, не «продолжить общение»" />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn primary onClick={add}>Добавить сделку</Btn>
              <Btn onClick={() => setAdding(false)}>Отмена</Btn>
            </div>
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
