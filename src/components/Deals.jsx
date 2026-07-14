import { useMemo, useState } from "react";
import { MACRO_STAGES, STAGES, emptyDeal, macroStageIndex } from "../constants";
import { addDays } from "../lib/date";
import { Btn, ChoiceChips, EmptyState, Field, StatusBadge } from "./atoms";

const MACRO_TO_STAGE = [0, 4, 6, 7, 8, 9];

const dayDistance = (from, to) => Math.round((Date.parse(to) - Date.parse(from)) / 86400000);

export function dealStatus(deal, today) {
  if (deal.stage >= 9) return { kind: "done", tone: "green", label: "Повторяемая" };
  if (!deal.nextStep?.trim() || !deal.nextDate) return { kind: "nostep", tone: "amber", label: "Следующий шаг отсутствует" };
  if (deal.nextDate < today) {
    const days = Math.abs(dayDistance(today, deal.nextDate));
    return { kind: "overdue", tone: "red", label: `Просрочено на ${days} дн.` };
  }
  if (deal.nextDate === today) return { kind: "today", tone: "amber", label: "Сегодня" };
  return { kind: "upcoming", tone: "neutral", label: deal.nextDate };
}

function DateChips({ value, onChange, today }) {
  let friday = today;
  for (let index = 1; index <= 7; index += 1) {
    const candidate = addDays(today, index);
    if (new Date(`${candidate}T00:00:00Z`).getUTCDay() === 5) { friday = candidate; break; }
  }
  const options = [
    { label: "Сегодня", value: today },
    { label: "Завтра", value: addDays(today, 1) },
    { label: "Пятница", value: friday },
    { label: "Следующая неделя", value: addDays(today, 7) },
  ];
  return <div className="date-chips"><ChoiceChips options={options} value={value} onChange={onChange} /><Field label="Выбрать дату" type="date" value={value} onChange={onChange} /></div>;
}

function DealCard({ deal, today, onChange, onDelete }) {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = dealStatus(deal, today);
  const macro = macroStageIndex(deal.stage);
  return (
    <article className={`deal-card ${status.kind}`}>
      <button type="button" className="deal-card-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="deal-name"><strong>{deal.name || "Без названия"}</strong>{deal.company && <small>{deal.company}</small>}</span>
        <span className="deal-summary">{deal.amount && <b>{deal.amount}</b>}<StatusBadge tone={deal.stage >= 6 ? "green" : "gold"}>{MACRO_STAGES[macro]}</StatusBadge></span>
        <span className="deal-next"><span>{deal.nextStep || "Следующий шаг не назначен"}</span><StatusBadge tone={status.tone}>{status.label}</StatusBadge></span>
      </button>
      <div className="deal-quick-actions">
        <Btn primary onClick={() => onChange({ movementCount: (deal.movementCount || 0) + 1, updated: today })}>Отметить движение</Btn>
        <Btn onClick={() => onChange({ nextDate: addDays(today, 1) })}>На завтра</Btn>
        <Btn onClick={() => onChange({ stage: Math.min(9, deal.stage + 1) })}>Стадия +</Btn>
        <Btn onClick={() => onChange({ blocker: deal.blocker || "Требует решения" })}>Блокер</Btn>
      </div>
      {open && <div className="deal-details">
        <div className="form-grid two"><Field label="Название" value={deal.name} onChange={(name) => onChange({ name })} /><Field label="Компания" value={deal.company} onChange={(company) => onChange({ company })} /></div>
        <div className="form-grid two"><Field label="Контакт" value={deal.contact} onChange={(contact) => onChange({ contact })} /><Field label="Сумма" value={deal.amount} onChange={(amount) => onChange({ amount })} placeholder="$500k" /></div>
        <Field label="Следующий шаг" value={deal.nextStep} onChange={(nextStep) => onChange({ nextStep })} />
        <div className="form-grid two"><Field label="Ответственный" value={deal.owner || ""} onChange={(owner) => onChange({ owner })} /><Field label="Проект" value={deal.project || ""} onChange={(project) => onChange({ project })} /></div>
        <div className="form-grid two"><Field label="Дата следующего шага" type="date" value={deal.nextDate} onChange={(nextDate) => onChange({ nextDate })} /><Field label="Блокер" value={deal.blocker} onChange={(blocker) => onChange({ blocker })} /></div>
        <label className="field"><span className="flabel">Макро-стадия</span><select className="input" value={macro} onChange={(event) => onChange({ stage: MACRO_TO_STAGE[Number(event.target.value)] })}>{MACRO_STAGES.map((stage, index) => <option key={stage} value={index}>{stage}</option>)}</select></label>
        <details className="quiet-disclosure"><summary>Точная стадия и приоритет</summary><div className="form-grid two"><label className="field"><span className="flabel">Полная стадия</span><select className="input" value={deal.stage} onChange={(event) => onChange({ stage: Number(event.target.value) })}>{STAGES.map((stage, index) => <option key={stage} value={index}>{index + 1}. {stage}</option>)}</select></label><label className="field"><span className="flabel">Тип приоритета</span><select className="input" value={deal.priorityType || "revenue"} onChange={(event) => onChange({ priorityType: event.target.value })}><option value="revenue">Revenue</option><option value="contract">Контракт</option><option value="recovery">Recovery</option><option value="legal">Legal</option><option value="general">Обычный</option></select></label></div><ChoiceChips options={[{ label: "Требует лично Далера", value: "yes", allowEmpty: true }]} value={deal.chairmanOnly ? "yes" : ""} onChange={(value) => onChange({ chairmanOnly: value === "yes" })} /></details>
        {confirmDelete ? <div className="delete-confirm"><span>Удалить «{deal.name}»?</span><Btn onClick={() => setConfirmDelete(false)}>Отмена</Btn><button type="button" className="delete-action" onClick={onDelete}>Подтвердить удаление</button></div>
          : <button type="button" className="delete-action" onClick={() => setConfirmDelete(true)}>Удалить сделку</button>}
      </div>}
    </article>
  );
}

function QuickAdd({ today, onAdd, onClose }) {
  const [draft, setDraft] = useState({ ...emptyDeal(), nextDate: today });
  const [details, setDetails] = useState(false);
  const valid = draft.name.trim() && draft.nextStep.trim() && draft.nextDate;
  return <div className="quick-add-sheet" role="dialog" aria-modal="true" aria-labelledby="quick-add-title">
    <div className="sheet-head"><div><span className="eyebrow">Быстрое добавление</span><h2 id="quick-add-title">Новая сделка</h2></div><button type="button" onClick={onClose} aria-label="Закрыть">×</button></div>
    <Field label="Название" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} placeholder="Название сделки" />
    <Field label="Следующий шаг" value={draft.nextStep} onChange={(nextStep) => setDraft({ ...draft, nextStep })} placeholder="Конкретное действие" />
    <DateChips today={today} value={draft.nextDate} onChange={(nextDate) => setDraft({ ...draft, nextDate })} />
    <button type="button" className="text-action" onClick={() => setDetails((value) => !value)}>{details ? "Скрыть детали" : "Добавить детали"}</button>
    {details && <div className="form-grid two"><Field label="Компания" value={draft.company} onChange={(company) => setDraft({ ...draft, company })} /><Field label="Контакт" value={draft.contact} onChange={(contact) => setDraft({ ...draft, contact })} /><Field label="Сумма" value={draft.amount} onChange={(amount) => setDraft({ ...draft, amount })} /><Field label="Проект" value={draft.project} onChange={(project) => setDraft({ ...draft, project })} /><Field label="Блокер" value={draft.blocker} onChange={(blocker) => setDraft({ ...draft, blocker })} /></div>}
    <Btn primary big disabled={!valid} onClick={() => onAdd({ ...draft, id: `deal-${Date.now()}`, updated: today })}>Добавить сделку</Btn>
  </div>;
}

function amountValue(raw) {
  const text = String(raw || "").toLowerCase().replace(/[^0-9.kmbмлрд]/g, "");
  const value = Number.parseFloat(text) || 0;
  if (text.includes("b") || text.includes("млрд")) return value * 1_000_000_000;
  if (text.includes("m") || text.includes("м")) return value * 1_000_000;
  if (text.includes("k")) return value * 1_000;
  return value;
}

function compactMoney(value) {
  if (!value) return "—";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}b`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${Math.round(value)}`;
}

export default function Deals({ deals, setDeals, today }) {
  const [filter, setFilter] = useState("today");
  const [adding, setAdding] = useState(false);
  const update = (id, patch) => setDeals(deals.map((deal) => deal.id === id ? { ...deal, ...patch, updated: today } : deal));
  const counts = {
    today: deals.filter((deal) => ["today", "overdue", "nostep"].includes(dealStatus(deal, today).kind)).length,
    overdue: deals.filter((deal) => dealStatus(deal, today).kind === "overdue").length,
    signed: deals.filter((deal) => deal.stage >= 6).length,
  };
  const pipelineValue = deals.reduce((sum, deal) => sum + amountValue(deal.amount), 0);
  const shown = useMemo(() => deals.filter((deal) => {
    const kind = dealStatus(deal, today).kind;
    if (filter === "today") return ["today", "overdue", "nostep"].includes(kind);
    if (filter === "risk") return kind === "overdue" || Boolean(deal.blocker);
    if (filter === "signed") return deal.stage >= 6;
    return true;
  }).sort((a, b) => {
    const rank = { overdue: 0, today: 1, nostep: 2, upcoming: 3, done: 4 };
    return rank[dealStatus(a, today).kind] - rank[dealStatus(b, today).kind] || String(a.nextDate || "9999").localeCompare(String(b.nextDate || "9999"));
  }), [deals, filter, today]);
  return <div className="deals-screen">
    <div className="screen-toolbar"><div><span className="kicker">Pipeline</span><h2>Движение сделок</h2></div><Btn primary onClick={() => setAdding(true)}>Новая сделка</Btn></div>
    <div className="metric-strip"><div><span>Pipeline</span><strong>{compactMoney(pipelineValue)}</strong></div><div><span>Сегодня</span><strong>{counts.today}</strong></div><div><span>Просрочено</span><strong className="red-text">{counts.overdue}</strong></div><div><span>Signed+</span><strong className="green-text">{counts.signed}</strong></div></div>
    <div className="seg" role="tablist">{[
      ["today", "Сегодня"], ["all", "Все"], ["risk", "Под риском"], ["signed", "Signed+"],
    ].map(([value, label]) => <button type="button" role="tab" aria-selected={filter === value} key={value} className={filter === value ? "on" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div>
    <div className="deal-list">{shown.map((deal) => <DealCard key={deal.id} deal={deal} today={today} onChange={(patch) => update(deal.id, patch)} onDelete={() => setDeals(deals.filter((item) => item.id !== deal.id))} />)}{shown.length === 0 && <EmptyState title="В этом фильтре пусто" text="Рутинное движение появится здесь, как только у сделки будет следующий шаг." action={<Btn onClick={() => setAdding(true)}>Добавить сделку</Btn>} />}</div>
    {adding && <QuickAdd today={today} onClose={() => setAdding(false)} onAdd={(deal) => { setDeals([...deals, deal]); setAdding(false); }} />}
  </div>;
}
