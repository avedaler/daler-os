import { useState, useEffect } from "react";
import { C, FONT, emptyDay } from "../constants";
import { Section } from "./atoms";
import { listDays, loadDay } from "../lib/store";
import { prettyDate } from "../lib/date";
import { dayScore } from "../lib/score";

export default function Week({ date }) {
  const [week, setWeek] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const all = (await listDays()).slice(-7);
        const rows = [];
        for (const d of all) {
          const v = await loadDay(d);
          if (v) rows.push({ date: d, data: v });
        }
        setWeek(rows.reverse());
      } catch {
        setWeek([]);
      }
    })();
  }, [date]);

  return (
    <Section kicker="обзор" title="Последние 7 дней">
      {week.length === 0 && <div style={{ color: C.muted, fontSize: 14 }}>Пока нет записей. Дни появятся здесь по мере заполнения.</div>}
      {week.map(({ date: d, data }) => {
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
            {data.proof && <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Доказательство: {data.proof}{data.proofDone ? " ✓" : " (не закрыто)"}</div>}
          </div>
        );
      })}
      <div style={{ fontSize: 12, color: C.muted, marginTop: 16, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
        Оценка недели: 8–10 — система работает · 6–7 — упростить · ниже 6 — календарь спроектирован неверно.
      </div>
    </Section>
  );
}
