import assert from "node:assert/strict";
import { directProviderRoute, friendlyProviderError } from "../api/_lib/direct-ai.js";

const openai = directProviderRoute("openai/gpt-5.6-sol", { openai: "sk-openai-test" });
assert.deepEqual(openai, {
  provider: "openai",
  modelId: "gpt-5.6-sol",
  apiKey: "sk-openai-test",
});

const anthropic = directProviderRoute("anthropic/claude-opus-5-fast", { anthropic: "sk-ant-test" });
assert.equal(anthropic.modelId, "claude-opus-5");
assert.equal(directProviderRoute("openai/gpt-5.6-sol", {}), null);

const invalidKey = friendlyProviderError({ status: 401, message: "invalid api key" }, "openai");
assert.equal(invalidKey.statusCode, 401);
assert.match(invalidKey.message, /API-ключ OpenAI отклонён/);

const quota = friendlyProviderError({ status: 429, code: "insufficient_quota" }, "openai");
assert.equal(quota.statusCode, 402);
assert.match(quota.message, /нет доступного баланса/);

console.log("Direct AI provider routing checks passed.");
