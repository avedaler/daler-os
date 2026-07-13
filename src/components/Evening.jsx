import { Section, Field, CheckRow } from "./atoms";

export default function Evening({ s, up }) {
  return (
    <>
      <Section kicker="shutdown" title="Три победы дня">
        {s.wins.map((w, i) => (
          <Field key={i} label={`Победа ${i + 1}`} value={w} onChange={(v) => up({ wins: s.wins.map((x, j) => (j === i ? v : x)) })} placeholder="Факт, не намерение" />
        ))}
      </Section>
      <Section kicker="аудит стоимости" title="Вопросы Архитектора">
        <Field label="Что сегодня увеличило стоимость бизнеса?" value={s.value} onChange={(v) => up({ value: v })} rows={2} />
        <Field label="Что было шумом?" value={s.noise} onChange={(v) => up({ noise: v })} rows={2} />
        <Field label="Главное решение завтра" value={s.tomorrow} onChange={(v) => up({ tomorrow: v })} rows={2} />
      </Section>
      <Section kicker="доказательство" title="Закрытие дня">
        <CheckRow on={s.proofDone} onClick={() => up({ proofDone: !s.proofDone })} label={`Экономическое доказательство дня создано: ${s.proof || "—"}`} />
        <CheckRow gold on={s.shutdown} onClick={() => up({ shutdown: !s.shutdown })} label="Shutdown: регистры обновлены, материалы закрыты, перехожу в личное время" />
      </Section>
    </>
  );
}
