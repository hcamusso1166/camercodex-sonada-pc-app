const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/rutinas/bookTestImposibleV2ShowAudio.js', 'utf8');
const window = {};
vm.runInNewContext(source, { window, Audio: function Audio() {}, console, setTimeout, clearTimeout });
const audio = new window.BookTestImposibleV2ShowAudio();

test('page 009 line 16 usa únicamente sus tres takes normales', () => {
  const context = audio.resolveReadingContext('any-book', 9, 16);
  const takes = audio.getClassicTakeUrls(context);
  assert.match(takes.p1, /line-016_p1\.mp3$/);
  assert.match(takes.p2, /line-016_p2\.mp3$/);
  assert.match(takes.p3, /line-016_p3\.mp3$/);
  assert.deepEqual(Object.keys(takes), ['p1', 'p2', 'p3']);
});

function readingSources(partCount) {
  const context = audio.resolveReadingContext('future-book', 9, 17, partCount);
  const takes = audio.getClassicTakeUrls(context);
  return Array.from(audio.playClassicReadingTwoTakes(context, takes)
    .filter(item => item.type === 'audio')
    .map(item => item.src.match(/line-017_p\d\.mp3$/)[0]));
}

test('queue partCount 1 repite sólo p1 y nunca solicita p2/p3', () => {
  assert.deepEqual(readingSources(1), ['line-017_p1.mp3', 'line-017_p1.mp3']);
});

test('queue partCount 2 repite p1+p2 y nunca solicita p3', () => {
  assert.deepEqual(readingSources(2), ['line-017_p1.mp3', 'line-017_p2.mp3', 'line-017_p1.mp3', 'line-017_p2.mp3']);
});

test('queue partCount 3 conserva p1+p2+p3 en sus dos repeticiones', () => {
  assert.deepEqual(readingSources(3), ['line-017_p1.mp3', 'line-017_p2.mp3', 'line-017_p3.mp3', 'line-017_p1.mp3', 'line-017_p2.mp3', 'line-017_p3.mp3']);
});

test('page 009 line 17 y page 010 line 1 no se remapean', () => {
  const line17 = audio.getClassicTakeUrls(audio.resolveReadingContext('future-book', 9, 17));
  const line1 = audio.getClassicTakeUrls(audio.resolveReadingContext('future-book', 10, 1));
  assert.deepEqual(Object.values(line17).map(src => src.match(/line-\d{3}_p\d\.mp3$/)[0]), ['line-017_p1.mp3', 'line-017_p2.mp3', 'line-017_p3.mp3']);
  assert.deepEqual(Object.values(line1).map(src => src.match(/page-010\/line-\d{3}_p\d\.mp3$/)[0]), ['page-010/line-001_p1.mp3', 'page-010/line-001_p2.mp3', 'page-010/line-001_p3.mp3']);
});
