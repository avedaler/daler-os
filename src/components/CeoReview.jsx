import { useCallback, useEffect, useRef, useState } from "react";
import { emptyWeekReview, migrateDay } from "../constants";
import { addDays, isoWeek, weekday } from "../lib/date";
import { dayScore, weekVerdict } from "../lib/score";
import { listDays, loadDay, loadWeek, saveWeek } from "../lib/store";
import { Btn, ChoiceChips, Field, Section, StatusBadge } from "./atoms";

const QUESTIONS = [
  { key: "facts", title: "Какие факты созданы?", label: "Подписано, оплачено, запущено", placeholder: "Только цифры и изменённая реальность" },
  { key: "gap", title: "Где разрыв между историей и реальностью?", label: "Разрыв", placeholder: "Что говорит narrative и что показывают факты" },
  { key: "bottleneck", title: "Одно узкое место", label: "Главный bottleneck", placeholder: "Что сильнее всего тормозит результат" },
  { key: "subtraction", title: "Что убрать?", label: "Вычитание", placeholder: "Проект, встреча или обязательство" },
  { key: "nextWeek", title: "Одно главное на следующую неделю", label: "North Star", placeholder: "Один приоритет и одно доказательство" },
];

export default function CeoReview({ date }) {
  const week = isoWeek(date);
  const [review, setReview] = useState(emptyWeekReview());
  const [step, setStep] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState({ n: 0, avg: 0 });
  const timer = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await loadWeek(week);
      const monday = addDays(date, -((weekday(date) + 6) % 7));
      const existing = new Set(await listDays());
      const scores = [];
      for (let index = 0; index < 7; index += 1) {
        const day = addDays(monday, index);
        if (!existing.has(day)) continue;
        const data = await loadDay(day);
        if (data) scores.push(dayScore(migrateDay(data)).pts);
      }
      if (!active) return;
      setReview({ ...emptyWeekReview(), ...(saved || {}) });
      setStats({ n: scores.length, avg: scores.length ? Math.round((scores.reduce((sum, value) => sum + value, 0) / scores.length) * 10) / 10 : 0 });
      setLoaded(true);
    })();
    return () => { active = false; };
  }, [week, date]);

  const update = useCallback((patch) => setReview((previous) => {
    const next = { ...previous, ...patch };
    clearTimeout(timer.current);
    timer.current = setTimeout(() => saveWeek(week, next), 400);
    return next;
  }), [week]);

  if (!loaded) return null;
  const verdict = stats.n ? weekVerdict(stats.avg) : null;
  const question = QUESTIONS[step];

  return <div className="ceo-review">
    <div className="review-score-strip"><div><span>Средний баланс</span><strong>{stats.n ? stats.avg : "—"}<small>/10</small></strong></div><div><span>Дней заполнено</span><strong>{stats.n}<small>/7</small></strong></div>{verdict && <StatusBadge tone={verdict.color === "red" ? "red" : verdict.color === "green" ? "green" : "gold"}>{verdict.text}</StatusBadge>}</div>
    {step < QUESTIONS.length ? <Section kicker={`Вопрос ${step + 1} из ${QUESTIONS.length}`} title={question.title}>
      {question.key === "bottleneck" && <ChoiceChips options={["Капитал", "Продажи", "Продукт", "Команда", "Legal", "Государство / партнёр", "Личное внимание"]} value={review.bottleneckCategory || ""} onChange={(bottleneckCategory) => update({ bottleneckCategory })} />}
      {question.key === "subtraction" && <ChoiceChips options={["Остановить проект", "Отменить встречу", "Делегировать", "Убрать обязательство", "Отложить"]} value={review.subtractionCategory || ""} onChange={(subtractionCategory) => update({ subtractionCategory })} />}
      <div className="review-field"><Field label={question.label} value={review[question.key]} onChange={(value) => update({ [question.key]: value })} placeholder={question.placeholder} rows={3} /></div>
      <div className="step-actions"><Btn disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>Назад</Btn><Btn primary onClick={() => setStep((value) => value + 1)}>Далее</Btn></div>
    </Section> : <Section kicker="Итог" title="CEO-review готов к публикации">
      <div className="review-summary">{QUESTIONS.map((item, index) => <div key={item.key}><span>{index + 1}. {item.title}</span><p>{review[item.key] || "—"}</p></div>)}</div>
      <p className="quiet-copy">North Star следующей недели станет подсказкой в Компасе дня. Bottleneck и subtraction сохраняются в обзоре как риск и действие.</p>
      <div className="step-actions"><Btn onClick={() => setStep(QUESTIONS.length - 1)}>Назад</Btn><Btn primary onClick={() => update({ done: true, completedAt: new Date().toISOString() })}>{review.done ? "Опубликовано ✓" : "Опубликовать North Star"}</Btn></div>
    </Section>}
  </div>;
}
