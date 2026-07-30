import {
  providerConnectionStatus,
  removeProviderKey,
  saveProviderKey,
} from "./_lib/provider-keys.js";

function isAllowedOrigin(origin) {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    if (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)) return true;
    const allowedHosts = new Set([
      "daler-os.vercel.app",
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ].filter(Boolean));
    return url.protocol === "https:" && allowedHosts.has(url.hostname);
  } catch {
    return false;
  }
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") return response.status(405).json({ error: "Метод не поддерживается" });
  if (!isAllowedOrigin(request.headers.origin)) return response.status(403).json({ error: "Источник запроса не разрешён" });

  let body;
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  } catch {
    return response.status(400).json({ error: "Некорректный запрос" });
  }

  try {
    const action = String(body.action || "status");
    let connections;
    if (action === "save") connections = await saveProviderKey(body.cloud, String(body.provider || ""), body.apiKey);
    else if (action === "remove") connections = await removeProviderKey(body.cloud, String(body.provider || ""));
    else if (action === "status") connections = await providerConnectionStatus(body.cloud);
    else return response.status(400).json({ error: "Неизвестное действие" });
    return response.status(200).json({ connections });
  } catch (error) {
    console.error("AI provider connection failed", error?.message || error);
    return response.status(error.statusCode || 500).json({
      error: error.message || "Не удалось изменить подключение",
    });
  }
}
