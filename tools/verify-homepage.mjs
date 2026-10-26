import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const script = readFileSync(resolve(root, 'assets/home.js'), 'utf8');
const i18nSource = readFileSync(resolve(root, 'assets/i18n.js'), 'utf8');
new vm.Script(script);
new vm.Script(readFileSync(resolve(root, 'assets/updates-feed.js'), 'utf8'));
new vm.Script(i18nSource);
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

// Build a real DragonI18n instance so the dictionary contract is tested, not a copy of it.
function element(tag = 'div') {
  return {tagName:tag.toUpperCase(), dataset:{}, attributes:{}, children:[], events:{}, style:{},
    textContent:'', innerHTML:'', hidden:false,
    setAttribute(key, value) { this.attributes[key] = String(value); },
    getAttribute(key) { return this.attributes[key]; },
    removeAttribute(key) { delete this.attributes[key]; },
    hasAttribute(key) { return key in this.attributes; },
    append(...nodes) { this.children.push(...nodes); },
    appendChild(node) { this.children.push(node); return node; },
    replaceChildren(...nodes) { this.children = nodes; },
    addEventListener(name, action) { this.events[name] = action; },
    removeEventListener() {},
    focus() { this.focused = true; },
    blur() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    classList: { _s:new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, on) { if (on === undefined) on = !this._s.has(c); on ? this._s.add(c) : this._s.delete(c); return on; },
      contains(c) { return this._s.has(c); } }
  };
}
// Mirrors the real switcher markup: a button wrapping a compact label, plus an empty listbox.
function switcherDom() {
  const label = element('span');
  label.classList.add('language-current');
  const toggle = element('button');
  toggle.appendChild(label);
  toggle.querySelector = selector => (selector === '.language-current' ? label : null);
  const menu = element('ul');
  return {label, toggle, menu};
}
function browser(entry, dom) {
  const scope = {};
  scope.window = scope;
  scope.document = {
    documentElement: element('html'), head: element('head'), body: element('body'),
    createElement: tag => element(tag),
    getElementById: id => (dom ? (id === 'languageToggle' ? dom.toggle : id === 'languageMenu' ? dom.menu : null) : null),
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, readyState: 'complete'
  };
  scope.navigator = { languages: [entry], language: entry };
  scope.localStorage = { _v:{}, getItem(key) { return this._v[key] ?? null; }, setItem(key, value) { this._v[key] = String(value); }, removeItem(key) { delete this._v[key]; } };
  scope.location = { search: '', href: 'http://localhost/' };
  scope.setTimeout = setTimeout;
  scope.clearTimeout = clearTimeout;
  vm.runInNewContext(i18nSource, scope);
  return scope.window.DragonI18n;
}

const registry = browser('en-GB');
assert.equal(registry.current, 'en', 'English is the fallback');
const supported = registry.SUPPORTED;
assert.ok(supported.includes('en'), 'English stays the default language');
assert.ok(supported.length >= 9, `Expected at least nine languages, got ${supported.length}`);
assert.equal(new Set(supported).size, supported.length, 'Language codes must be unique');
for (const code of supported) {
  assert.ok(registry.META[code]?.name, `${code} needs a display name`);
  assert.ok(registry.META[code]?.short, `${code} needs a compact toggle label`);
  assert.ok(registry.META[code]?.htmlLang, `${code} needs an html lang tag`);
  assert.ok(registry.META[code]?.locale, `${code} needs an Intl locale`);
}

// Detection must map real browser tags onto supported codes.
const expect = tag => browser(tag).current;
assert.equal(expect('zh-CN'), 'zh-Hans');
assert.equal(expect('zh-SG'), 'zh-Hans');
assert.equal(expect('zh-HK'), 'zh-Hant');
assert.equal(expect('zh-TW'), 'zh-Hant');
assert.equal(expect('ja-JP'), 'ja');
assert.equal(expect('ko-KR'), 'ko');
assert.equal(expect('es-419'), 'es');
assert.equal(expect('fr-CA'), 'fr');
assert.equal(expect('de-AT'), 'de');
assert.equal(expect('pt-BR'), 'pt');
assert.equal(expect('en-US'), 'en');
assert.equal(expect('sw-KE'), 'en', 'Unsupported languages fall back to English');

// The dropdown must list every language, mark exactly one, and show the compact label.
const dom = switcherDom();
const detected = browser('zh-HK', dom);
assert.equal(detected.current, 'zh-Hant', 'A Hong Kong browser lands on Traditional Chinese');
assert.equal(dom.menu.children.length, supported.length, 'The switcher lists every supported language');
assert.equal(dom.menu.children.filter(option => option.attributes['aria-selected'] === 'true').length, 1, 'Exactly one option is selected');
for (const option of dom.menu.children) {
  assert.equal(option.attributes.role, 'option', 'Menu entries are listbox options');
  assert.ok(supported.includes(option.dataset.lang), `Unexpected option: ${option.dataset.lang}`);
  assert.ok(option.textContent, 'Each option shows the language name');
}
assert.equal(dom.label.textContent, detected.META['zh-Hant'].short, 'The toggle shows the compact label');
assert.equal(dom.toggle.attributes['aria-label'], `Choose language: ${detected.META['zh-Hant'].name}`, 'The toggle names the current language');
assert.ok(/id="languageToggle"[^>]*aria-haspopup="listbox"/.test(html), 'The toggle advertises its popup type');
assert.ok(/id="languageMenu"[^>]*role="listbox"/.test(html), 'The menu is a listbox');
assert.ok(/id="languageToggle"[^>]*aria-controls="languageMenu"/.test(html), 'The toggle is bound to the menu');
assert.equal(detected.META.en.short, 'EN', 'English keeps the two-letter label');

// Every dictionary must cover every translatable key in both pages.
const dictionaries = new Map();
for (const file of readdirSync(resolve(root, 'assets/i18n')).filter(name => name.endsWith('.js'))) {
  const code = file.replace(/\.js$/, '');
  const scope = {};
  const registered = {};
  scope.window = scope;
  scope.DragonI18n = { register(name, table) { registered[name] = table; } };
  vm.runInNewContext(readFileSync(resolve(root, 'assets/i18n', file), 'utf8'), scope);
  const stored = registered[code];
  assert.ok(stored, `${file} must register the ${code} code`);
  assert.deepEqual(Object.keys(registered), [code], `${file} must register exactly its own code`);
  dictionaries.set(code, stored);
}
assert.equal(dictionaries.size, supported.length - 1, 'Every non-English language ships a dictionary file');

for (const [attribute, bucket] of [['data-i18n', 'text'], ['data-i18n-html', 'html']]) {
  const keys = new Set();
  for (const markup of [html, archive]) {
    for (const match of markup.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))) keys.add(match[1]);
  }
  assert.ok(keys.size > 0, `${attribute} keys exist`);
  for (const [code, stored] of dictionaries) {
    for (const key of keys) {
      assert.ok(stored[bucket]?.[key], `Missing ${code} ${bucket} translation: ${key}`);
    }
  }
  for (const code of dictionaries.keys()) {
    assert.equal(Object.keys(dictionaries.get(code)[bucket] || {}).length, keys.size,
      `${code} ${bucket} dictionary must not carry unused keys`);
  }
}

// Every ui() key used by the shipping code must resolve, and placeholders must match.
const enUi = registry.ui;
const usedKeys = new Set();
for (const source of [script, archive, readFileSync(resolve(root, 'assets/updates-feed.js'), 'utf8')]) {
  for (const match of source.matchAll(/\bui\('([A-Za-z0-9_]+)'/g)) usedKeys.add(match[1]);
}
for (const key of ['pagerHome', 'pagerHeritage', 'pagerCrew', 'pagerPartners']) usedKeys.add(key);
for (const key of usedKeys) {
  assert.ok(enUi(key) && enUi(key) !== key, `ui key ${key} must resolve to English text`);
}
for (const [code, stored] of dictionaries) {
  for (const key of usedKeys) {
    const value = stored.ui?.[key];
    assert.ok(value, `Missing ${code} ui string: ${key}`);
    const englishVars = (enUi(key).match(/\{[a-z]+\}/gi) || []).sort().join(',');
    const localVars = (value.match(/\{[a-z]+\}/gi) || []).sort().join(',');
    assert.equal(localVars, englishVars, `${code} ui.${key} placeholders must match English`);
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
assert.ok(!html.includes('assets/language.js'), 'The superseded language detector is gone');

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
console.log(`PASS: syntax, ${supported.length}-language detection, dictionary coverage, ui placeholders, unique IDs, local assets, section anchors and media compatibility.`);
