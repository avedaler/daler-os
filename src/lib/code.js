export const CODE_CATEGORIES = ["Calm", "Focus", "Execution", "Wealth", "Leadership", "Health", "Time"];

const law = (id, category, ru, en, practice) => ({ id, category, ru, en, practice, active: true, favorite: false });

export const CODE_LAWS = [
  law("calm", "Calm", "Спокойствие — моё конкурентное преимущество.", "Calm is my competitive advantage.", "Пауза перед ответом под давлением."),
  law("causes", "Execution", "Я не охочусь за следствием. Я создаю причины.", "I do not chase outcomes. I create causes.", "Создай одно действие, которое повышает вероятность результата."),
  law("compound", "Time", "Каждый правильно прожитый день становится инвестицией.", "Every well-lived day becomes an investment.", "Сделай один повторяемый шаг."),
  law("attention", "Focus", "Моё внимание — мой самый дорогой актив.", "My attention is my most valuable asset.", "Закрой реактивные каналы на один фокус-блок."),
  law("responsibility", "Leadership", "Я принимаю полную ответственность. Это освобождает меня.", "I take full responsibility. It sets me free.", "Назови факт, решение и следующий шаг."),
  law("wealth", "Wealth", "Я ежедневно увеличиваю способность создавать ценность.", "Every day I increase my capacity to create value.", "Создай измеримое экономическое доказательство."),
  law("influence", "Leadership", "Мой пример говорит громче моих слов.", "My example speaks louder than my words.", "Сначала покажи стандарт собственным поведением."),
  law("execution", "Execution", "Я превращаю идеи в системы, а системы — в ценность.", "I turn ideas into systems and systems into value.", "Закрой старое обязательство до запуска нового."),
  law("time", "Time", "Сегодня — единственный день, который я действительно могу использовать.", "Today is the only day I can truly use.", "Выбери одно действие, которое оправдает этот день."),
  law("discipline", "Health", "Дисциплина важнее настроения.", "Discipline over mood.", "Выполни минимальную версию обещанного."),
];

export const IDENTITY_STATEMENTS = [
  { id: "calm", ru: "Я действую спокойно.", en: "I act calmly.", active: true },
  { id: "systems", ru: "Я строю системы.", en: "I build systems.", active: true },
  { id: "value", ru: "Я создаю ценность.", en: "I create value.", active: true },
  { id: "attention", ru: "Моё внимание принадлежит мне.", en: "My attention belongs to me.", active: true },
  { id: "execute", ru: "Сегодня я двигаю главный проект.", en: "Today I move the main project.", active: true },
  { id: "energy", ru: "Я — энергичный человек, который берёт максимум от дня и ценит его.", en: "I am energetic, I use the day fully, and I value it.", active: true },
];

export const CODE_TRIGGERS = [
  { id: "pressure", labelRu: "Давление", labelEn: "Pressure", responseRu: "Пауза. Факты. Решение.", responseEn: "Pause. Facts. Decision.", active: true },
  { id: "anxiety", labelRu: "Тревога", labelEn: "Anxiety", responseRu: "Спокойно. Наблюдай. Решай. Исполняй.", responseEn: "Calm. Observe. Decide. Execute.", active: true },
  { id: "distraction", labelRu: "Отвлечение", labelEn: "Distraction", responseRu: "Верни внимание к Главному ходу.", responseEn: "Return attention to the Main Move.", active: true },
  { id: "new-idea", labelRu: "Новая идея", labelEn: "New idea", responseRu: "Запиши. Не запускай. Закрой текущее.", responseEn: "Capture it. Do not launch it. Close the current commitment.", active: true },
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
    settings: { ...base.settings, ...(value.settings || {}) },
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

export function displayCodeText(item, mode) {
  if (!item) return "";
  if (mode === "ru") return item.ru || item.labelRu || item.responseRu || "";
  if (mode === "en") return item.en || item.labelEn || item.responseEn || "";
  const ru = item.ru || item.labelRu || item.responseRu || "";
  const en = item.en || item.labelEn || item.responseEn || "";
  return [ru, en].filter(Boolean).join(" / ");
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
