// Optional dev-only PostgreSQL test: pass the installed @electric-sql/pglite entry path.
// No runtime dependencies are added to this static website.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const {PGlite} = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : '@electric-sql/pglite');
const db = new PGlite();
const admin = 'f456c281-29b1-4ef9-8ad9-caaeea274466';
const other = '3231cdb3-ef7b-4ffa-ab16-743ffbdd6611';
const visitor = 'e62aa92b-e846-4b2f-a7f0-91dc3b0df482';
const secondVisitor = '5e20a917-baf2-4082-818b-4a97207bca74';
const scalar = async sql => (await db.query(sql)).rows[0].value;
const claim = async id => db.query("select set_config('request.jwt.claims', $1, false)", [JSON.stringify({sub:id})]);
const forbidden = async sql => assert.rejects(db.query(sql), error => error.code === '42501');

try {
  // The hosted platform supplies these roles and auth objects. Reproduce only that boundary.
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, email text, email_confirmed_at timestamptz);
    create function auth.uid() returns uuid language sql stable as $$
      select (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')::uuid
    $$;
    insert into auth.users values
      ('${admin}', 'dragondance@lstc.edu.hk', now()),
      ('${other}', 'not-admin@example.com', now());
  `);
  const migration = readFileSync(new URL('../supabase/migrations/202610240001_site_analytics.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  const started = await scalar('select started_at::text as value from public.site_analytics_settings');
  await db.exec(migration);
  assert.equal(await scalar('select started_at::text as value from public.site_analytics_settings'), started, 'Rerunning setup preserves the original activation date');

  await db.exec('set role anon');
  await forbidden('select * from public.site_visits');
  await forbidden('select * from public.site_analytics_settings');
  await forbidden('select public.get_site_analytics()');
  await forbidden("insert into public.site_visits values (gen_random_uuid(), gen_random_uuid(), 'home', now())");
  await db.query('select public.record_site_visit($1, $2, $3)', ['91126314-63a7-46ec-a158-a937728bca86', visitor, 'home']);
  await db.query('select public.record_site_visit($1, $2, $3)', ['91126314-63a7-46ec-a158-a937728bca86', visitor, 'home']);
  await db.query('select public.record_site_visit($1, $2, $3)', ['17e12c8d-919b-4d2c-beb5-e30b2d9f371c', visitor, 'updates']);
  await assert.rejects(db.query('select public.record_site_visit(gen_random_uuid(), $1, $2)', [visitor,'admin']), error => error.code === '22023');
  await assert.rejects(db.query('select public.record_site_visit(null, $1, $2)', [visitor,'home']), error => error.code === '22023');
  await db.exec('reset role; set role authenticated');
  await claim(other);
  await forbidden('select public.get_site_analytics()');
  await forbidden('select * from public.site_visits');
  await claim(admin);
  let stats = await scalar('select public.get_site_analytics() as value');
  assert.equal(stats.total_visitors, 1, 'Repeated browsing does not create another visitor');
  assert.equal(stats.total_views, 2, 'The same event ID is idempotent but different page loads count');
  assert.equal(stats.today_visitors, 1);
  assert.equal(stats.today_views, 2);
  await forbidden('select * from public.site_visits');
  await db.exec('reset role');

  // 15:59:59 UTC is yesterday in Hong Kong; 16:00:00 UTC starts the next local day.
  await db.exec(`
    insert into public.site_visits values
      (gen_random_uuid(), '${secondVisitor}', 'home', (date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong') - interval '1 second'),
      (gen_random_uuid(), '${secondVisitor}', 'home', date_trunc('day', now() at time zone 'Asia/Hong_Kong') at time zone 'Asia/Hong_Kong');
  `);
  stats = await scalar('select public.get_site_analytics() as value');
  assert.equal(stats.total_visitors, 2);
  assert.equal(stats.total_views, 4);
  assert.equal(stats.today_visitors, 2, 'Today is calculated using the Hong Kong day boundary');
  assert.equal(stats.today_views, 3);

  await db.exec(`
    do $$ begin
      for i in 1..125 loop
        perform public.record_site_visit(gen_random_uuid(), '${visitor}', 'home');
      end loop;
    end $$;
  `);
  assert.equal(await scalar(`select count(*)::int as value from public.site_visits where visitor_id = '${visitor}' and visited_at >= now() - interval '1 minute'`), 120, 'Burst refreshes are capped per browser');
  const rls = await db.query("select relrowsecurity from pg_class where oid in ('public.site_visits'::regclass, 'public.site_analytics_settings'::regclass)");
  assert.ok(rls.rows.every(row => row.relrowsecurity));
  console.log('PASS: PostgreSQL migration, RLS, anonymous write-only RPC, admin authorization, event deduplication, unique visitors, Hong Kong date boundary, burst limit and idempotent setup.');
} finally {
  await db.close();
}
