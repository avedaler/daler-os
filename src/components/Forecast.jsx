import { useState, useMemo, useEffect } from "react";
import { C, FONT, migrateDay } from "../constants";
import { Section, Btn, StatusBadge } from "./atoms";
import { computeAstro, astroToText, SIGNS } from "../lib/astro";
import { personalDay, PD_MEANING } from "../lib/numerology";
import { prettyDate, weekday, addDays } from "../lib/date";
import { loadDay } from "../lib/store";
import { dayScore } from "../lib/score";

const MOON_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
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

export function TodayForecast({ date, compact = false }) {
  const result = useMemo(() => {
    const astro = computeAstro(date);
    const numerology = personalDay(date);
    return { astro, numerology, fitness: dealFitness(astro, numerology.pd) };
  }, [date]);
  const { astro, numerology, fitness } = result;
  const fitnessLabel = fitness >= 2 ? "Высокая" : fitness <= -2 ? "Низкая" : "Нейтральная";
  const fitnessTone = fitness >= 2 ? "green" : fitness <= -2 ? "red" : "gold";
  if (compact) return <section className="command-rail-section command-context" aria-label="Гороскопы дня">
    <div className="command-rail-heading"><span className="eyebrow">Гороскопы · сегодня</span><StatusBadge tone={fitnessTone}>сделки · {fitnessLabel}</StatusBadge></div>
    <div className="command-context-grid">
      <div><span>Личный день</span><strong>{numerology.pd}</strong></div>
      <div><span>Луна</span><strong>В {astro.moonSignLoc}</strong></div>
      <div><span>Окна / риски</span><strong>{astro.windows.length} / {astro.cautions.length}</strong></div>
    </div>
    <p><strong>Контекст, не команда.</strong> {astro.cautions[0]?.text || astro.windows[0]?.text || "Решения принимаются по фактам, срокам и ответственным."}</p>
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

  const [from, to] =
    mode === "day" ? [anchor, anchor]
    : mode === "week" ? weekBounds(anchor)
    : mode === "month" ? monthBounds(anchor)
    : [anchor, rangeTo >= anchor ? rangeTo : anchor];

  const r = useMemo(() => computeRange(from, to), [from, to]);

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

  return (
    <>
      <Section kicker="эфемерида + нумерология · по требованию" title="Расчёт периода">
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {[["day", "День"], ["week", "Неделя"], ["month", "Месяц"], ["range", "Период"]].map(([k, label]) => (
            <Btn key={k} primary={mode === k} onClick={() => setMode(k)}>{label}</Btn>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <Btn onClick={() => shift(-1)}>◀</Btn>
          {dateInput(anchor, setAnchor, "Начальная дата")}
          {mode === "range" && <>— {dateInput(rangeTo, setRangeTo, "Конечная дата")}</>}
          <Btn onClick={() => shift(1)}>▶</Btn>
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
            {MOON_GLYPH[single.a.moonSign]} Луна в {single.a.moonSignLoc} · {single.a.phase.name} {single.a.illum}%
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
        <Section kicker="по дням" title="Календарь периода">
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
                      <td style={{ padding: "7px 8px", whiteSpace: "nowrap" }}>{MOON_GLYPH[d.a.moonSign]} {SIGNS[d.a.moonSign]}</td>
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
          <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Btn primary onClick={download}>Скачать расчёт (Markdown)</Btn>
            <span style={{ fontSize: 12, color: C.muted }}>ЛД — личный день · ℞ — первые буквы ретроградных планет</span>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 10, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            Context, not command: расчёт — психологическая рамка для планирования, а не основание для решений о капитале.
          </div>
        </Section>
      )}

      {single && (
        <div style={{ display: "flex", gap: 12 }}>
          <Btn primary onClick={download}>Скачать расчёт (Markdown)</Btn>
        </div>
      )}
    </>
  );
}
