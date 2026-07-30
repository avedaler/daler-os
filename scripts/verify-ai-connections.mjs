import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

process.env.AI_KEYS_ENCRYPTION_KEY = randomBytes(32).toString("base64");
const { decryptSecret, encryptSecret } = await import("../api/_lib/provider-keys.js");

const secret = "sk-test-secret-1234567890";
const encrypted = encryptSecret(secret);

assert.equal(encrypted.v, 1);
assert.equal(JSON.stringify(encrypted).includes(secret), false);
assert.equal(decryptSecret(encrypted), secret);
assert.throws(() => decryptSecret({ ...encrypted, data: `${encrypted.data.slice(0, -2)}aa` }));

console.log("AI provider encryption checks passed.");
