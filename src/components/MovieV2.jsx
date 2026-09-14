import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "the-movie:episode-002:2026-09-15";

const scenes = [
  { id: "morning", title: "MORNING POWER", body: "Gym: грудь + руки → короткое кардио → sauna → pool / 10 минут тишины.", purpose: "Тело, дыхание, дисциплина, уверенная энергия." },
  { id: "transform", title: "TRANSFORMATION", body: "Дом → душ → grooming → сильный business look → короткий review целей дня.", purpose: "Войти в роль до первого делового контакта." },
  { id: "australia", title: "AUSTRALIA", body: "Сумма → механизм возврата → даты → обязательства → дальнейшая коммуникация.", purpose: "Recovery strategy + dates + next action." },
  { id: "idsb", title: "IDSB", body: "Определить нашу позицию, текущий статус и следующий стратегический ход.", purpose: "Clear position + owner + deadline." },
  { id: "gov", title: "GOV ORGANIZATION", body: "Понять agenda → показать ценность → получить следующий шаг.", purpose: "Конкретное продолжение." },
  { id: "logistics", title: "LOGISTICS COMPANY", body: "Opportunity → economics → decision path.", purpose: "Next contact / next action." },
  { id: "pavel", title: "PAVEL / ONLINE BETTING", body: "Business model, роли, экономика, regulatory path, capital requirement.", purpose: "Opportunity assessment, не запуск." },
  { id: "artem", title: "ARTEM / ST PETERSBURG IT", body: "Продукт → Malaysia entry → инвестиции → модель присутствия → твоя роль / ценность.", purpose: "Structure + next step." },
  { id: "capital", title: "CAPITAL WAR ROOM", body: "Сколько поднимаем → зачем → инструмент → investors → кто ведёт → сроки.", purpose: "Capital Map v1." },
  { id: "bali", title: "BALI DECISION", body: "Wednesday–Sunday: GO / NO-GO. Если GO — цель, логистика, что должно остаться управляемым в KL.", purpose: "Решение без неопределённости." },
  { id: "shutdown", title: "BUSINESS SHUTDOWN", body: "15–20 минут: решения → переносы → owner → deadline. После этого бизнес закрыт.", purpose: "Контроль и дисциплина завершения." },
  { id: "evening", title: "EVENING", body: "Ужин с родителями → 20–30 минут прогулки → Bali packing / фильм / чтение / creative note / спокойная игра.", purpose: "Одна личная активность. Никаких случайных business meetings." },
];

const oracle = [
  ["green", "CHARACTER", "Closer / Presenter / Strategic Operator. Спокойная сила вместо суеты."],
  ["green", "BUSINESS", "День измеряется ясностью и закрытыми next steps, не количеством встреч."],
  ["yellow", "CAPACITY", "Не добавлять случайные встречи. Если перегруз — режем второстепенное."],
  ["yellow", "AUSTRALIA", "Факты, обязательства, документы и законные рычаги. Не эмоциональное давление."],
  ["yellow", "BETTING", "Пока opportunity assessment. Regulatory path обязателен до запуска."],
  ["green", "HEALTH / EVENING", "Body block утром + shutdown вечером — часть стратегии."],
];

function readState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

export default function MovieV2() {
  const [done, setDone] = useState(() => readState().done || {});
  const [mode, setMode] = useState(() => readState().mode || "script");
  const [reality, setReality] = useState(() => readState().reality || "");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ done, mode, reality }));
  }, [done, mode, reality]);

  const completed = useMemo(() => scenes.filter((s) => done[s.id]).length, [done]);

  const toggle = (id) => setDone((v) => ({ ...v, [id]: !v[id] }));

  return (
    <main className="movieV2">
      <style>{`
        .movieV2{min-height:100vh;background:#090b0f;color:#f4f1e9;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:env(safe-area-inset-top) 14px calc(92px + env(safe-area-inset-bottom));}
        .mv-shell{max-width:760px;margin:0 auto}.mv-top{position:sticky;top:0;z-index:20;background:rgba(9,11,15,.94);backdrop-filter:blur(16px);padding:10px 0 12px;border-bottom:1px solid #262a31}.mv-kicker{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#a58d58}.mv-title{font-family:Georgia,"Times New Roman",serif;font-size:27px;line-height:1.04;margin:6px 0 7px}.mv-meta{display:flex;gap:8px;flex-wrap:wrap;color:#9da3ad;font-size:12px}.mv-pill{border:1px solid #2f3540;border-radius:999px;padding:5px 9px}.mv-oracle{color:#8fd3a9}.mv-progress{height:3px;background:#242932;margin-top:12px;overflow:hidden;border-radius:99px}.mv-progress>span{display:block;height:100%;background:#b79a61;transition:width .2s ease}.mv-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:14px 0 10px}.mv-mode button{appearance:none;border:1px solid #2b3038;background:#11151b;color:#9da3ad;padding:9px;border-radius:10px;font-weight:700}.mv-mode button.on{background:#eee9df;color:#111318;border-color:#eee9df}.mv-card{border:1px solid #282d35;background:#101319;border-radius:14px;padding:14px;margin:10px 0}.mv-card.hero{background:linear-gradient(145deg,#171717,#0f1217);border-color:#3a3328}.mv-label{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8d939d;font-weight:800}.mv-big{font-size:20px;line-height:1.18;font-weight:800;margin-top:6px}.mv-text{font-size:14px;line-height:1.48;color:#d7d9dd;margin-top:7px}.mv-quote{font-family:Georgia,"Times New Roman",serif;font-size:17px;line-height:1.42;margin:10px 0 0;color:#f1e8d6}.mv-section{margin:22px 0 8px;display:flex;align-items:center;justify-content:space-between;gap:12px}.mv-section h2{font-size:12px;letter-spacing:.15em;text-transform:uppercase;margin:0;color:#d7c49c}.mv-section span{font-size:11px;color:#737b86}.mv-scene{display:grid;grid-template-columns:32px 1fr;gap:10px;border:1px solid #272c34;border-radius:13px;padding:12px;margin:8px 0;background:#0e1116}.mv-scene.done{opacity:.55}.mv-check{width:28px;height:28px;border-radius:9px;border:1px solid #3c424d;background:#12161c;color:#f4f1e9;font-size:16px}.mv-scene.done .mv-check{background:#21442f;border-color:#316a47}.mv-scene-title{font-size:13px;font-weight:900;letter-spacing:.04em}.mv-scene-body{font-size:13px;line-height:1.42;color:#c9cdd3;margin-top:4px}.mv-purpose{font-size:11.5px;line-height:1.4;color:#939aa4;margin-top:6px}.mv-purpose b{color:#bba16e}.mv-grid{display:grid;grid-template-columns:1fr;gap:8px}.mv-move{border-left:3px solid #b79a61;padding-left:12px}.mv-oracle-row{display:grid;grid-template-columns:10px 1fr;gap:9px;padding:9px 0;border-bottom:1px solid #242932}.mv-oracle-row:last-child{border-bottom:0}.mv-dot{width:8px;height:8px;border-radius:50%;margin-top:5px}.mv-dot.green{background:#4ca56c}.mv-dot.yellow{background:#c89b44}.mv-oracle-row strong{font-size:11px;letter-spacing:.07em}.mv-oracle-row p{font-size:12.5px;line-height:1.4;color:#bfc4cb;margin:2px 0 0}.mv-reality{width:100%;min-height:170px;resize:vertical;background:#0a0d11;color:#f4f1e9;border:1px solid #303641;border-radius:10px;padding:12px;font:inherit;line-height:1.45;box-sizing:border-box;margin-top:10px}.mv-final{background:#eee9df;color:#101216;border-radius:15px;padding:16px;margin-top:16px}.mv-final .mv-label{color:#70685a}.mv-final .mv-text{color:#272a2f}.mv-question{font-weight:900;margin-top:12px;font-size:14px}.mv-footer{position:fixed;left:0;right:0;bottom:0;z-index:25;background:rgba(9,11,15,.95);backdrop-filter:blur(16px);border-top:1px solid #262a31;padding:9px 14px calc(9px + env(safe-area-inset-bottom))}.mv-footer-inner{max-width:760px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:8px}.mv-now{border:0;border-radius:11px;background:#b79a61;color:#111318;padding:11px 14px;font-weight:900;text-align:left}.mv-count{border:1px solid #303641;border-radius:11px;padding:10px 12px;color:#cbd0d6;font-size:12px;display:flex;align-items:center}
        @media(min-width:700px){.movieV2{padding-left:20px;padding-right:20px}.mv-grid{grid-template-columns:1fr 1fr}.mv-title{font-size:32px}.mv-card{padding:16px}}
      `}</style>

      <div className="mv-shell">
        <header className="mv-top">
          <div className="mv-kicker">THE MOVIE V2 · TODAY</div>
          <h1 className="mv-title">EPISODE 002 — CAPITAL & CONTROL</h1>
          <div className="mv-meta">
            <span className="mv-pill">15 Sep 2026</span>
            <span className="mv-pill">Kuala Lumpur</span>
            <span className="mv-pill mv-oracle">● Oracle: Green / Yellow</span>
          </div>
          <div className="mv-progress"><span style={{ width: `${(completed / scenes.length) * 100}%` }} /></div>
        </header>

        <div className="mv-mode">
          <button className={mode === "script" ? "on" : ""} onClick={() => setMode("script")}>SCRIPT</button>
          <button className={mode === "reality" ? "on" : ""} onClick={() => setMode("reality")}>REALITY</button>
        </div>

        {mode === "script" ? <>
          <section className="mv-card hero">
            <div className="mv-label">Character of the Day</div>
            <div className="mv-big">DALER — Business Closer / Strategic Operator</div>
            <div className="mv-text">Спокойная стратегическая сила. Говорит медленнее и короче. Не доказывает силу громкостью. Сначала понимает позицию → потом делает ход.</div>
            <div className="mv-quote">«Я знаю, зачем я здесь. Я знаю, что мне нужно. Я делаю следующий ход.»</div>
          </section>

          <section className="mv-card">
            <div className="mv-label">90-Day Direction · December</div>
            <div className="mv-text">Более сильное и атлетичное тело · $20M капитала под управлением / доступного для проектов · сильнее компании через партнёрства и контракты · дисциплинированный стратегический характер.</div>
          </section>

          <section className="mv-card hero">
            <div className="mv-label">One Win</div>
            <div className="mv-big">Capital Map v1</div>
            <div className="mv-text">Сколько → куда → инструмент → инвесторы → owners → deadlines.</div>
          </section>

          <div className="mv-section"><h2>Day Flow</h2><span>{completed}/{scenes.length} closed</span></div>
          {scenes.map((scene) => (
            <article className={`mv-scene${done[scene.id] ? " done" : ""}`} key={scene.id}>
              <button className="mv-check" onClick={() => toggle(scene.id)} aria-label={`Отметить ${scene.title}`}>{done[scene.id] ? "✓" : ""}</button>
              <div>
                <div className="mv-scene-title">{scene.title}</div>
                <div className="mv-scene-body">{scene.body}</div>
                <div className="mv-purpose"><b>WHY / OUTCOME:</b> {scene.purpose}</div>
              </div>
            </article>
          ))}

          <div className="mv-section"><h2>Director's Moves</h2><span>generated from strategy</span></div>
          <div className="mv-grid">
            <section className="mv-card mv-move"><div className="mv-label">Move 1</div><div className="mv-big" style={{fontSize:16}}>Protected Capital Block</div><div className="mv-text">Защищённое время на investor pipeline и структуру cap raise — не растворять это в звонках.</div></section>
            <section className="mv-card mv-move"><div className="mv-label">Move 2</div><div className="mv-big" style={{fontSize:16}}>One Real Capital Move</div><div className="mv-text">До конца дня сделать один реальный шаг по капиталу: intro, contact, term structure или decision.</div></section>
          </div>

          <div className="mv-section"><h2>Oracle Validation</h2><span>always visible</span></div>
          <section className="mv-card">
            {oracle.map(([status, label, body]) => <div className="mv-oracle-row" key={label}><span className={`mv-dot ${status}`} /><div><strong>{label}</strong><p>{body}</p></div></div>)}
          </section>

          <section className="mv-final">
            <div className="mv-label">Final Frame</div>
            <div className="mv-text">К вечеру перед DALER лежит чистая карта: Capital Map v1, recovery next step по Australia, стратегия по IDSB, конкретные next steps по новым возможностям, решение Bali и закрытый вовремя рабочий день.</div>
            <div className="mv-question">СДВИНУЛ ЛИ Я ДЕКАБРЬ ВПЕРЁД?</div>
          </section>
        </> : <>
          <section className="mv-card hero"><div className="mv-label">Reality · Evening Close</div><div className="mv-big">Что произошло на самом деле?</div><div className="mv-text">Не подгонять Reality под Script. Факты → выводы → переносы → Director’s Note.</div></section>
          <section className="mv-card">
            <div className="mv-label">Voice / text journal</div>
            <textarea className="mv-reality" value={reality} onChange={(e) => setReality(e.target.value)} placeholder="Australia…\nIDSB…\nCapital…\nPavel / Artem / Gov / Logistics…\nBali…\nCharacter…" />
          </section>
          <section className="mv-card"><div className="mv-label">Director's Note</div><div className="mv-text">Что сработало в персонаже? Что сломалось? Что переносим в Episode 003?</div></section>
        </>}
      </div>

      <footer className="mv-footer">
        <div className="mv-footer-inner">
          <button className="mv-now" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>↑ EPISODE 002 · {mode.toUpperCase()}</button>
          <div className="mv-count">{completed}/{scenes.length}</div>
        </div>
      </footer>
    </main>
  );
}
