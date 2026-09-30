# Dragon Dance Website Audit and Optimization Design

## Goal

Improve the Dragon Dance STEM Racing website in three controlled phases: fix measurable interaction and accessibility defects, reduce avoidable runtime and loading work, then refine the existing Fire-Dragon visual system for clearer desktop and mobile reading.

## Product truth and constraints

- Keep the approved Fire-Dragon dark theme, ember field, fog canvas, dragon mark and four-page horizontal pager.
- Keep Home, Fire Dragon, Crew and Partners in that order. Swipes, arrows, keyboard navigation, direct hash links and bilingual switching must continue to work.
- Keep English as the default language and Traditional Chinese as the alternate language.
- Keep the Tai Hang Fire Dragon Dance content factual, sourced and explicitly framed as cultural inspiration rather than an official affiliation.
- Keep Supabase update media compatible with both plain URL strings and JSON-encoded media metadata.
- Do not add a framework, build step, service key or private credential.
- Keep updates, admin authentication, contact links, sponsorship downloads and existing SEO surfaces working.

## Audit baseline

The live site currently has no browser console errors, no horizontal overflow at 320px, 390px or the default desktop viewport, and a successful Vercel deployment. The four pager slides, drag and keyboard navigation, language switching and Supabase update path were reproduced.

Measured weaknesses:

- Several mobile controls are below a 44px touch target, including language controls, copy-email and modal-close controls.
- Hidden pager panels need explicit focus/inert guarantees so controls from an inactive slide cannot enter the keyboard sequence.
- `assets/home.js` and `assets/home.css` are each roughly 46KB and currently combine pager state, language rendering, Supabase updates, contact modal, fog rendering and copy-to-clipboard behavior.
- The fog canvas and document-level pointer listeners run during the whole page lifecycle; the home-only height transition animates layout.
- Update media can be large and the loading/error/empty states are visually similar, making failure recovery unclear.
- The existing detector reports an incumbent height transition, gradient text and rounded border accent. These are documented as follow-up candidates; the first pass will not remove the approved Fire-Dragon visual language solely to satisfy a generic detector warning.

## Architecture

The site remains static HTML, CSS and browser JavaScript. Phase 1 introduces small shared helpers inside the existing extracted files rather than adding a runtime dependency. Pager state becomes the single authority for slide visibility, `aria-hidden`, `inert`, focus restoration and section visibility. Language dictionaries remain data-only and are validated by the existing verifier.

Phase 2 keeps the same public interfaces while separating concerns inside the existing local scripts: pager and language state, visual effects, updates rendering, and contact behavior become clearly bounded regions. Expensive effects are scoped to visible states, and image loading uses explicit dimensions, lazy loading where appropriate, and a recoverable error state.

Phase 3 changes tokens and layout rules only after the behavior and performance checks pass. It preserves the current composition and cultural artwork while tightening type scale, spacing, contrast, focus styling and narrow-screen reading flow.

## Phase 1 behavior

1. All interactive controls that visitors must tap are at least 44px in both dimensions, or have an explicit 44px hit-area wrapper.
2. When a slide is inactive, its root and descendants are removed from sequential focus with `inert`; when a slide becomes active, focus stays on the triggering control unless the user explicitly moved focus into the slide.
3. The active slide and its related content expose one coherent `aria-current`/`aria-pressed` state. The culture section is hidden only when its slide is inactive.
4. Updates show distinct loading, empty, unavailable and populated states. A failed Supabase request does not throw or leave a permanent loading message.
5. Modal open, close, Escape handling and focus return remain functional in both languages and at narrow widths.
6. `prefers-reduced-motion` keeps state changes understandable without continuous fog, swipe or entrance animation.

## Phase 2 behavior

1. The fog loop is paused when the hero is outside the viewport and does not collect pointer samples outside the active hero interaction.
2. Layout-affecting animation is removed or replaced with a non-thrashing state transition where the same hierarchy can be preserved.
3. Non-critical update and crew media are lazy, have stable aspect-ratio boxes, and do not shift surrounding content while loading.
4. The browser console remains free of uncaught errors when Supabase is unavailable, a media request fails, or local storage is inaccessible.

## Phase 3 behavior

1. English and Traditional Chinese copy fit at 320px, 390px, tablet and desktop widths without clipping or overlap.
2. Primary and secondary actions, section labels and body copy have a consistent hierarchy derived from the existing Fire-Dragon tokens.
3. Focus rings, selection color, link states and disclosure states are visible on dark surfaces.
4. The Fire Dragon artwork, timeline, source links and cultural disclaimer remain findable and readable within the second slide.

## Verification

Every phase runs the static verifier and `git diff --check`. Browser checks cover desktop, 320px and 390px widths; English and Traditional Chinese; all four slides; swipe, arrow and keyboard navigation; inactive-slide focus; modal open/close; update loading/empty/error/populated states; and the production URL after Vercel deployment. The final pass runs the Impeccable detector once on changed UI files and records false positives that belong to the approved incumbent theme.

## Out of scope

No new CMS, account flow, server API, framework migration, 3D showcase, paid service, analytics integration or replacement brand direction is included in this plan.
