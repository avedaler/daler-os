// Скоринг v2: результат весит больше ритуала.
// Результат 5 · Исполнение 2 · Здоровье/стратегия 2 · Ритуалы 1 = 10
export function dayScore(s) {
  let pts = 0;
  const max = 10;
  // Результат — 5: факт создан (подписано/оплачено/запущено) и есть победы-факты
  if (s.proofDone) pts += 4;
  if (s.wins.some((w) => w.trim())) pts += 1;
  // Исполнение — 2: встречи закончились шагами, решение завтра зафиксировано
  if (s.blocks.office) pts += 1;
  if (s.tomorrow.trim()) pts += 1;
  // Здоровье и стратегия — 2
  if (s.blocks.health) pts += 1;
  if (s.blocks.architect) pts += 1;
  // Ритуалы — 1: shutdown проведён
  if (s.shutdown) pts += 1;
  return { pts, max };
}

export const SCORE_LEGEND = "Результат 5 · Исполнение 2 · Здоровье/стратегия 2 · Ритуалы 1. Разговоры не считаются: балл за результат даёт только подтверждённый факт.";

export function weekVerdict(avg) {
  if (avg >= 8) return { text: "Система работает", color: "green" };
  if (avg >= 6) return { text: "Упростить", color: "gold" };
  return { text: "Календарь спроектирован неверно", color: "red" };
}

// Прогресс вкладок для бейджей навигации
export function tabProgress(s) {
  return {
    morning: {
      done: [s.aff.every(Boolean), s.decl, !!s.architectQ.trim(), !!s.proof.trim()].filter(Boolean).length,
      max: 4,
    },
    day: { done: Object.values(s.blocks).filter(Boolean).length, max: 4 },
    evening: {
      done: [s.wins.some((w) => w.trim()), !!s.value.trim(), !!s.tomorrow.trim(), s.proofDone, s.shutdown].filter(Boolean).length,
      max: 5,
    },
  };
}
