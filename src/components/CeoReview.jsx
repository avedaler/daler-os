import { useState, useEffect, useRef, useCallback } from "react";
import { C, FONT, emptyDay, emptyWeekReview } from "../constants";
import { Section, Field, CheckRow } from "./atoms";
import { loadWeek, saveWeek, listDays, loadDay } from "../lib/store";
import { isoWeek, weekday, addDays } from "../lib/date";
import { dayScore, weekVerdict } from "../lib/score";

export default function CeoReview({ date }) {
  const wk = isoWeek(date);
  const [r, setR] = useState(emptyWeekReview());
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    (async () => {
      const v = await loadWeek(wk);
      setR({ ...emptyWeekReview(), ...(v || {}) });
      // scorecard: дни текущей ISO-недели
      const dow = weekday(date); // 0=вс
      const monday = addDays(date, -((dow + 6) % 7));
      const days = await listDays();
      const scores = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(monday, i);
        if (!days.includes(d)) continue;
        const data = await loadDay(d);
        if (data) scores.push(dayScore({ ...emptyDay(), ...data }).pts);
      }
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      setStats({ n: scores.length, avg: Math.round(avg * 10) / 10 });
      setLoaded(true);
    })();
  }, [wk, date]);

  const up = useCallback((patch) => {
    setR((prev) => {
      const next = { ...prev, ...patch };
      clearTimeout(timer.current);
      timer.current = setTimeout(() => saveWeek(wk, next), 600);
      return next;
    });
  }, [wk]);

  if (!loaded) return null;
  const verdict = stats && stats.n > 0 ? weekVerdict(stats.avg) : null;
  const isFriday = weekday(date) === 5;

  return (
    <>
      {stats && (
        <Section kicker={`scorecard · ${wk}`} title="Недельный счёт">
          <div style={{ display: "flex", gap: 24, alignItems: "baseline", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono, letterSpacing: ".1em" }}>СРЕДНИЙ БАЛАНС</div>
              <div style={{ fontSize: 32, fontFamily: FONT.mono, color: verdict ? C[verdict.color] : C.muted }}>
                {stats.n > 0 ? stats.avg : "—"}<span style={{ fontSize: 16, color: C.muted }}>/10</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono, letterSpacing: ".1em" }}>ДНЕЙ ЗАПОЛНЕНО</div>
              <div style={{ fontSize: 32, fontFamily: FONT.mono, color: C.ivory }}>{stats.n}<span style={{ fontSize: 16, color: C.muted }}>/7</span></div>
            </div>
            {verdict && (
              <div style={{ fontSize: 14, color: C[verdict.color], border: `1px solid ${C[verdict.color]}`, borderRadius: 4, padding: "8px 14px", fontFamily: FONT.mono }}>
                {verdict.text.toUpperCase()}
              </div>
            )}
          </div>
        </Section>
      )}

      <Section kicker={isFriday ? "сегодня пятница — время ревью" : "заполняется по пятницам"} title="CEO-review: 5 вопросов Master OS">
        <Field label="1 · Факты недели (цифры: подписано, оплачено, запущено)" value={r.facts} onChange={(v) => up({ facts: v })} placeholder="Только факты, не намерения" rows={2} />
        <Field label="2 · Где разрыв между историей и реальностью?" value={r.gap} onChange={(v) => up({ gap: v })} placeholder="Что я рассказываю vs что показывают цифры" rows={2} />
        <Field label="3 · Одно узкое место" value={r.bottleneck} onChange={(v) => up({ bottleneck: v })} placeholder="Что сильнее всего тормозит Signed → Paid → Live → Recurring" rows={2} />
        <Field label="4 · Вычитание: что убрать" value={r.subtraction} onChange={(v) => up({ subtraction: v })} placeholder="Проект, встреча, обязательство — что закрыть" rows={2} />
        <Field label="5 · Следующая неделя: одно главное" value={r.nextWeek} onChange={(v) => up({ nextWeek: v })} placeholder="Один приоритет, одно доказательство" rows={2} />
        <CheckRow gold on={r.done} onClick={() => up({ done: !r.done })} label="Ревью проведено, приоритет следующей недели выбран" />
      </Section>
    </>
  );
}
