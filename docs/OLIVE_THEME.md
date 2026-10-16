# Warm Vintage Detective â€” Olive & Cream

The entire interface uses the shared palette in `css/theme.css`. Backgrounds are cream, surfaces are warm off-white, headings are deep olive, and body text and interactive outlines are olive. `#FAEBD7` text appears on dark olive surfaces. `#D8C39F` borders divide decorative surfaces; controls use stronger olive borders and focus rings.

| Role | Color |
| --- | --- |
| Main background | `#FAF0E6` |
| Highlighted surfaces | `#FFE4B5` |
| Primary text and actions | `#556B2F` |
| Text on olive | `#FAEBD7` |
| Headings and dark panels | `#34421E` |
| Decorative borders | `#D8C39F` |
| Card/dialog surface | `#FFF9F0` |
| Button hover/pressed | `#475B27` |

The keypad uses an olive case with cream fields and keys. Hint panels, image-overlay labels, fingerprint panel and destination stamp use opaque olive backgrounds with light text. Progress indicators distinguish steps through numbers/checkmarks and fill. Wrong answers retain explanatory text, underline/shake feedback and existing sound. Puzzle selection/drag outlines use contrasting cream and olive rings so they remain visible over the photo and target slots.

All color/shadow values are centralized in `css/theme.css`. The browser's theme-color metadata and standalone olive favicon carry matching literal colors because they cannot inherit page CSS variables. Fonts, layouts, animation timing, puzzle answers, gameplay modules, saved-state schema and audio behavior are preserved. Small puzzle/progress captions have improved legibility on phones.

## Contrast verification

Contrast calculations use the [W3C text contrast thresholds](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Text pair | Contrast |
| --- | --- |
| Olive on main cream | 5.29:1 |
| Olive on secondary cream | 4.82:1 |
| Olive on card cream | 5.68:1 |
| Light cream on olive | 5.08:1 |
| Light cream on hover olive | 6.42:1 |
| Light cream on deep olive | 9.22:1 |
| Deep olive on beige envelope flap | 6.29:1 |

`scripts/theme-audit.mjs` captures seven screen sizes (320, 375, 390, 430, 768, 1024 and 1440px), including all stages, clue/inventory dialogs, hints, settings, restart confirmation, keyboard focus, key hover, wrong-code feedback and puzzle drag hover. Its 147 views passed axe-core's text contrast rule and an additional computed-color scan of 3,440 text nodes, including the single digits/symbols that axe leaves for inspection. The lowest computed ratio was 4.82:1. Palette checks also bound the light text against every olive gradient stop, paper text against a worst-case black texture beneath the 94% cream wash, and interactive outlines against their adjacent cream surfaces.

Axe's uncertain cases (original pictures, gradients, overlapping decorative borders, and single-character symbols) are retained in the raw ignored report for visual review. These checks assess the theme's color contrast; they are not a claim of a complete accessibility certification.

## Preservation and testing

- All **40 existing asset files** and every gameplay JavaScript file were verified byte-for-byte unchanged. Only the standalone themed favicon is new. The official AISC logo retains its original pixels, colors, proportions, placement and fade animation; source photos and scene illustrations retain their original colors.
- **32 existing logic tests**, the asset validator, and exact sports-hall photo/tile verification passed.
- Six-width local browser tests passed **18 complete/restart cycles**, touch/mouse dragging, persistence, audio decoding, offline refresh and replay.
- A short **390 × 640** normal-animation run also passed three complete/restart cycles and pending-transition cancellation.
- A real v3 offline cache upgraded to `case02-static-v4-olive-cream` while retaining the entire saved state (partial placements, tray order, evidence, unlocked case, hints, stage and mute preference), unrelated storage/cache and offline image loading.
- Public verification passed **42 contrast/screen checks** and **six full complete/restart cycles** at 390 and 1024px, including settings resets, saved positions, offline gameplay and all 11 audio decodes. Published CSS matches the tested sources after normalizing Git line endings; the original logo/photo match exactly. See [public theme audit](THEME_PUBLISHED_REPORT.json) and [public gameplay report](PUBLISHED_TEST_REPORT.json).
- Browser tests use Chromium touch emulation. Physical iPhone Safari and Android Chrome remain device checks.

The static runtime has no new dependencies. For the optional visual checker, install Playwright and axe-core locally or set `PLAYWRIGHT_MODULE_PATH` and `AXE_PATH`, start the preview, then run `node scripts/theme-audit.mjs`. The checker and screenshots are not shipped to participants. `BASE_URL` selects a public deployment; `AUDIT_WIDTHS` and `AUDIT_LABEL` support targeted review. Full reports/screenshots are written to ignored `test-results/`.
