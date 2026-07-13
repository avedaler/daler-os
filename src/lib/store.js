// Локальное офлайн-хранилище: IndexedDB через idb-keyval.
// Ключи: day:YYYY-MM-DD · week:YYYY-Www · settings
import { get, set, keys } from "idb-keyval";

export const dayKey = (iso) => `day:${iso}`;
export const weekKey = (w) => `week:${w}`;

export async function loadDay(iso) {
  return (await get(dayKey(iso))) || null;
}

export async function saveDay(iso, data) {
  await set(dayKey(iso), data);
}

export async function listDays() {
  const all = await keys();
  return all.filter((k) => typeof k === "string" && k.startsWith("day:")).map((k) => k.slice(4)).sort();
}

export async function loadWeek(w) {
  return (await get(weekKey(w))) || null;
}

export async function saveWeek(w, data) {
  await set(weekKey(w), data);
}

export async function loadSettings() {
  return (await get("settings")) || null;
}

export async function saveSettings(s) {
  await set("settings", s);
}
