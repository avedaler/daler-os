import { useMemo } from "react";
import { C, FONT } from "../constants";
import { Section, Field } from "./atoms";
import { computeAstro, MOON_SIGN_TEXT } from "../lib/astro";
import { PD_MEANING, personalDay } from "../lib/numerology";
import { prettyDate } from "../lib/date";

const MOON_GLYPH = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

const Line = ({ children }) => (
  <div style={{ fontSize: 14, lineHeight: 1.55, color: C.ivory, marginBottom: 8 }}>{children}</div>
);

const Tag = ({ color, children }) => (
  <span style={{ display: "inline-block", fontSize: 11, fontFamily: FONT.mono, letterSpacing: ".06em", color, border: `1px solid ${color}`, borderRadius: 3, padding: "2px 8px", marginRight: 8, marginBottom: 6 }}>{children}</span>
);

export default function AstroPanel({ date, pasted, onPasted }) {
  const a = useMemo(() => computeAstro(date), [date]);
  const num = personalDay(date);

  return (
    <Section kicker="транзиты дня · расчёт по эфемериде" title="Астрослой">
      <div style={{ fontSize: 12, color: C.gold, fontFamily: FONT.mono, letterSpacing: ".06em", marginTop: -8, marginBottom: 12, borderBottom: `1px solid ${C.line}`, paddingBottom: 10 }}>
        {prettyDate(date)}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: FONT.serif, fontSize: 22, color: C.gold }}>{MOON_GLYPH[a.moonSign]} Луна в {a.moonSignLoc}</span>
        <span style={{ fontSize: 12, color: C.muted, fontFamily: FONT.mono }}>{a.phase.name} · {a.illum}%</span>
      </div>

      <Line>{MOON_SIGN_TEXT[a.moonSign].charAt(0).toUpperCase() + MOON_SIGN_TEXT[a.moonSign].slice(1)}</Line>
      <Line><span style={{ color: C.muted }}>Фаза:</span> {a.phase.note}</Line>
      {a.ingress && <Line><span style={{ color: C.muted }}>Переход:</span> в течение дня Луна переходит из {a.ingress.from} в {a.ingress.to} — вторая половина дня меняет тон.</Line>}
      <Line><span style={{ color: C.muted }}>Для Овна:</span> {a.aries}</Line>

      {a.windows.length > 0 && (
        <div style={{ margin: "12px 0 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.green, fontFamily: FONT.mono, marginBottom: 6 }}>Окна дня</div>
          {a.windows.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: C.ivory, marginBottom: 5 }}>
              <Tag color={C.green}>{w.aspect} · {w.planet}</Tag>{w.text}
            </div>
          ))}
        </div>
      )}

      {a.cautions.length > 0 && (
        <div style={{ margin: "12px 0 4px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.red, fontFamily: FONT.mono, marginBottom: 6 }}>Запреты дня</div>
          {a.cautions.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: C.ivory, marginBottom: 5 }}>
              <Tag color={C.red}>{w.aspect} · {w.planet}</Tag>{w.text}
            </div>
          ))}
        </div>
      )}

      {a.retro.length > 0 && (
        <Line><span style={{ color: C.gold }}>℞ Ретроградны: {a.retro.join(", ")}</span> — перепроверяй документы, договорённости и технику.</Line>
      )}

      <div style={{ borderTop: `1px solid ${C.line}`, margin: "12px 0", paddingTop: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.goldDim, fontFamily: FONT.mono, marginBottom: 6 }}>Нумерология · личный день {num.pd}</div>
        <Line>{PD_MEANING[num.pd]}</Line>
      </div>

      <Field label="Дополнительный прогноз (вставить из чата с Claude)" value={pasted} onChange={onPasted} placeholder="Опционально: расширенный астрослой…" rows={3} />
    </Section>
  );
}
