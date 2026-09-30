# Dragon Dance Website Handover

Last updated: 2026-09-30

## Separate Heritage Page Follow-up

- The owner requested the full fire dragon introduction on its own page. It now lives in `heritage.html` with independent bilingual behaviour in `assets/heritage.js`; the homepage retains only its cultural framing and links.
- Removed the homepage race car exploration button and the culture section's race car exploration link. The actual racing content remains on the homepage.
- Old `/#heritage` links redirect to `heritage.html`. The culture page links back to the homepage and its `#crew` and `#partners` panels. Language preference is shared across both pages.
- `sitemap.xml` includes the new canonical page. The static verifier checks both pages and confirms the former exploration button is absent.

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
