import assert from "node:assert/strict";
import {
  base64Data,
  canonicalTextMediaType as canonicalServerTextMediaType,
  cleanMessageAttachments,
  gatewayMessages,
} from "../api/_lib/chat-attachments.js";
import {
  attachmentMeta,
  attachmentPayloadSize,
  canonicalTextMediaType as canonicalClientTextMediaType,
  persistableMessages,
  prepareChatAttachment,
} from "../src/lib/aiAttachments.js";

const imageData = `data:image/png;base64,${Buffer.from("image").toString("base64")}`;
const totals = { binary: 0, text: 0 };
const attachments = cleanMessageAttachments([
  {
    name: "screen.png",
    mediaType: "image/png",
    size: 5,
    kind: "image",
    data: imageData,
  },
  {
    name: "notes.md",
    mediaType: "text/markdown",
    size: 12,
    kind: "text",
    content: "Главный вывод",
  },
], totals);

assert.equal(attachments.length, 2);
assert.equal(base64Data(imageData), Buffer.from("image").toString("base64"));
assert.equal(totals.binary, imageData.length);
assert.equal(totals.text, "Главный вывод".length);

const messages = gatewayMessages([{ role: "user", content: "Разбери", attachments }]);
assert.equal(messages[0].content[0].type, "text");
assert.equal(messages[0].content[1].type, "image");
assert.equal(messages[0].content[2].type, "text");
assert.equal(messages[0].content[1].mediaType, "image/png");

assert.deepEqual(cleanMessageAttachments([
  { name: "old.pdf", mediaType: "application/pdf", kind: "file", size: 20 },
]), []);
assert.throws(() => cleanMessageAttachments([
  { name: "bad.png", mediaType: "image/png", kind: "image", data: "not-a-data-url" },
]), /некорректные данные/);

const preparedText = await prepareChatAttachment({
  name: "decision.md",
  type: "text/markdown",
  size: 19,
  text: async () => "Факт, риск, действие",
});
assert.equal(preparedText.kind, "text");
assert.equal(preparedText.content, "Факт, риск, действие");
assert.equal(attachmentPayloadSize(preparedText), "Факт, риск, действие".length);

const safariMarkdown = await prepareChatAttachment({
  name: "README.MD",
  type: "application/octet-stream",
  size: 34,
  text: async () => "# Контекст\nФайл передан с iPhone",
});
assert.equal(safariMarkdown.kind, "text");
assert.equal(safariMarkdown.mediaType, "text/markdown");
assert.equal(canonicalClientTextMediaType("notes.markdown", "application/octet-stream"), "text/markdown");
assert.equal(canonicalClientTextMediaType("notes", "text/x-markdown"), "text/markdown");
assert.equal(canonicalServerTextMediaType("notes.md", "application/octet-stream"), "text/markdown");
assert.equal(canonicalServerTextMediaType("notes", "application/markdown"), "text/markdown");
assert.deepEqual(cleanMessageAttachments([{
  name: "iphone.md",
  mediaType: "application/octet-stream",
  size: 24,
  kind: "text",
  content: "# Факт\nMarkdown прочитан",
}])[0], {
  name: "iphone.md",
  mediaType: "text/markdown",
  size: 24,
  kind: "text",
  content: "# Факт\nMarkdown прочитан",
});

const persisted = persistableMessages([{
  role: "user",
  content: "Разбери вложения",
  attachments: [
    preparedText,
    {
      id: "image-id",
      name: "screen.png",
      mediaType: "image/png",
      size: 5,
      kind: "image",
      data: imageData,
    },
  ],
}]);
assert.deepEqual(persisted[0].attachments, [
  attachmentMeta(preparedText),
  {
    name: "screen.png",
    mediaType: "image/png",
    size: 5,
    kind: "image",
  },
]);
assert.equal("content" in persisted[0].attachments[0], false);
assert.equal("data" in persisted[0].attachments[1], false);

console.log("AI chat attachment checks passed.");
