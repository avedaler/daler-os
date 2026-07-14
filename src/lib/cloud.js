// Облако: Supabase — email-вход и синхронизация IndexedDB между устройствами.
// Конфиг (URL проекта + anon-ключ) вводится в настройках и хранится локально;
// anon-ключ публичен по дизайну, данные защищены row-level security.
import { createClient } from "@supabase/supabase-js";
import { get as idbGet, set as idbSet, keys as idbKeys } from "idb-keyval";

const CFG_KEY = "daleros:cloud";
const META_KEY = "daleros:kvmeta";
const TABLE = "daleros_kv";

// Какие ключи синхронизируем
const syncable = (k) =>
  typeof k === "string" && (
    k.startsWith("day:") ||
    k.startsWith("week:") ||
    k === "deals" ||
    k === "settings" ||
    k === "healthProfile" ||
    k === "trainingPlan"
  );

export function getConfig() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || null; } catch { return null; }
}

let client = null;
export function setConfig(cfg) {
  if (cfg) localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  else localStorage.removeItem(CFG_KEY);
  client = null;
}

export function getClient() {
  const cfg = getConfig();
  if (!cfg?.url || !cfg?.anonKey) return null;
  if (!client) client = createClient(cfg.url, cfg.anonKey);
  return client;
}

export const cloudConfigured = () => !!getClient();

// Локальные отметки времени изменений (для last-write-wins)
const meta = () => { try { return JSON.parse(localStorage.getItem(META_KEY)) || {}; } catch { return {}; } };
const saveMeta = (m) => localStorage.setItem(META_KEY, JSON.stringify(m));
export function markLocal(key) {
  const m = meta();
  m[key] = Date.now();
  saveMeta(m);
}

export async function currentUser() {
  const c = getClient();
  if (!c) return null;
  const { data } = await c.auth.getSession();
  return data.session?.user || null;
}

export async function signUp(email, password) {
  const c = getClient();
  if (!c) throw new Error("Облако не настроено");
  const { error } = await c.auth.signUp({ email, password });
  if (error) throw error;
}

export async function signIn(email, password) {
  const c = getClient();
  if (!c) throw new Error("Облако не настроено");
  const { error } = await c.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await getClient()?.auth.signOut();
}

// Отправка одного ключа (fire-and-forget из store.js)
export async function pushKey(key, value) {
  const c = getClient();
  if (!c || !syncable(key)) return;
  const { data } = await c.auth.getSession();
  const session = data.session;
  if (!session) return;
  await c.from(TABLE).upsert(
    { user_id: session.user.id, key, value, updated_at: new Date().toISOString() },
    { onConflict: "user_id,key" }
  );
}

// Полная сверка: по каждому ключу побеждает более свежая версия
export async function syncAll() {
  const c = getClient();
  if (!c) return { ok: false, reason: "не настроено" };
  const { data: sess } = await c.auth.getSession();
  if (!sess.session) return { ok: false, reason: "нет входа" };

  const { data: rows, error } = await c.from(TABLE).select("key,value,updated_at");
  if (error) return { ok: false, reason: error.message };

  const m = meta();
  const cloudKeys = new Set();
  let pulled = 0, pushed = 0;

  for (const row of rows || []) {
    cloudKeys.add(row.key);
    const cloudTs = Date.parse(row.updated_at) || 0;
    const localTs = m[row.key] || 0;
    if (cloudTs > localTs) {
      await idbSet(row.key, row.value);
      m[row.key] = cloudTs;
      pulled++;
    } else if (localTs > cloudTs) {
      const v = await idbGet(row.key);
      if (v !== undefined) { await pushKey(row.key, v); pushed++; }
    }
  }

  // локальные ключи, которых нет в облаке
  for (const k of await idbKeys()) {
    if (!syncable(k) || cloudKeys.has(k)) continue;
    const v = await idbGet(k);
    if (v !== undefined) { await pushKey(k, v); m[k] = m[k] || Date.now(); pushed++; }
  }

  saveMeta(m);
  localStorage.setItem("daleros:lastSync", String(Date.now()));
  return { ok: true, pulled, pushed };
}

export const lastSync = () => Number(localStorage.getItem("daleros:lastSync") || 0);

// SQL, который нужно один раз выполнить в Supabase → SQL Editor
export const SETUP_SQL = `create table if not exists public.daleros_kv (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.daleros_kv enable row level security;
drop policy if exists "own rows" on public.daleros_kv;
create policy "own rows" on public.daleros_kv
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);`;
