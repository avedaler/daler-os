import { useState, useEffect } from "react";
import { C, FONT, STAGES, AFFIRMATIONS, DECLARATION, STATE_OPTIONS, REFUSAL_OPTIONS, MISS_REASONS, MISS_ACTIONS, ARTIFACT_TYPES, HEALTH_ACTS } from "../constants";
import { Section, Field, CheckRow, ChoiceChips, Btn, Check } from "./atoms";
import ArchitectTimer from "./ArchitectTimer";
import AstroPanel from "./AstroPanel";
import { loadDay } from "../lib/store";
import { addDays } from "../lib/date";
import { migrateDay } from "../constants";

// Быстрый капитал-фильтр: action sheet вместо постоянной формы
function QuickFilter({ goDeals }) {
  const [open, setOpen] = useState(false);
  const [pick, setPick] = useState("");
  const creates = ["Капитал", "Защиту", "Стоимость бизнеса", "Репутацию"];
  if (!open) {
    return (
      <button className="suggest ghost" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>
        + Новая задача / возможность — прогнать через фильтр
      </button>
    );
  }
  return (
    <Section kicker="капитал-фильтр" title="Что она создаёт?">
      <ChoiceChips options={[...creates, "Ничего из перечисленного"]} value={pick} onChange={setPick} />
      {creates.includes(pick) && (
        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: C.green, fontSize: 13, fontFamily: FONT.mono }}>ПРОХОДИТ ФИЛЬТР</span>
          <Btn primary onClick={goDeals}>Создать сделку</Btn>
          <Btn onClick={() => { setOpen(false); setPick(""); }}>Закрыть</Btn>
        </div>
      )}
      {pick === "Ничего из перечисленного" && (
        <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: C.red, fontSize: 13, fontFamily: FONT.mono }}>НЕ ПРОХОДИТ:</span>
          <span style={{ fontSize: 14, color: C.ivory }}>делегировать · отложить · отказаться</span>
          <Btn onClick={() => { setOpen(false); setPick(""); }}>Понял</Btn>
        </div>
      )}
    </Section>
  );
}

// Фаза дня: утро (пока не нажато «Начать день»), исполнение, вечер
function defaultPhase(s, klTime) {
  if (!s.dayStarted) return "morning";
  if (klTime >= "20:00" || ["done", "partial", "no"].includes(s.outcomeStatus) && s.shutdown) return "evening";
  return "work";
}

export default function Today({ s, up, deals, today, date, time, northStar, goDeals, setDeals }) {
  const [phase, setPhase] = useState(() => defaultPhase(s, time));
  const [fullRitual, setFullRitual] = useState(false);
  const [customOutcome, setCustomOutcome] = useState(false);
  const [extraWins, setExtraWins] = useState(false);
  const [yesterdayMiss, setYesterdayMiss] = useState("");

  // незакрытый результат вчера — как подсказка
  useEffect(() => {
    (async () => {
      const y = await loadDay(addDays(date, -1));
      if (!y) return setYesterdayMiss("");
      const ym = migrateDay(y);
      setYesterdayMiss(ym.primaryOutcome && ym.outcomeStatus !== "done" ? ym.primaryOutcome : "");
    })();
  }, [date]);

  useEffect(() => { setPhase(defaultPhase(s, time)); /* при смене даты */ // eslint-disable-line
  }, [date]); // eslint-disable-line react-hooks/exhaustive-deps

  const setBlock = (k, v) => up((prev) => ({ blocks: { ...prev.blocks, [k]: v } }));
  const due = deals.filter((d) => d.nextDate && d.nextDate <= today && d.stage < 9);

  // подсказки главного результата
  const suggestions = [];
  for (const d of due.slice(0, 3)) if (d.nextStep) suggestions.push(`${d.name}: ${d.nextStep}`);
  if (northStar) suggestions.push(`North Star: ${northStar}`);
  if (yesterdayMiss) suggestions.push(`Вчера не закрыто: ${yesterdayMiss}`);

  const phaseBtn = (k, label) => (
    <button key={k} onClick={() => setPhase(k)} className={phase === k ? "on" : ""}>{label}</button>
  );

  const advanceDeal = (d) => setDeals(deals.map((x) => (x.id === d.id ? { ...x, stage: Math.min(x.stage + 1, 9), updated: today } : x)));
  const rescheduleDeal = (d, iso) => setDeals(deals.map((x) => (x.id === d.id ? { ...x, nextDate: iso, updated: today } : x)));

  return (
    <>
      <div className="seg">
        {phaseBtn("morning", s.dayStarted ? "Утро ✓" : "Утро")}
        {phaseBtn("work", "Исполнение")}
        {phaseBtn("evening", "Вечер")}
      </div>

      {/* ===================== УТРО ===================== */}
      {phase === "morning" && (
        <>
          <Section kicker="30–60 секунд · до телефона" title="Запуск дня">
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, marginBottom: 8 }}>1 · Состояние</div>
            <ChoiceChips options={STATE_OPTIONS} value={s.stateCat} onChange={(v) => up({ stateCat: v })} />

            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, margin: "18px 0 8px" }}>2 · Главный результат дня — факт, не встреча</div>
            {suggestions.length > 0 && !customOutcome && !s.primaryOutcome && (
              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 10 }}>
                {suggestions.map((sg) => (
                  <button key={sg} className="suggest" onClick={() => up({ primaryOutcome: sg.replace(/^(North Star|Вчера не закрыто): /, "") })}>{sg}</button>
                ))}
                <button className="suggest ghost" onClick={() => setCustomOutcome(true)}>+ Другой результат</button>
              </div>
            )}
            {(customOutcome || s.primaryOutcome || suggestions.length === 0) && (
              <Field label="" value={s.primaryOutcome} onChange={(v) => up({ primaryOutcome: v })} placeholder="Получить подтверждение IC call от двух фондов" />
            )}
            <CheckRow gold on={s.chairmanOnly} onClick={() => up({ chairmanOnly: !s.chairmanOnly })} label="Требуется лично моё участие (Chairman action)" />

            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, margin: "18px 0 8px" }}>3 · Чего сегодня не делать (опционально)</div>
            <ChoiceChips multi options={REFUSAL_OPTIONS} value={s.refusalChips} onChange={(v) => up({ refusalChips: v })} />

            <div style={{ marginTop: 20 }}>
              <Btn primary big disabled={!s.stateCat || !s.primaryOutcome.trim()} onClick={() => { up({ dayStarted: true }); setPhase("work"); }}>
                {s.dayStarted ? "День запущен ✓" : "Начать день →"}
              </Btn>
            </div>
          </Section>

          {!fullRitual ? (
            <button className="link-btn" onClick={() => setFullRitual(true)}>
              Открыть полный ритуал (аффирмации · декларация · астрослой)
            </button>
          ) : (
            <>
              <Section kicker="полный ритуал" title="Аффирмации">
                {AFFIRMATIONS.map((a, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                    <Check gold on={s.aff[i]} onClick={() => up((prev) => ({ aff: prev.aff.map((v, j) => (j === i ? !v : v)) }))} />
                    <span style={{ fontSize: 15, lineHeight: 1.45, fontStyle: "italic", color: s.aff[i] ? C.ivory : C.muted }}>«{a}»</span>
                  </div>
                ))}
              </Section>
              <Section kicker="полный ритуал" title="Декларация">
                <div style={{ fontSize: 14, lineHeight: 1.6, color: C.muted, whiteSpace: "pre-line", marginBottom: 12 }}>{DECLARATION}</div>
                <CheckRow gold on={s.decl} onClick={() => up({ decl: !s.decl })} label="Прочитано вслух, принято" />
              </Section>
              <AstroPanel date={date} pasted={s.astro} onPasted={(v) => up({ astro: v })} />
            </>
          )}
        </>
      )}

      {/* ===================== ИСПОЛНЕНИЕ ===================== */}
      {phase === "work" && (
        <>
          {s.primaryOutcome.trim() ? (
            <div className="focus-banner fade-in">
              <div className="kicker" style={{ marginBottom: 6 }}>
                главный результат {s.chairmanOnly ? "· chairman action" : ""}
              </div>
              <div style={{ fontFamily: FONT.serif, fontSize: 19, color: C.ivory, marginBottom: 12, lineHeight: 1.35 }}>{s.primaryOutcome}</div>
              <ChoiceChips green options={["Выполнено", "В процессе", "Заблокировано"]}
                value={s.outcomeStatus === "done" ? "Выполнено" : s.outcomeStatus === "progress" ? "В процессе" : s.outcomeStatus === "blocked" ? "Заблокировано" : ""}
                onChange={(v) => up({ outcomeStatus: v === "Выполнено" ? "done" : v === "В процессе" ? "progress" : v === "Заблокировано" ? "blocked" : "", proofDone: v === "Выполнено" })} />
            </div>
          ) : (
            <div style={{ border: `1px solid ${C.red}`, borderRadius: 6, padding: "12px 16px", marginBottom: 16, fontSize: 14, color: C.red }}>
              Главный результат не задан — вернись в «Утро».
            </div>
          )}

          {due.length > 0 && (
            <Section kicker="pipeline · сегодня" title="Движения по сделкам">
              {due.map((d) => (
                <div key={d.id} style={{ borderBottom: `1px solid ${C.line}`, padding: "8px 0 12px", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, color: C.ivory, marginBottom: 8 }}>
                    <b>{d.name}</b> <span style={{ fontSize: 11, color: C.muted, fontFamily: FONT.mono }}>[{STAGES[d.stage]}]</span> — {d.nextStep || "шаг не задан"}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Btn primary onClick={() => advanceDeal(d)}>✓ Сделано → {STAGES[Math.min(d.stage + 1, 9)]}</Btn>
                    <Btn onClick={() => rescheduleDeal(d, addDays(today, 1))}>Перенести на завтра</Btn>
                    <Btn onClick={goDeals}>Открыть</Btn>
                  </div>
                </div>
              ))}
            </Section>
          )}

          <Section kicker="неприкосновенно" title="Час Архитектора">
            <ArchitectTimer onComplete={() => setBlock("architect", true)} />
            <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, fontFamily: FONT.mono, margin: "10px 0 8px" }}>Артефакт на выходе</div>
            <ChoiceChips options={ARTIFACT_TYPES} value={s.artifactType} onChange={(v) => up({ artifactType: v, blocks: { ...s.blocks, architect: v ? true : s.blocks.architect } })} />
            {s.artifactType === "Другое" && (
              <div style={{ marginTop: 10 }}>
                <Field label="Название артефакта" value={s.architectResult} onChange={(v) => up({ architectResult: v })} placeholder="Коротко" />
              </div>
            )}
          </Section>

          <Section kicker="одной строкой" title="Здоровье сегодня">
            <ChoiceChips multi green options={HEALTH_ACTS} value={s.healthActs}
              onChange={(v) => up({ healthActs: v, blocks: { ...s.blocks, health: v.length > 0 } })} />
          </Section>

          <CheckRow on={s.blocks.office} onClick={() => setBlock("office", !s.blocks.office)} label="Офис: каждая встреча закончилась следующим шагом" />
          <CheckRow on={s.blocks.evening} onClick={() => setBlock("evening", !s.blocks.evening)} label="Вечерняя разгрузка без экрана" />

          <QuickFilter goDeals={goDeals} />
        </>
      )}

      {/* ===================== ВЕЧЕР ===================== */}
      {phase === "evening" && (
        <>
          <Section kicker="шаг 1 из 5" title="Главный результат получен?">
            {s.primaryOutcome.trim() && <div style={{ fontFamily: FONT.serif, fontSize: 16, color: C.ivory, marginBottom: 12 }}>{s.primaryOutcome}</div>}
            <ChoiceChips green options={["Да", "Частично", "Нет"]}
              value={s.outcomeStatus === "done" ? "Да" : s.outcomeStatus === "partial" ? "Частично" : s.outcomeStatus === "no" ? "Нет" : ""}
              onChange={(v) => up({ outcomeStatus: v === "Да" ? "done" : v === "Частично" ? "partial" : v === "Нет" ? "no" : "", proofDone: v === "Да" })} />
          </Section>

          {["partial", "no", "blocked"].includes(s.outcomeStatus) && (
            <>
              <Section kicker="шаг 2" title="Почему?">
                <ChoiceChips options={MISS_REASONS} value={s.missReasonChoice} onChange={(v) => up({ missReasonChoice: v })} />
              </Section>
              <Section kicker="шаг 3" title="Что делаем с результатом?">
                <ChoiceChips options={MISS_ACTIONS} value={s.missAction} onChange={(v) => up({ missAction: v })} />
                {s.missAction === "Перенести" && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Утром завтра он появится в подсказках. Больше двух переносов — убить или делегировать.</div>}
              </Section>
            </>
          )}

          <Section kicker={`шаг ${["partial", "no", "blocked"].includes(s.outcomeStatus) ? 4 : 2}`} title="Главная победа дня">
            <Field label="" value={s.wins[0]} onChange={(v) => up((prev) => ({ wins: prev.wins.map((x, j) => (j === 0 ? v : x)) }))} placeholder="Факт, не намерение" />
            {!extraWins && (s.wins[1] || s.wins[2] ? null : (
              <button className="link-btn" onClick={() => setExtraWins(true)}>+ Ещё победа</button>
            ))}
            {(extraWins || s.wins[1] || s.wins[2]) && (
              <>
                <Field label="Победа 2" value={s.wins[1]} onChange={(v) => up((prev) => ({ wins: prev.wins.map((x, j) => (j === 1 ? v : x)) }))} />
                <Field label="Победа 3" value={s.wins[2]} onChange={(v) => up((prev) => ({ wins: prev.wins.map((x, j) => (j === 2 ? v : x)) }))} />
              </>
            )}
          </Section>

          <Section kicker="финал" title="Shutdown">
            <CheckRow gold on={s.shutdown} onClick={() => up({ shutdown: !s.shutdown })} label="День закрыт, обязательства обновлены, перехожу в личное время" />
          </Section>

          {s.shutdown && (
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 6, padding: "14px 18px", fontSize: 13, color: C.muted, lineHeight: 1.7 }}>
              <span style={{ color: C.goldDim, fontFamily: FONT.mono, fontSize: 10, letterSpacing: ".14em" }}>ИТОГ ДНЯ · </span>
              Результат: {s.outcomeStatus === "done" ? "✓ создан" : s.outcomeStatus === "partial" ? "частично" : s.outcomeStatus === "no" ? `нет → ${s.missAction || "решение не принято"}` : "—"} ·
              Победа: {s.wins[0] || "—"} · Здоровье: {(s.healthActs || []).join(", ") || "—"} ·
              Архитектор: {s.artifactType || "—"}
            </div>
          )}
        </>
      )}
    </>
  );
}
