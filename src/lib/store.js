// Локальное офлайн-хранилище: IndexedDB через idb-keyval.
// Ключи: day:YYYY-MM-DD · week:YYYY-Www · deals · settings
// Каждая запись отмечается локальным временем и (если настроено облако)
// улетает в Supabase фоном — офлайн ничего не ломает.
import { get, set, keys } from "idb-keyval";
import { markLocal, pushKey } from "./cloud";

export const dayKey = (iso) => `day:${iso}`;
export const weekKey = (w) => `week:${w}`;

async function persist(key, data) {
  await set(key, data);
  markLocal(key);
  pushKey(key, data).catch(() => { /* офлайн — догонит syncAll */ });
}

export async function loadDay(iso) {
  return (await get(dayKey(iso))) || null;
}

export async function saveDay(iso, data) {
  await persist(dayKey(iso), data);
}

export async function listDays() {
  const all = await keys();
  return all.filter((k) => typeof k === "string" && k.startsWith("day:")).map((k) => k.slice(4)).sort();
}

export async function loadWeek(w) {
  return (await get(weekKey(w))) || null;
}

export async function saveWeek(w, data) {
  await persist(weekKey(w), data);
}

export async function loadSettings() {
  return (await get("settings")) || null;
}

export async function saveSettings(s) {
  await persist("settings", s);
}

export async function loadHealthProfile() {
  return (await get("healthProfile")) || null;
}

export async function saveHealthProfile(profile) {
  await persist("healthProfile", profile);
}

export async function loadTrainingPlan() {
  return (await get("trainingPlan")) || null;
}

export async function saveTrainingPlan(plan) {
  await persist("trainingPlan", plan);
}

export async function loadDeals() {
  return (await get("deals")) || [];
}

export async function saveDeals(deals) {
  await persist("deals", deals);
}

export async function loadCode() {
  return (await get("code")) || null;
}

export async function saveCode(code) {
  await persist("code", code);
}

export async function loadBusinessKnowledge() {
  return (await get("businessKnowledge")) || null;
}

export async function saveBusinessKnowledge(knowledge) {
  await persist("businessKnowledge", knowledge);
}

export async function loadBusinessChat() {
  return (await get("businessChat")) || [];
}

export async function saveBusinessChat(messages) {
  await persist("businessChat", messages);
}

export async function loadDevelopmentKnowledge() {
  return (await get("developmentKnowledge")) || null;
}

export async function saveDevelopmentKnowledge(knowledge) {
  await persist("developmentKnowledge", knowledge);
}

export async function loadDevelopmentChat() {
  const stored = await get("developmentChat");
  if (Array.isArray(stored)) return stored;
  try {
    const legacy = JSON.parse(localStorage.getItem("daler-os-ai-development") || "[]");
    if (Array.isArray(legacy) && legacy.length) {
      await persist("developmentChat", legacy);
      return legacy;
    }
  } catch {
    // Start with an empty controlled chat when the legacy value is unavailable.
  }
  return [];
}

export async function saveDevelopmentChat(messages) {
  await persist("developmentChat", messages);
}

// Полный бэкап/восстановление: все ключи IndexedDB одним JSON-объектом
export async function exportAllData() {
  const ks = await keys();
  const out = { _app: "daler-os", _version: 3, _exportedAt: new Date().toISOString() };
  for (const k of ks) {
    if (typeof k === "string") out[k] = await get(k);
  }
  return out;
}

export async function importAllData(obj) {
  if (!obj || obj._app !== "daler-os") throw new Error("Это не бэкап DALER OS");
  let n = 0;
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith("_")) continue;
    await set(k, v);
    n++;
  }
  return n;
}

export const LAST_EXPORT_KEY = "daleros:lastExport";
export function daysSinceExport() {
  const t = Number(localStorage.getItem(LAST_EXPORT_KEY) || 0);
  if (!t) return Infinity;
  return Math.floor((Date.now() - t) / 86400000);
}
