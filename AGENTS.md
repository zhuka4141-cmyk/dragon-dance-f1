# Dragon Dance Website Guidance

Read `PROJECT_HANDOVER.md` before making changes. It is the current project memory and handover record.

## Project rules

- This is a static HTML/CSS/JavaScript website. There is no build tool or framework.
- Keep changes scoped to the requested feature. Do not redesign the whole site or remove existing content without permission.
- The owner wants GitHub and Vercel updated after completed, verified website changes.
- Use `apply_patch` for manual file edits. Do not discard user changes or use destructive Git commands.
- Before publishing, run `git diff --check` and check the affected page in a browser where practical.
- The public website is multilingual: nine languages (English, Traditional Chinese, Simplified Chinese, Japanese, Korean, Spanish, French, German, Portuguese). English is the default and stays inline in the markup; every other language is a separate dictionary in `assets/i18n/<code>.js` loaded on demand.
- `assets/i18n.js` owns detection and switching. Resolution order is `?lang=`, then `localStorage['dragon-dance-language']`, then `navigator.languages`, then English. Only an explicit pick is persisted. Add a language by adding one `META` entry plus one dictionary file; never hand-wire per-page language buttons.

## Important compatibility rules

- The current production homepage uses the approved Fire-Dragon dark theme: rising ember particles, a gradient dragon mark, and the fog canvas layered together. Keep this visual direction; do not revert it or add broad oval/elliptical fog rings without asking the owner.
- Supabase `updates.image_urls` may contain either normal URLs or JSON strings that describe `{ url, type, positionX, positionY, scale }`. Keep `parseMediaEntry`, `mediaUrl`, and `normaliseMediaEntries` compatible with both forms in `index.html`, `updates.html`, and `admin/index.html`.
- Do not put passwords, recovery codes, service-role keys, or private account credentials into Git.
