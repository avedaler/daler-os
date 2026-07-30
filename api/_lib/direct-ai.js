import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { attachmentText, base64Data } from "./chat-attachments.js";

const PROVIDER_NAMES = {
  openai: "OpenAI",
  anthropic: "Anthropic",
};

function providerErrorDetails(error) {
  return [
    error?.message,
    error?.code,
    error?.type,
    error?.error?.message,
    error?.error?.code,
    error?.error?.type,
  ].filter(Boolean).join(" | ");
}

export function directProviderRoute(requestedModel, providerKeys = {}) {
  const [provider, ...modelParts] = String(requestedModel || "").split("/");
  const apiKey = providerKeys[provider];
  if (!apiKey || !PROVIDER_NAMES[provider] || !modelParts.length) return null;
  let modelId = modelParts.join("/");
  if (provider === "anthropic" && modelId.endsWith("-fast")) modelId = modelId.slice(0, -5);
  return { provider, modelId, apiKey };
}

export function friendlyProviderError(error, provider) {
  const name = PROVIDER_NAMES[provider] || "провайдера";
  const status = Number(error?.status || error?.statusCode || 0);
  const details = providerErrorDetails(error);
  let message = `Не удалось получить ответ от ${name}`;
  let statusCode = 502;

  if (status === 401 || /invalid.*api.?key|authentication|unauthorized/i.test(details)) {
    message = `API-ключ ${name} отклонён. Проверь ключ в «Ещё → Настройки → OpenAI и Claude»`;
    statusCode = 401;
  } else if (/insufficient_quota|billing|credit balance|payment required|spend limit/i.test(details)) {
    message = `В API-аккаунте ${name} нет доступного баланса или активного биллинга`;
    statusCode = 402;
  } else if (status === 404 || /model.*not found|does not exist|unknown model/i.test(details)) {
    message = `Модель ${name} недоступна для этого API-аккаунта. Выбери другую версию`;
    statusCode = 404;
  } else if (status === 403 || /permission|not have access/i.test(details)) {
    message = `API-аккаунт ${name} не имеет доступа к выбранной модели`;
    statusCode = 403;
  } else if (status === 429 || /rate.?limit|too many requests/i.test(details)) {
    message = `Временный лимит запросов ${name}. Повтори через минуту`;
    statusCode = 429;
  } else if (status === 400) {
    message = `${name} отклонил параметры запроса. Выбери другую модель`;
    statusCode = 400;
  }

  const wrapped = new Error(message);
  wrapped.statusCode = statusCode;
  wrapped.cause = error;
  return wrapped;
}

export async function callDirectProvider({
  requestedModel,
  providerKeys,
  instructions,
  input,
  maxOutputTokens,
}) {
  const route = directProviderRoute(requestedModel, providerKeys);
  if (!route) return null;
  const system = `${instructions}

КРИТИЧЕСКОЕ ПРАВИЛО ФОРМАТА: не показывай внутренние рассуждения, анализ запроса, план ответа, проверку инструкций или черновик. Выводи только готовый ответ пользователю и только на русском языке.`;

  try {
    if (route.provider === "openai") {
      const client = new OpenAI({ apiKey: route.apiKey, maxRetries: 0, timeout: 60000 });
      const response = await client.responses.create({
        model: route.modelId,
        instructions: system,
        input: input.map((message) => {
          if (message.role !== "user" || !message.attachments?.length) {
            return { role: message.role, content: message.content };
          }
          const content = [{
            type: "input_text",
            text: message.content || "Проанализируй прикреплённые материалы и ответь по существу.",
          }];
          for (const attachment of message.attachments) {
            if (attachment.kind === "text") {
              content.push({ type: "input_text", text: attachmentText(attachment) });
            } else if (attachment.kind === "image") {
              content.push({ type: "input_image", image_url: attachment.data, detail: "auto" });
            } else {
              content.push({
                type: "input_file",
                file_data: attachment.data,
                filename: attachment.name,
                detail: "low",
              });
            }
          }
          return { role: message.role, content };
        }),
        max_output_tokens: maxOutputTokens,
      });
      return { text: response.output_text || "", model: `openai/${route.modelId}` };
    }

    const client = new Anthropic({ apiKey: route.apiKey, maxRetries: 0, timeout: 60000 });
    const response = await client.messages.create({
      model: route.modelId,
      system,
      messages: input.map((message) => {
        if (message.role !== "user" || !message.attachments?.length) {
          return { role: message.role, content: message.content };
        }
        const content = [{
          type: "text",
          text: message.content || "Проанализируй прикреплённые материалы и ответь по существу.",
        }];
        for (const attachment of message.attachments) {
          if (attachment.kind === "text") {
            content.push({
              type: "document",
              source: { type: "text", media_type: "text/plain", data: attachment.content },
              title: attachment.name,
            });
          } else if (attachment.kind === "image") {
            content.push({
              type: "image",
              source: {
                type: "base64",
                media_type: attachment.mediaType,
                data: base64Data(attachment.data),
              },
            });
          } else {
            content.push({
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Data(attachment.data),
              },
              title: attachment.name,
            });
          }
        }
        return { role: message.role, content };
      }),
      max_tokens: maxOutputTokens,
    });
    return {
      text: response.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n"),
      model: `anthropic/${route.modelId}`,
    };
  } catch (error) {
    console.error(
      "Direct AI provider failed",
      route.provider,
      route.modelId,
      error?.status || error?.statusCode || "unknown",
      providerErrorDetails(error).replace(/\s+/g, " ").slice(0, 800)
    );
    throw friendlyProviderError(error, route.provider);
  }
}
