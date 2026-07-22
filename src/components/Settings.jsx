import { useState, useRef, useEffect } from "react";
import { C, FONT } from "../constants";
import { Section, CheckRow, Btn } from "./atoms";
import { askPermission } from "../lib/notify";
import { exportMonth } from "../lib/export";
import { exportAllData, importAllData, LAST_EXPORT_KEY, daysSinceExport } from "../lib/store";
import { hasLock, setPin, verifyPin, clearLock, lockNow, hasBiometric, biometricAvailable, registerBiometric, disableBiometric } from "../lib/lock";
import { getConfig, setConfig, cloudConfigured, currentUser, signUp, signIn, signOut, syncAll, lastSync, SETUP_SQL } from "../lib/cloud";

function CloudSettings() {
  const [cfg, setCfg] = useState(getConfig());
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState(cfg?.url || "");
  const [anonKey, setAnonKey] = useState(cfg?.anonKey || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSql, setShowSql] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const say = (m) => setMsg(m);

  useEffect(() => { if (cloudConfigured()) currentUser().then(setUser); }, []);

  const connect = () => {
    const u = url.trim().replace(/\/$/, "");
    if (!/^https:\/\/.+\.supabase\.co$/.test(u)) return say("URL должен быть вида https://xxxx.supabase.co");
    if (anonKey.trim().length < 30) return say("Похоже, это не anon-ключ");
    setConfig({ url: u, anonKey: anonKey.trim() });
    setCfg(getConfig());
    say("Облако подключено — теперь войди или создай аккаунт");
  };

  const doAuth = async (mode) => {
    if (!email.includes("@") || password.length < 6) return say("Email и пароль (мин. 6 символов)");
    setBusy(true);
    try {
      if (mode === "up") {
        await signUp(email, password);
        say("Аккаунт создан. Если вход не произошёл — подтверди email по письму и войди.");
      } else {
        await signIn(email, password);
      }
      const u = await currentUser();
      setUser(u);
      if (u) {
        say("Вход выполнен, синхронизирую…");
        const r = await syncAll();
        say(r.ok ? `Синхронизировано: получено ${r.pulled}, отправлено ${r.pushed}` : `Вход есть, но синхронизация: ${r.reason}`);
      }
    } catch (e) {
      say(`Ошибка: ${e.message}`);
    }
    setBusy(false);
  };

  const doSync = async () => {
    setBusy(true);
    const r = await syncAll();
    say(r.ok ? `Готово: получено ${r.pulled}, отправлено ${r.pushed}` : `Не вышло: ${r.reason}`);
    setBusy(false);
  };

  const field = (label, val, setVal, type = "text", placeholder = "") => (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 6, fontFamily: FONT.mono }}>{label}</div>
      <input type={type} value={val} placeholder={placeholder} autoComplete={type === "password" ? "current-password" : "off"} aria-label={label}
        onChange={(e) => setVal(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "10px 12px", fontSize: 14, fontFamily: FONT.sans }} />
    </label>
  );

  return (
    <Section kicker="supabase · синхронизация устройств" title="Облако">
      {!cfg ? (
        <>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            Синхронизация между устройствами не подключена. Данные живут на этом устройстве.
          </div>
          {!showAdvanced ? (
            <Btn primary onClick={() => setShowAdvanced(true)}>Подключить синхронизацию</Btn>
          ) : (
            <>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.6 }}>
                Один раз: на supabase.com создай проект (регион Singapore) → SQL Editor → выполни SQL (кнопка ниже) →
                Settings → API → скопируй Project URL и anon public key сюда.
              </div>
              <Btn onClick={() => setShowSql(!showSql)}>{showSql ? "Скрыть SQL" : "Показать SQL для таблицы"}</Btn>
              {showSql && (
                <pre style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, padding: 12, fontSize: 11, color: C.ivory, overflowX: "auto", margin: "12px 0" }}>{SETUP_SQL}</pre>
              )}
              <div style={{ marginTop: 12 }}>
                {field("Project URL", url, setUrl, "text", "https://xxxx.supabase.co")}
                {field("anon public key", anonKey, setAnonKey, "text", "eyJhbGciOi…")}
                <Btn primary onClick={connect}>Подключить облако</Btn>
              </div>
            </>
          )}
        </>
      ) : !user ? (
        <>
          <div style={{ fontSize: 13, color: C.green, marginBottom: 10 }}>✓ Проект подключён: {cfg.url.replace("https://", "")}</div>
          {field("Email", email, setEmail, "email", "you@example.com")}
          {field("Пароль", password, setPassword, "password")}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn primary onClick={() => !busy && doAuth("in")}>Войти</Btn>
            <Btn onClick={() => !busy && doAuth("up")}>Создать аккаунт</Btn>
            <Btn onClick={() => { setConfig(null); setCfg(null); say("Облако отключено"); }}>Отключить облако</Btn>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, color: C.green, marginBottom: 10 }}>
            ✓ Вошёл как {user.email}
            {lastSync() ? ` · последняя сверка ${new Date(lastSync()).toLocaleString("ru-RU")}` : ""}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn primary onClick={doSync}>Синхронизировать сейчас</Btn>
            <Btn onClick={async () => { await signOut(); setUser(null); say("Вышел из аккаунта — данные остались на устройстве"); }}>Выйти</Btn>
          </div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
            Каждое сохранение сразу отправляется в облако и появляется на других открытых устройствах; при запуске приложение дополнительно сверяет все записи.
            Войди этим же аккаунтом на втором устройстве — история подтянется.
          </div>
        </>
      )}
      <div style={{ minHeight: 20, fontSize: 13, color: C.gold, fontFamily: FONT.mono, marginTop: 10 }}>{msg}</div>
    </Section>
  );
}

function LockSettings({ onLock }) {
  const [enabled, setEnabled] = useState(hasLock());
  const [bio, setBio] = useState(hasBiometric());
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [current, setCurrent] = useState("");
  const [msg, setMsg] = useState("");
  const say = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const enable = async () => {
    if (pin1.length < 4) return say("PIN — минимум 4 знака");
    if (pin1 !== pin2) return say("PIN не совпадает");
    await setPin(pin1);
    setEnabled(true); setPin1(""); setPin2("");
    say("Защита включена");
  };

  const change = async () => {
    if (!(await verifyPin(current))) return say("Текущий PIN неверен");
    if (pin1.length < 4) return say("Новый PIN — минимум 4 знака");
    if (pin1 !== pin2) return say("Новый PIN не совпадает");
    await setPin(pin1);
    setCurrent(""); setPin1(""); setPin2("");
    say("PIN изменён");
  };

  const disable = async () => {
    if (!(await verifyPin(current))) return say("Текущий PIN неверен");
    if (!confirm("Отключить защиту входа?")) return;
    clearLock();
    setEnabled(false); setBio(false); setCurrent("");
    say("Защита отключена");
  };

  const addBio = async () => {
    try {
      await registerBiometric();
      setBio(true);
      say("Биометрия подключена");
    } catch (e) {
      say(`Не получилось: ${e.message || "устройство не поддерживает"}`);
    }
  };

  const pinField = (label, val, setVal) => (
    <label style={{ flex: "1 1 140px", display: "block", marginBottom: 14 }}>
      <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 6, fontFamily: FONT.mono }}>{label}</div>
      <input type="password" inputMode="numeric" autoComplete="off" value={val} placeholder="••••" aria-label={label}
        onChange={(e) => setVal(e.target.value)}
        style={{ width: "100%", boxSizing: "border-box", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ivory, padding: "10px 12px", fontSize: 16, fontFamily: FONT.mono, letterSpacing: ".3em" }} />
    </label>
  );

  return (
    <Section kicker="идентификация · это устройство" title="Вход в приложение">
      {!enabled ? (
        <>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>
            PIN закрывает приложение от посторонних на этом устройстве. Хранится как хеш, никуда не отправляется.
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {pinField("Новый PIN", pin1, setPin1)}
            {pinField("Повторить PIN", pin2, setPin2)}
          </div>
          <Btn primary onClick={enable}>Включить PIN-вход</Btn>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, color: C.green, marginBottom: 12 }}>✓ Защита включена{bio ? " · биометрия подключена" : ""}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {pinField("Текущий PIN", current, setCurrent)}
            {pinField("Новый PIN", pin1, setPin1)}
            {pinField("Повторить новый", pin2, setPin2)}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <Btn primary onClick={change}>Сменить PIN</Btn>
            <Btn onClick={disable}>Отключить (нужен текущий PIN)</Btn>
            <Btn onClick={() => { lockNow(); onLock(); }}>Заблокировать сейчас</Btn>
          </div>
          {biometricAvailable() && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {!bio
                ? <Btn onClick={addBio}>Подключить Face ID / Touch ID</Btn>
                : <Btn onClick={() => { disableBiometric(); setBio(false); say("Биометрия отключена"); }}>Отключить биометрию</Btn>}
            </div>
          )}
        </>
      )}
      <div style={{ minHeight: 20, fontSize: 13, color: C.gold, fontFamily: FONT.mono, marginTop: 8 }}>{msg}</div>
      <div style={{ fontSize: 12, color: C.muted }}>
        Забытый PIN не восстанавливается — только очистка данных сайта (история удалится). Держи свежий JSON-бэкап.
        Облачный логин с синхронизацией появится после подключения бэкенда.
      </div>
    </Section>
  );
}

const TimeInput = ({ value, onChange, disabled }) => (
  <input type="time" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
    style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: disabled ? C.muted : C.ivory, padding: "6px 10px", fontSize: 14, fontFamily: FONT.mono, colorScheme: "inherit" }} />
);

export default function Settings({ settings, upSettings, date, onLock }) {
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [exportMsg, setExportMsg] = useState("");
  const [backupMsg, setBackupMsg] = useState("");
  const fileRef = useRef(null);
  const ym = date.slice(0, 7);
  const staleDays = daysSinceExport();

  const downloadJson = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daler-os-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(LAST_EXPORT_KEY, String(Date.now()));
    const n = Object.keys(data).filter((k) => !k.startsWith("_")).length;
    setBackupMsg(`Сохранено записей: ${n}`);
  };

  const onImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const obj = JSON.parse(await file.text());
      if (!confirm("Импорт добавит/перезапишет записи из бэкапа. Продолжить?")) return;
      const n = await importAllData(obj);
      setBackupMsg(`Импортировано записей: ${n}. Перезагружаю…`);
      setTimeout(() => window.location.reload(), 800);
    } catch (err) {
      setBackupMsg(`Ошибка импорта: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  };

  const rows = [
    ["notifyMorning", "morningTime", "Утренний ритуал"],
    ["notifyArchitect", "architectTime", "Час Архитектора"],
    ["notifyShutdown", "shutdownTime", "Shutdown"],
  ];

  return (
    <>
      <LockSettings onLock={onLock} />

      <CloudSettings />

      <Section kicker="критично" title="Бэкап данных">
        {staleDays >= 7 && (
          <div style={{ border: `1px solid ${C.red}`, color: C.red, borderRadius: 4, padding: "10px 14px", fontSize: 13, marginBottom: 14 }}>
            {staleDays === Infinity ? "Бэкап ещё ни разу не делался." : `Последний бэкап — ${staleDays} дн. назад.`} Данные живут только в этом браузере:
            очистка Safari или смена телефона сотрёт всю историю. Скачай JSON сейчас.
          </div>
        )}
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn primary onClick={downloadJson}>Скачать полный бэкап (JSON)</Btn>
          <Btn onClick={() => fileRef.current?.click()}>Импорт из бэкапа</Btn>
          <input ref={fileRef} type="file" accept="application/json" onChange={onImportFile} style={{ display: "none" }} aria-label="Файл бэкапа JSON" />
          <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT.mono }}>{backupMsg}</span>
        </div>
        <div style={{ fontSize: 12, color: C.muted, marginTop: 10 }}>
          JSON восстанавливается в приложение один в один (дни, недели, сделки, настройки). Делай бэкап минимум раз в неделю — приложение напомнит.
        </div>
      </Section>

      <Section kicker="время KL · пока приложение открыто" title="Напоминания">
        {perm !== "granted" && (
          <div style={{ marginBottom: 14 }}>
            <Btn primary onClick={async () => setPerm(await askPermission())}>Разрешить уведомления</Btn>
            {perm === "denied" && <div style={{ fontSize: 12, color: C.red, marginTop: 6 }}>Уведомления запрещены в браузере — включи их в настройках сайта.</div>}
            {perm === "unsupported" && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Браузер не поддерживает уведомления.</div>}
          </div>
        )}
        {rows.map(([flag, timeKey, label]) => (
          <div key={flag} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 200px" }}>
              <CheckRow gold on={settings[flag]} onClick={() => upSettings({ [flag]: !settings[flag] })} label={label} />
            </div>
            <TimeInput value={settings[timeKey]} disabled={!settings[flag]} onChange={(v) => upSettings({ [timeKey]: v })} />
          </div>
        ))}
        <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
          Честно: это напоминания, пока приложение открыто или активно на home screen — push-сервера нет, данные не покидают устройство.
          Для гарантированных сигналов продублируй Час Архитектора, пятничный CEO-review и shutdown в календаре телефона.
        </div>
      </Section>

      <Section kicker="markdown" title="Экспорт месяца (читаемый отчёт)">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn onClick={async () => {
            const n = await exportMonth(ym);
            setExportMsg(n ? `Экспортировано дней: ${n}` : "Нет записей за этот месяц");
          }}>Скачать {ym}.md</Btn>
          <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT.mono }}>{exportMsg}</span>
        </div>
      </Section>

      <Section kicker="данные" title="Хранилище">
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Все записи хранятся локально в IndexedDB этого устройства (офлайн-first). Одна запись на дату (KL).
          Синхронизация между устройствами появится с облачным хранилищем — до тех пор регулярный JSON-бэкап обязателен.
        </div>
      </Section>
    </>
  );
}
