import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const TABLE = "daleros_kv";
const RECORD_KEY = "__ai_provider_keys_v1";
const PROVIDERS = new Set(["openai", "anthropic"]);

function encryptionKey() {
  const value = String(process.env.AI_KEYS_ENCRYPTION_KEY || "").trim();
  const key = Buffer.from(value, "base64");
  if (key.length !== 32) {
    const error = new Error("Хранилище API-ключей ещё не активировано на сервере");
    error.statusCode = 503;
    throw error;
  }
  return key;
}

export function encryptSecret(secret) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  return {
    v: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    data: encrypted.toString("base64"),
  };
}

export function decryptSecret(payload) {
  if (payload?.v !== 1 || !payload.iv || !payload.tag || !payload.data) {
    throw new Error("Некорректная запись API-ключа");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(payload.data, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function validCloudConfig(cloud) {
  try {
    const url = new URL(String(cloud?.url || ""));
    return url.protocol === "https:"
      && /^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname)
      && String(cloud?.anonKey || "").length >= 30
      && String(cloud?.accessToken || "").length >= 30;
  } catch {
    return false;
  }
}

async function authenticatedCloud(cloud) {
  if (!validCloudConfig(cloud)) {
    const error = new Error("Войди в облако DALER OS, чтобы использовать собственные API-ключи");
    error.statusCode = 401;
    throw error;
  }
  const accessToken = String(cloud.accessToken);
  const client = createClient(String(cloud.url), String(cloud.anonKey), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) {
    const authError = new Error("Сессия облака истекла. Войди снова в настройках");
    authError.statusCode = 401;
    throw authError;
  }
  return { client, user: data.user };
}

async function readRecord(cloud) {
  const { client, user } = await authenticatedCloud(cloud);
  const { data, error } = await client
    .from(TABLE)
    .select("value")
    .eq("user_id", user.id)
    .eq("key", RECORD_KEY)
    .maybeSingle();
  if (error) throw new Error(`Не удалось прочитать подключения: ${error.message}`);
  return { client, user, value: data?.value && typeof data.value === "object" ? data.value : {} };
}

function connectionStatus(value) {
  return {
    openai: Boolean(value?.providers?.openai),
    anthropic: Boolean(value?.providers?.anthropic),
  };
}

async function writeRecord(client, user, value) {
  const { error } = await client.from(TABLE).upsert({
    user_id: user.id,
    key: RECORD_KEY,
    value,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,key" });
  if (error) throw new Error(`Не удалось сохранить подключение: ${error.message}`);
}

export async function providerConnectionStatus(cloud) {
  const { value } = await readRecord(cloud);
  return connectionStatus(value);
}

export async function saveProviderKey(cloud, provider, apiKey) {
  if (!PROVIDERS.has(provider)) {
    const error = new Error("Неизвестный провайдер");
    error.statusCode = 400;
    throw error;
  }
  const key = String(apiKey || "").trim();
  if (!key.startsWith("sk-") || key.length < 20 || key.length > 500) {
    const error = new Error("Проверь API-ключ: он должен начинаться с sk-");
    error.statusCode = 400;
    throw error;
  }
  const { client, user, value } = await readRecord(cloud);
  const next = {
    v: 1,
    providers: { ...(value.providers || {}), [provider]: encryptSecret(key) },
    updatedAt: new Date().toISOString(),
  };
  await writeRecord(client, user, next);
  return connectionStatus(next);
}

export async function removeProviderKey(cloud, provider) {
  if (!PROVIDERS.has(provider)) {
    const error = new Error("Неизвестный провайдер");
    error.statusCode = 400;
    throw error;
  }
  const { client, user, value } = await readRecord(cloud);
  const providers = { ...(value.providers || {}) };
  delete providers[provider];
  const next = { v: 1, providers, updatedAt: new Date().toISOString() };
  await writeRecord(client, user, next);
  return connectionStatus(next);
}

export async function loadUserProviderKeys(cloud) {
  if (!cloud) return {};
  const { value } = await readRecord(cloud);
  const result = {};
  for (const provider of PROVIDERS) {
    if (value?.providers?.[provider]) result[provider] = decryptSecret(value.providers[provider]);
  }
  return result;
}
