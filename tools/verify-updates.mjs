import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('assets/updates-feed.js', root), 'utf8');
const i18nSource = readFileSync(new URL('assets/i18n.js', root), 'utf8');

function element() {
  return {dataset:{}, attributes:{}, children:[], events:{}, style:{}, textContent:'',
    setAttribute(key, value) { this.attributes[key] = value; },
    getAttribute(key) { return this.attributes[key]; },
    append(child) { this.children.push(child); },
    appendChild(child) { this.children.push(child); },
    addEventListener(name, action) { this.events[name] = action; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    classList: { add() {}, remove() {}, toggle() {} },
    focus() { this.focused = true; }
  };
}

// The feed now reads its copy from the shared registry, so the test drives the real one.
const registry = (() => {
  const scope = {};
  scope.window = scope;
  scope.document = {
    documentElement: element(), head: element(), body: element(),
    createElement: () => element(), getElementById: () => null,
    querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, readyState: 'complete'
  };
  scope.navigator = { languages: ['en-GB', 'en'], language: 'en-GB' };
  scope.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
  scope.location = { search: '', href: 'http://localhost/' };
  scope.setTimeout = setTimeout;
  scope.clearTimeout = clearTimeout;
  vm.runInNewContext(i18nSource, scope);
  return scope.DragonI18n;
})();

function fixture(result, config = true, timeout = false) {
  const calls = [];
  const query = { then: (...args) => (timeout ? new Promise(() => {}) : Promise.resolve(result)).then(...args) };
  for (const method of ['from', 'select', 'eq', 'order', 'limit', 'abortSignal']) {
    query[method] = (...args) => { calls.push([method, ...args]); return query; };
  }
  const window = config ? { supabase: { createClient: () => query }, DRAGON_DANCE_SUPABASE: {url:'https://example.com', publishableKey:'public'} } : {};
  window.DragonI18n = registry;
  vm.runInNewContext(source, {window, AbortController,
    setTimeout:timeout ? action => { queueMicrotask(action); return 0; } : setTimeout,
    clearTimeout, document:{createElement:element}});
  return {api:window.DragonUpdates, calls};
}

const populated = fixture({data:[{slug:'news'}], error:null});
assert.equal((await populated.api.load(3))[0].slug, 'news');
assert.ok(populated.calls.some(([method, size]) => method === 'limit' && size === 3), 'Home only requests three posts');
assert.ok(populated.calls.some(([method, key, value]) => method === 'eq' && key === 'is_published' && value === true));
assert.equal((await fixture({data:[],error:null}).api.load()).length, 0, 'Empty is a successful result');
await assert.rejects(fixture({data:null,error:new Error('offline')}).api.load(), /offline/);
await assert.rejects(fixture(null, false).api.load(), /unavailable/i);
await assert.rejects(fixture({data:null,error:null}).api.load(), /invalid/i);
const stalled = fixture(null, true, true);
await assert.rejects(stalled.api.load(), /timed out/i);
assert.equal(stalled.calls.find(([method]) => method === 'abortSignal')[1].aborted, true, 'Timeout also aborts the request');

// The locale is resolved by the registry, so every supported code must render real copy.
for (const language of registry.SUPPORTED) {
  for (const state of ['loading', 'empty', 'error', 'ready']) {
    const container = element();
    let retries = 0;
    const shown = populated.api.renderStatus(container, state, language, () => retries++);
    assert.equal(container.dataset.state, state);
    assert.equal(container.attributes['aria-busy'], String(state === 'loading'));
    assert.equal(shown, state !== 'ready');
    if (shown) {
      const text = container.children[0].children[0].textContent;
      assert.ok(text && !/^feed[A-Z]/.test(text), `renderStatus(${language}, ${state}) must show copy, got ${text}`);
    }
    if (state === 'error') {
      const retry = container.children[0].children[1];
      assert.ok(retry.textContent && !/^feed[A-Z]/.test(retry.textContent), 'Retry button must show copy');
      retry.events.click();
      assert.equal(retries, 1);
      assert.equal(container.focused, true, 'Retry keeps focus on the live result region');
    }
  }
}

const failedImage = element();
failedImage.parentElement = element();
populated.api.protectMedia(failedImage, 'en');
failedImage.events.error();
assert.equal(failedImage.hidden, true);
assert.equal(failedImage.parentElement.children[0].textContent, 'Media unavailable');
console.log(`PASS: queries, limit, timeout/abort, errors, ${registry.SUPPORTED.length}-language feed states, retry focus and broken media fallback.`);
