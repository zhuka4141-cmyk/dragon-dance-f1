---
name: Dragon Dance — Fire Procession
description: Incense light, festival lettering and collective movement for a Hong Kong student STEM Racing team.
colors:
  soot: "#0b0a08"
  soot-raised: "#11100d"
  surface: "#191611"
  surface-raised: "#211c15"
  editorial-surface: "#17130e"
  paper: "#f6eddc"
  muted: "#b6ac9b"
  quiet: "#a69b87"
  ember: "#df4a26"
  ember-ink: "#f49463"
  incense: "#f2bb73"
  incense-hover: "#ffdaad"
  action-ink: "#21130a"
  focus: "#ffd185"
  hairline: "#bba27922"
  hairline-strong: "#bba27942"
typography:
  display:
    fontFamily: "Procession, 'Arial Narrow', sans-serif"
    fontSize: "clamp(112px, 12.7vw, 190px)"
    fontWeight: 800
    lineHeight: 0.85
    letterSpacing: "-0.015em"
  display-tc:
    fontFamily: "ProcessionTC, 'Noto Serif TC', serif"
    fontSize: "clamp(90px, 9.3vw, 142px)"
    fontWeight: 900
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Procession, 'Arial Narrow', sans-serif"
    fontSize: "clamp(58px, 6.7vw, 98px)"
    fontWeight: 800
    lineHeight: 0.97
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', 'Helvetica Neue', 'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', sans-serif"
    fontSize: "15px"
    lineHeight: 1.75
  label:
    fontSize: "11px"
    letterSpacing: "0.12em"
rounded:
  flat: "0"
  control: "2px"
  surface: "3px"
  dialog: "4px"
spacing:
  gutter-desktop: "6.3vw"
  gutter-mobile: "7vw"
  action-gap: "16px"
  section: "96px"
components:
  button-primary:
    backgroundColor: "{colors.incense}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.control}"
    padding: "17px 22px"
  button-primary-hover:
    backgroundColor: "{colors.incense-hover}"
    textColor: "{colors.action-ink}"
  button-route-link:
    backgroundColor: "transparent"
    textColor: "#eccc98"
    rounded: "{rounded.flat}"
    padding: "12px 0"
  button-route-link-hover:
    textColor: "#fff0d2"
  editorial-card:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    rounded: "{rounded.flat}"
  route-nav:
    backgroundColor: "#0b0a08e8"
    textColor: "#9d9281"
    height: "76px"
  pinned-tag:
    backgroundColor: "rgba(224,24,35,.14)"
    textColor: "{colors.ember-ink}"
    rounded: "{rounded.control}"
    padding: "5px 9px"
  disclosure:
    textColor: "{colors.paper}"
    padding: "23px 0"
---

# Design System: Dragon Dance — Fire Procession

## Overview

**Creative North Star: "The Incense Procession"**

The built September 30 redesign turns a winding dragon into a sculpture of woven incense light. Monumental festival lettering, warm soot backgrounds and restrained fog create the energy of a night procession. Authentic team portraits and a vermilion partnership poster connect that cultural atmosphere to the student team.

This records the implementation, replacing the earlier heritage-extension description. The homepage loads `assets/home.css`, `assets/heritage.css`, `assets/public-ui.css`, then `assets/procession.css`. The first two retain foundational layout and behavior-related styles; `procession.css` overrides their former cool-black palette, large card radii, central logo scene and display hierarchy. It is the current visual authority. The archive loads its inline base, `public-ui.css`, then the same procession stylesheet. Existing interaction code remains authoritative; the new decorative layer does not drive navigation.

**Key Characteristics:**
- Warm soot and paper with incense gold and vermilion emphasis.
- Tall condensed English display lettering paired with substantial Traditional Chinese serif display lettering.
- An original static incense dragon enhanced by bounded moving lights.
- Open editorial rows, hairline dividers and almost square surfaces.
- Four distinct horizontal scenes sharing one numbered route.

## Colors

The palette is warm throughout: pale paper and amber emerge from brown-black surfaces, while ember red gives the partnership composition its strongest interruption.

### Primary

- **Incense gold:** primary discovery action, route emphasis, cultural dates and the dragon's light. The brighter hover variant makes the primary action legible as an interactive object.
- **Ember / ember ink:** racing and supporting accents. The poster and proposal panel use closely related local vermilion values already defined in the stylesheet; retain those contextual surface variants.

### Neutral

- **Soot / soot raised:** homepage and archive foundations.
- **Surface / surface raised / editorial surface:** quiet tonal separation for content, fallbacks and larger editorial bands.
- **Paper / muted / quiet:** reading hierarchy. Local contextual text colors tune this hierarchy on the hero, cultural content and archive.
- **Hairline / hairline strong:** warm transparent borders that separate content without raised containers.
- **Focus:** a clear amber keyboard outline supplied by shared public controls.

**The Incense Rule.** Glowing light belongs to the dragon, its route and selected emphasis. It represents burning incense; it must not imply a fantasy dragon breathing flame.

## Typography

**Display Font:** self-hosted Barlow Condensed ExtraBold (800), exposed as `Procession` from `assets/fonts/procession-display.woff2`, with Arial Narrow and sans-serif fallbacks.

**Traditional Chinese Display Font:** a self-hosted Noto Serif TC Black (900) subset, exposed as `ProcessionTC` from `assets/fonts/procession-chinese.woff2`. This is a subset for the implemented text, not full CJK coverage; extend it when adding unsupported display copy. Both local faces use `font-display: swap`; the English face is preloaded on the homepage. Font licenses are stored beside them.

**Body Font:** the existing system sans-serif stack. Traditional Chinese body text continues to prefer Noto Sans TC, PingFang TC and Microsoft JhengHei. The existing Google Fonts Noto Sans TC stylesheet remains; only the new display faces are self-hosted.

English hero display is tightly stacked, uppercase and monumental; its second line carries a gold-to-ember gradient. Chinese display uses its own larger line height and responsive sizes. Do not force Latin compression onto Chinese glyphs. The large, faint rotated 龍 is atmospheric artwork, not body copy.

### Hierarchy

- **Display:** hero titles. The frontmatter records desktop English and Chinese Home values; translated slides have explicit local sizing.
- **Headline:** culture and lower-page editorial headings use the condensed family at smaller fluid sizes. Chinese heritage headings switch to the serif face.
- **Body:** hero copy is compact and readable; overview paragraphs enlarge to 17px with a 1.85 line height and a 65ch limit. Cultural introductions allow a 1.9 line height.
- **Label:** compact tracked navigation, dates, roles and provenance. Redundant decorative eyebrows and section labels are suppressed by the final stylesheet; useful race class/year metadata remains.
- **Archive titles:** the archive masthead uses condensed display; individual post headings preserve readable sans-serif.

## Layout

Home, Fire Dragon, Crew and Partners remain four horizontal homepage pages, in that order. Header and numbered bottom route select the same active page as arrows, keyboard and swipe gestures. Each page exposes its corresponding lower content. Fire Dragon retains this navigation model; `heritage.html` is a compatibility redirect.

On desktop, oversized copy occupies the left and a substantial composition occupies the right: dragon art on Home and Fire Dragon, three staggered real crew portraits on Crew, and the angled partner poster on Partners. The shared scene height is `clamp(760px, calc(100svh - 80px), 1000px)`. Main content uses the documented desktop gutter; the header uses its own 5.7vw inset. The bottom route reserves space for circular arrows. Heritage content pairs artwork and history in a 1.1fr / .9fr split before timeline and disclosure rows. The final overview composition places its title left and copy/facts right, with inherited double padding removed. Lower sections are visible without waiting for scroll-reveal animation.

At 1050px, header and hero proportions tighten. At 800px and below, copy precedes artwork, editorial compositions and overview content stack, the route becomes four compact number/label controls, and circular pager arrows disappear. Scene height becomes 1020px, then 960px at 480px. The final mobile art override is 110% width with a -5% right offset; earlier wider values are superseded. Crew member cards retain a two-column mobile layout. Chinese titles have explicit mobile size and line-height overrides.

The archive preserves the type, palette, gutters and near-square media treatment. Media/copy rows become one column below 800px; it remains a reading surface.

## Elevation & Depth

The redesign is predominantly flat. Warm tonal bands, fine dividers, large art, angled compositions and localized light provide depth. Navigation, primary buttons, update previews, crew cards and partner rows remove old box shadows. Contact dialogs retain their base modal shadow; archive overlays retain dimming and blur. Functional overlays are not a general card style.

**The Static First Rule.** The original `assets/incense-dragon.svg` remains visible independently of Canvas. Decorative failure or reduced motion must leave a complete composition.

`assets/procession.js` enhances only the active Home or Fire Dragon scene with 80 sprite lights along a sampled path, drawn at no more than 30fps with device pixel ratio capped at 1.5. It stops and clears when the hero is out of view, the document is hidden, motion is reduced, or Crew/Partners is active. Fine-pointer drift is bounded to ±6px horizontally and ±4px vertically. Reduced motion removes drift and hides the light canvases. The softer Home fog stays underneath; the former global spark field, hero ember field, central halo and trails are hidden by the new layer. Archive incense dots retain existing CSS animation and reduced-motion treatment; the Canvas loop does not control them.

## Shapes

Editorial cards and rows are square, controls and media have small corners, and the contact dialog has a slightly softer corner. Round shapes are reserved for light particles, the pearl and functional pager/gallery controls. Preserve small-radius, hairline treatments. Old pill values survive in residual controls such as retry buttons; they are not the new global direction.

Crew uses three existing photographs, staggered and rotated together by -4 degrees, with warm lower borders and partial grayscale. The partner poster rotates by 5 degrees and uses dragon art as a subtle screen-blended texture. These are specific scene compositions, not transformations for every card.

## Components

### Buttons

The primary discovery button is a pale incense rectangle with dark lettering, a small arrow, minimum 54px height and a 2px corner. Hover warms the fill and lifts it by 2px. The cultural continuation link is an open underlined action with an inline downward arrow. Shared public styles provide keyboard focus with a 2px outline and 4px offset, and 44px minimum control targets. Reduced motion disables transitions.

### Navigation

The condensed wordmark and restrained section labels sit in a warm, near-opaque sticky header. The active section receives a pale label and amber underline. The four-part bottom route repeats the same `aria-pressed` state with display numerals and a growing top rule. Mobile retains all four controls and the language switch alongside swipe gestures.

### Cards and media

Update previews use open copy blocks, bottom rules and near-square media; the featured preview keeps a raised tonal background. Crew cards show actual portraits and roles. Partner information uses open ruled rows, while the proposal action uses a vermilion panel and dark download button. Archive posts preserve real media, crop metadata and readable article copy. Do not invent posts or placeholder sponsors.

### Tags and disclosures

Archive pinned/media-count tags keep compact tracked text and small corners; they communicate metadata, not filters. Heritage craft disclosures use native `details`/`summary`, generous vertical padding and warm dividers; all three start open. Their text and descriptions translate with the page.

### Dialogs and recovery

Contact and media dialogs retain isolated focus, close controls and focus return. Long contact details wrap and contact dialogs scroll within short viewports. Feeds keep distinct bilingual loading, empty, error/retry and ready states. Public controls are read-only; admin is outside this redesign. No public input fields exist to invent for this system.

### Incense dragon

Decorative hero images and Canvas are hidden from assistive technology; the heritage illustration has descriptive alternate text and a visible artistic-interpretation caption. Keep the recognizable head, woven body, incense tips and guiding pearl. It is original art, not a documentary photograph or geographic route map. The original team dragon mark remains a small supporting signature.

## Do's and Don'ts

### Do:

- **Do** retain the dark Fire-Dragon identity, original team mark and soft fog while using the new procession composition as visual authority.
- **Do** preserve all four horizontal pages, bilingual copy, visible keyboard focus and at least 44px interactive targets.
- **Do** keep the complete static SVG visible when motion is reduced or Canvas is unavailable.
- **Do** use authentic crew portraits, published team updates and existing proposal/contact destinations.
- **Do** label dragon artwork as an interpretation and preserve official heritage sources and the independent student-team disclaimer.

### Don't:

- **Don't** reintroduce the removed race-car exploration CTA; retain actual engineering and racing content.
- **Don't** add broad elliptical fog rings, flame-breathing imagery, autoplay audio or heavy runtime dependencies.
- **Don't** restore large rounded glass cards as the default based on superseded base stylesheet values.
- **Don't** imply UNESCO recognition, official-organiser status, invented sponsors, awards or race results.
- **Don't** run the new decorative Canvas loop on inactive pages, hidden documents or reduced-motion settings.
