import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';

const collectorPath = new URL('../assets/site-analytics.js', import.meta.url);
assert.ok((await import('node:fs')).existsSync(collectorPath), 'Public visitor collector must exist');
const source = readFileSync(collectorPath, 'utf8');
const storage = new Map();
const visitor = 'e62aa92b-e846-4b2f-a7f0-91dc3b0df482';
const event = '91126314-63a7-46ec-a158-a937728bca86';

async function visit({path = '/', hostname = 'lstc-dragon-dance.vercel.app', privacy = false, blockedStorage = false, visibility = 'visible', fail = false, duplicate = false} = {}) {
  const requests = [];
  const listeners = {};
  let generated = 0;
  const context = {
    window: {DRAGON_DANCE_SUPABASE:{url:'https://example.supabase.co',publishableKey:'public-key'}},
    location: {pathname:path,hostname},
    navigator: {globalPrivacyControl:privacy},
    document: {visibilityState:visibility, addEventListener:(name, fn) => { listeners[name] = fn; }},
    localStorage: {getItem:key => { if (blockedStorage) throw new Error('storage blocked'); return storage.get(key) ?? null; }, setItem:(key, value) => { storage.set(key, value); }},
    crypto: {randomUUID:() => (++generated === 1 && !storage.size ? visitor : randomUUID())},
    fetch: async (url, options) => { requests.push({url, ...options}); if (fail) throw new Error('offline'); return {ok:true}; },
    AbortController, setTimeout, clearTimeout
  };
  vm.runInNewContext(source, context);
  if (duplicate) vm.runInNewContext(source, context);
  await new Promise(resolve => setImmediate(resolve));
  return {requests, context, listeners};
}

const first = await visit({duplicate:true});
assert.equal(first.requests.length, 1, 'One event per document even if script is loaded twice');
assert.equal(first.requests[0].url, 'https://example.supabase.co/rest/v1/rpc/record_site_visit');
const body = JSON.parse(first.requests[0].body);
assert.equal(body.p_visitor_id, visitor);
assert.equal(body.p_page, 'home');
assert.deepEqual(Object.keys(body).sort(), ['p_event_id','p_page','p_visitor_id'], 'Do not send full URLs, queries, identity or client timestamps');
assert.equal(first.requests[0].credentials, 'omit');
assert.equal(first.requests[0].referrerPolicy, 'no-referrer');
assert.equal(first.requests[0].headers.apikey, 'public-key');
assert.equal(JSON.parse((await visit({path:'/index.html'})).requests[0].body).p_visitor_id, visitor, 'Refreshes reuse the anonymous browser ID');
assert.equal(JSON.parse((await visit({path:'/updates.html'})).requests[0].body).p_page, 'updates');
assert.notEqual(JSON.parse((await visit()).requests[0].body).p_event_id, body.p_event_id, 'Separate page loads have different event IDs');
for (const options of [{path:'/admin/'}, {path:'/heritage.html'}, {hostname:'localhost'}, {hostname:'preview.vercel.app'}, {privacy:true}, {blockedStorage:true}]) {
  assert.equal((await visit(options)).requests.length, 0, `Exclude ${JSON.stringify(options)}`);
}
const hidden = await visit({visibility:'hidden'});
assert.equal(hidden.requests.length, 0, 'Do not count background/prerendered tabs before they are viewed');
hidden.context.document.visibilityState = 'visible';
hidden.listeners.visibilitychange();
hidden.listeners.visibilitychange();
await new Promise(resolve => setImmediate(resolve));
assert.equal(hidden.requests.length, 1, 'Visibility changes cannot double count');
await visit({fail:true}); // A rejected analytics request must not become an unhandled rejection.

for (const file of ['index.html', 'updates.html']) {
  const html = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  assert.match(html, /<script[^>]+src="assets\/site-analytics\.js"/, `${file} must record public visits`);
}
const admin = readFileSync(new URL('../admin/index.html', import.meta.url), 'utf8');
assert.doesNotMatch(admin, /src="[^"\n]*site-analytics\.js"/, 'Admin visits are excluded');
assert.match(admin, /id="siteAnalytics"/, 'Statistics live inside the existing dashboard');
assert.match(admin, /DragonAnalyticsAdmin\.setSession/, 'Statistics follow the authenticated admin session');
const adminSource = readFileSync(new URL('../assets/admin-analytics.js', import.meta.url), 'utf8');
function dashboard(result) {
  const elements = Object.fromEntries(['siteAnalytics','analyticsRefresh','analyticsStatus','analyticsPeriod','totalVisitors','totalViews','todayVisitors','todayViews'].map(id => [id, {
    textContent:'', attributes:{}, events:{}, disabled:false,
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(name, fn) { this.events[name] = fn; }
  }]));
  const intervals = new Map();
  const context = {
    window:{}, Intl, Date, AbortController, setTimeout, clearTimeout,
    setInterval:fn => { intervals.set(1, fn); return 1; }, clearInterval:id => intervals.delete(id),
    document:{getElementById:id => elements[id], addEventListener() {}, visibilityState:'visible'}
  };
  vm.runInNewContext(adminSource, context);
  const client = {rpc:name => {
    assert.equal(name, 'get_site_analytics');
    return {abortSignal:() => result instanceof Promise ? result : Promise.resolve(result)};
  }};
  context.window.DragonAnalyticsAdmin.setSession(client, {id:'admin'});
  return {elements, intervals, api:context.window.DragonAnalyticsAdmin};
}
const totals = {total_visitors:1234,total_views:4567,today_visitors:12,today_views:34,started_at:'2026-10-24T01:00:00Z',generated_at:'2026-10-24T03:00:00Z'};
const ready = dashboard({data:totals,error:null});
assert.equal(ready.elements.siteAnalytics.attributes['aria-busy'], 'true');
assert.equal(ready.elements.analyticsRefresh.disabled, true);
await new Promise(resolve => setImmediate(resolve));
assert.equal(ready.elements.totalVisitors.textContent, '1,234');
assert.equal(ready.elements.todayViews.textContent, '34');
assert.match(ready.elements.analyticsStatus.textContent, /每分鐘自動更新/);
assert.equal(ready.elements.siteAnalytics.attributes['aria-busy'], 'false');
assert.equal(ready.elements.analyticsRefresh.disabled, false);
assert.equal(ready.intervals.size, 1);
ready.api.setSession(null, null);
assert.equal(ready.intervals.size, 0, 'Signing out stops automatic reads');
assert.equal(ready.elements.totalVisitors.textContent, '—', 'Signing out clears private aggregates');
const empty = dashboard({data:{...totals,total_visitors:0,total_views:0,today_visitors:0,today_views:0},error:null});
const missing = dashboard({data:null,error:{code:'PGRST202'}});
const invalid = dashboard({data:{...totals,total_views:null},error:null});
await new Promise(resolve => setImmediate(resolve));
assert.match(empty.elements.analyticsStatus.textContent, /尚未錄得/);
assert.equal(empty.elements.totalVisitors.textContent, '0', 'An empty database is genuinely zero');
assert.match(missing.elements.analyticsStatus.textContent, /尚未啟用/);
assert.equal(invalid.elements.totalViews.textContent, '—', 'An error or invalid data is never presented as zero');
assert.match(invalid.elements.analyticsStatus.textContent, /重試/);
let finish;
const pending = dashboard(new Promise(resolve => { finish = resolve; }));
pending.api.setSession(null, null);
finish({data:totals,error:null});
await new Promise(resolve => setImmediate(resolve));
assert.equal(pending.elements.totalVisitors.textContent, '—', 'A late response cannot reveal counts after sign-out');
assert.equal(pending.elements.analyticsStatus.textContent, '');
for (const fixture of [empty,missing,invalid]) fixture.api.setSession(null, null);
console.log('PASS: collector scope, anonymous identity, unique events, privacy/storage, visibility, network failures; dashboard loading/ready/empty/error, formatting, polling, sign-out and late-response protection.');
