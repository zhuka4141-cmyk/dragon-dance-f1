import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const script = readFileSync(resolve(root, 'assets/home.js'), 'utf8');
new vm.Script(script);
new vm.Script(readFileSync(resolve(root, 'assets/updates-feed.js'), 'utf8'));
const archive = readFileSync(resolve(root, 'updates.html'), 'utf8');
for (const match of archive.matchAll(/<script>([\s\S]*?)<[/]script>/g)) new vm.Script(match[1]);
assert.equal((html.match(/class="hero-page /g) || []).length, 4, 'Home, heritage, crew and partners share the four-slide pager');
assert.ok(!html.includes('href="heritage.html"'), 'Culture controls must switch the pager instead of opening another document');
assert.ok(html.includes('id="heritage" hidden'), 'Heritage detail is a pager-controlled panel');
assert.ok(!html.includes('data-i18n="discoverMachine"'), 'Race car exploration remains removed');
assert.ok(!html.includes('heritageBridgeLink'), 'No race car exploration CTA in culture panel');
const legacyPage = readFileSync(resolve(root, 'heritage.html'), 'utf8');
assert.ok(legacyPage.includes('url=index.html#heritage'), 'Old standalone URL redirects into the pager');
assert.equal((html.match(/data-page-panel="0"/g) || []).length, 2);
assert.equal((html.match(/data-page-panel="2"/g) || []).length, 2);
assert.equal((html.match(/data-page-panel="3"/g) || []).length, 2);

// Translation omissions are easy to miss when adding editorial content.
for (const [markup, source] of [[html, script]]) {
for (const [attribute, dictionary] of [['data-i18n', 'chineseText'], ['data-i18n-html', 'chineseHtml']]) {
  const start = source.indexOf(`const ${dictionary} = {`);
  assert.ok(start >= 0, `${dictionary} exists`);
  const from = source.indexOf('{', start);
  const end = source.indexOf('};', from);
  const translations = vm.runInNewContext(`(${source.slice(from, end + 1)})`);
  for (const match of markup.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))) {
    assert.ok(translations[match[1]], `Missing Chinese translation: ${match[1]}`);
  }
}
}

const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
for (const match of html.matchAll(/(?:src|href)="(assets[/][^"]+)"/g)) {
  assert.ok(existsSync(resolve(root, match[1])), `Missing local asset: ${match[1]}`);
}
assert.ok(ids.includes('heritage'), 'Culture panel is in the homepage');
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  assert.ok(ids.includes(match[1]), `Missing section target: ${match[1]}`);
}

// Preserve both Supabase media representations and their crop metadata.
const mediaStart = script.indexOf('function parseMediaEntry(');
const mediaEnd = script.indexOf('function mediaNaturalSize(', mediaStart);
const media = vm.runInNewContext(`(() => { ${script.slice(mediaStart, mediaEnd)}; return {mediaUrl, normaliseMediaEntries}; })()`);
const plain = 'https://example.com/plain.jpg';
const cropped = {url:'https://example.com/cropped.jpg', type:'image/jpeg', positionX:23, positionY:74, scale:1.8};
assert.equal(media.mediaUrl(plain), plain);
assert.equal(media.mediaUrl(JSON.stringify(cropped)), cropped.url);
const entries = media.normaliseMediaEntries({image_urls:[plain, JSON.stringify(cropped), plain]});
assert.equal(entries.length, 2);
assert.equal(entries[1].positionX, 23);
assert.equal(entries[1].positionY, 74);
assert.equal(entries[1].scale, 1.8);
assert.equal(media.normaliseMediaEntries({cover_url:plain})[0].url, plain);
for (const page of [archive]) {
  const start = page.indexOf('function parseMediaEntry(');
  const end = page.indexOf('function mediaNaturalSize(', start);
  assert.ok(start >= 0 && end > start, 'Each media surface keeps the compatible parser');
  const parser = vm.runInNewContext(`(() => { ${page.slice(start, end)}; return {mediaUrl, normaliseMediaEntries}; })()`);
  assert.equal(parser.mediaUrl(JSON.stringify(cropped)), cropped.url);
  assert.equal(parser.mediaUrl(plain), plain);
  assert.equal(parser.normaliseMediaEntries({image_urls:[JSON.stringify(cropped)]})[0].scale, 1.8);
}
console.log('PASS: JavaScript syntax, bilingual coverage, unique IDs, local assets, section anchors and media compatibility.');
