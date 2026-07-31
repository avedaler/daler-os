import assert from "node:assert/strict";
import {
  extractReadableHtml,
  isPrivateAddress,
  validatePublicUrl,
} from "../api/_lib/web-source.js";
import { parseDevelopmentKnowledge } from "../api/ai-chat.js";

assert.equal(isPrivateAddress("127.0.0.1"), true);
assert.equal(isPrivateAddress("10.0.0.4"), true);
assert.equal(isPrivateAddress("172.20.10.2"), true);
assert.equal(isPrivateAddress("192.168.1.1"), true);
assert.equal(isPrivateAddress("169.254.169.254"), true);
assert.equal(isPrivateAddress("::1"), true);
assert.equal(isPrivateAddress("fc00::1"), true);
assert.equal(isPrivateAddress("8.8.8.8"), false);
assert.equal(isPrivateAddress("2606:4700:4700::1111"), false);

assert.equal(validatePublicUrl("https://example.com/article#part").toString(), "https://example.com/article");
assert.throws(() => validatePublicUrl("http://localhost/admin"), /Локальные/);
assert.throws(() => validatePublicUrl("http://127.0.0.1/admin"), /Локальные/);
assert.throws(() => validatePublicUrl("file:///etc/passwd"), /HTTP/);
assert.throws(() => validatePublicUrl("https://example.com:8443/"), /порт/);

const article = extractReadableHtml(Buffer.from(`
  <html>
    <head><title>Практика внимания</title><style>.hide{display:none}</style></head>
    <body>
      <nav>Меню, которое не должно попасть в анализ</nav>
      <main>
        <h1>Практика внимания</h1>
        <p>Отключите уведомления на сорок пять минут и завершите один измеримый материал.</p>
        <p>Записывайте факт выполнения и число завершённых материалов каждый день.</p>
      </main>
      <script>ignore()</script>
    </body>
  </html>
`), "https://example.com/focus");
assert.equal(article.title, "Практика внимания");
assert.match(article.content, /Отключите уведомления/);
assert.doesNotMatch(article.content, /Меню|ignore/);

const learning = parseDevelopmentKnowledge(JSON.stringify({
  summary: "Практика требует личной проверки.",
  quality: { level: "moderate", reason: "Есть механизм, но нет данных пользователя." },
  claims: [{ text: "Отключение уведомлений уменьшает переключения", support: "plausible" }],
  practices: [{
    title: "Фокус 45 минут",
    protocol: "Отключить уведомления и закончить один материал.",
    durationDays: 7,
    metric: "Число завершённых материалов",
    evidence: "moderate",
    risks: [],
  }],
  warnings: ["Личный результат не доказывает причинность"],
}));
assert.equal(learning.quality.level, "moderate");
assert.equal(learning.practices[0].durationDays, 7);
assert.match(learning.warnings[0], /причинность/);

console.log("Public web source checks passed.");
