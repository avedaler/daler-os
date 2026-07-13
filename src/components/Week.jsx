import { useState, useEffect } from "react";
import { C, FONT, emptyDay } from "../constants";
import { Section } from "./atoms";
import { loadDay } from "../lib/store";
import { prettyDate, weekday, addDays, isoWeek } from "../lib/date";
import { dayScore, weekVerdict, SCORE_LEGEND } from "../lib/score";

async function collectWeek(monday) {
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = addDays(monday, i);
    const v = await loadDay(d);
    rows.push({ date: d, data: v });
  }
  return rows;
}

function stats(rows) {
  const filled = rows.filter((r) => r.data);
  const scores = filled.map((r) => dayScore({ ...emptyDay(), ...r.data }));
  const avg = scores.length ? scores.reduce((a, b) => a + b.pts, 0) / scores.length : 0;
  return {
    filled: filled.length,
    avg: Math.round(avg * 10) / 10,
    proofs: filled.filter((r) => r.data.proofDone).length,
    trainings: filled.filter((r) => r.data.blocks?.health).length,
    architect: filled.filter((r) => r.data.blocks?.architect).length,
    shutdowns: filled.filter((r) => r.data.shutdown).length,
  };
}

export default function Week({ date }) {
  const [rows, setRows] = useState(null);
  const [prev, setPrev] = useState(null);

  useEffect(() => {
    (async () => {
      const dow = weekday(date); // 0=вс
      const monday = addDays(date, -((dow + 6) % 7));
      setRows(await collectWeek(monday));
      setPrev(stats(await collectWeek(addDays(monday, -7))));
    })();
  }, [date]);

  if (!rows) return null;
  const st = stats(rows);
  const verdict = st.filled ? weekVerdict(st.avg) : null;
  const delta = prev && prev.filled ? Math.round((st.avg - prev.avg) * 10) / 10 : null;

  const Stat = ({ label, value, color }) => (
    <div>
      <div style={{ fontSize: 10, color: C.muted, fontFamily: FONT.mono, letterSpacing: ".1em" }}>{label}</div>
      <div style={{ fontSize: 22, fontFamily: FONT.mono, color: color || C.ivory }}>{value}</div>
    </div>
  );

  return (
    <>
      <Section kicker={`неделя ${isoWeek(date)} · пн–вс`} title="Недельный дашборд">
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap", marginBottom: 6 }}>
          <Stat label="СРЕДНИЙ БАЛАНС" value={st.filled ? st.avg : "—"} color={verdict ? C[verdict.color] : C.muted} />
          <Stat label="К ПРОШЛОЙ НЕДЕЛЕ" value={delta == null ? "—" : (delta >= 0 ? `+${delta}` : delta)} color={delta == null ? C.muted : delta >= 0 ? C.green : C.red} />
          <Stat label="ФАКТЫ-РЕЗУЛЬТАТЫ" value={`${st.proofs}/7`} color={st.proofs >= 5 ? C.green : C.gold} />
          <Stat label="ЧАС АРХИТЕКТОРА" value={`${st.architect}/7`} />
          <Stat label="ТРЕНИРОВКИ" value={`${st.trainings}/7`} />
          <Stat label="SHUTDOWN" value={`${st.shutdowns}/7`} />
        </div>
        {verdict && (
          <div style={{ display: "inline-block", fontSize: 13, color: C[verdict.color], border: `1px solid ${C[verdict.color]}`, borderRadius: 4, padding: "6px 12px", fontFamily: FONT.mono, marginTop: 6 }}>
            {verdict.text.toUpperCase()}
          </div>
        )}
      </Section>

      <Section kicker="дни недели" title="Понедельник — воскресенье">
        {rows.map(({ date: d, data }) => {
          if (!data) {
            return (
              <div key={d} style={{ marginBottom: 14, opacity: 0.55 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ color: C.muted }}>{prettyDate(d)}</span>
                  <span style={{ fontFamily: FONT.mono, color: C.muted }}>не заполнен</span>
                </div>
                <div style={{ height: 6, background: C.panel2, borderRadius: 3, border: `1px dashed ${C.line}` }} />
              </div>
            );
          }
          const sc = dayScore({ ...emptyDay(), ...data });
          const w = Math.round((sc.pts / sc.max) * 100);
          return (
            <div key={d} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: C.ivory }}>{prettyDate(d)}</span>
                <span style={{ fontFamily: FONT.mono, color: sc.pts >= 8 ? C.green : sc.pts >= 5 ? C.gold : C.muted }}>{sc.pts}/{sc.max}</span>
              </div>
              <div style={{ height: 6, background: C.panel2, borderRadius: 3, border: `1px solid ${C.line}` }}>
                <div style={{ width: `${w}%`, height: "100%", background: sc.pts >= 8 ? C.green : C.gold, borderRadius: 3 }} />
              </div>
              {data.proof && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Результат: {data.proof}{data.proofDone ? " ✓" : " (не закрыт)"}</div>}
            </div>
          );
        })}
        <div style={{ fontSize: 12, color: C.muted, marginTop: 16, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
          {SCORE_LEGEND} Оценка недели: 8–10 — система работает · 6–7 — упростить · ниже 6 — календарь спроектирован неверно.
        </div>
      </Section>
    </>
  );
}
