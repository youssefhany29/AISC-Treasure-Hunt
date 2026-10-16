# Six-piece sports hall photo puzzle

Updated **16 October 2026**. This replaces only the old three-fragment blueprint interaction; the cafe, security code, final door answers, destination and AISC branding behavior remain the same.

## Source and geometry

- Exact user-supplied source: `assets/images/puzzle/indoor-sports-hall.png`.
- Source SHA-256: `6da34c8cdfdf39d1e305de627a90ab1c7e909af17f59ba84b914a443ab98bc9e`.
- Original dimensions: **492 × 361**; no photo pixels edited or discarded.
- Portrait evidence frame: **492 × 738**, holding the entire undistorted landscape image.
- Board: **2 columns × 3 rows**, six **246 × 246** square tiles, lossless PNG.
- Generator: `scripts/generate-photo-tiles.py`; no AI image generation.
- Geometry/source verifier: `npm run test:tiles` (Python/Pillow).

## Interaction and saves

The board starts empty, with all six pieces shuffled in a separate tray. Unified Pointer Events support real touch, mouse and pen input without HTML drag-and-drop dependencies. Pick-up creates a visible floating tile, slots/tray highlight on hover, correct drops snap in, and incorrect drops return to their origin with clear visual/text/sound feedback. Already placed pieces can move back to the tray. Pointer cancellation or Escape never loses a tile. Edge scrolling runs only while a drag is active.

Tap and keyboard alternatives are available: select a tile, then select a slot. Correct placements, remaining tray order, hints and preferences save immediately. Invalid saved entries are repaired without losing a piece.

All six correct placements trigger the image-restored animation and success sound, then automatically continue to the existing final deduction. A Continue button is also available during the brief reveal. The deduction preview now shows the supplied photo, replacing its obsolete floorplan reference.

The existing `treasureHunt.case02.v1` save key remains. Legacy unfinished blueprint saves retain their evidence/unlocked case/preferences and receive the new empty photo puzzle. Legacy solved deduction/completion saves remain solved. No mission reset is required.

Runtime assets are static relative files. The service-worker cache revision is `case02-static-v2-photo-puzzle`; its manifest and registration avoid stale imported manifests when upgrading an existing visit. No extra runtime service, dependency or network API is used.

## Verification

- **30/30 Node logic tests passed**, including placement validation, duplicate/lost-piece protection, returning placed tiles, saved order/slots, corrupt state, legacy migration and unchanged earlier/final-stage logic.
- Exact source file hash, six square dimensions, full-board reconstruction and every original photo pixel verified with Pillow.
- Full local playthroughs passed at **320, 375, 390, 430, 768 and 1024px**, including real touch-event dragging on mobile widths and mouse dragging on larger widths. Correct/wrong/occupied-slot drops, returning placed tiles, cancellation, keyboard placement, save/refresh and automatic progression were checked.
- A **390 × 640** normal-animation playthrough also passed. The complete 390px investigation and its new photo assets worked offline after caching. No missing images, console errors, horizontal overflow or clipped controls were found.
- Full local and published browser reports are recorded after UI verification in `docs/PUBLISHED_TEST_REPORT.json`.
- Physical iPhone/Android devices and printed QR scanning remain event checks; automated mobile tests use Chromium touch emulation.
