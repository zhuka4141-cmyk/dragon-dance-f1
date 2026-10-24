# Website visitor statistics

Requested: show website visitor counts in the existing admin dashboard.

Scope: four metrics (all-time visitors/views, today's visitors/views), using the existing Supabase project and the current admin identity. Keep the current design and content.

1. Add an anonymous public-page collector with persistent browser UUIDs. Only count the production homepage and updates archive; omit admin, preview/local environments, private URL parameters, and visitors with privacy opt-outs. Never block page use on tracking failure.
2. Add Supabase tables and narrowly scoped RPCs. Server timestamps, event deduplication, browser-level burst limiting, table RLS, and administrator-only aggregates. Record the feature activation date; never invent historical counts.
3. Add an accessible statistics section above the editor, loading/error/empty states, automatic minute refresh and manual retry. Cancel requests on sign-out.
4. Verify collector behavior, SQL permissions/deduplication/date boundaries, existing website checks, and desktop/mobile dashboard rendering. Execute the migration using the owner's Supabase login.
5. Update project handover, commit and push main. Verify deployment and production RPC access without retaining synthetic visits.

Visitor counts are approximate unique browsers. Devices, private browsing and storage resets may count separately; visitors who block analytics are excluded. No IP addresses or personal profiles are stored.
