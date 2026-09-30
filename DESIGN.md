# Dragon Dance — Fire Dragon Heritage

September 30 follow-up: the full cultural introduction now lives on `heritage.html`, using `assets/heritage.js` for its own language controls. Navigation and the remaining heritage hero action open this page. The race car exploration actions have been removed. Old `#heritage` links redirect to the new page; crew/partners links return to the corresponding homepage panel. Shared cultural styling and artwork remain unchanged.

The homepage preserves the approved Fire-Dragon identity. The September 2026 extension gives Tai Hang's living tradition a distinct editorial section without replacing the team's racing identity.

## Visual language

- Near-black incumbent surfaces, warm amber for cultural content, red for racing accents; white/cream primary text.
- Existing fog canvas, ember field and dragon mark remain the hero's central visual.
- The heritage section uses an original geometric incense-dragon drawing, labelled as an artistic interpretation. It is not a documentary photograph.
- Large two-line section headings lead into restrained readable text, an open drawing/history composition, a three-date timeline, native disclosure panels and a culture-to-engineering conclusion.
- Fonts inherit the existing system stack and Noto Sans TC; the extension does not introduce a font dependency.

## Navigation and layout

The visible header exposes team, fire dragon, crew and partners. Existing horizontal panels and keyboard/swipe support remain. Cultural content appears only on the home panel. At 1050px and below, section navigation moves to a second row with horizontal overflow available; its controls have a minimum 44px width and 46px height. Floating pager arrows are hidden at 800px and below so they cannot cover the text.

Desktop culture content uses two asymmetric columns within a 1360px maximum content width. At 800px and below, the main editorial compositions stack into a single reading column; the history date and copy retain a compact split until 480px. Mobile hero copy/actions precede the mark instead of overlapping it. New cultural elements add no animation, and their hover transitions are disabled for reduced motion.

## Content and accessibility

English is the default and Traditional Chinese is the alternate. All added copy, art descriptions and source labels switch together. Official source links are provided and local legend is distinguished from documented designation dates. The student team's cultural inspiration is not presented as an institutional affiliation.

Native buttons, anchors and details controls retain keyboard operation, visible focus and semantic state. The three craft disclosures are open by default. Offscreen hero slides are inert. Existing Supabase media parsing remains compatible with URL strings and JSON-encoded media objects.

## Files

`index.html` owns semantic content and metadata. `assets/home.css` and `assets/home.js` contain the extracted existing homepage styling/behaviour. `assets/heritage.css` contains the focused editorial and navigation extension. `assets/fire-dragon-procession.svg` is the original local art. No framework or build step is required.
