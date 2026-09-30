import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const script = readFileSync(resolve(root, 'assets/home.js'), 'utf8');
new vm.Script(script);
assert.ok(existsSync(resolve(root, 'heritage.html')), 'Fire dragon introduction has its own page');
assert.ok(!html.includes('id="heritage"'), 'Homepage no longer embeds the full introduction');
assert.ok(!html.includes('data-i18n="discoverMachine"'), 'Remove the explore race car entry');
assert.ok(html.includes('href="heritage.html"'), 'Homepage links to the separate heritage page');
const heritageHtml = readFileSync(resolve(root, 'heritage.html'), 'utf8');
const heritageScript = readFileSync(resolve(root, 'assets/heritage.js'), 'utf8');
new vm.Script(heritageScript);
assert.ok(heritageHtml.includes('<h1'), 'Standalone introduction has a primary heading');
assert.ok(!heritageHtml.includes('heritageBridgeLink'), 'No race car exploration CTA on culture page');
for (const match of heritageHtml.matchAll(/(?:src|href)="(assets[/][^"]+)"/g)) {
  assert.ok(existsSync(resolve(root, match[1])), `Missing cultural page asset: ${match[1]}`);
}

// Translation omissions are easy to miss when adding editorial content.
for (const [markup, source] of [[html, script], [heritageHtml, heritageScript]]) {
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
assert.ok(heritageHtml.includes('id="heritage"'), 'Heritage anchor lives on its own page');
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
console.log('PASS: JavaScript syntax, bilingual coverage, unique IDs, local assets, section anchors and media compatibility.');
