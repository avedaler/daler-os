import { useMemo } from "react";
import { STAGES, primaryOutcomeText } from "../constants";
import { prettyDate } from "../lib/date";
import { personalDay, PD_MEANING } from "../lib/numerology";
import { computeAstro } from "../lib/astro";

// Печатная «Инструкция на день»: скрыта на экране, видима только при печати.
// Чёрным по белому, в эстетике леджера.
export default function PrintSheet({ date, s, settings, deals, northStar }) {
  const a = useMemo(() => computeAstro(date), [date]);
  const num = personalDay(date);
  const due = deals.filter((d) => d.nextDate && d.nextDate <= date && d.stage < 9);
  const box = "☐";
  const outcome = primaryOutcomeText(s.primaryOutcome);

  const Row = ({ label, value }) => (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#555" }}>{label}: </span>
      <span>{value || "________________________________________"}</span>
    </div>
  );

  return (
    <div id="print-sheet">
      <style>{`
        #print-sheet { display: none; }
        @media print {
          body { background: #fff !important; }
          #app-root { display: none !important; }
          #print-sheet {
            display: block !important;
            background: #fff; color: #111;
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 12pt; line-height: 1.5; padding: 4mm;
          }
          #print-sheet .mono { font-family: 'Courier New', monospace; }
          #print-sheet .rule { border-top: 1.5pt solid #111; border-bottom: 0.5pt solid #111; height: 2pt; margin: 6pt 0; }
          #print-sheet h1 { font-size: 20pt; margin: 0; font-weight: 600; }
          #print-sheet h2 { font-size: 11pt; letter-spacing: .12em; text-transform: uppercase; margin: 12pt 0 4pt; border-bottom: 0.5pt solid #999; padding-bottom: 2pt; }
          #print-sheet .small { font-size: 9pt; color: #444; }
          @page { margin: 12mm; }
        }
      `}</style>

      <div className="rule" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>DALER OS — инструкция на день</h1>
        <span className="mono small">{num.pd}·{num.pm}·{num.py}</span>
      </div>
      <div className="small">{prettyDate(date)} · Kuala Lumpur</div>
      <div className="rule" />

      {northStar && <div style={{ margin: "8pt 0", padding: "6pt 8pt", border: "1pt solid #111" }}>
        <span className="small" style={{ letterSpacing: ".1em" }}>NORTH STAR НЕДЕЛИ: </span>{northStar}
      </div>}

      <h2>Утро — до телефона</h2>
      <Row label="Главный результат (факт)" value={outcome} />
      {(s.primaryOutcome?.chairmanOnly || s.chairmanOnly) && <div style={{ marginBottom: 6 }}><b>Chairman action — требуется лично.</b></div>}
      <Row label="Чего не делать" value={s.dailyProtocol?.compass?.noToday || (s.refusalChips || []).join(" · ") || s.refusal} />

      <h2>Расписание</h2>
      <div className="mono">
        {box} {settings.morningTime || "07:30"} — утренний ритуал<br />
        {box} {settings.architectTime || "15:00"} — Час Архитектора (выход: артефакт)<br />
        {box} {settings.shutdownTime || "21:30"} — shutdown: план против факта
      </div>

      <h2>Приоритеты</h2>
      <div>
        {box} Офис: каждая встреча заканчивается следующим шагом<br />
        {box} Утро: лекарственное окно и stack по профилю<br />
        {box} Спорт: рекомендация по готовности<br />
        {box} Час Архитектора — артефакт: ______________________________<br />
        {box} Вечерняя разгрузка без экрана
      </div>

      {due.length > 0 && (
        <>
          <h2>Сделки — двинуть сегодня</h2>
          {due.map((d) => (
            <div key={d.id}>{box} <b>{d.name}</b> [{STAGES[d.stage]}] — {d.nextStep || "определить шаг"}{d.blocker ? ` · блокер: ${d.blocker}` : ""}</div>
          ))}
        </>
      )}

      <h2>Астрослой · context, not command</h2>
      <div className="small">
        Луна в {a.moonSignLoc} · {a.phase.name} {a.illum}%{a.retro.length ? ` · ℞ ${a.retro.join(", ")}` : ""}<br />
        {a.windows.length > 0 && <>Окна: {a.windows.map((w) => `${w.aspect} ${w.planet}`).join(", ")}. </>}
        {a.cautions.length > 0 && <>Осторожно: {a.cautions.map((w) => `${w.aspect} ${w.planet}`).join(", ")}. </>}
        Личный день {num.pd}: {PD_MEANING[num.pd]}
      </div>

      <h2>Вечер — заполнить рукой</h2>
      <div>
        Главная победа: ______________________________________<br />
        Результат дня создан: да {box} · нет {box} — причина: ______________________<br />
        Главное решение завтра: ______________________________
      </div>

      <div className="rule" style={{ marginTop: "10pt" }} />
      <div className="small">Signed → Paid → Live → Recurring · Разговор — не результат. Балл только за факт.</div>
    </div>
  );
}
