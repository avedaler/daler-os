export const AFFIRMATIONS = [
  "Мои финансовые доходы сейчас увеличиваются",
  "Я богат, я здоров и я счастлив",
  "Мирное изобилие — моё наследие. Порядок установлен во мне",
  "Я — энергичный человек. Моя энергия создаёт движение, ценность и результат",
];

export const DECLARATION = `Я — дисциплинированный создатель ценности, распределитель капитала и closer. Я запускаю только то, что способно стать подписанным, оплаченным, запущенным и повторяемым. Я защищаю своё тело, семью, репутацию, внимание и свободу.

Я не создаю новые истории, когда должен закрывать старые обязательства. Я не путаю внимание с прогрессом, встречи — со сделками, claims — с деньгами, а намерения — с дисциплиной. Каждый день я создаю одно экономическое доказательство, укрепляю тело и присутствую в отношениях. Каждую неделю я измеряю факты, закрываю лишнее и снова выбираю главное.`;

export const C = {
  bg: "#0a0c10",
  panel: "#12151c",
  panel2: "#0d1016",
  line: "rgba(235,230,218,0.09)",
  ivory: "#ece7db",
  muted: "#8b93a5",
  gold: "#d4af6e",
  goldDim: "#967c4c",
  green: "#7cbb92",
  red: "#c98080",
};

export const FONT = {
  serif: "'Playfair Display', serif",
  sans: "'Manrope', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// Дата рождения для нумерологии: 3 апреля
export const BIRTH = { day: 3, month: 4 };

export const emptyPrimaryOutcome = () => ({
  text: "",
  source: "custom",
  projectId: null,
  dealId: null,
  chairmanOnly: false,
  status: "planned",
  dueAt: null,
  legacyNote: "",
});

export const primaryOutcomeText = (value) =>
  typeof value === "string" ? value : value?.text || "";

export function normalizePrimaryOutcome(raw, legacy = {}) {
  const base = emptyPrimaryOutcome();
  const fromObject = raw && typeof raw === "object" ? raw : {};
  const primaryText = typeof raw === "string" ? raw.trim() : String(fromObject.text || "").trim();
  const proof = String(legacy.proof || "").trim();
  const architect = String(legacy.architectQ || "").trim();
  const fallback = primaryText || proof || architect;
  const legacyNote = proof && architect && proof !== architect
    ? `Результат: ${proof}\nВопрос Архитектора: ${architect}`
    : String(fromObject.legacyNote || "");
  const legacyStatus = legacy.proofDone ? "done" : legacy.outcomeStatus;
  const statusMap = { progress: "in_progress", no: "missed", "": "planned" };
  return {
    ...base,
    ...fromObject,
    text: fallback,
    source: fromObject.source || (fallback ? "custom" : base.source),
    chairmanOnly: Boolean(fromObject.chairmanOnly ?? legacy.chairmanOnly),
    status: statusMap[fromObject.status || legacyStatus] || fromObject.status || legacyStatus || "planned",
    legacyNote,
  };
}

export const withPrimaryOutcome = (current, patch) => ({
  ...normalizePrimaryOutcome(current),
  ...patch,
});

export const defaultHealthProfile = () => ({
  schemaVersion: 2,
  wakeTime: "07:00",
  workStartTime: "10:00",
  lunchTime: "14:00",
  dinnerTime: "19:00",
  waterTargetMl: 3250,
  morningWaterTargetMl: 700,
  breakfastSkipped: true,
  coffeePreference: "milk",
  medications: [{
    id: "mounjaro",
    name: "Mounjaro",
    active: true,
    dose: null,
    prescribed: true,
    timing: "weekly",
    weekdays: [3],
    instructionsConfirmedByUser: true,
  }],
  supplements: [
    { id: "electrolytes", name: "Electrolytes", active: true, dose: "1 порция", timing: "after_wake", group: "hydration", confirmedByUser: true },
    { id: "mct-oil", name: "MCT Oil", active: true, dose: "1 ст. ложка", timing: "morning_focus", group: "focus", confirmedByUser: true },
    { id: "alpha-gpc", name: "Alpha GPC", active: true, dose: "300 mg", timing: "morning_focus", group: "focus", confirmedByUser: true },
    { id: "l-tyrosine", name: "L-Tyrosine", active: true, dose: "500 mg", timing: "morning_focus", group: "focus", instructions: "5 дней ON / 2 OFF", confirmedByUser: true },
    { id: "berberine-first-meal", name: "Berberine", active: true, dose: "500 mg", timing: "pre_first_meal", group: "metabolic", instructions: "за 15–20 минут до первого приема пищи", confirmedByUser: true },
    { id: "vitamin-d3", name: "Vitamin D3", active: true, dose: "5000 IU", timing: "after_first_meal", group: "vitamins", confirmedByUser: true },
    { id: "omega-3-first-meal", name: "Omega-3", active: true, dose: "2 капсулы", timing: "after_first_meal", group: "cellular", confirmedByUser: true },
    { id: "nac-first-meal", name: "NAC", active: true, dose: "600 mg", timing: "after_first_meal", group: "cellular", confirmedByUser: true },
    { id: "b-complex", name: "B-Complex (NOW Co-Enzyme)", active: true, dose: null, timing: "after_first_meal", group: "vitamins", confirmedByUser: true },
    { id: "coq10", name: "CoQ10", active: true, dose: "200 mg", timing: "after_first_meal", group: "cellular", confirmedByUser: true },
    { id: "selenium", name: "Selenium (NOW)", active: true, dose: "100 mcg", timing: "after_first_meal", group: "vitamins", confirmedByUser: true },
    { id: "phosphatidyl-choline", name: "Phosphatidyl Choline (PC)", active: true, dose: "420 mg", timing: "after_first_meal", group: "cellular", confirmedByUser: true },
    { id: "alcar", name: "L-Carnitine / ALCAR", active: true, dose: "1000 mg", timing: "after_first_meal", group: "performance", confirmedByUser: true },
    { id: "creatine", name: "Creatine", active: true, dose: "5 g", timing: "after_first_meal", group: "performance", confirmedByUser: true },
    { id: "collagen", name: "Collagen Peptides", active: true, dose: "10 g", timing: "after_first_meal", group: "performance", confirmedByUser: true },
    { id: "vitamin-c", name: "Vitamin C", active: true, dose: "250–500 mg", timing: "after_first_meal", group: "vitamins", confirmedByUser: true },
    { id: "probiotic", name: "Probiotic", active: true, dose: "1 капсула", timing: "after_first_meal", group: "digestion", confirmedByUser: true },
    { id: "omega-3-daytime", name: "Omega-3", active: true, dose: "2 капсулы", timing: "daytime", confirmedByUser: true },
    { id: "nac-daytime", name: "NAC", active: true, dose: "600 mg", timing: "daytime", instructions: "до 17:00", confirmedByUser: true },
    { id: "heptral", name: "Heptral", active: true, dose: "400 mg", timing: "course_daytime", instructions: "только если идет курс; натощак", conditional: true, confirmedByUser: true },
    { id: "berberine-dinner", name: "Berberine", active: true, dose: "500 mg", timing: "pre_dinner", instructions: "за 15–20 минут до ужина, если есть углеводы", conditional: true, confirmedByUser: true },
    { id: "magnesium-glycinate", name: "Magnesium Glycinate", active: true, dose: "300–400 mg", timing: "pre_sleep", instructions: "за 1–2 часа до сна", confirmedByUser: true },
    { id: "zinc", name: "Zinc", active: true, dose: "15–25 mg", timing: "pre_sleep", instructions: "курс 6–8 недель", confirmedByUser: true },
    { id: "l-theanine", name: "L-Theanine", active: true, dose: "200 mg", timing: "pre_sleep", confirmedByUser: true },
    { id: "vitamin-e", name: "Vitamin E (Blackmores Bio E 250)", active: true, dose: null, timing: "course", conditional: true, confirmedByUser: true },
    { id: "curcumin", name: "Curcumin", active: true, dose: null, timing: "course", conditional: true, confirmedByUser: true },
  ],
  protein: { enabled: true, defaultServing: "25–30 г", rule: "conditional" },
});

export function migrateHealthProfile(raw, settings = {}) {
  const base = defaultHealthProfile();
  const value = raw || {};
  const existingMedications = Array.isArray(value.medications) ? value.medications : [];
  const existingMounjaro = existingMedications.find((item) => item.id === "mounjaro");
  const medications = [
    { ...base.medications[0], ...(existingMounjaro || {}), active: true, weekdays: [3], dose: existingMounjaro?.dose ?? null },
    ...existingMedications
      .filter((item) => item.id !== "mounjaro")
      .map((item) => item.id === "rybelsus" ? { ...item, active: false, legacy: true } : item),
  ];
  const existingSupplements = Array.isArray(value.supplements) ? value.supplements : [];
  const isCurrentSchema = Number(value.schemaVersion || 0) >= 2;
  const supplements = base.supplements.map((item) => {
    const existing = existingSupplements.find((entry) => entry.id === item.id);
    return isCurrentSchema && existing ? { ...item, ...existing } : { ...(existing || {}), ...item };
  });
  const retainedLegacySupplements = existingSupplements
    .filter((item) => !supplements.some((entry) => entry.id === item.id))
    .map((item) => ({ ...item, active: isCurrentSchema ? item.active : false, legacy: !isCurrentSchema }));
  return {
    ...base,
    ...value,
    schemaVersion: 2,
    wakeTime: value.wakeTime || settings.morningTime || base.wakeTime,
    breakfastSkipped: true,
    medications,
    supplements: [...supplements, ...retainedLegacySupplements],
    protein: { ...base.protein, ...(value.protein || {}) },
  };
}

export const defaultTrainingPlan = () => ({
  schemaVersion: 1,
  template: "3_strength_2_aerobic",
  days: {
    monday: { type: "strength", focus: "shoulders_arms", duration: 60 },
    tuesday: { type: "swim", focus: "zone2_technique", duration: 40, coldOptional: true },
    wednesday: { type: "strength", focus: "chest_back", duration: 60 },
    thursday: { type: "recovery", focus: "walk_mobility", duration: 35, coldOptional: true },
    friday: { type: "strength", focus: "legs_core", duration: 60 },
    saturday: { type: "swim", focus: "zone2", duration: 40, coldOptional: true },
    sunday: { type: "rest", focus: "family_reset", duration: 0 },
  },
  userOverrides: {},
  history: [],
  safetyProfile: {
    clinicianCleared: null,
    painFlags: [],
    coldExposureAcknowledged: false,
  },
});

export function migrateTrainingPlan(raw) {
  const base = defaultTrainingPlan();
  const value = raw || {};
  return {
    ...base,
    ...value,
    days: { ...base.days, ...(value.days || {}) },
    userOverrides: { ...base.userOverrides, ...(value.userOverrides || {}) },
    history: Array.isArray(value.history) ? value.history : [],
    safetyProfile: { ...base.safetyProfile, ...(value.safetyProfile || {}) },
  };
}

export const emptyDailyProtocol = () => ({
  schemaVersion: 1,
  compass: {
    stateBand: "",
    affirmationId: 0,
    affirmationPinned: false,
    motivationId: 0,
    astroAdvice: "",
    noToday: "",
  },
  morning: {
    medicationEvents: [],
    medicationStatus: "pending",
    medicationTakenAt: null,
    medicationGateEndsAt: null,
    medicationTimerCompleted: false,
    light: false,
    breathwork: false,
    rinse: false,
    waterMl: 0,
    postGateWater: false,
    coffee: "pending",
    breakfastTags: [],
    supplementEvents: [],
    proteinDecision: "",
    proteinPlan: "",
  },
  training: {
    plannedSessionId: null,
    recommendationReason: "",
    readiness: "",
    painFlag: false,
    status: "planned",
    coldExposure: "not_recommended",
    swapDay: null,
  },
  work: {
    primaryOutcomeId: null,
    priorityActionIds: [],
    chairmanActionIds: [],
    deepWorkMinutes: 0,
    deepWorkStatus: "idle",
    deepWorkStartedAt: null,
    deepWorkEndsAt: null,
    meetingPrepIds: [],
    meetingPrep: null,
    developmentPromptId: null,
    artifact: "",
  },
  evening: {
    outcomeStatus: null,
    missReason: null,
    resolution: null,
    mainWin: null,
    delegateOrStop: null,
    delegateNote: "",
    dealRegisterUpdated: false,
    recoveryRegisterUpdated: false,
    materialsClosed: false,
    familyPresence: false,
    noAlcohol: false,
    eveningWalk: false,
    sleepReady: false,
    tomorrowFirstAction: null,
    shutdown: false,
  },
  legacy: {
    healthNote: "",
    trainingTags: [],
  },
});

export const emptyDay = () => ({
  schemaVersion: 3,
  primaryOutcome: emptyPrimaryOutcome(),
  dailyProtocol: emptyDailyProtocol(),
  chairmanOnly: false,      // «требуется лично моё участие»
  stateCat: "",             // Низкая / Нормально / Сильное / Перегружен
  dayStarted: false,
  refusalChips: [],
  outcomeStatus: "",        // done | progress | blocked | partial | no
  missReasonChoice: "",
  missAction: "",
  healthActs: [],           // Тренировка / Ходьба / Добавки / Восстановление
  artifactType: "",
  // наследие v1/v2 (миграция при загрузке)
  aff: AFFIRMATIONS.map(() => false),
  decl: false,
  architectQ: "",
  state: 5,
  proof: "",
  proofDone: false,
  proofMiss: "",
  onlyDaler: "",
  refusal: "",
  body: "",
  family: "",
  blocks: { office: false, health: false, architect: false, evening: false },
  architectResult: "",
  astro: "",
  wins: ["", "", ""],
  value: "",
  noise: "",
  tomorrow: "",
  shutdown: false,
  habits: {
    noSmoke: false,
    noAlcohol: false,
    logic: false,
    biceps: false,
    chest: false,
    comfortExit: "",
    social: "",
    hobby: "",
  },
});

// Миграция старой записи к v3
export function migrateDay(v) {
  const base = emptyDay();
  const value = v || {};
  const protocol = value.dailyProtocol || {};
  const morning = { ...base.dailyProtocol.morning, ...(protocol.morning || {}) };
  const training = { ...base.dailyProtocol.training, ...(protocol.training || {}) };
  const work = { ...base.dailyProtocol.work, ...(protocol.work || {}) };
  const evening = { ...base.dailyProtocol.evening, ...(protocol.evening || {}) };
  const legacy = { ...base.dailyProtocol.legacy, ...(protocol.legacy || {}) };
  const compass = { ...base.dailyProtocol.compass, ...(protocol.compass || {}) };
  const primaryOutcome = normalizePrimaryOutcome(value.primaryOutcome, value);

  if (!compass.stateBand && value.stateCat) compass.stateBand = value.stateCat;
  if (value.blocks?.health && !morning.postGateWater) morning.legacyCompleted = true;
  if (value.habits?.noAlcohol && !evening.noAlcohol) evening.noAlcohol = true;
  if (value.shutdown && !evening.shutdown) evening.shutdown = true;
  if (!evening.outcomeStatus && value.outcomeStatus) evening.outcomeStatus = value.outcomeStatus;
  if (!evening.missReason && value.missReasonChoice) evening.missReason = value.missReasonChoice;
  if (!evening.resolution && value.missAction) evening.resolution = value.missAction;
  if (!evening.mainWin && value.wins?.[0]) evening.mainWin = value.wins[0];
  if (!work.artifact && value.architectResult) work.artifact = value.architectResult;
  if (!legacy.healthNote && value.body) legacy.healthNote = value.body;
  if (!legacy.trainingTags.length) {
    legacy.trainingTags = [value.habits?.biceps && "biceps", value.habits?.chest && "chest"].filter(Boolean);
  }

  return {
    ...base,
    ...value,
    schemaVersion: 3,
    aff: AFFIRMATIONS.map((_, index) => Boolean(value.aff?.[index])),
    primaryOutcome,
    chairmanOnly: primaryOutcome.chairmanOnly,
    outcomeStatus: value.outcomeStatus || primaryOutcome.status,
    blocks: { ...base.blocks, ...(value.blocks || {}) },
    habits: { ...base.habits, ...(value.habits || {}) },
    dailyProtocol: {
      ...base.dailyProtocol,
      ...protocol,
      compass,
      morning,
      training,
      work,
      evening,
      legacy,
    },
    artifactType: value.artifactType || (value.architectResult ? "Другое" : ""),
  };
}

export const STATE_OPTIONS = ["Низкая энергия", "Собран", "Сильное состояние", "Перегружен"];
export const REFUSAL_OPTIONS = ["Не начинать новое", "Не в операционку", "Без сообщений до фокуса", "Без встреч без цели", "Без эмоциональных конфликтов"];
export const MISS_REASONS = ["Жду другого человека", "Изменился приоритет", "Недооценил объём", "Избегал действия", "Не хватило времени", "Кризис / перебой", "Другое"];
export const MISS_ACTIONS = ["Перенести", "Делегировать", "Эскалировать", "Изменить подход", "Отказаться"];
export const ARTIFACT_TYPES = ["Решение", "Memo", "Список", "Делегировано", "Проект остановлен", "Другое"];
export const HEALTH_ACTS = ["Тренировка", "Ходьба", "Добавки", "Восстановление"];

export const MOTIVATIONS = [
  "Не выиграть разговор — получить решение.",
  "Первый тяжёлый звонок раньше лёгких сообщений.",
  "Встреча без ответственного, даты и следующего шага не считается движением.",
  "Сегодня не создавай новую историю — закрой старое обязательство.",
  "Скорость после решения важнее эмоциональной спешки до решения.",
];

export const IDENTITY_LINES = [
  "Я строю капитал, а не занятость.",
  "Я говорю спокойно, думаю глубоко, действую быстро.",
  "Сегодня я создаю доказательство: подписано, оплачено, запущено или возвращено.",
  "Я богат, я здоров и я счастлив.",
  "Мирное изобилие — моё наследие. Порядок установлен во мне.",
  "Я — дисциплинированный создатель ценности и распределитель капитала.",
];

export const HOBBIES = ["Overlanding", "Golf range", "Padel"];

// Стадии сделки: формула Master OS
export const STAGES = ["Idea", "Qualified", "Introduced", "Meeting", "Proposal", "Negotiation", "Signed", "Paid", "Live", "Recurring"];
export const MACRO_STAGES = ["Контакт", "Переговоры", "Подписание", "Оплата", "Запуск", "Повторяемая"];
export const macroStageIndex = (stage = 0) => stage <= 3 ? 0 : stage <= 5 ? 1 : stage === 6 ? 2 : stage === 7 ? 3 : stage === 8 ? 4 : 5;

export const emptyDeal = () => ({
  id: "",
  name: "",
  company: "",
  contact: "",
  amount: "",
  stage: 0,
  nextStep: "",
  nextDate: "",
  blocker: "",
  owner: "",
  project: "",
  priorityType: "revenue",
  chairmanOnly: false,
  movementCount: 0,
  updated: "",
});

export const emptyWeekReview = () => ({
  facts: "",
  gap: "",
  bottleneck: "",
  subtraction: "",
  nextWeek: "",
  done: false,
});

export const DEFAULT_SETTINGS = {
  notifyMorning: true,
  morningTime: "07:30",
  notifyArchitect: false,
  architectTime: "15:00",
  notifyShutdown: true,
  shutdownTime: "21:30",
  morningMode: "quick",
};
