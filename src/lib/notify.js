// Локальные уведомления по KL-времени. Работают, пока приложение открыто
// (или установлено как PWA и находится в памяти) — Web Push сервера нет по спецификации.
import { klNow } from "./date";

export async function askPermission() {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return await Notification.requestPermission();
}

const ICON = `${import.meta.env.BASE_URL}icon-192.png`;

function fire(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: ICON, badge: ICON });
  } catch {
    // iOS в PWA требует showNotification через SW-регистрацию
    navigator.serviceWorker?.ready.then((reg) => reg.showNotification(title, { body, icon: ICON }));
  }
}

const MESSAGES = {
  morning: ["DALER OS · Утро", "Аффирмации, декларация, вопрос Архитектора — до телефона и новостей."],
  architect: ["DALER OS · Час Архитектора", "Без телефона и встреч. Стратегия, капитал, партнёрства, мышление."],
  shutdown: ["DALER OS · Shutdown", "Три победы, аудит стоимости, закрытие дня."],
};

// Проверяет расписание раз в 30 сек; каждое напоминание срабатывает раз в день.
export function startScheduler(getSettings) {
  const firedKey = (date, kind) => `daleros:fired:${date}:${kind}`;
  const tick = () => {
    const st = getSettings();
    if (!st) return;
    const { date, time } = klNow();
    const checks = [
      ["morning", st.notifyMorning, st.morningTime],
      ["architect", st.notifyArchitect, st.architectTime],
      ["shutdown", st.notifyShutdown, st.shutdownTime],
    ];
    for (const [kind, enabled, at] of checks) {
      if (!enabled || !at) continue;
      if (time >= at && !localStorage.getItem(firedKey(date, kind))) {
        localStorage.setItem(firedKey(date, kind), "1");
        fire(...MESSAGES[kind]);
      }
    }
  };
  tick();
  const id = setInterval(tick, 30000);
  return () => clearInterval(id);
}
