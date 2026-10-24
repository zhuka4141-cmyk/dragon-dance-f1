# Visitor statistics verification — 2026-10-24

## Scope

Four administrator-only counts: all-time anonymous browsers/page views and today's anonymous browsers/page views. No public content or visual theme redesign. Counts begin at database activation; they cannot recover past traffic.

## Completed checks

- `node tools/verify-analytics.mjs`: PASS — production route scope, persistent browser identity, unique event IDs, visibility deduplication, privacy/storage exclusions, network failure isolation; dashboard loading, ready, zero, invalid/error/setup states, number formatting, polling, sign-out and stale response protection.
- `node tools/verify-analytics-sql.mjs <PGlite entry>`: PASS — real isolated PostgreSQL migration, idempotent setup, RLS, anonymous collection, restricted raw tables and aggregates, confirmed admin, duplicate event handling, unique browsers, Hong Kong date boundary and burst limiting. Test-only platform auth objects are simulated in the isolated runtime.
- `node tools/verify-homepage.mjs`: PASS.
- `node tools/verify-updates.mjs`: PASS.
- `node tools/verify-effects.mjs`: PASS.
- `git diff --check`: PASS (Git's existing CRLF advisory is informational).
- Desktop and mobile browser previews: four-column / two-column metrics, readable notes, normal focus and 44px refresh target; no horizontal overflow. Preview counters were clearly labeled synthetic and never sent to production.
- Browser network/error/retry view: four em dashes, clear recovery text, enabled retry control, no console errors.
- Independent finish review: no material findings. Existing approved theme warnings from the one mechanical detector pass were intentionally preserved.

## Hosted database

Migration `202610240001_site_analytics.sql` executed successfully in the correct Supabase project. A hosted PostgreSQL transaction verified real administrator identity and permissions, +1 distinct browser / +2 views from two unique events, duplicate event idempotence, today's counters and table RLS. All synthetic data and test JWT claims were rolled back.

Public REST tests returned HTTP 401 / `42501` for aggregate and raw-table reads, and HTTP 400 / `22023` for an invalid page category. No service-role key is used in the public site or admin client.

## Deliberate limits

These are approximate unique browsers, not a person-identification service. Privacy tools, disabled storage and network failures can exclude visits; device/storage changes may add a new visitor. Browser-level rate limiting bounds accidental refresh loops, not adversarial bot traffic. Distinct counts scan stored visits; introduce rollups only if the small site's traffic makes this measurably expensive.
