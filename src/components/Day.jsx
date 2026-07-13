import { C, FONT } from "../constants";
import { Section, CheckRow } from "./atoms";
import ArchitectTimer from "./ArchitectTimer";
import TaskFilter from "./TaskFilter";

export default function Day({ s, up }) {
  const setBlock = (k, v) => up({ blocks: { ...s.blocks, [k]: v } });
  return (
    <>
      {s.architectQ.trim() && (
        <div style={{ border: `1px solid ${C.gold}`, background: "rgba(200,164,92,.07)", borderRadius: 6, padding: "14px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: ".14em", color: C.goldDim, textTransform: "uppercase", fontFamily: FONT.mono, marginBottom: 4 }}>фокус дня · из утреннего вопроса архитектора</div>
          <div style={{ fontFamily: FONT.serif, fontSize: 17, color: C.ivory }}>{s.architectQ}</div>
        </div>
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
        <CheckRow on={s.blocks.architect} onClick={() => setBlock("architect", !s.blocks.architect)} label="Час проведён" />
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
