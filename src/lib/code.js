export const CODE_CATEGORIES = ["Calm", "Focus", "Execution", "Wealth", "Leadership", "Health", "Time"];

const law = (id, category, ru, practice) => ({ id, category, ru, practice, active: true, favorite: false });

export const CODE_LAWS = [
  law("calm", "Calm", "Спокойствие — моё конкурентное преимущество.", "Пауза перед ответом под давлением."),
  law("causes", "Execution", "Я не охочусь за следствием. Я создаю причины.", "Создай одно действие, которое повышает вероятность результата."),
  law("compound", "Time", "Каждый правильно прожитый день становится инвестицией.", "Сделай один повторяемый шаг."),
  law("attention", "Focus", "Моё внимание — мой самый дорогой актив.", "Закрой реактивные каналы на один фокус-блок."),
  law("responsibility", "Leadership", "Я принимаю полную ответственность. Это освобождает меня.", "Назови факт, решение и следующий шаг."),
  law("wealth", "Wealth", "Я ежедневно увеличиваю способность создавать ценность.", "Создай измеримое экономическое доказательство."),
  law("influence", "Leadership", "Мой пример говорит громче моих слов.", "Сначала покажи стандарт собственным поведением."),
  law("execution", "Execution", "Я превращаю идеи в системы, а системы — в ценность.", "Закрой старое обязательство до запуска нового."),
  law("time", "Time", "Сегодня — единственный день, который я действительно могу использовать.", "Выбери одно действие, которое оправдает этот день."),
  law("discipline", "Health", "Дисциплина важнее настроения.", "Выполни минимальную версию обещанного."),
];

export const IDENTITY_STATEMENTS = [
  { id: "calm", ru: "Я действую спокойно.", active: true },
  { id: "systems", ru: "Я строю системы.", active: true },
  { id: "value", ru: "Я создаю ценность.", active: true },
  { id: "attention", ru: "Моё внимание принадлежит мне.", active: true },
  { id: "execute", ru: "Сегодня я двигаю главный проект.", active: true },
  { id: "energy", ru: "Я — энергичный человек, который берёт максимум от дня и ценит его.", active: true },
];

export const CODE_TRIGGERS = [
  { id: "pressure", labelRu: "Давление", responseRu: "Пауза. Факты. Решение.", active: true },
  { id: "anxiety", labelRu: "Тревога", responseRu: "Спокойно. Наблюдай. Решай. Исполняй.", active: true },
  { id: "distraction", labelRu: "Отвлечение", responseRu: "Верни внимание к Главному ходу.", active: true },
  { id: "new-idea", labelRu: "Новая идея", responseRu: "Запиши. Не запускай. Закрой текущее.", active: true },
];

export function defaultCodeState() {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    onboardingComplete: false,
    settings: {
      languageMode: "ru",
      duration: 3,
      statementCount: 3,
      tone: "firm",
      spiritualLanguage: false,
      automaticWeeklyLaw: true,
      activeCategories: [...CODE_CATEGORIES],
    },
    profile: {
      traits: ["Спокойный", "Дисциплинированный", "Решительный", "Стратегический", "Сфокусированный", "Последовательный"],
    },
    laws: CODE_LAWS,
    identityStatements: IDENTITY_STATEMENTS,
    triggers: CODE_TRIGGERS,
    activeLawId: "calm",
    activeLawSince: now.slice(0, 10),
    sessions: {},
    weeklyReviews: [],
    constitution: {
      current: "Реальность не меняется от одних слов.\nМеняется человек.\nДругие решения создают другую жизнь.",
      versions: [{ id: "v1", createdAt: now, text: "Реальность не меняется от одних слов.\nМеняется человек.\nДругие решения создают другую жизнь." }],
    },
  };
}

export function migrateCodeState(raw) {
  const base = defaultCodeState();
  const value = raw || {};
  const mergeById = (seed, saved) => {
    const savedMap = new Map((Array.isArray(saved) ? saved : []).map((item) => [item.id, item]));
    const seeded = seed.map((item) => ({ ...item, ...(savedMap.get(item.id) || {}) }));
    const seedIds = new Set(seed.map((item) => item.id));
    return [...seeded, ...(Array.isArray(saved) ? saved.filter((item) => !seedIds.has(item.id)) : [])];
  };
  const migrated = {
    ...base,
    ...value,
    schemaVersion: 1,
    settings: { ...base.settings, ...(value.settings || {}), languageMode: "ru" },
    profile: { ...base.profile, ...(value.profile || {}) },
    laws: mergeById(base.laws, value.laws),
    identityStatements: mergeById(base.identityStatements, value.identityStatements),
    triggers: mergeById(base.triggers, value.triggers),
    sessions: value.sessions && typeof value.sessions === "object" ? value.sessions : {},
    weeklyReviews: Array.isArray(value.weeklyReviews) ? value.weeklyReviews : [],
    constitution: {
      ...base.constitution,
      ...(value.constitution || {}),
      versions: Array.isArray(value.constitution?.versions) && value.constitution.versions.length
        ? value.constitution.versions
        : base.constitution.versions,
    },
  };
  if (migrated.settings.automaticWeeklyLaw && migrated.activeLawSince) {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const weeks = Math.floor((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${migrated.activeLawSince}T00:00:00Z`)) / 604800000);
    const activeLaws = migrated.laws.filter((item) => item.active);
    const currentIndex = activeLaws.findIndex((item) => item.id === migrated.activeLawId);
    if (weeks > 0 && activeLaws.length > 0) migrated.activeLawId = activeLaws[(Math.max(0, currentIndex) + weeks) % activeLaws.length].id;
  }
  return migrated;
}

export function codeSession(state, date) {
  return {
    date,
    energyScore: 3,
    focusScore: 3,
    calmScore: 3,
    confidenceScore: 3,
    disciplineScore: 3,
    emotionalPressureScore: 1,
    activeLawId: state.activeLawId,
    identityStatementIds: state.identityStatements.filter((item) => item.active).slice(0, state.settings.statementCount).map((item) => item.id),
    mainMoveText: "",
    linkedTaskId: "",
    expectedTriggerId: "pressure",
    chosenResponse: "",
    morningCompletedAt: null,
    mainMoveCompletedAt: null,
    eveningCompletedAt: null,
    behavioralProof: "",
    dayLesson: "",
    tomorrowAdjustment: "",
    ...(state.sessions[date] || {}),
  };
}

export function displayCodeText(item) {
  if (!item) return "";
  return item.ru || item.labelRu || item.responseRu || "";
}

export function codeEventsForDate(state, date) {
  const session = state.sessions?.[date];
  if (!session) return [];
  const events = [];
  if (session.morningCompletedAt) events.push({ id: "code-morning", label: "Утренний Кодекс", category: "Код", tone: "gold", detail: "Протокол завершён" });
  if (session.mainMoveCompletedAt) events.push({ id: "code-main-move", label: "Главный ход выполнен", category: "Код", tone: "green", detail: session.mainMoveText || "" });
  if (session.eveningCompletedAt) events.push({ id: "code-evening", label: "Вечерний разбор Кодекса", category: "Код", tone: "gold", detail: session.behavioralProof || "" });
  return events;
}
