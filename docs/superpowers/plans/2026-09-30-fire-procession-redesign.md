# Fire procession visual redesign

**Goal:** Deliver the owner's requested bolder, more attractive fire-dragon website, with a visible redesign across the four existing horizontal pages.

**Direction:** The route of a fire-dragon procession becomes an illuminated, sculptural line. Oversized festival typography and a moving incense dragon occupy the first viewport; the same amber route joins navigation, history, crew and partnerships. Keep the recognisable dark Fire-Dragon identity and original team mark.

**Design exploration:** Night procession light sculpture; rattan-workshop specimens; procession-route cartography; Hong Kong festival poster; race pitlane timing tower; drum-cadence score; long-exposure harbour ribbons. The direction seed assigned procession-route cartography (da9d1311), developed as an artistic route of incense rather than a geographically accurate street map. Brick instructions and memory quilts communicate craft but dilute the requested night-time energy; title-card graphics inform typography without replacing the fire-dragon brief.

**Architecture:** Static local SVG artwork, a bounded Canvas light animation, and one scoped visual stylesheet. Existing pager, modal, feed and admin mechanics remain authoritative. Local display fonts; no framework or new runtime dependency.

## Implementation

- [x] Author the incense-dragon geometry and local display assets; recompose Home and Heritage around the artwork.
- [x] Apply the new navigation, page position strip, crew/partner compositions and lower-page visual system; retain all bilingual content and working actions.
- [x] Add reduced-motion/visibility-aware motion; run existing regression checks and desktop/mobile interaction checks.
- [x] Run a separate finish review, record the built design, publish to GitHub and verify Vercel.

## Constraints

Four horizontal pages; English/Traditional Chinese; no returned race-car exploration button; no invented claims or sponsors; no broad oval fog rings; clear artwork interpretation; accessible targets, focus and reduced motion; preserve Supabase media representations and error recovery.

## Finish review

Independent verdict: **Approved for publication**. Contract fit, artwork, bilingual typography, mobile composition and source behavior passed. Findings resolved: lower-page content is visible by default; redundant decorative kickers removed; overview uses a balanced heading/copy split. No unresolved material visual defect. Reviewer used source and screenshots; parent verified interactions.

Published implementation: `ac2ae86027d2987f8b4e206365ba4a3a7756e978`. GitHub Vercel check reports success; production browser confirms the new illustration, visual stylesheet and four route controls, with no console errors.

Validation: all four Node verification scripts pass. Desktop 1440px and mobile 390px/320px inspected; route buttons, actual swipe, keyboard arrows, language persistence and reduced-motion CSS checked. Browser console reported no errors. Detector's remaining gradient-text warning is intentional in the fire identity; portrait border warning is a false positive on square images; inherited archive halo rules are overridden by solid surfaces.
