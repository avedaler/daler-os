import { AFFIRMATIONS, DECLARATION, C, FONT } from "../constants";
import { Section, Field, Check, CheckRow } from "./atoms";
import AstroPanel from "./AstroPanel";

export default function Morning({ s, up, date }) {
  return (
    <>
      <Section kicker="до телефона и новостей" title="Аффирмации">
        {AFFIRMATIONS.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
            <Check gold on={s.aff[i]} onClick={() => up({ aff: s.aff.map((v, j) => (j === i ? !v : v)) })} />
            <span style={{ fontSize: 15, lineHeight: 1.45, fontStyle: "italic", color: s.aff[i] ? C.ivory : C.muted }}>«{a}»</span>
          </div>
        ))}
      </Section>

      <Section kicker="операционная идентичность" title="Декларация">
        <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, whiteSpace: "pre-line", marginBottom: 12 }}>{DECLARATION}</div>
        <CheckRow gold on={s.decl} onClick={() => up({ decl: !s.decl })} label="Прочитано вслух, принято" />
      </Section>

      <Section kicker="вопрос архитектора" title="Что сегодня максимально увеличит стоимость моих компаний?">
        <Field label="Ответ" value={s.architectQ} onChange={(v) => up({ architectQ: v })} placeholder="Одно высокорычажное действие…" rows={2} />
        {s.architectQ.trim() && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: -4, marginBottom: 4, color: C.green, fontSize: 13 }}>
            <span>✓</span>
            <span>Зафиксировано как фокус дня — показан наверху вкладки «День»</span>
          </div>
        )}
      </Section>

      <Section kicker="протокол 1–1–1" title="Утренний протокол">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 8, fontFamily: FONT.mono }}>Состояние: {s.state}/10</div>
          <input type="range" min={1} max={10} value={s.state} onChange={(e) => up({ state: Number(e.target.value) })} style={{ width: "100%", accentColor: C.gold }} />
        </div>
        <Field label="Экономическое доказательство дня (подписано / оплачено / зафиксировано)" value={s.proof} onChange={(v) => up({ proof: v })} placeholder="Не встреча и не разговор — факт" />
        <Field label="Действие, которое может сделать только Далер" value={s.onlyDaler} onChange={(v) => up({ onlyDaler: v })} placeholder="Chairman-level" />
        <Field label="От чего сознательно отказываюсь сегодня" value={s.refusal} onChange={(v) => up({ refusal: v })} placeholder="Новая история / шум / чужая важность" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Тело" value={s.body} onChange={(v) => up({ body: v })} placeholder="Тренировка / шаги" />
          <Field label="Семья / отношения" value={s.family} onChange={(v) => up({ family: v })} placeholder="Присутствие без телефона" />
        </div>
      </Section>

      <AstroPanel date={date} pasted={s.astro} onPasted={(v) => up({ astro: v })} />
    </>
  );
}
