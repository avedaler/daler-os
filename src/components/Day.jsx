import { C, FONT, STAGES } from "../constants";
import { Section, CheckRow, Field, Btn } from "./atoms";
import ArchitectTimer from "./ArchitectTimer";
import TaskFilter from "./TaskFilter";

export default function Day({ s, up, deals, today, goDeals }) {
  const setBlock = (k, v) => up((prev) => ({ blocks: { ...prev.blocks, [k]: v } }));
  const due = deals.filter((d) => d.nextDate && d.nextDate <= today && d.stage < 9);

  return (
    <>
      {s.architectQ.trim() && (
        <div style={{ border: `1px solid ${C.gold}`, background: "rgba(200,164,92,.07)", borderRadius: 6, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: ".14em", color: C.goldDim, textTransform: "uppercase", fontFamily: FONT.mono, marginBottom: 4 }}>фокус дня · из утреннего вопроса архитектора</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 17, color: C.ivory }}>{s.architectQ}</div>
        </div>
      )}

      {due.length > 0 && (
        <Section kicker="pipeline" title="Сделки, требующие движения сегодня">
          {due.map((d) => (
            <div key={d.id} style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8, fontSize: 14, flexWrap: "wrap" }}>
              <span style={{ color: C.ivory }}>{d.name} <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>[{STAGES[d.stage]}]</span></span>
              <span style={{ color: C.red }}>{d.nextStep || "шаг не задан"}</span>
            </div>
          ))}
          <Btn onClick={goDeals}>Открыть сделки →</Btn>
        </Section>
      )}

      <Section kicker="приоритет 1" title="Офис: статус-апдейт + бизнес-встреча">
        <CheckRow on={s.blocks.office} onClick={() => setBlock("office", !s.blocks.office)} label="Проведено. Каждая встреча закончилась следующим конкретным шагом" />
      </Section>

      <Section kicker="приоритет 2 · утром" title="Здоровье: тренировка и добавки (утром)">
        <CheckRow on={s.blocks.health} onClick={() => setBlock("health", !s.blocks.health)} label="Тело укреплено: тренировка / шаги + добавки" />
      </Section>

      <Section kicker="приоритет 3 · неприкосновенно" title="Час Архитектора">
        <div style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Без телефона, сообщений и встреч. Только стратегия, капитал, партнёрства, мышление.</div>
        <ArchitectTimer onComplete={() => setBlock("architect", true)} />
        <Field label="Результат часа — артефакт, не размышление" value={s.architectResult} onChange={(v) => up({ architectResult: v })} placeholder="Решение / memo / список инвесторов / убить проект X" />
        <CheckRow on={s.blocks.architect} onClick={() => setBlock("architect", !s.blocks.architect)} label="Час проведён, артефакт зафиксирован" />
      </Section>

      <Section kicker="приоритет 4" title="Вечер: ментальная разгрузка">
        <CheckRow on={s.blocks.evening} onClick={() => setBlock("evening", !s.blocks.evening)} label="Разгрузка сделана, без экрана" />
      </Section>

      <Section kicker="капитал-фильтр" title="Фильтр новой задачи">
        <TaskFilter />
      </Section>
    </>
  );
}
