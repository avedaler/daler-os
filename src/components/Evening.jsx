import { C, FONT } from "../constants";
import { Section, Field, CheckRow } from "./atoms";

export default function Evening({ s, up }) {
  return (
    <>
      <Section kicker="план против факта" title="Сверка с утренним обещанием">
        {s.proof.trim() ? (
          <>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 4, fontFamily: FONT.mono, letterSpacing: ".06em", textTransform: "uppercase" }}>Утром обещано</div>
            <div style={{ fontFamily: FONT.serif, fontSize: 16, color: C.ivory, marginBottom: 12 }}>{s.proof}</div>
            <CheckRow on={s.proofDone} onClick={() => up({ proofDone: !s.proofDone })} label="Сделано — это факт, не намерение" />
            {!s.proofDone && (
              <Field label="Не сделано: причина + решение (перенос / отказ / делегировать / изменить подход)" value={s.proofMiss} onChange={(v) => up({ proofMiss: v })} placeholder="Больше двух переносов нельзя — убить, делегировать или эскалировать" rows={2} />
            )}
          </>
        ) : (
          <div style={{ fontSize: 14, color: C.red }}>Утром результат дня не был задан — день прошёл без обещания. Завтра начни с него.</div>
        )}
        {s.architectQ.trim() && (
          <div style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Фокус дня был: «{s.architectQ}»</div>
        )}
      </Section>

      <Section kicker="факты" title="Три победы дня">
        {s.wins.map((w, i) => (
          <Field key={i} label={`Победа ${i + 1}`} value={w} onChange={(v) => up((prev) => ({ wins: prev.wins.map((x, j) => (j === i ? v : x)) }))} placeholder="Факт, не намерение" />
        ))}
      </Section>

      <Section kicker="аудит стоимости" title="Вопросы Архитектора">
        <Field label="Что сегодня увеличило стоимость бизнеса?" value={s.value} onChange={(v) => up({ value: v })} rows={2} />
        <Field label="Что было шумом?" value={s.noise} onChange={(v) => up({ noise: v })} rows={2} />
        <Field label="Главное решение завтра" value={s.tomorrow} onChange={(v) => up({ tomorrow: v })} rows={2} />
      </Section>

      <Section kicker="закрытие" title="Shutdown">
        <CheckRow gold on={s.shutdown} onClick={() => up({ shutdown: !s.shutdown })} label="Регистры обновлены, материалы закрыты, перехожу в личное время" />
      </Section>
    </>
  );
}
