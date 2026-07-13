// Скоринг v3: результат весит больше ритуала.
// Результат 5 · Исполнение 2 · Здоровье/стратегия 2 · Ритуалы 1 = 10
export function dayScore(s) {
  let pts = 0;
  const max = 10;
  const done = s.outcomeStatus === "done" || s.proofDone;
  // Результат — 5: главный результат стал фактом + есть главная победа
  if (done) pts += 4;
  if (s.wins.some((w) => w.trim())) pts += 1;
  // Исполнение — 2: встречи закончились шагами; по невыполненному принято решение
  if (s.blocks.office) pts += 1;
  if (done || s.missAction || s.tomorrow.trim()) pts += 1;
  // Здоровье и стратегия — 2
  if (s.blocks.health || (s.healthActs || []).length > 0) pts += 1;
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

// Быстрое утро: состояние → результат → старт (3/3)
export function morningProgress(s) {
  return {
    done: [!!s.stateCat, !!s.primaryOutcome.trim(), s.dayStarted].filter(Boolean).length,
    max: 3,
  };
}

// Вечер: статус → (решение, если не сделано) → победа → shutdown
export function eveningProgress(s) {
  const statusSet = ["done", "partial", "no"].includes(s.outcomeStatus);
  const resolved = s.outcomeStatus === "done" || !!s.missAction;
  return {
    done: [statusSet, resolved, s.wins.some((w) => w.trim()), s.shutdown].filter(Boolean).length,
    max: 4,
  };
}
