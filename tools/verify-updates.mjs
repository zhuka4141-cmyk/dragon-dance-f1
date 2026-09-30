import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/updates-feed.js', import.meta.url), 'utf8');
function element() {
  return {dataset:{}, attributes:{}, children:[], events:{},
    setAttribute(key, value) { this.attributes[key] = value; },
    append(child) { this.children.push(child); },
    addEventListener(name, action) { this.events[name] = action; },
    focus() { this.focused = true; }
  };
}
function fixture(result, config = true, timeout = false) {
  const calls = [];
  const query = { then: (...args) => (timeout ? new Promise(() => {}) : Promise.resolve(result)).then(...args) };
  for (const method of ['from', 'select', 'eq', 'order', 'limit', 'abortSignal']) {
    query[method] = (...args) => { calls.push([method, ...args]); return query; };
  }
  const window = config ? { supabase: { createClient: () => query }, DRAGON_DANCE_SUPABASE: {url:'https://example.com', publishableKey:'public'} } : {};
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
for (const language of ['en', 'zh']) {
  for (const state of ['loading', 'empty', 'error', 'ready']) {
    const container = element();
    let retries = 0;
    const shown = populated.api.renderStatus(container, state, language, () => retries++);
    assert.equal(container.dataset.state, state);
    assert.equal(container.attributes['aria-busy'], String(state === 'loading'));
    assert.equal(shown, state !== 'ready');
    if (shown) assert.ok(container.children[0].children[0].textContent);
    if (state === 'error') {
      const retry = container.children[0].children[1];
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
console.log('PASS: queries, limit, timeout/abort, errors, four bilingual feed states, retry focus and broken media fallback.');
