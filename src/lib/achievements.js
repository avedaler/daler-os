import { defaultHealthProfile, primaryOutcomeText } from "../constants.js";

const OUTCOME_LABELS = {
  done: "Главный результат выполнен",
  in_progress: "Главный результат в работе",
  partial: "Главный результат выполнен частично",
  blocked: "Главный результат заблокирован",
  missed: "Главный результат не выполнен",
};

const TRAINING_LABELS = {
  strength: "Силовая тренировка",
  swim: "Плавание",
  recovery: "Восстановительная тренировка",
  rest: "День восстановления",
};

const HEALTH_ACT_LABELS = {
  "Тренировка": "Тренировка отмечена",
  "Ходьба": "Ходьба отмечена",
  "Добавки": "Добавки отмечены",
  "Восстановление": "Восстановление отмечено",
};

const supplementNames = new Map(defaultHealthProfile().supplements.map((item) => [item.id, item.name]));

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function dailyEvents(day) {
  if (!day) return [];
  const events = [];
  const ids = new Set();
  const add = (id, label, category, tone = "neutral", detail = "") => {
    if (!label || ids.has(id)) return;
    ids.add(id);
    events.push({ id, label, category, tone, detail: clean(detail) });
  };

  const habits = day.habits || {};
  const protocol = day.dailyProtocol || {};
  const morning = protocol.morning || {};
  const training = protocol.training || {};
  const work = protocol.work || {};
  const evening = protocol.evening || {};
  const blocks = day.blocks || {};

  if (habits.noSmoke) add("no-smoke", "День без курения", "Дисциплина", "green");
  if (habits.noAlcohol || evening.noAlcohol) add("no-alcohol", "День без алкоголя", "Дисциплина", "green");
  if (habits.logic) add("logic", "Логика / обучение", "Развитие", "gold");
  if (habits.biceps) add("training-biceps", "Тренировка: бицепс", "Здоровье", "green");
  if (habits.chest) add("training-chest", "Тренировка: грудь", "Здоровье", "green");
  if (clean(habits.comfortExit)) add("comfort-exit", "Выход из зоны комфорта", "Развитие", "gold", habits.comfortExit);
  if (clean(habits.social)) add("social", "Социальное событие", "Личное", "neutral", habits.social);
  if (clean(habits.hobby)) add("hobby", "Хобби", "Личное", "neutral", habits.hobby);

  const outcomeText = primaryOutcomeText(day.primaryOutcome);
  const outcomeStatus = day.primaryOutcome?.status || day.outcomeStatus;
  if (outcomeText && OUTCOME_LABELS[outcomeStatus]) {
    add("primary-outcome", OUTCOME_LABELS[outcomeStatus], "Работа", outcomeStatus === "done" ? "gold" : ["missed", "blocked"].includes(outcomeStatus) ? "red" : "amber", outcomeText);
  }

  const medicationEvents = Array.isArray(morning.medicationEvents) ? morning.medicationEvents : [];
  const mounjaroTaken = morning.medicationStatus === "taken" || medicationEvents.some((event) => event.medicationId === "mounjaro" && event.status === "taken");
  if (mounjaroTaken) add("mounjaro", "Mounjaro принято", "Здоровье", "green");
  else if (morning.medicationStatus === "skipped") add("mounjaro-skipped", "Mounjaro пропущено", "Здоровье", "red");
  else if (morning.medicationStatus === "not_planned") add("mounjaro-not-planned", "Mounjaro: не сегодня", "Здоровье", "neutral");
  medicationEvents.forEach((event, index) => {
    if (event.medicationId === "mounjaro") return;
    add(`medication-${event.medicationId || index}`, `Препарат: ${event.medicationId || "отметка"}`, "Здоровье", event.status === "taken" ? "green" : "amber", event.status || "");
  });

  if (Number(morning.waterMl) > 0) add("water", `Вода утром · ${morning.waterMl} мл`, "Здоровье", Number(morning.waterMl) >= 500 ? "green" : "neutral");
  const supplements = Array.isArray(morning.supplementEvents) ? [...new Set(morning.supplementEvents)] : [];
  if (supplements.length) {
    add("supplements", `Схема добавок · ${supplements.length}`, "Здоровье", "green", supplements.map((id) => supplementNames.get(id) || id).join(", "));
  }
  if (morning.coffee === "done") add("coffee", "Утренний кофе", "Режим", "neutral");
  if (morning.light) add("morning-light", "Дневной свет", "Режим", "green");
  if (morning.breathwork) add("breathwork", "Дыхательная практика", "Здоровье", "green");
  if (morning.rinse) add("rinse", "Контрастный душ", "Здоровье", "green");

  if (["started", "shortened", "done"].includes(training.status)) {
    const session = TRAINING_LABELS[training.plannedSessionId] || "Тренировка";
    const state = training.status === "done" ? "завершена" : training.status === "shortened" ? "сокращена" : "начата";
    add("training", `${session} · ${state}`, "Здоровье", training.status === "done" ? "green" : "amber");
  }
  if (training.coldExposure === "done") add("cold-exposure", "Cold plunge выполнен", "Здоровье", "green");

  if (work.deepWorkStatus && work.deepWorkStatus !== "idle") {
    const minutes = Number(work.deepWorkMinutes) || 0;
    const state = work.deepWorkStatus === "paused" ? "пауза" : work.deepWorkStatus === "done" ? "завершено" : "запущено";
    add("deep-work", `Глубокая работа${minutes ? ` · ${minutes} мин` : ""}`, "Работа", work.deepWorkStatus === "done" ? "green" : "gold", state);
  }
  const artifact = clean(work.artifact) || clean(day.artifactType) || clean(day.architectResult);
  if (artifact) add("artifact", "Рабочий артефакт", "Работа", "gold", artifact);
  if (work.meetingPrep && Object.values(work.meetingPrep).some((value) => clean(value))) add("meeting-prep", "Встреча подготовлена", "Работа", "gold", work.meetingPrep.outcome);
  (Array.isArray(work.tasks) ? work.tasks : []).forEach((task, index) => {
    const title = clean(task.title);
    if (!title) return;
    add(`task-${task.id || index}`, title, task.kind === "event" ? "Календарь" : "Задача", task.done ? "green" : "neutral", [task.time, clean(task.notes)].filter(Boolean).join(" · "));
  });

  const mainWin = clean(evening.mainWin) || clean(day.wins?.[0]);
  if (mainWin) add("main-win", "Главная победа дня", "Достижение", "gold", mainWin);
  if (evening.delegateOrStop === "delegate") add("delegate", "Задача делегирована", "Работа", "gold", evening.delegateNote);
  if (evening.delegateOrStop === "stop") add("stop", "Лишняя задача прекращена", "Работа", "gold", evening.delegateNote);
  if (evening.dealRegisterUpdated) add("deal-register", "Deal Register обновлён", "Работа", "green");
  if (evening.recoveryRegisterUpdated) add("recovery-register", "Recovery Register обновлён", "Здоровье", "green");
  if (evening.materialsClosed) add("materials-closed", "Рабочие материалы закрыты", "Работа", "green");
  if (evening.familyPresence) add("family-presence", "Время с близкими без телефона", "Личное", "green");
  if (evening.eveningWalk) add("evening-walk", "Вечерняя прогулка", "Здоровье", "green");
  if (evening.sleepReady) add("sleep-ready", "Подготовка ко сну", "Здоровье", "green");
  if (evening.shutdown || day.shutdown) add("shutdown", "Рабочий день закрыт", "Режим", "green");

  (Array.isArray(day.healthActs) ? day.healthActs : []).forEach((item) => {
    add(`health-${item}`, HEALTH_ACT_LABELS[item] || item, "Здоровье", "green");
  });
  if (blocks.office) add("legacy-office", "Офисный блок выполнен", "Работа", "green");
  if (blocks.health) add("legacy-health", "Блок здоровья выполнен", "Здоровье", "green");
  if (blocks.architect) add("legacy-architect", "Блок Архитектора выполнен", "Развитие", "gold");
  if (blocks.evening && !ids.has("shutdown")) add("legacy-evening", "Вечерний обзор выполнен", "Режим", "green");
  if (day.decl) add("declaration", "Декларация пройдена", "Режим", "green");
  const affirmationCount = Array.isArray(day.aff) ? day.aff.filter(Boolean).length : 0;
  if (affirmationCount) add("affirmations", `Аффирмации · ${affirmationCount}`, "Режим", "green");

  const extraWins = Array.isArray(day.wins) ? day.wins.map(clean).filter(Boolean) : [];
  extraWins.forEach((win, index) => {
    if (win === mainWin) return;
    add(`win-${index}`, "Достижение", "Достижение", "gold", win);
  });
  if (clean(day.value)) add("value", "Созданная ценность", "Достижение", "gold", day.value);
  if (clean(day.body) && clean(day.body) !== clean(protocol.legacy?.healthNote)) add("body-note", "Запись о состоянии", "Здоровье", "neutral", day.body);
  if (clean(day.family)) add("family-note", "Событие с семьёй", "Личное", "neutral", day.family);

  return events;
}

export function calendarMetrics(days) {
  const eventLists = Object.values(days || {});
  const contains = (id) => eventLists.filter((events) => events.some((event) => event.id === id)).length;
  return {
    noSmoke: contains("no-smoke"),
    noAlcohol: contains("no-alcohol"),
    training: eventLists.filter((events) => events.some((event) => event.id === "training" || event.id.startsWith("training-") || event.id === "health-Тренировка")).length,
    outcomes: eventLists.filter((events) => events.some((event) => event.id === "primary-outcome" && event.tone === "gold")).length,
    shutdowns: contains("shutdown"),
    total: eventLists.reduce((sum, events) => sum + events.length, 0),
  };
}
