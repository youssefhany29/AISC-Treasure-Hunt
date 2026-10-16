# CASE 02 — Validation report

**Historical initial-release report.** The six-piece photo puzzle supersedes the three-fragment blueprint described below. Current puzzle implementation and verification are documented in [PHOTO_PUZZLE_UPDATE.md](PHOTO_PUZZLE_UPDATE.md); [PUBLISHED_TEST_REPORT.json](PUBLISHED_TEST_REPORT.json) records the latest published run.

Verified **16 October 2026**. Complete implementation; no gameplay features remain as placeholders.

## Executed checks

- **21/21 automated Node tests passed.** Initial state, stage gates, four clues, duplicate prevention, code derivation and retries, always-unsolved shuffling, swap validation, blueprint completion, doors, destination visibility, saving/restoring, corrupt/stale state, reset, storage failure, unavailable/muted audio, and hidden unverified navigation link.
- **Complete browser playthroughs passed at 320, 375, 390, 430, 768 and 1024px** using Chromium. Each run used real UI clicks and keyboard activation from intro through cafe, code, envelope, blueprint, deduction, and completion.
- **Normal-motion 390px playthrough passed**, including object reactions, case opening, envelope opening, piece joining, door feedback, and final reveal. The six-width suite used reduced motion.
- No horizontal page overflow, clipped controls, missing images, HTTP asset failures, or JavaScript/console errors in the six-width suite.
- Correct logo placement checked on every stage: one official image on intro and completion, none in cafe, lock, envelope, blueprint, or deduction.
- Destination name absent from visible page text until successful final deduction.
- Wrong keypad sequence rejected; clear/delete and correct sequence accepted; all three incorrect doors rejected without losing progress.
- Refresh checked during cafe, lock, blueprint, and completion. Duplicate reinspection preserved the evidence count. Fragment order restored correctly.
- Evidence inventory and hints opened/closed without resetting stage progress.
- **Entire 390px investigation played offline after the initial successful cache**, including local images and WAV files; offline completion refresh also passed.
- All **11 WAV sound effects decoded in a real browser** with nonzero duration. Acquisition checks also decoded every audio file and confirmed nonzero PCM signal.
- Corrupted saved JSON, unavailable AudioContext, saved mute preference, and organizer reset checked in browser.
- Static validator passed for configured asset paths, image/audio signatures, CSS assets, and ES-module imports. Assets total approximately **824 KiB**, with no external runtime requests required.
- Original SVG assets passed XML parsing and were rasterized and visually inspected. Desktop intro, mobile cafe, reconstructed blueprint, illustrated doors, and completion screenshots were visually reviewed.
- Credential-pattern scan of project source found no tokens, private keys, or cloud access keys. Only explicit project files are selected for Git.

## AISC logo integrity

The local PNG is byte-identical to the user-provided file. SHA-256:

```text
5FBFE27DCE694128AC767A016C2AE2B5CEC3D1E144897AC1B152D785F4DCE1DB
```

No image generation, cropping, recoloring, blending filters, or proportional distortion was applied to the logo.

## Practical verification limits

Browser QA uses Chromium with mobile viewport/touch emulation. Physical iPhone Safari and Android Chrome testing, printed QR scanning, and venue connectivity checks remain event-organizer checks. No claim is made that physical devices were exercised. Gameplay uses browser-native APIs with graceful storage/audio/asset failures and reduced-motion support.

Machine-readable reports and screenshots are generated under ignored `test-results/`. Public deployment verification is recorded separately in `docs/DEPLOYMENT.md` once completed.
