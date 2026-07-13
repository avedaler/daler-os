// Астрослой: реальные положения планет через astronomy-engine (без внешних API).
// Все расчёты — геоцентрическая эклиптическая долгота на 12:00 по Куала-Лумпуру.
import { Body, GeoVector, Ecliptic, MoonPhase, Illumination } from "astronomy-engine";
import { klNoonUTC, klTimeUTC } from "./date";

export const SIGNS = ["Овен", "Телец", "Близнецы", "Рак", "Лев", "Дева", "Весы", "Скорпион", "Стрелец", "Козерог", "Водолей", "Рыбы"];
const SIGNS_LOC = ["Овне", "Тельце", "Близнецах", "Раке", "Льве", "Деве", "Весах", "Скорпионе", "Стрельце", "Козероге", "Водолее", "Рыбах"];
const SIGNS_GEN = ["Овна", "Тельца", "Близнецов", "Рака", "Льва", "Девы", "Весов", "Скорпиона", "Стрельца", "Козерога", "Водолея", "Рыб"];
const ELEMENT = ["огонь", "земля", "воздух", "вода", "огонь", "земля", "воздух", "вода", "огонь", "земля", "воздух", "вода"];

const PLANETS = [
  { body: Body.Sun, name: "Солнце" },
  { body: Body.Mercury, name: "Меркурий" },
  { body: Body.Venus, name: "Венера" },
  { body: Body.Mars, name: "Марс" },
  { body: Body.Jupiter, name: "Юпитер" },
  { body: Body.Saturn, name: "Сатурн" },
];

function lon(body, date) {
  return Ecliptic(GeoVector(body, date, true)).elon;
}

const signOf = (l) => Math.floor((((l % 360) + 360) % 360) / 30);

// Луна в знаке — деловая трактовка
const MOON_SIGN = [
  "быстрые решения и старты. Инициируй, но не ввязывайся в импульсивные конфликты.",
  "деньги, активы, материальная ценность. Хороша для договоров о цене — не торопи процесс.",
  "переговоры, письма, звонки, документы в обороте. Риск распыления — держи фокус на одном.",
  "команда, семья, тыл. Не день для жёстких переговоров; укрепляй отношения.",
  "публичность, презентации, лидерство. Выходи на сцену — но проверяй, что за блеском есть сделка.",
  "детали, аудит, документы, здоровье. Идеальна для вычитки договоров и наведения порядка.",
  "партнёрства, юристы, баланс интересов. Ищи win-win, фиксируй условия письменно.",
  "чужой капитал, инвестиции, due diligence. Смотри вглубь — день вскрывает скрытое.",
  "стратегия, экспансия, зарубежные контакты. Подними взгляд от операционки к горизонту.",
  "структура, власть, долгосрочные обязательства. Сильный день для серьёзных подписаний.",
  "сети, технологии, нестандартные ходы. Хороша для продукта и партнёрских альянсов.",
  "интуиция и образы. Слушай чутьё, но перепроверяй факты — ничего не подписывай вслепую.",
];

function phaseInfo(angle) {
  // angle: 0 = новолуние, 180 = полнолуние
  if (angle < 20 || angle >= 340) return { name: "Новолуние", note: "закладывай намерения и планы; не жди мгновенных результатов, не форсируй закрытия." };
  if (angle < 90) return { name: "Растущая Луна", note: "наращивай усилия: продажи, переговоры, расширение. Энергия работает на рост." };
  if (angle < 160) return { name: "Растущая Луна (к полнолунию)", note: "дожимай начатое до факта: подписано / оплачено / запущено." };
  if (angle < 200) return { name: "Полнолуние", note: "кульминация и пик эмоций. Фиксируй результаты; избегай импульсивных решений и конфликтов." };
  if (angle < 270) return { name: "Убывающая Луна", note: "завершай, собирай дебиторку, закрывай хвосты. Хорошо для вычитания лишнего." };
  return { name: "Убывающая Луна (к новолунию)", note: "чистка и аудит. Освобождай календарь под следующий цикл, не запускай новое." };
}

const ASPECTS = [
  { angle: 0, orb: 7, name: "соединение", hard: false },
  { angle: 60, orb: 4, name: "секстиль", hard: false },
  { angle: 90, orb: 6, name: "квадрат", hard: true },
  { angle: 120, orb: 6, name: "трин", hard: false },
  { angle: 180, orb: 7, name: "оппозиция", hard: true },
];

const ASPECT_TEXT = {
  "Солнце": { soft: "ясность целей, поддержка статуса — хорошо для публичных шагов", hard: "эго-трения с партнёрами и начальственный тон — не продавливай" },
  "Меркурий": { soft: "быстрые договорённости, удачные тексты и звонки", hard: "недопонимание и ошибки в документах — перечитай каждую цифру перед отправкой" },
  "Венера": { soft: "окно для денег, переговоров об условиях и отношений", hard: "перекос в уступки или траты — не покупай и не обещай лишнего" },
  "Марс": { soft: "энергия на прорыв — используй для тела и смелых шагов", hard: "раздражительность и спешка — риск конфликта; не отвечай сгоряча" },
  "Юпитер": { soft: "расширение, удача в сделках — день для крупных предложений", hard: "переоценка и обещание лишнего — режь план пополам" },
  "Сатурн": { soft: "дисциплина и структура — фиксируй долгосрочные обязательства", hard: "задержки и холод от контрагентов — не воспринимай «нет» как финал" },
};

function moonAspects(date) {
  const ml = lon(Body.Moon, date);
  const res = [];
  for (const p of PLANETS) {
    const pl = lon(p.body, date);
    let diff = Math.abs(ml - pl) % 360;
    if (diff > 180) diff = 360 - diff;
    for (const a of ASPECTS) {
      if (Math.abs(diff - a.angle) <= a.orb) {
        res.push({ planet: p.name, aspect: a.name, hard: a.hard, text: ASPECT_TEXT[p.name][a.hard ? "hard" : "soft"] });
        break;
      }
    }
  }
  return res;
}

function retrogrades(date) {
  const later = new Date(date.getTime() + 86400000);
  const out = [];
  for (const p of PLANETS) {
    if (p.body === Body.Sun) continue;
    let d = lon(p.body, later) - lon(p.body, date);
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    if (d < 0) out.push(p.name);
  }
  return out;
}

// Отношение Луны дня к натальному Солнцу в Овне (Далер — Овен, 3.04)
function forAries(moonSign) {
  const el = ELEMENT[moonSign];
  if (el === "огонь") return "Луна в огненном знаке — твоя стихия: действуй прямо, день поддерживает натиск Овна.";
  if (el === "воздух") return "Воздушный знак дует в твои паруса: связи, переговоры и союзники сегодня работают на тебя.";
  if (el === "земля") return "Земной знак замедляет твой темп — это не тормоз, а заземление: переведи идеи в договоры и цифры.";
  return "Водный знак требует от Овна тонкости: меньше напора, больше чутья. Слушай, что не сказано вслух.";
}

export function computeAstro(iso) {
  const noon = klNoonUTC(iso);
  const moonLon = lon(Body.Moon, noon);
  const moonSign = signOf(moonLon);
  const sunSign = signOf(lon(Body.Sun, noon));
  const phaseAngle = MoonPhase(noon);
  const illum = Math.round(Illumination(Body.Moon, noon).phase_fraction * 100);
  const phase = phaseInfo(phaseAngle);
  const aspects = moonAspects(noon);
  const retro = retrogrades(noon);

  // Смена знака Луны в течение дня (KL)
  const s0 = signOf(lon(Body.Moon, klTimeUTC(iso, 0, 0)));
  const s1 = signOf(lon(Body.Moon, klTimeUTC(iso, 23, 59)));
  const ingress = s0 !== s1 ? { from: SIGNS_GEN[s0], to: `знак ${SIGNS_GEN[s1]}` } : null;

  const windows = aspects.filter((a) => !a.hard);
  const cautions = aspects.filter((a) => a.hard);

  return { moonSign, moonSignName: SIGNS[moonSign], moonSignLoc: SIGNS_LOC[moonSign], sunSign, sunSignName: SIGNS[sunSign], phase, phaseAngle, illum, aspects, windows, cautions, retro, ingress, aries: forAries(moonSign) };
}

// Готовый текст (для экспорта в Markdown)
export function astroToText(a) {
  const L = [];
  L.push(`Луна в ${a.moonSignLoc} — ${MOON_SIGN[a.moonSign]}`);
  L.push(`${a.phase.name} (${a.illum}%) — ${a.phase.note}`);
  if (a.ingress) L.push(`В течение дня Луна переходит из ${a.ingress.from} в ${a.ingress.to}.`);
  if (a.windows.length) L.push("Окна дня: " + a.windows.map((w) => `${w.aspect} с ${w.planet} — ${w.text}`).join("; ") + ".");
  if (a.cautions.length) L.push("Осторожно: " + a.cautions.map((w) => `${w.aspect} с ${w.planet} — ${w.text}`).join("; ") + ".");
  if (a.retro.length) L.push(`Ретроградны: ${a.retro.join(", ")} — перепроверяй документы, договорённости и технику.`);
  L.push(a.aries);
  return L.join("\n");
}

export const MOON_SIGN_TEXT = MOON_SIGN;
