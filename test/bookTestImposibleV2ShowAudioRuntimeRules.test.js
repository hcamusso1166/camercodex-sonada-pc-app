const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/rutinas/bookTestImposibleV2ShowAudio.js', 'utf8');
const window = {};
vm.runInNewContext(source, { window, Audio: function Audio() {}, console, setTimeout, clearTimeout });
const audio = new window.BookTestImposibleV2ShowAudio();

test('regla page 009 line 16 produce 016 p1/p2/p3 y 017 p1', () => {
  const context = audio.resolveReadingContext('any-book', 9, 16, { playLine: 16, extendWithNextLine: true });
  const takes = audio.getClassicTakeUrls(context);
  assert.match(takes.p1, /line-016_p1\.mp3$/);
  assert.match(takes.p2, /line-016_p2\.mp3$/);
  assert.match(takes.p3, /line-016_p3\.mp3$/);
  assert.match(takes.p4, /line-017_p1\.mp3$/);
});

test('regla page 009 line 17 remapea playback y anuncios sin hardcode de libro', () => {
  const context = audio.resolveReadingContext('future-book', 9, 17, { playLine: 16, extendWithNextLine: true, announceLines: [17, 16] });
  assert.equal(context.playbackLineNumber, 16);
  assert.equal(context.classicMode, 'extend-next-line');
  assert.deepEqual(Array.from(context.lineAnnouncementNumbers), [17, 16]);
});
