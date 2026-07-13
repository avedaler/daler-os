import { useState } from "react";
import { C, FONT } from "../constants";
import { Section, CheckRow, Btn } from "./atoms";
import { askPermission } from "../lib/notify";
import { exportMonth } from "../lib/export";

const TimeInput = ({ value, onChange, disabled }) => (
  <input type="time" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}
    style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 4, color: disabled ? C.muted : C.ivory, padding: "6px 10px", fontSize: 14, fontFamily: FONT.mono, colorScheme: "dark" }} />
);

export default function Settings({ settings, upSettings, date }) {
  const [perm, setPerm] = useState(typeof Notification !== "undefined" ? Notification.permission : "unsupported");
  const [exportMsg, setExportMsg] = useState("");
  const ym = date.slice(0, 7);

  const rows = [
    ["notifyMorning", "morningTime", "Утренний ритуал"],
    ["notifyArchitect", "architectTime", "Час Архитектора"],
    ["notifyShutdown", "shutdownTime", "Shutdown"],
  ];

  return (
    <>
      <Section kicker="время KL" title="Уведомления">
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
          Напоминания срабатывают, пока приложение открыто или установлено на home screen. Push-сервера нет — данные не покидают устройство.
        </div>
      </Section>

      <Section kicker="markdown" title="Экспорт месяца">
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Btn primary onClick={async () => {
            const n = await exportMonth(ym);
            setExportMsg(n ? `Экспортировано дней: ${n}` : "Нет записей за этот месяц");
          }}>Скачать {ym}.md</Btn>
          <span style={{ fontSize: 13, color: C.muted, fontFamily: FONT.mono }}>{exportMsg}</span>
        </div>
      </Section>

      <Section kicker="данные" title="Хранилище">
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Все записи хранятся локально в IndexedDB этого устройства (офлайн-first).
          Одна запись на дату (KL). Регулярный экспорт в Markdown — твой бэкап.
        </div>
      </Section>
    </>
  );
}
