import { useState, useRef } from "react";
import { C, FONT } from "../constants";
import { Section, CheckRow, Btn } from "./atoms";
import { askPermission } from "../lib/notify";
import { exportMonth } from "../lib/export";
import { exportAllData, importAllData, LAST_EXPORT_KEY, daysSinceExport } from "../lib/store";

const TimeInput = ({ value, onChange, disabled }) => (
  <input type="time" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
    style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: disabled ? C.muted : C.ivory, padding: "6px 10px", fontSize: 14, fontFamily: FONT.mono, colorScheme: "dark" }} />
);

export default function Settings({ settings, upSettings, date }) {
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
