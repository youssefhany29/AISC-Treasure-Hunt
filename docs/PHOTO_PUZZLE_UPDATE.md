# Original-photo puzzle and replay update

Updated **16 October 2026**. The framed puzzle has been replaced with six crops of the actual supplied sports hall photograph. Other puzzle answers, scenes, audio assets and AISC branding are preserved.

## Source and layout

- Exact uploaded source: `assets/images/puzzle/indoor-sports-hall.png`.
- SHA-256: `6da34c8cdfdf39d1e305de627a90ab1c7e909af17f59ba84b914a443ab98bc9e`.
- Board: **3 columns × 2 rows**, reconstructing the original **492 × 361** photo.
- Six lossless crops: top row **164 × 180** each; bottom row **164 × 181** each. Every original pixel is retained, with no added art, frame, labels, resizing or filters.
- Generator: `scripts/generate-photo-tiles.py`; verification: `npm run test:tiles`.

The empty board is centered, with six shuffled photo tiles in a separate tray below. Pointer Events handle mouse, touch and pen dragging. Pick-up, hover, accepted/rejected drop, snap and restored-photo animation provide feedback. Incorrect drops return to their origin. Placed pieces can return to the tray. Tap/keyboard placement is also available. All six correct placements play the existing success sound and advance to final deduction.

## Replay and saved progress

Mission Complete has a visible **PLAY AGAIN** button. **Case settings → Restart Mission** is available during gameplay. Both show “Restart the mission from the beginning?” with Confirm and Cancel controls. Confirmation immediately renders Begin Investigation without navigation or refresh.

Reset replaces only `treasureHunt.case02.v1` with a clean mission while retaining its sound preference. Evidence, stage gates, envelope state, hints, six tile positions/tray and completion flags reset. No unrelated storage is changed. Stage cleanup and render-lifetime guards prevent old listeners, drag ghosts, timers and delayed evidence dialogs from affecting the new mission.

The existing save key is retained. In-progress older puzzles receive the corrected empty board and keep collected clues and unlocked case. Previously solved missions retain their deduction/completion and can use PLAY AGAIN. Correct new tile placements and remaining tray order save immediately.

Static relative PNGs and the `case02-static-v3-photo-replay` service-worker cache work under GitHub Pages. An isolated real v2 cached client was upgraded to v3, retaining clues and muted sound, restoring new placements offline, and restarting a previously completed mission.

## Verification

- **32/32 Node tests passed**, including repeated completion/reset, unrelated-storage preservation, current/legacy saved progress and all existing game gates.
- Exact uploaded file hash and full-photo reconstruction passed the Pillow verifier.
- Local browser QA passed at **320, 375, 390, 430, 768 and 1024px**, with **three full complete/restart cycles per width** and another start. It checked touch/mouse drag, wrong/correct drops, returning placed pieces, cancellation, keyboard placement, saved progress, restart confirmation/cancellation, no navigation, sound and unrelated storage retention, settings restart at every stage, offline play and all 11 audio decodes.
- A **390 × 640** run with normal animations also passed three complete/restart cycles, plus a deterministic restart before a pending clue dialog could open.
- The **published GitHub Pages site passed the same six-width suite and 18 full complete/restart cycles**. The live source photo and logo hashes match the uploads. Results are recorded in deployment documentation and `PUBLISHED_TEST_REPORT.json`.
- Browser QA uses Chromium touch emulation and mouse input. Physical iPhone Safari and Android Chrome remain device checks; no physical-device test is claimed.
