# Dragon Dance Website Handover

Last updated: 2026-10-24

## Website Visitor Statistics

- `assets/site-analytics.js` records anonymous browser visits to the production homepage (`/` and `/index.html`) and `/updates.html`. It excludes admin, the compatibility redirect, localhost and preview hosts. Background tabs count only when first viewed. Global Privacy Control / Do Not Track and blocked storage are respected. Failures never block the website.
- A random UUID in local storage identifies an approximate unique browser; different devices, private browsing and clearing storage can create new visitors. Visit rows store an event UUID, anonymous browser UUID, the `home`/`updates` page category and a server-generated timestamp. No IP address, full URL, query parameters, email or other personal profile is stored in analytics tables.
- Setup: execute `supabase/migrations/202610240001_site_analytics.sql` in the SQL editor of project `csnleawnckocalvggvdf`. It creates `site_visits`, `site_analytics_settings`, `record_site_visit` and `get_site_analytics`. The migration is safe to rerun and preserves the first activation date. The dashboard explicitly shows setup is pending if the RPC has not been installed; it never substitutes fake zero totals.
- Production database setup was applied on 2026-10-24. Hosted transaction tests passed for the confirmed admin identity, unique visitors, duplicate event handling, daily counters and RLS; synthetic visits were rolled back. Real REST checks rejected anonymous aggregate/raw-table reads (401 / `42501`) and invalid public page categories (400 / `22023`).
- Raw tables have RLS enabled and no public/admin-client read or write grants. The public RPC only records visits; the aggregate RPC requires the confirmed `dragondance@lstc.edu.hk` account, verified by `auth.uid()` against `auth.users`. A primary key deduplicates repeated event IDs, server time determines visit dates, and a browser-level 120-per-minute limit bounds accidental refresh loops. This is a small-site counter, not a bot-proof analytics platform.
- The existing admin dashboard includes all-time unique browsers/page views and today's unique browsers/page views. Dates use `Asia/Hong_Kong`; totals start when the database setup is enabled and do not reconstruct historical traffic. `assets/admin-analytics.js` handles loading, empty, unavailable and setup states, refreshes once a minute while visible, and clears/cancels private counts on sign-out. It does not change update editing or media behavior.
- `supabase/` is excluded from Vercel's static output. Never expose a service-role key to make statistics work.
- Checks: `node tools/verify-analytics.mjs` exercises collector and dashboard states; existing homepage, updates and effects checks still apply. `node tools/verify-analytics-sql.mjs <absolute-path-to-@electric-sql/pglite/dist/index.js>` optionally validates the migration in an isolated PostgreSQL runtime, with simulated Supabase auth objects and no writes to production.

## Public Website Optimization

- The owner approved the audit/design in `docs/superpowers/specs/2026-09-30-website-audit-optimization-design.md`; implementation preserves the four-slide pager and Fire-Dragon theme.
- `assets/updates-feed.js` is shared by Home and the archive. It loads the optional Supabase SDK asynchronously with an 8-second limit, times out/aborts data requests after 12 seconds, and provides separate bilingual loading/empty/error/retry states. Public reads disable auth persistence so blocked local storage does not break the feed. The admin script remains unchanged.
- Home requests only three published posts. Archive cards request only the cover; additional media load when the gallery opens. Videos are user-controlled, and media errors preserve the frame with a readable fallback. URL/JSON media parsing and crop metadata remain compatible.
- All inactive hero/about/feature panels are inert; contact and gallery dialogs isolate the background, trap keyboard focus, support Escape, and return focus. Gallery overlays now sit above the navigation.
- Fog pauses outside Home, below the hero, in hidden tabs and with reduced motion. Reduced motion keeps one static frame. Pointer sampling is scoped to the hero. Home-only content no longer animates height.
- `assets/public-ui.css` contains shared 44px controls, focus rings, contrast improvements, responsive dialogs and long-text wrapping. Mobile heritage navigation no longer shrinks language controls below 44px.
- Verify with `node tools/verify-homepage.mjs`, `node tools/verify-updates.mjs`, `node tools/verify-effects.mjs`, and `git diff --check`; then browser-check the homepage and archive.

## Horizontal Heritage Page — Corrected Requirement

- The owner clarified that a separate page means another horizontal pager slide, exactly like Crew and Partners, not a separate document. Current order: Home (0), Fire Dragon (1), Crew (2), Partners (3).
- Removed the homepage race car exploration button and the culture section's race car exploration link. The actual racing content remains on the homepage.
- `index.html` holds the heritage title slide and full cultural detail panel, visible only when page index 1 is active. All translations and navigation run through `assets/home.js`. Existing about/feature panels use explicit `data-page-panel` indexes so Crew and Partners retain their content.
- `heritage.html` is only a compatibility redirect to `index.html#heritage`; the separate language script has been removed. Hash links select the relevant slide. The static verifier checks four slides, panel mappings, bilingual coverage, and that the racing exploration entry remains absent.

## September 2026 Heritage Refactor

- Homepage now links the team story with Tai Hang Fire Dragon Dance: origin legend, 1880/2011/2017 timeline, craft, incense, collective rhythm and the connection to engineering. English and Traditional Chinese copy are complete.
- Header now exposes Team, Fire Dragon, Crew and Partners directly. Existing horizontal panels still work. On mobile, floating pager arrows are hidden because they otherwise cover the copy.
- `assets/home.css` and `assets/home.js` were extracted from `index.html`. Future homepage behaviour changes belong in `assets/home.js`; preserve media compatibility functions there. `updates.html` and `admin/index.html` retain their existing implementations.
- `assets/heritage.css` contains responsive culture/navigation styles. `assets/fire-dragon-procession.svg` is original geometric artwork, explicitly labelled as an interpretation. Do not relabel it as a photograph or evidence of an actual procession.
- Official references: `https://www.icho.hk/en/web/icho/representative_list_taihang.html`, `https://firedragon1949.org.hk/en/inherit-the-fire-dragon-culture/`, and the Hong Kong Tourism Board's Tai Hang Fire Dragon Dance article. Designations are national (2011) and Hong Kong representative-list (2017), not UNESCO.
- Run `node tools/verify-homepage.mjs` and `git diff --check` before publishing. The verifier checks bilingual coverage, anchors, asset existence, syntax and both Supabase media representations.
- `DESIGN.md` records the extended visual language. Internal documentation remains excluded from Vercel through `.vercelignore`.

This file is the durable project memory for a new computer or a new Codex session. Read it before changing the website.

## Live Services

- Public website: https://lstc-dragon-dance.vercel.app/
- Public updates page: https://lstc-dragon-dance.vercel.app/updates.html
- Admin dashboard: https://lstc-dragon-dance.vercel.app/admin/
- GitHub repository: https://github.com/zhuka4141-cmyk/dragon-dance-f1
- Deployment: Vercel deploys automatically when `main` is pushed.
- Supabase keepalive: `.github/workflows/supabase-keepalive.yml` queries the public `updates` endpoint once per day and can also be run manually from GitHub Actions. It uses only the publishable key already used by the public site.
- Supabase project reference: `csnleawnckocalvggvdf`
- Supabase configuration file: `supabase-config.js`
- Admin login email: `dragondance@lstc.edu.hk`

Passwords, Supabase owner access, GitHub login, Vercel login, recovery codes, and any service-role key are intentionally not stored in this repository. Keep access to those accounts before reinstalling Windows.

## Reinstall And Continue

1. Install Git, Node.js, and Codex on the new computer.
2. Sign in to GitHub, Vercel, Supabase, and Codex with the existing accounts.
3. Clone the repository:

   ```powershell
   git clone https://github.com/zhuka4141-cmyk/dragon-dance-f1.git
   cd dragon-dance-f1
   ```

4. Open this folder in Codex. `AGENTS.md` and this file provide the project context automatically.
5. Check that `main` is current with GitHub. Pushing to `main` should trigger Vercel.
6. Open the public site and `/admin/` after the first deployment check.

The complete source code, static assets, Git history, and the latest bug fixes are already in GitHub. Supabase database rows and files uploaded through the dashboard live in Supabase Storage, not in Git. They remain online as long as the Supabase project and its account access are retained.

## Copy-Ready Prompt For A New Codex

```text
Take over the Dragon Dance STEM Racing website. Read AGENTS.md and PROJECT_HANDOVER.md first, then inspect the current Git status before editing. Keep the approved Fire-Dragon dark theme and publish verified website changes to GitHub main so Vercel deploys automatically. Do not expose credentials or revert the Fire-Dragon visual direction without asking.
```

## Architecture

| File or service | Responsibility |
| --- | --- |
| `index.html` | Homepage, bilingual UI, dragon/fog hero, horizontal pages, deadlines, contact modal, and the three latest updates. |
| `updates.html` | Full public updates archive and media gallery. |
| `admin/index.html` | Password-protected Supabase admin dashboard for creating, editing, pinning, and deleting updates. |
| `supabase-config.js` | Public Supabase URL and publishable key used by the three pages. |
| `assets/` | Dragon icon, team photos, contact icons, PDF, and local FFmpeg worker. |
| Supabase table `updates` | Update text, date, pin state, cover URL, and media metadata. |
| Supabase Storage bucket `updates` | Uploaded update images and videos. |

There is no package manager, build command, or server-side app. Vercel serves these files as a static website.

## Current Website Features

- English by default with Traditional Chinese switching and transition animation.
- Homepage hero with the Fire-Dragon dark theme, Dragon Dance logo, rising ember particles, fog interaction, gradient dragon mark, and left/right page navigation.
- Team and sponsor pages in the horizontal homepage flow.
- Contact footer for email, WhatsApp, Instagram, and the school website.
- SEO metadata, sitemap, robots file, favicon, Open Graph image, and Google Search Console verification markup.
- Deadline cards for the online file and car handover dates.
- Latest updates preview on the homepage and a complete archive page.
- Admin dashboard with Supabase email/password login, automatic current date, manual date adjustment, pinning, image/video upload, compression, individual media removal, crop positioning, and deletion of storage files with the update.

## Update Media Data: Important Detail

The `updates.image_urls` database column can return media entries in two valid forms:

```json
"https://example.com/photo.webp"
```

or, because of the existing database representation:

```json
"{\"url\":\"https://example.com/photo.webp\",\"type\":\"image/webp\",\"positionX\":50,\"positionY\":50,\"scale\":1}"
```

The second example is a JSON object stored as a string. On 2026-07-27 it caused broken update thumbnails and admin previews because code treated that whole string as an image URL. Commit `14bf8d8` fixed this with `parseMediaEntry()` in all three pages:

- `index.html`
- `updates.html`
- `admin/index.html`

Do not remove that compatibility logic. Whenever media logic is modified, test both formats.

Media limits implemented by the dashboard:

- Up to 8 media items per update.
- Images are optimised in the browser before upload.
- MP4/WebM files at or below 50 MB may upload directly.
- Larger video files attempt client-side FFmpeg compression; original files above 150 MB are rejected.

## Visual Decisions Already Made

- The team name used publicly is Dragon Dance STEM Racing. "F1 in Schools" may appear only as historical/SEO context; the public category is STEM Racing.
- The current production design is the approved "Fire-Dragon" dark theme (deployed 2026-08-31, commit `fa39854`): a dark theme with CSS variables, rising ember particles over the hero, a gradient-text dragon mark, the fog canvas retained, and modern rounded cards/pills/glass surfaces. This replaced the earlier plain high-contrast look. Treat this as the current visual direction; do not revert to older styles without asking.
- The homepage fog should still be visibly present and dynamic, layered under the ember field. The user dislikes clear oval or elliptical smoke rings.
- Mobile controls should not prevent normal vertical page scrolling.
- Keep the website dense and professional; the Fire-Dragon theme's rounded cards/pills/glass styling is the approved modern look.

## Useful Verification

Run these after relevant changes:

```powershell
git diff --check
git status --short
```

Then manually check:

1. Homepage in English and Traditional Chinese.
2. Horizontal page navigation on desktop and mobile.
3. Latest update cards and the full updates page.
4. Admin login, media preview, crop editor, save, delete, and pin behaviour when changing the dashboard.
5. Browser console errors on the affected page.

## Current Git State

- Branch: `main`
- Latest relevant commit: `fa39854 Apply Fire-Dragon dark theme redesign`
- The working tree was clean when this handover was written.

## How To Work With The Owner

- The owner normally wants direct implementation, verification, GitHub push, and Vercel deployment in one task.
- Communicate in Chinese, preferably Traditional Chinese for website/admin text.
- Do not repeat generic feature suggestions that were already discussed.
- If a new visual direction is unclear, ask for a screenshot or one focused decision before doing a broad redesign.
