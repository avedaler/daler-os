export const AFFIRMATIONS = [
  "Мои финансовые доходы сейчас увеличиваются",
  "Я богат, я здоров и я счастлив",
  "Мирное изобилие — моё наследие. Порядок установлен во мне",
];

export const DECLARATION = `Я — дисциплинированный создатель ценности, распределитель капитала и closer. Я запускаю только то, что способно стать подписанным, оплаченным, запущенным и повторяемым. Я защищаю своё тело, семью, репутацию, внимание и свободу.

Я не создаю новые истории, когда должен закрывать старые обязательства. Я не путаю внимание с прогрессом, встречи — со сделками, claims — с деньгами, а намерения — с дисциплиной. Каждый день я создаю одно экономическое доказательство, укрепляю тело и присутствую в отношениях. Каждую неделю я измеряю факты, закрываю лишнее и снова выбираю главное.`;

export const C = {
  bg: "#0C0F14",
  panel: "#141922",
  panel2: "#10151D",
  line: "#232B38",
  ivory: "#E9E4D8",
  muted: "#8C93A3",
  gold: "#C8A45C",
  goldDim: "#8A7440",
  green: "#6FAF87",
  red: "#B86A6A",
};

export const FONT = {
  serif: "'Playfair Display', serif",
  sans: "'Manrope', sans-serif",
  mono: "'JetBrains Mono', monospace",
};

// Дата рождения для нумерологии: 3 апреля
export const BIRTH = { day: 3, month: 4 };

export const emptyDay = () => ({
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
