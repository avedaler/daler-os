import assert from "node:assert/strict";
import {
  AFFIRMATIONS,
  DECLARATION,
  defaultTrainingPlan,
  migrateDay,
  migrateHealthProfile,
  primaryOutcomeText,
} from "../src/constants.js";
import { calendarMetrics, dailyEvents } from "../src/lib/achievements.js";

assert.deepEqual(AFFIRMATIONS, [
  "Мои финансовые доходы сейчас увеличиваются",
  "Я богат, я здоров и я счастлив",
  "Мирное изобилие — моё наследие. Порядок установлен во мне",
  "Я — энергичный человек. Моя энергия создаёт движение, ценность и результат",
]);
assert.match(DECLARATION, /дисциплинированный создатель ценности, распределитель капитала и closer/);
assert.match(DECLARATION, /Каждую неделю я измеряю факты, закрываю лишнее и снова выбираю главное/);
assert.deepEqual(migrateDay({ aff: [true, false, true] }).aff, [true, false, true, false]);

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
assert.equal(training.days.monday.focus, "shoulders_arms");
assert.equal(training.days.wednesday.focus, "chest_back");
assert.equal(training.days.friday.focus, "legs_core");
assert.equal(training.safetyProfile.coldExposureAcknowledged, false);

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

console.log("Migration and protocol checks passed.");
