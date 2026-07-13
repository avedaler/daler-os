export const AFFIRMATIONS = [
  "Мои финансовые доходы сейчас увеличиваются",
  "Я богат, я здоров и я счастлив",
  "Мирное изобилие — моё наследие. Порядок установлен во мне",
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

export const emptyDay = () => ({
  // v3: одно главное поле дня
  primaryOutcome: "",
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
  aff: [false, false, false],
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
  const s = { ...emptyDay(), ...v, blocks: { ...emptyDay().blocks, ...(v?.blocks || {}) }, habits: { ...emptyDay().habits, ...(v?.habits || {}) } };
  if (!s.primaryOutcome) s.primaryOutcome = s.proof || s.architectQ || "";
  if (!s.outcomeStatus && s.proofDone) s.outcomeStatus = "done";
  if (!s.artifactType && s.architectResult) s.artifactType = "Другое";
  return s;
}

export const STATE_OPTIONS = ["Низкая энергия", "Нормально", "Сильное состояние", "Перегружен"];
export const REFUSAL_OPTIONS = ["Не начинать новое", "Не в операционку", "Без сообщений до фокуса", "Без встреч без цели", "Без эмоциональных конфликтов"];
export const MISS_REASONS = ["Жду другого человека", "Изменился приоритет", "Недооценил объём", "Избегал действия", "Не хватило времени", "Возник кризис"];
export const MISS_ACTIONS = ["Перенести", "Делегировать", "Эскалировать", "Изменить подход", "Отказаться"];
export const ARTIFACT_TYPES = ["Решение", "Memo", "Список", "Делегировано", "Проект остановлен", "Другое"];
export const HEALTH_ACTS = ["Тренировка", "Ходьба", "Добавки", "Восстановление"];

export const HOBBIES = ["Overlanding", "Golf range", "Padel"];

// Стадии сделки: формула Master OS
export const STAGES = ["Idea", "Qualified", "Introduced", "Meeting", "Proposal", "Negotiation", "Signed", "Paid", "Live", "Recurring"];

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
