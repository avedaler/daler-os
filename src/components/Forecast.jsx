import { useState, useMemo, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { C, FONT, migrateDay } from "../constants";
import { Section, Btn, StatusBadge } from "./atoms";
import { computeAstro, astroToText, MOON_SIGN_TEXT, SIGNS } from "../lib/astro";
import { personalDay, PD_MEANING } from "../lib/numerology";
import { prettyDate, weekday, addDays } from "../lib/date";
import { loadDay } from "../lib/store";
import { dayScore } from "../lib/score";
import AiChat from "./AiChat";

const MAX_DAYS = 120;

const WD_SHORT = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const shortDate = (iso) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${WD_SHORT[weekday(iso)]} ${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
};

function listDates(from, to) {
  const out = [];
  let d = from;
  while (d <= to && out.length < MAX_DAYS) {
    out.push(d);
    d = addDays(d, 1);
  }
  return out;
}

function monthBounds(iso) {
  const [y, m] = iso.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const mm = String(m).padStart(2, "0");
  return [`${y}-${mm}-01`, `${y}-${mm}-${String(last).padStart(2, "0")}`];
}

function weekBounds(iso) {
  const monday = addDays(iso, -((weekday(iso) + 6) % 7));
  return [monday, addDays(monday, 6)];
}

// Пригодность дня для сделки: нумерология + Луна + аспекты + ретро-Меркурий
function dealFitness(a, pd) {
  let f = 0;
  if (pd === 8) f += 2;               // день денег и власти
  if (pd === 1 || pd === 4) f += 1;   // старт / структура-документы
  if (pd === 9) f -= 1;               // завершение, не начинать
  if (a.moonSign === 1 || a.moonSign === 9) f += 1; // Телец, Козерог
  if (a.moonSign === 11) f -= 1;      // Рыбы — не подписывать вслепую
  f += Math.min(a.windows.length, 2);
  f -= a.cautions.length;
  if (a.retro.includes("Меркурий")) f -= 1;
  return f;
}

function computeRange(from, to) {
  const days = listDates(from, to).map((iso) => {
    const a = computeAstro(iso);
    const pd = personalDay(iso).pd;
    return { iso, a, pd, fit: dealFitness(a, pd) };
  });
  const moons = [];
  for (const d of days) {
    const ang = d.a.phaseAngle;
    if (ang < 12 || ang > 348) moons.push({ iso: d.iso, type: "Новолуние" });
    else if (Math.abs(ang - 180) < 12) moons.push({ iso: d.iso, type: "Полнолуние" });
  }
  const dedupMoons = moons.filter((m, i) => i === 0 || m.type !== moons[i - 1].type);
  const retroMerc = days.filter((d) => d.a.retro.includes("Меркурий")).map((d) => d.iso);
  const best = [...days].sort((x, y) => y.fit - x.fit).slice(0, 3).filter((d) => d.fit >= 2);
  const risky = days.filter((d) => d.fit <= -2);
  return { days, dedupMoons, retroMerc, best, risky };
}

function fitLabel(fit) {
  if (fit >= 2) return { text: "сильный день", color: C.green };
  if (fit <= -2) return { text: "день осторожности", color: C.red };
  return { text: "нейтральный день", color: C.muted };
}

function periodSummary(r) {
  const signs = new Map();
  let growing = 0;
  let waning = 0;
  let windows = 0;
  let cautions = 0;

  for (const d of r.days) {
    signs.set(d.a.moonSign, (signs.get(d.a.moonSign) || 0) + 1);
    if (d.a.phaseAngle > 0 && d.a.phaseAngle < 180) growing++;
    else waning++;
    windows += d.a.windows.length;
    cautions += d.a.cautions.length;
  }

  const dominant = [...signs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([sign, count]) => `${SIGNS[sign]} · ${count} дн.`);

  const rhythm = growing > waning
    ? "Период преимущественно растущий: продвигай, усиливай и выводи начатое наружу."
    : waning > growing
      ? "Период преимущественно убывающий: завершай, собирай деньги и освобождай ресурсы."
      : "Период сбалансирован: чередуй продвижение с завершением и аудитом.";

  const climate = windows > cautions
    ? `Поддерживающих аспектов больше (${windows} против ${cautions}): используй открывающиеся окна, сохраняя проверку фактов.`
    : cautions > windows
      ? `Напряжённых аспектов больше (${cautions} против ${windows}): снизь скорость, перепроверяй условия и не реагируй импульсивно.`
      : `Поддерживающих и напряжённых аспектов поровну (${windows}): результат зависит от дисциплины и качества подготовки.`;

  return { dominant, rhythm, climate };
}

function splitIntoWeeks(days) {
  const groups = [];
  for (const day of days) {
    const monday = addDays(day.iso, -((weekday(day.iso) + 6) % 7));
    const last = groups[groups.length - 1];
    if (!last || last.key !== monday) groups.push({ key: monday, days: [day] });
    else last.days.push(day);
  }
  return groups;
}

function DayDetails({ day, today, open, onToggle }) {
  const mark = fitLabel(day.fit);
  return (
    <div style={{
      borderBottom: `1px solid ${C.line}`,
      background: day.iso === today ? "rgba(200,164,92,.06)" : "transparent",
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", minHeight: 58, padding: "11px 4px", border: 0, cursor: "pointer",
          background: "transparent", color: C.ivory, textAlign: "left", fontFamily: FONT.sans,
          display: "grid", gridTemplateColumns: "minmax(108px, .8fr) minmax(150px, 1.4fr) auto",
          gap: 12, alignItems: "center",
        }}
      >
        <span>
          <strong style={{ display: "block", fontSize: 14 }}>{shortDate(day.iso)}</strong>
          <span style={{ color: C.muted, fontSize: 11, fontFamily: FONT.mono }}>личный день {day.pd}</span>
        </span>
        <span style={{ minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 14 }}>Луна в {day.a.moonSignLoc}</span>
          <span style={{ display: "block", color: mark.color, fontSize: 11, fontFamily: FONT.mono }}>{mark.text}</span>
        </span>
        <span aria-hidden style={{ color: C.gold, fontSize: 16 }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div style={{ padding: "2px 4px 18px", fontSize: 14, lineHeight: 1.65 }}>
          <div style={{ color: C.gold, fontFamily: FONT.serif, fontSize: 17, marginBottom: 9 }}>
            {day.a.phase.name} · освещённость {day.a.illum}%
          </div>
          <div style={{ whiteSpace: "pre-line", color: C.ivory }}>{astroToText(day.a)}</div>
          <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 12, paddingTop: 11 }}>
            <span style={{ color: C.goldDim, fontFamily: FONT.mono, fontSize: 10, letterSpacing: ".08em" }}>ЛИЧНЫЙ ДЕНЬ {day.pd} · </span>
            {PD_MEANING[day.pd]}
          </div>
          <div style={{ marginTop: 10, color: mark.color, fontFamily: FONT.mono, fontSize: 12 }}>
            Сделки: {day.fit >= 2 ? "хорошее окно для конкретного шага" : day.fit <= -2 ? "не спешить с подписанием и оплатой" : "действовать после проверки условий"}
          </div>
        </div>
      )}
    </div>
  );
}

function rangeToMarkdown(from, to, r) {
  const L = [`# Расчёт DALER OS · ${from} — ${to}`, ""];
  if (r.best.length) L.push("**Лучшие дни для сделок:** " + r.best.map((d) => `${d.iso} (личный день ${d.pd}, Луна в ${SIGNS[d.a.moonSign]})`).join("; "));
  if (r.risky.length) L.push("**Дни осторожности:** " + r.risky.map((d) => d.iso).join(", "));
  if (r.retroMerc.length) L.push(`**Ретро-Меркурий:** ${r.retroMerc[0]} — ${r.retroMerc[r.retroMerc.length - 1]} (перепроверять документы)`);
  for (const m of r.dedupMoons) L.push(`**${m.type}:** ${m.iso}`);
  L.push("", "| Дата | ЛД | Луна | Фаза | Окна | Риски | ℞ |", "|---|---|---|---|---|---|---|");
  for (const d of r.days) {
    L.push(`| ${d.iso} | ${d.pd} | ${SIGNS[d.a.moonSign]} | ${d.a.phase.name} ${d.a.illum}% | ${d.a.windows.length} | ${d.a.cautions.length} | ${d.a.retro.join(", ") || "—"} |`);
  }
  L.push("", "## Детали по дням", "");
  for (const d of r.days) {
    L.push(`### ${prettyDate(d.iso)} — личный день ${d.pd}`, "", astroToText(d.a), "", PD_MEANING[d.pd], "");
  }
  return L.join("\n");
}

export function TodayForecast({ date, compact = false, onOpen }) {
  const [expanded, setExpanded] = useState(false);
  const result = useMemo(() => {
    const astro = computeAstro(date);
    const numerology = personalDay(date);
    return { astro, numerology, fitness: dealFitness(astro, numerology.pd) };
  }, [date]);
  const { astro, numerology, fitness } = result;
  const fitnessLabel = fitness >= 2 ? "Высокая" : fitness <= -2 ? "Низкая" : "Нейтральная";
  const fitnessTone = fitness >= 2 ? "green" : fitness <= -2 ? "red" : "gold";
  if (compact) return <section className={`command-rail-section command-context${expanded ? " expanded" : ""}`} aria-label="Гороскопы дня">
    <div className="command-rail-heading"><span className="eyebrow">Гороскопы · сегодня</span><StatusBadge tone={fitnessTone}>сделки · {fitnessLabel}</StatusBadge></div>
    <div className="command-context-grid">
      <div><span>Личный день</span><strong>{numerology.pd}</strong></div>
      <div><span>Луна</span><strong>В {astro.moonSignLoc}</strong></div>
      <div><span>Окна / риски</span><strong>{astro.windows.length} / {astro.cautions.length}</strong></div>
    </div>
    <p><strong>Контекст, не команда.</strong> {astro.cautions[0]?.text || astro.windows[0]?.text || "Решения принимаются по фактам, срокам и ответственным."}</p>
    <button type="button" className="forecast-expand" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>
      <span>{expanded ? "Скрыть подробности" : "Читать подробнее"}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    {expanded && <div className="forecast-expanded-details">
      <div className="forecast-detail-block">
        <span>Личный день · {numerology.pd}</span>
        <p>{PD_MEANING[numerology.pd]}</p>
      </div>
      <div className="forecast-detail-block">
        <span>Прогноз Луны</span>
        <p><strong>Луна в {astro.moonSignLoc}</strong> — {MOON_SIGN_TEXT[astro.moonSign]}</p>
        <p>{astro.phase.name}, освещённость {astro.illum}%.</p>
      </div>
      <div className="forecast-detail-columns">
        <div><span>Окна · {astro.windows.length}</span>{astro.windows.length ? astro.windows.map((item, index) => <p key={`${item.text}-${index}`}>{item.text}</p>) : <p>Выраженных благоприятных окон нет.</p>}</div>
        <div><span>Риски · {astro.cautions.length}</span>{astro.cautions.length ? astro.cautions.map((item, index) => <p key={`${item.text}-${index}`}>{item.text}</p>) : <p>Выраженных факторов осторожности нет.</p>}</div>
      </div>
      <div className="forecast-detail-block">
        <span>Ретроградные факторы</span>
        <p>{astro.retro.length ? `${astro.retro.join(", ")}. Документы, сроки и договорённости перепроверять.` : "Ретроградных факторов в расчёте нет."}</p>
      </div>
    </div>}
    {onOpen && <button type="button" className="forecast-ai-link" onClick={onOpen}><MessageCircle size={15} aria-hidden="true" /><span>Открыть расчёт и обсудить с ИИ</span></button>}
  </section>;
  return <section className="today-forecast" aria-label="Расчет дня">
    <div className="today-forecast-head">
      <div><span className="kicker">Расчет дня</span><h2>Астрономический и личный контекст</h2></div>
      <StatusBadge tone={fitnessTone}>Сделки · {fitnessLabel}</StatusBadge>
    </div>
    <div className="forecast-metrics">
      <div><span>Личный день</span><strong>{numerology.pd}</strong><small>{PD_MEANING[numerology.pd]}</small></div>
      <div><span>Луна</span><strong>В {astro.moonSignLoc}</strong><small>{astro.phase.name} · освещенность {astro.illum}%</small></div>
      <div><span>Окна / риски</span><strong>{astro.windows.length} / {astro.cautions.length}</strong><small>{astro.retro.length ? `Ретроградны: ${astro.retro.join(", ")}` : "Ретроградных факторов нет"}</small></div>
    </div>
    <div className="forecast-context"><strong>Контекст, не команда.</strong><span>{astro.cautions[0]?.text || astro.windows[0]?.text || "Решения принимаются по фактам, срокам и ответственным."}</span></div>
  </section>;
}

export default function Forecast({ today }) {
  const [mode, setMode] = useState("day");
  const [anchor, setAnchor] = useState(today);
  const [rangeTo, setRangeTo] = useState(addDays(today, 6));
  const [openDays, setOpenDays] = useState(() => new Set([today]));

  const [from, to] =
    mode === "day" ? [anchor, anchor]
    : mode === "week" ? weekBounds(anchor)
    : mode === "month" ? monthBounds(anchor)
    : [anchor, rangeTo >= anchor ? rangeTo : anchor];

  const r = useMemo(() => computeRange(from, to), [from, to]);
  const summary = useMemo(() => periodSummary(r), [r]);
  const weeks = useMemo(() => splitIntoWeeks(r.days), [r]);

  useEffect(() => {
    setOpenDays(new Set(mode === "day" ? [anchor] : r.days.some((d) => d.iso === today) ? [today] : [r.days[0]?.iso].filter(Boolean)));
  }, [mode, from, to, today]);

  // фактические результаты за период (если записи есть)
  const [facts, setFacts] = useState(null);
  useEffect(() => {
    (async () => {
      let filled = 0, ptsSum = 0, proofs = 0;
      for (const d of listDates(from, to)) {
        if (d > today) break;
        const v = await loadDay(d);
        if (!v) continue;
        filled++;
        ptsSum += dayScore(migrateDay(v)).pts;
        if (v.proofDone) proofs++;
      }
      setFacts(filled ? { filled, avg: Math.round((ptsSum / filled) * 10) / 10, proofs } : null);
    })();
  }, [from, to, today]);

  const shift = (dir) => {
    const len = mode === "day" ? 1 : mode === "week" ? 7 : mode === "month" ? 30 : listDates(from, to).length;
    if (mode === "month") {
      const [y, m] = anchor.split("-").map(Number);
      const nm = m + dir;
      const ny = y + Math.floor((nm - 1) / 12);
      const mm = ((nm - 1 + 12) % 12) + 1;
      setAnchor(`${ny}-${String(mm).padStart(2, "0")}-01`);
    } else {
      setAnchor(addDays(anchor, dir * len));
      if (mode === "range") setRangeTo(addDays(rangeTo, dir * len));
    }
  };

  const download = () => {
    const blob = new Blob([rangeToMarkdown(from, to, r)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daler-os-raschet-${from}_${to}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const dateInput = (val, onChange, aria) => (
    <input type="date" value={val} aria-label={aria} onChange={(e) => e.target.value && onChange(e.target.value)}
      style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "7px 10px", fontSize: 13, fontFamily: FONT.mono, colorScheme: "inherit" }} />
  );

  const single = r.days.length === 1 ? r.days[0] : null;
  const forecastContext = JSON.stringify({
    period: { mode, from, to, days: r.days.length },
    summary,
    bestDays: r.best.map((day) => ({ date: day.iso, personalDay: day.pd, moon: SIGNS[day.a.moonSign], score: day.fit })),
    cautionDays: r.risky.map((day) => day.iso),
    retrogradeMercury: r.retroMerc,
    moonEvents: r.dedupMoons,
    dailyCalculations: r.days.slice(0, 45).map((day) => ({
      date: day.iso,
      personalDay: day.pd,
      moon: day.a.moonSignLoc,
      phase: day.a.phase.name,
      illumination: day.a.illum,
      windows: day.a.windows.map((item) => item.text),
      cautions: day.a.cautions.map((item) => item.text),
      retrograde: day.a.retro,
      dealFitness: day.fit,
    })),
  });

  return (
    <>
      <Section kicker="эфемерида + нумерология · по требованию" title="Расчёт периода">
        <div className="forecast-mode-tabs">
          {[["day", "День"], ["week", "Неделя"], ["month", "Месяц"], ["range", "Период"]].map(([k, label]) => (
            <Btn key={k} primary={mode === k} onClick={() => setMode(k)}>{label}</Btn>
          ))}
        </div>
        <div className="forecast-date-controls">
          <Btn onClick={() => shift(-1)}><ChevronLeft size={17} aria-hidden="true" /></Btn>
          {dateInput(anchor, setAnchor, "Начальная дата")}
          {mode === "range" && <>— {dateInput(rangeTo, setRangeTo, "Конечная дата")}</>}
          <Btn onClick={() => shift(1)}><ChevronRight size={17} aria-hidden="true" /></Btn>
          <Btn onClick={() => { setAnchor(today); setRangeTo(addDays(today, 6)); }}>Сегодня</Btn>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: FONT.mono }}>
            {from} — {to} · {r.days.length} дн.{r.days.length >= MAX_DAYS ? ` (максимум ${MAX_DAYS})` : ""}
          </span>
        </div>

        {/* Сводка периода */}
        {!single && (
          <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12, marginBottom: 4 }}>
            {r.best.length > 0 && (
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: C.green, fontFamily: FONT.mono, fontSize: 11, letterSpacing: ".08em" }}>ЛУЧШИЕ ДНИ ДЛЯ СДЕЛОК: </span>
                {r.best.map((d) => `${shortDate(d.iso)} (ЛД ${d.pd}, ${SIGNS[d.a.moonSign]})`).join(" · ")}
              </div>
            )}
            {r.risky.length > 0 && (
              <div style={{ fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: C.red, fontFamily: FONT.mono, fontSize: 11, letterSpacing: ".08em" }}>ДНИ ОСТОРОЖНОСТИ: </span>
                {r.risky.map((d) => shortDate(d.iso)).join(" · ")}
              </div>
            )}
            {r.retroMerc.length > 0 && (
              <div style={{ fontSize: 13, marginBottom: 6, color: C.gold }}>
                ℞ Меркурий ретрограден: {shortDate(r.retroMerc[0])} — {shortDate(r.retroMerc[r.retroMerc.length - 1])} · документы перепроверять
              </div>
            )}
            {r.dedupMoons.map((m) => (
              <div key={m.iso + m.type} style={{ fontSize: 13, marginBottom: 6, color: C.muted }}>
                {m.type === "Полнолуние" ? "○" : "●"} {m.type}: {shortDate(m.iso)}
              </div>
            ))}
            {facts && (
              <div style={{ fontSize: 13, marginTop: 8, color: C.ivory, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
                <span style={{ color: C.goldDim, fontFamily: FONT.mono, fontSize: 11, letterSpacing: ".08em" }}>ФАКТЫ ЗА ПЕРИОД: </span>
                заполнено дней {facts.filled} · средний баланс {facts.avg}/10 · результатов-фактов {facts.proofs}
              </div>
            )}
          </div>
        )}
      </Section>

      {/* Один день — полная детализация */}
      {single && (
        <Section kicker={`личный день ${single.pd}`} title={prettyDate(single.iso)}>
          <div style={{ fontFamily: FONT.serif, fontSize: 20, color: C.gold, marginBottom: 10 }}>
            Луна в {single.a.moonSignLoc} · {single.a.phase.name} {single.a.illum}%
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.7, color: C.ivory, whiteSpace: "pre-line" }}>{astroToText(single.a)}</div>
          <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 12, paddingTop: 12, fontSize: 14, lineHeight: 1.6 }}>
            <span style={{ color: C.goldDim, fontFamily: FONT.mono, fontSize: 11, letterSpacing: ".08em" }}>НУМЕРОЛОГИЯ · </span>
            {PD_MEANING[single.pd]}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: single.fit >= 2 ? C.green : single.fit <= -2 ? C.red : C.muted, fontFamily: FONT.mono }}>
            Пригодность для сделок: {single.fit >= 2 ? "ВЫСОКАЯ" : single.fit <= -2 ? "НИЗКАЯ — перенести подписания" : "НЕЙТРАЛЬНАЯ"}
          </div>
        </Section>
      )}

      {/* Таблица периода */}
      {!single && (
        <>
        <Section kicker={mode === "month" ? "стратегия месяца" : "стратегия недели"} title="Главное в периоде">
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontSize: 15, lineHeight: 1.65, fontFamily: FONT.serif }}>{summary.rhythm}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: C.ivory }}>{summary.climate}</div>
            <div>
              <div style={{ color: C.goldDim, fontFamily: FONT.mono, fontSize: 10, letterSpacing: ".1em", marginBottom: 7 }}>ДОМИНИРУЮЩИЕ ЗНАКИ ЛУНЫ</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {summary.dominant.map((item) => <span key={item} className="chip on">{item}</span>)}
              </div>
            </div>
          </div>
        </Section>

        {mode === "month" && (
          <Section kicker="ритм месяца" title="Недели месяца">
            <div style={{ display: "grid", gap: 10 }}>
              {weeks.map((week, index) => {
                const best = [...week.days].sort((a, b) => b.fit - a.fit)[0];
                const riskCount = week.days.filter((d) => d.fit <= -2).length;
                const start = week.days[0].iso;
                const end = week.days[week.days.length - 1].iso;
                return (
                  <div key={week.key} style={{ padding: "11px 0", borderBottom: index === weeks.length - 1 ? 0 : `1px solid ${C.line}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 5 }}>
                      <strong style={{ fontFamily: FONT.serif, fontSize: 16 }}>Неделя {index + 1}</strong>
                      <span style={{ color: C.muted, fontFamily: FONT.mono, fontSize: 11 }}>{shortDate(start)} — {shortDate(end)}</span>
                    </div>
                    <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                      Лучшее окно: <span style={{ color: C.green }}>{shortDate(best.iso)}</span>
                      {riskCount ? <span style={{ color: C.red }}> · дней осторожности: {riskCount}</span> : <span style={{ color: C.muted }}> · выраженных дней риска нет</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        <Section kicker="нажми на день для полного прогноза" title="Подробный прогноз">
          <div>
            {r.days.map((d) => (
              <DayDetails
                key={d.iso}
                day={d}
                today={today}
                open={openDays.has(d.iso)}
                onToggle={() => setOpenDays((current) => {
                  const next = new Set(current);
                  if (next.has(d.iso)) next.delete(d.iso);
                  else next.add(d.iso);
                  return next;
                })}
              />
            ))}
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Btn primary onClick={download}>Скачать полный расчёт</Btn>
            <span style={{ fontSize: 12, color: C.muted }}>Эфемерида рассчитана на 12:00 по Куала-Лумпуру</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            Расчёт служит рамкой для планирования и не заменяет проверку фактов при решениях о капитале.
          </div>
        </Section>

        <details className="forecast-technical">
          <summary>Технический календарь периода</summary>
          <Section kicker="таблица расчёта" title="Календарь периода">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
              <thead>
                <tr style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: ".08em", color: C.muted, textTransform: "uppercase" }}>
                  {["Дата", "ЛД", "Луна", "Фаза", "Окна", "Риски", "℞", "Сделки"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${C.line}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {r.days.map((d) => {
                  const mark = d.fit >= 2 ? { t: "✓ да", c: C.green } : d.fit <= -2 ? { t: "избегать", c: C.red } : { t: "·", c: C.muted };
                  return (
                    <tr key={d.iso} style={{ borderBottom: `1px solid ${C.line}`, background: d.iso === today ? "var(--accent-subtle)" : "transparent" }}>
                      <td style={{ padding: "7px 8px", color: C.ivory, whiteSpace: "nowrap" }}>{shortDate(d.iso)}</td>
                      <td style={{ padding: "7px 8px", fontFamily: FONT.mono, color: d.pd === 8 ? C.gold : C.ivory }}>{d.pd}</td>
                      <td style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>{SIGNS[d.a.moonSign]}</td>
                      <td style={{ padding: "7px 8px", color: C.muted, whiteSpace: "nowrap" }}>{d.a.illum}%</td>
                      <td style={{ padding: "7px 8px", color: d.a.windows.length ? C.green : C.muted, fontFamily: FONT.mono }}>{d.a.windows.length || "—"}</td>
                      <td style={{ padding: "7px 8px", color: d.a.cautions.length ? C.red : C.muted, fontFamily: FONT.mono }}>{d.a.cautions.length || "—"}</td>
                      <td style={{ padding: "7px 8px", color: C.gold, fontSize: 11 }}>{d.a.retro.map((p) => p[0]).join(" ") || "—"}</td>
                      <td style={{ padding: "7px 8px", color: mark.c, fontFamily: FONT.mono, fontSize: 12 }}>{mark.t}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: C.muted }}>ЛД — личный день · ℞ — первые буквы ретроградных планет</div>
          </Section>
        </details>
        </>
      )}

      {single && (
        <div style={{ display: "flex", gap: 12 }}>
          <Btn primary onClick={download}>Скачать расчёт</Btn>
        </div>
      )}

      <AiChat
        key={`forecast-${from}-${to}`}
        mode="forecast"
        title="Обсудить прогноз"
        description="Задавай вопросы о смысле периода, окнах и рисках. ИИ опирается на расчёт выше и не меняет факты эфемериды."
        context={forecastContext}
        contextLabel={`${from} — ${to}; ${r.days.length} дн.`}
        storageKey={`daler-os-ai-forecast-${from}-${to}`}
        quickPrompts={[
          "Какой практический фокус выбрать на этот период?",
          "Какие дни лучше оставить для переговоров и подписания?",
          "Где прогноз предупреждает о поспешном решении?",
        ]}
      />
    </>
  );
}
