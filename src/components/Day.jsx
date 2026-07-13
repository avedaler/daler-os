import { C } from "../constants";
import { Section, CheckRow } from "./atoms";
import ArchitectTimer from "./ArchitectTimer";
import TaskFilter from "./TaskFilter";

export default function Day({ s, up }) {
  const setBlock = (k, v) => up({ blocks: { ...s.blocks, [k]: v } });
  return (
    <>
      <Section kicker="приоритет 1" title="Офис: статус-апдейт + бизнес-встреча">
        <CheckRow on={s.blocks.office} onClick={() => setBlock("office", !s.blocks.office)} label="Проведено. Каждая встреча закончилась следующим конкретным шагом" />
      </Section>

      <Section kicker="приоритет 2" title="Здоровье: тренировка и добавки">
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
