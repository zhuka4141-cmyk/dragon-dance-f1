# Dragon Dance — Fire Dragon Heritage

September 30 clarification: Fire Dragon is the second horizontal slide in the homepage's existing pager, between Home and Crew, followed by Partners. The cultural introduction appears beneath its own title slide. Arrows, swipes, keyboard and header controls use the same interaction as the existing panels. `heritage.html` only redirects older links to `index.html#heritage`. Race car exploration actions remain removed.

The homepage preserves the approved Fire-Dragon identity. The September 2026 extension gives Tai Hang's living tradition a distinct editorial section without replacing the team's racing identity.

## Visual language

- Near-black incumbent surfaces, warm amber for cultural content, red for racing accents; white/cream primary text.
- Existing fog canvas, ember field and dragon mark remain the hero's central visual.
- The heritage section uses an original geometric incense-dragon drawing, labelled as an artistic interpretation. It is not a documentary photograph.
- Large two-line section headings lead into restrained readable text, an open drawing/history composition, a three-date timeline, native disclosure panels and a culture-to-engineering conclusion.
- Fonts inherit the existing system stack and Noto Sans TC; the extension does not introduce a font dependency.

## Navigation and layout

The visible header exposes team, fire dragon, crew and partners. All four entries select horizontal slides. Cultural content appears only on the Fire Dragon slide. At 1050px and below, section navigation moves to a second row with horizontal overflow available; its controls have a minimum 44px width and 46px height. Floating pager arrows are hidden at 800px and below so they cannot cover the text.

Desktop culture content uses two asymmetric columns within a 1360px maximum content width. At 800px and below, the main editorial compositions stack into a single reading column; the history date and copy retain a compact split until 480px. Mobile hero copy/actions precede the mark instead of overlapping it. New cultural elements add no animation, and their hover transitions are disabled for reduced motion.

## Content and accessibility

English is the default and Traditional Chinese is the alternate. All added copy, art descriptions and source labels switch together. Official source links are provided and local legend is distinguished from documented designation dates. The student team's cultural inspiration is not presented as an institutional affiliation.

Native buttons, anchors and details controls retain keyboard operation, visible focus and semantic state. The three craft disclosures are open by default. Offscreen hero slides are inert. Existing Supabase media parsing remains compatible with URL strings and JSON-encoded media objects.

## Files

`index.html` owns semantic content and metadata. `assets/home.css` and `assets/home.js` contain the extracted existing homepage styling/behaviour. `assets/heritage.css` contains the focused editorial and navigation extension. `assets/fire-dragon-procession.svg` is the original local art. No framework or build step is required.

## September 30 optimization

`assets/public-ui.css` now provides shared public-page touch targets, warm amber keyboard focus, readable muted text, media fallback surfaces and reduced-motion rules. Interactive controls are at least 44px. Contact dialogs scroll within short viewports and long email addresses wrap rather than shrink. The approved gradients, fog and fire accents remain intentional.

Inactive hero and detail panels are inert. Both contact and media dialogs isolate background focus and return focus on closing. Home-only sections switch directly without animating layout height. Fog runs only on a visible Home hero in a visible document, and reduced-motion users receive a static frame.

`assets/updates-feed.js` owns the shared optional SDK loader, bounded published-post request and distinct bilingual loading, empty, error/retry and ready states. A failed CDN cannot block navigation. Home requests three posts; archive cards load only a cover until the visitor opens the gallery. Videos use explicit playback controls in the gallery; previews no longer autoplay or rotate on timers.
