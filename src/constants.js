export const AFFIRMATIONS = [
  "Мои финансовые доходы сейчас увеличиваются",
  "Я богат, я здоров и я счастлив",
  "Мирное изобилие — моё наследие. Порядок установлен во мне",
  "Я — энергичный человек. Моя энергия создаёт движение, ценность и результат",
  "Я беру максимум от этого дня и ценю каждый его момент",
];

export const DECLARATION = `Я — дисциплинированный создатель ценности, распределитель капитала и closer. Я запускаю только то, что способно стать подписанным, оплаченным, запущенным и повторяемым. Я защищаю своё тело, семью, репутацию, внимание и свободу.

Я не создаю новые истории, когда должен закрывать старые обязательства. Я не путаю внимание с прогрессом, встречи — со сделками, claims — с деньгами, а намерения — с дисциплиной. Каждый день я создаю одно экономическое доказательство, укрепляю тело и присутствую в отношениях. Каждую неделю я измеряю факты, закрываю лишнее и снова выбираю главное.`;

export const C = {
  bg: "var(--bg)",
  panel: "var(--surface)",
  panel2: "var(--surface-quiet)",
  line: "var(--border)",
  ivory: "var(--text)",
  muted: "var(--muted)",
  gold: "var(--gold)",
  goldDim: "var(--gold-dim)",
  green: "var(--green)",
  red: "var(--red)",
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
  schemaVersion: 2,
  template: "4_day_strength_growth",
  program: {
    name: "Рост мышц и сила",
    durationWeeks: 12,
    strengthDays: 4,
    principles: ["Прогрессивная нагрузка", "Чистая техника", "Регулярность"],
    guidance: {
      sets: "3–4 рабочих",
      reps: "6–12 в среднем",
      baseRest: "90–120 сек",
      isolationRest: "45–75 сек",
      cardio: "10–15 мин после силовой или 30–45 мин отдельно",
      warmup: "5–10 минут",
      reserve: "1–2 повтора в запасе (RIR)",
      sleep: "7–8 часов",
      protein: "1.6–2.0 г на кг веса",
    },
  },
  days: {
    monday: {
      type: "strength", focus: "push", title: "PUSH", subtitle: "Грудь · плечи · трицепс", duration: 70, durationLabel: "60–75",
      warmup: "Разминка 5–10 минут", cardioAfter: "Ходьба 10–15 минут",
      exercises: [
        { id: "bench-press", name: "Жим штанги лёжа", sets: 4, reps: "6–8", restSec: 120 },
        { id: "incline-dumbbell-press", name: "Жим гантелей на наклонной скамье", sets: 3, reps: "8–10", restSec: 90 },
        { id: "seated-dumbbell-press", name: "Жим гантелей сидя", note: "плечи", sets: 3, reps: "8–10", restSec: 90 },
        { id: "lateral-raise", name: "Разведения гантелей в стороны", sets: 3, reps: "12–15", restSec: 60 },
        { id: "dips-close-grip", name: "Отжимания на брусьях или жим узким хватом", sets: 3, reps: "8–10", restSec: 90 },
        { id: "triceps-pushdown", name: "Разгибание рук на блоке", sets: 3, reps: "12–15", restSec: 60 },
      ],
    },
    tuesday: {
      type: "strength", focus: "pull", title: "PULL", subtitle: "Спина · бицепс", duration: 70, durationLabel: "60–75", allowPreviousStrength: true,
      warmup: "Разминка 5–10 минут", cardioAfter: "Прогулка 15–20 минут",
      exercises: [
        { id: "pull-up", name: "Подтягивания или тяга верхнего блока", sets: 4, reps: "8–10", restSec: 120 },
        { id: "seated-row", name: "Тяга горизонтального блока", sets: 3, reps: "8–10", restSec: 90 },
        { id: "barbell-row", name: "Тяга штанги или T-грифа", sets: 3, reps: "8–10", restSec: 90 },
        { id: "face-pull", name: "Face Pull", note: "тяга к лицу на блоке", sets: 3, reps: "12–15", restSec: 60 },
        { id: "barbell-curl", name: "Сгибания рук со штангой", sets: 3, reps: "8–10", restSec: 90 },
        { id: "hammer-curl", name: "Молотковые сгибания гантелей", sets: 3, reps: "10–12", restSec: 60 },
      ],
    },
    wednesday: {
      type: "recovery", focus: "recovery_walk_swim", title: "Восстановление", subtitle: "Ходьба · плавание · растяжка", duration: 40, coldOptional: true,
      exercises: [
        { id: "recovery-walk", name: "Ходьба", reps: "30–45 мин" },
        { id: "recovery-swim", name: "Плавание", reps: "20–30 мин" },
        { id: "recovery-stretch", name: "Растяжка", reps: "10–15 мин" },
        { id: "recovery-mobility", name: "Мобилизация суставов", reps: "мягко, без боли" },
      ],
    },
    thursday: {
      type: "strength", focus: "legs", title: "НОГИ", subtitle: "Ноги · ягодицы · пресс", duration: 70, durationLabel: "60–75",
      warmup: "Разминка 5–10 минут", cardioAfter: "Ходьба 10–15 минут",
      exercises: [
        { id: "barbell-squat", name: "Приседания со штангой", sets: 4, reps: "6–8", restSec: 120 },
        { id: "romanian-deadlift", name: "Румынская тяга", sets: 3, reps: "8–10", restSec: 90 },
        { id: "leg-press", name: "Жим ногами", sets: 3, reps: "10–12", restSec: 90 },
        { id: "leg-curl", name: "Сгибание ног лёжа", sets: 3, reps: "10–12", restSec: 60 },
        { id: "calf-raise", name: "Подъёмы на носки стоя или в тренажёре", sets: 4, reps: "12–15", restSec: 60 },
        { id: "plank", name: "Планка", sets: 3, reps: "45–60 сек", restSec: 60 },
      ],
    },
    friday: {
      type: "strength", focus: "upper_shape", title: "ВЕРХ ТЕЛА", subtitle: "Акцент на форму", duration: 70, durationLabel: "60–75", allowPreviousStrength: true,
      warmup: "Разминка 5–10 минут", cardioAfter: "Ходьба 10–15 минут",
      exercises: [
        { id: "upper-pull-up", name: "Подтягивания или тяга верхнего блока", sets: 3, reps: "максимум (или 8–10)", restSec: 90 },
        { id: "upper-incline-press", name: "Жим гантелей на наклонной скамье", sets: 3, reps: "8–10", restSec: 90 },
        { id: "upper-lat-pulldown", name: "Тяга к груди в вертикальном блоке", sets: 3, reps: "10", restSec: 90 },
        { id: "upper-lateral-raise", name: "Разведения гантелей в стороны", sets: 4, reps: "12–15", restSec: 60 },
        { id: "rear-delt", name: "Разведения на заднюю дельту", note: "блок или тренажёр", sets: 3, reps: "12–15", restSec: 60 },
        { id: "upper-curl", name: "Сгибания рук", sets: 3, reps: "10–12", restSec: 60 },
        { id: "french-press", name: "Французский жим или разгибание на блоке", sets: 3, reps: "10–12", restSec: 60 },
      ],
    },
    saturday: {
      type: "recovery", focus: "active_recovery", title: "Активное восстановление", subtitle: "Ходьба или плавание · растяжка", duration: 50, coldOptional: true,
      exercises: [
        { id: "active-walk-swim", name: "Ходьба или плавание", reps: "45–60 мин" },
        { id: "active-stretch", name: "Растяжка", reps: "10–15 мин" },
      ],
    },
    sunday: {
      type: "rest", focus: "rest", title: "Отдых", subtitle: "Полный отдых или спокойная прогулка", duration: 0,
      exercises: [{ id: "full-rest", name: "Полный отдых", reps: "спокойная прогулка по желанию" }],
    },
  },
  legacyDays: {},
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
  const isCurrentSchema = Number(value.schemaVersion || 0) >= 2;
  const days = Object.fromEntries(Object.entries(base.days).map(([dayKey, baseDay]) => {
    if (!isCurrentSchema) return [dayKey, baseDay];
    const existing = value.days?.[dayKey] || {};
    return [dayKey, {
      ...baseDay,
      ...existing,
      exercises: Array.isArray(existing.exercises) ? existing.exercises : baseDay.exercises,
    }];
  }));
  return {
    ...base,
    ...value,
    schemaVersion: 2,
    template: isCurrentSchema ? (value.template || base.template) : base.template,
    program: {
      ...base.program,
      ...(isCurrentSchema ? (value.program || {}) : {}),
      guidance: {
        ...base.program.guidance,
        ...(isCurrentSchema ? (value.program?.guidance || {}) : {}),
      },
    },
    days,
    legacyDays: isCurrentSchema
      ? { ...base.legacyDays, ...(value.legacyDays || {}) }
      : { ...(value.legacyDays || {}), ...(value.days || {}) },
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
    completedExerciseIds: [],
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
  theme: "dark",
  notifyMorning: true,
  morningTime: "07:30",
  notifyArchitect: false,
  architectTime: "15:00",
  notifyShutdown: true,
  shutdownTime: "21:30",
  morningMode: "quick",
};
