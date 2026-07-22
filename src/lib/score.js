import { primaryOutcomeText } from "../constants";

// Скоринг v3: результат весит больше ритуала.
// Результат 5 · Исполнение 2 · Здоровье/стратегия 2 · Ритуалы 1 = 10
export function dayScore(s) {
  let pts = 0;
  const max = 10;
  const outcomeStatus = s.primaryOutcome?.status || s.outcomeStatus;
  const done = outcomeStatus === "done" || s.proofDone;
  const evening = s.dailyProtocol?.evening || {};
  const work = s.dailyProtocol?.work || {};
  const training = s.dailyProtocol?.training || {};
  // Результат — 5: главный результат стал фактом + есть главная победа
  if (done) pts += 4;
  if (evening.mainWin || s.wins.some((w) => typeof w === "string" && w.trim())) pts += 1;
  // Исполнение — 2: встречи закончились шагами; по невыполненному принято решение
  if (s.blocks.office || work.deepWorkStatus === "running" || work.deepWorkStatus === "done") pts += 1;
  if (done || evening.resolution || s.missAction || s.tomorrow.trim()) pts += 1;
  // Здоровье и стратегия — 2
  if (s.blocks.health || training.status === "done" || (s.healthActs || []).length > 0) pts += 1;
  if (s.blocks.architect || work.artifact || s.artifactType) pts += 1;
  // Ритуалы — 1: shutdown проведён
  if (evening.shutdown || s.shutdown) pts += 1;
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
  const state = s.dailyProtocol?.compass?.stateBand || s.stateCat;
  return {
    done: [!!state, !!primaryOutcomeText(s.primaryOutcome).trim(), s.dayStarted].filter(Boolean).length,
    max: 3,
  };
}

// Вечер: статус → (решение, если не сделано) → победа → shutdown
export function eveningProgress(s) {
  const evening = s.dailyProtocol?.evening || {};
  const status = evening.outcomeStatus || s.primaryOutcome?.status || s.outcomeStatus;
  const statusSet = ["done", "partial", "missed", "no"].includes(status);
  const resolved = status === "done" || !!evening.resolution || !!s.missAction;
  return {
    done: [statusSet, resolved, !!evening.mainWin || s.wins.some((w) => typeof w === "string" && w.trim()), evening.shutdown || s.shutdown].filter(Boolean).length,
    max: 4,
  };
}
