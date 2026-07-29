import assert from "node:assert/strict";
import { captionsToText, parseCaptionTracks, parseYouTubeId } from "../api/_lib/youtube.js";

assert.equal(parseYouTubeId("Разбери https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "dQw4w9WgXcQ");
assert.equal(parseYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=15"), "dQw4w9WgXcQ");
assert.equal(parseYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"), "dQw4w9WgXcQ");
assert.equal(parseYouTubeId("https://example.com/watch?v=dQw4w9WgXcQ"), "");

const tracks = parseCaptionTracks('{"captionTracks":[{"baseUrl":"https://example.com/captions?x=1","languageCode":"ru","name":{"simpleText":"Русский"}}],"audioTracks":[]}');
assert.equal(tracks.length, 1);
assert.equal(tracks[0].languageCode, "ru");

const transcript = captionsToText({
  events: [
    { tStartMs: 0, segs: [{ utf8: "Первая " }, { utf8: "фраза" }] },
    { tStartMs: 65000, segs: [{ utf8: "Вторая фраза" }] },
  ],
});
assert.equal(transcript, "[0:00] Первая фраза\n[1:05] Вторая фраза");

console.log("YouTube transcript checks passed.");
