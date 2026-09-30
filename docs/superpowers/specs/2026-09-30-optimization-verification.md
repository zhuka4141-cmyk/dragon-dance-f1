# Website optimization verification — 2026-09-30

## Automated checks

- `node tools/verify-homepage.mjs`: script syntax, bilingual keys, four slides, legacy redirect, removed exploration CTA, unique IDs, local assets, anchors and URL/JSON crop compatibility on both public media surfaces.
- `node tools/verify-updates.mjs`: published-only requests, Home's three-post limit, empty/error handling, timeout and abort, bilingual loading/empty/error/ready rendering, retry focus and failed-media fallback.
- `node tools/verify-effects.mjs`: one fog loop, pause offscreen/on other slides/hidden documents/reduced motion, static reduced-motion frame, restart and unavailable canvas.
- `git diff --check`: clean.

## Local browser checks

- All four pages, English and Traditional Chinese, at 320, 390, 768 and 1440px: no horizontal document overflow; no visible button or standalone link below the 44px target (1px measurement tolerance).
- Additional 320px check with browser minimum font size set to 24px: no document overflow in either language across all four pages. Temporary font/viewport overrides are reset after QA.
- Inactive hero/about/feature panels have inert; keyboard arrows, previous-page control and pointer drag select the expected pages. Home-only sections hide immediately and fog pauses on other pages.
- Contact modal isolates background focus, wraps Shift+Tab, closes with Escape and returns focus to its opener; 320px dialog content fits without internal horizontal overflow.
- Archive gallery opens above navigation, isolates background focus, wraps keyboard focus, supports Escape and returns focus to the media button. Five real archive posts create five cover previews, with no autoplay video.
- Blocked Supabase request yields an error and retry action rather than an empty message. Blocked SDK CDN yields the same recoverable state; unblocking and retrying loads all five archive posts.
- A mocked empty archive response renders the distinct empty message. Interception is cleared after the test; live data is never modified.
- Blocked storage media shows the bilingual fallback inside the preserved gallery frame.
- Emulated reduced motion pauses fog and removes pager transitions and smooth scrolling.
- Browser console showed no uncaught application errors in the checked flows. An attempted browser storage-denial override is unsupported by the browser tool; existing storage try/catch guards and disabled public auth persistence are retained, without claiming a live storage-denial test.

## Visual detector

The detector reported five incumbent-theme findings: the existing calendar border accent, gradient text, ember glow and radial halo. These belong to the approved Fire-Dragon direction and are preserved. The previous layout-height animation finding is resolved.
