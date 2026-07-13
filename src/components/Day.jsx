import { useState, useEffect } from "react";
import { C, FONT, STAGES, HOBBIES } from "../constants";
import { Section, CheckRow, Field, Btn } from "./atoms";
import ArchitectTimer from "./ArchitectTimer";
import TaskFilter from "./TaskFilter";
import { loadDay } from "../lib/store";
import { addDays } from "../lib/date";

// Серия дней подряд (до вчера включительно), когда привычка соблюдалась
function useStreaks(date) {
  const [streaks, setStreaks] = useState({ noSmoke: 0, noAlcohol: 0 });
  useEffect(() => {
    (async () => {
      const out = { noSmoke: 0, noAlcohol: 0 };
      for (const key of ["noSmoke", "noAlcohol"]) {
        for (let i = 1; i <= 90; i++) {
          const v = await loadDay(addDays(date, -i));
          if (v?.habits?.[key]) out[key]++;
          else break;
        }
      }
      setStreaks(out);
    })();
  }, [date]);
  return streaks;
}

export default function Day({ s, up, deals, today, date, goDeals }) {
  const setBlock = (k, v) => up((prev) => ({ blocks: { ...prev.blocks, [k]: v } }));
  const setHabit = (patch) => up((prev) => ({ habits: { ...prev.habits, ...patch } }));
  const due = deals.filter((d) => d.nextDate && d.nextDate <= today && d.stage < 9);
  const streaks = useStreaks(date);
  const h = s.habits;
  const streakLabel = (base, n, on) => `${base}${n + (on ? 1 : 0) > 0 ? ` · серия ${n + (on ? 1 : 0)} дн.` : ""}`;

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

      <Section kicker="контроль исполнения · ежедневно" title="Дисциплина и развитие">
        <CheckRow gold on={h.noSmoke} onClick={() => setHabit({ noSmoke: !h.noSmoke })} label={streakLabel("Не курил", streaks.noSmoke, h.noSmoke)} />
        <CheckRow gold on={h.noAlcohol} onClick={() => setHabit({ noAlcohol: !h.noAlcohol })} label={streakLabel("Не пил", streaks.noAlcohol, h.noAlcohol)} />
        <div style={{ borderTop: `1px solid ${C.line}`, margin: "12px 0", paddingTop: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.gold, fontFamily: FONT.mono, marginBottom: 8 }}>Цель — срочно: бицепс и грудь</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <CheckRow on={h.biceps} onClick={() => setHabit({ biceps: !h.biceps })} label="Бицепс прокачан" />
            <CheckRow on={h.chest} onClick={() => setHabit({ chest: !h.chest })} label="Грудь прокачана" />
          </div>
        </div>
        <CheckRow on={h.logic} onClick={() => setHabit({ logic: !h.logic })} label="Изучал законы логики (минимум 20 минут)" />
        <Field label="Выход из зоны комфорта — что сделал (факт)" value={h.comfortExit} onChange={(v) => setHabit({ comfortExit: v })} placeholder="Звонок, который откладывал / незнакомая комната / сложный разговор" />
        <Field label="Социальная встреча в высоких кругах — с кем и результат" value={h.social} onChange={(v) => setHabit({ social: v })} placeholder="Имя, круг, следующий шаг" />
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, marginBottom: 8 }}>Хобби сегодня</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {HOBBIES.map((hb) => (
              <button key={hb} onClick={() => setHabit({ hobby: h.hobby === hb ? "" : hb })} style={{
                padding: "7px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13, minHeight: 36,
                border: `1px solid ${h.hobby === hb ? C.green : C.line}`,
                background: h.hobby === hb ? "rgba(111,175,135,.12)" : "transparent",
                color: h.hobby === hb ? C.green : C.muted, fontFamily: FONT.sans,
              }}>{hb}{h.hobby === hb ? " ✓" : ""}</button>
            ))}
          </div>
        </div>
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
