import assert from "node:assert/strict";
import {
  AFFIRMATIONS,
  DEFAULT_SETTINGS,
  DECLARATION,
  defaultTrainingPlan,
  migrateDay,
  migrateHealthProfile,
  migrateTrainingPlan,
  primaryOutcomeText,
} from "../src/constants.js";
import { calendarMetrics, dailyEvents } from "../src/lib/achievements.js";
import { CODE_LAWS, codeEventsForDate, codeSession, defaultCodeState, migrateCodeState } from "../src/lib/code.js";
import { businessResourceContext, migrateBusinessChat, migrateBusinessKnowledge } from "../src/lib/business.js";

assert.deepEqual(AFFIRMATIONS, [
  "Мои финансовые доходы сейчас увеличиваются",
  "Я богат, я здоров и я счастлив",
  "Мирное изобилие — моё наследие. Порядок установлен во мне",
  "Я — энергичный человек. Моя энергия создаёт движение, ценность и результат",
  "Я беру максимум от этого дня и ценю каждый его момент",
]);
assert.equal(DEFAULT_SETTINGS.theme, "dark");
assert.match(DECLARATION, /дисциплинированный создатель ценности, распределитель капитала и closer/);
assert.match(DECLARATION, /Каждую неделю я измеряю факты, закрываю лишнее и снова выбираю главное/);
assert.deepEqual(migrateDay({ aff: [true, false, true] }).aff, [true, false, true, false, false]);

const legacyDay = {
  proof: "Подписан договор",
  architectQ: "Как убрать последнее согласование?",
  proofDone: true,
  body: "Спал семь часов",
  blocks: { health: true },
  habits: { noAlcohol: true, biceps: true },
  wins: ["Договор подписан", "", ""],
};
const migratedDay = migrateDay(legacyDay);
assert.equal(primaryOutcomeText(migratedDay.primaryOutcome), legacyDay.proof);
assert.equal(migratedDay.primaryOutcome.status, "done");
assert.match(migratedDay.primaryOutcome.legacyNote, /Вопрос Архитектора/);
assert.equal(migratedDay.proof, legacyDay.proof, "legacy proof remains available");
assert.equal(migratedDay.architectQ, legacyDay.architectQ, "legacy architect question remains available");
assert.equal(migratedDay.dailyProtocol.legacy.healthNote, legacyDay.body);
assert.deepEqual(migratedDay.dailyProtocol.legacy.trainingTags, ["biceps"]);
assert.equal(migratedDay.dailyProtocol.evening.noAlcohol, true);
assert.equal(migratedDay.dailyProtocol.evening.mainWin, legacyDay.wins[0]);

const canonicalDay = migrateDay({
  primaryOutcome: { text: "Получена оплата", status: "in_progress", chairmanOnly: true },
  proof: "Старое доказательство",
});
assert.equal(primaryOutcomeText(canonicalDay.primaryOutcome), "Получена оплата");
assert.equal(canonicalDay.primaryOutcome.status, "in_progress");
assert.equal(canonicalDay.primaryOutcome.chairmanOnly, true);

const migratedProfile = migrateHealthProfile({
  schemaVersion: 1,
  medications: [{ id: "rybelsus", name: "Rybelsus", active: true, dose: "legacy" }],
  supplements: [{ id: "creatine", name: "Кератин", active: true, dose: null }],
});
const mounjaro = migratedProfile.medications.find((item) => item.id === "mounjaro");
const rybelsus = migratedProfile.medications.find((item) => item.id === "rybelsus");
assert.equal(migratedProfile.schemaVersion, 2);
assert.equal(migratedProfile.breakfastSkipped, true);
assert.deepEqual(mounjaro.weekdays, [3]);
assert.equal(mounjaro.dose, null, "Mounjaro dose is never inferred");
assert.equal(rybelsus.active, false, "Rybelsus is retained only as inactive legacy data");
assert.equal(rybelsus.dose, "legacy", "legacy medication data is preserved");
assert.equal(migratedProfile.supplements.find((item) => item.id === "creatine").dose, "5 g");
assert.equal(migratedProfile.supplements.find((item) => item.id === "b-complex").dose, null);
assert.equal(migratedProfile.supplements.find((item) => item.id === "magnesium-glycinate").dose, "300–400 mg");

const training = defaultTrainingPlan();
assert.equal(training.schemaVersion, 2);
assert.equal(training.template, "4_day_strength_growth");
assert.equal(training.days.monday.focus, "push");
assert.equal(training.days.tuesday.focus, "pull");
assert.equal(training.days.thursday.focus, "legs");
assert.equal(training.days.friday.focus, "upper_shape");
assert.equal(training.days.friday.exercises.length, 7);
assert.equal(training.safetyProfile.coldExposureAcknowledged, false);
const migratedTraining = migrateTrainingPlan({
  schemaVersion: 1,
  days: { monday: { type: "strength", focus: "legacy_custom", duration: 45 } },
  history: [{ date: "2026-01-01", status: "done" }],
  userOverrides: { "2026-01-02": { type: "rest", focus: "legacy_rest", duration: 0 } },
});
assert.equal(migratedTraining.days.monday.focus, "push", "v1 plan upgrades to the requested four-day program");
assert.equal(migratedTraining.legacyDays.monday.focus, "legacy_custom", "previous plan data remains archived");
assert.equal(migratedTraining.history.length, 1);
assert.equal(migratedTraining.userOverrides["2026-01-02"].focus, "legacy_rest");
const enrichedTraining = migrateTrainingPlan({
  schemaVersion: 2,
  days: { thursday: { exercises: [{ id: "barbell-squat", name: "Мой присед", sets: 5, reps: "5" }] } },
});
const enrichedSquat = enrichedTraining.days.thursday.exercises[0];
assert.equal(enrichedSquat.name, "Мой присед", "user exercise changes remain authoritative");
assert.equal(enrichedSquat.sets, 5, "user training volume is preserved");
assert.equal(enrichedSquat.tempo, "3–1–1", "new exercise guidance enriches saved plans by exercise id");
assert.ok(enrichedSquat.cue.includes("колени"), "saved plans receive the detailed technique cue");

const achievementEvents = dailyEvents(migrateDay({
  primaryOutcome: { text: "Оплата получена", status: "done" },
  habits: { noSmoke: true, noAlcohol: true },
  healthActs: ["Ходьба"],
  dailyProtocol: {
    morning: { waterMl: 700, supplementEvents: ["electrolytes", "vitamin-d3"], medicationStatus: "taken" },
    training: { status: "done", plannedSessionId: "strength" },
    evening: { mainWin: "Подписан договор", shutdown: true },
  },
}));
assert.ok(achievementEvents.some((event) => event.id === "no-smoke"));
assert.ok(achievementEvents.some((event) => event.id === "no-alcohol"));
assert.ok(achievementEvents.some((event) => event.id === "primary-outcome"));
assert.ok(achievementEvents.some((event) => event.id === "training"));
assert.ok(achievementEvents.some((event) => event.id === "supplements"));
assert.ok(achievementEvents.some((event) => event.id === "main-win"));
const achievementMetrics = calendarMetrics({ "2026-07-14": achievementEvents });
assert.equal(achievementMetrics.noSmoke, 1);
assert.equal(achievementMetrics.noAlcohol, 1);
assert.equal(achievementMetrics.training, 1);
assert.equal(achievementMetrics.outcomes, 1);

const codeState = defaultCodeState();
assert.equal(codeState.activeLawId, "calm");
assert.equal(codeState.settings.languageMode, "ru");
assert.ok(CODE_LAWS.length >= 10);
const codeDay = codeSession(codeState, "2026-07-25");
assert.equal(codeDay.expectedTriggerId, "pressure");
assert.equal(codeDay.identityStatementIds.length, 3);
const migratedCode = migrateCodeState({
  settings: { languageMode: "ru" },
  laws: [{ id: "calm", ru: "Мой сохранённый закон" }],
  sessions: { "2026-07-24": { mainMoveText: "Подписать договор" } },
});
assert.equal(migratedCode.settings.languageMode, "ru");
assert.equal(migratedCode.laws.find((item) => item.id === "calm").ru, "Мой сохранённый закон");
assert.equal(migratedCode.laws.length, CODE_LAWS.length, "new seeded laws enrich saved Code data");
assert.equal(migratedCode.sessions["2026-07-24"].mainMoveText, "Подписать договор");
const completedCode = {
  ...codeState,
  sessions: {
    "2026-07-25": {
      ...codeDay,
      mainMoveText: "Отправить договор",
      morningCompletedAt: "2026-07-25T08:00:00Z",
      mainMoveCompletedAt: "2026-07-25T12:00:00Z",
      eveningCompletedAt: "2026-07-25T20:00:00Z",
      behavioralProof: "Договор отправлен",
    },
  },
};
assert.deepEqual(codeEventsForDate(completedCode, "2026-07-25").map((event) => event.id), ["code-morning", "code-main-move", "code-evening"]);

const businessKnowledge = migrateBusinessKnowledge({
  resources: [{
    id: "strategy-book",
    type: "book",
    title: "Стратегия",
    summary: "Сконцентрировать усилия на главном ограничении.",
    skills: ["Диагностика ограничения"],
    principles: ["Не распылять ресурсы"],
    frameworks: ["Диагноз → политика → действия"],
    decisionQuestions: ["Какое ограничение сейчас главное?"],
  }],
});
assert.equal(businessKnowledge.resources.length, 1);
assert.match(businessResourceContext(businessKnowledge.resources[0]), /Диагностика ограничения/);
assert.deepEqual(migrateBusinessChat([{ role: "user", content: "Проверить гипотезу" }, { role: "system", content: "скрыто" }]), [{
  role: "user",
  content: "Проверить гипотезу",
  source: null,
  attachments: [],
}]);
assert.deepEqual(migrateBusinessChat([{ role: "assistant", content: "Ответ", model: "anthropic/claude-opus-4.8" }]), [{
  role: "assistant",
  content: "Ответ",
  model: "anthropic/claude-opus-4.8",
  source: null,
  attachments: [],
}]);
assert.deepEqual(migrateBusinessChat([{
  role: "user",
  content: "Разбери файл",
  attachments: [{ name: "plan.pdf", mediaType: "application/pdf", size: 2048, kind: "file", data: "secret-binary" }],
}])[0].attachments, [{ name: "plan.pdf", mediaType: "application/pdf", size: 2048, kind: "file" }]);

console.log("Migration and protocol checks passed.");
