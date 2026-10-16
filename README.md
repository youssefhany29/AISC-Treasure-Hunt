# CASE 02 — The Lost Destination

A complete mobile-first, browser-based mystery for the AISC treasure hunt. Participants open the public site from a QR code, investigate a cafe, open an informant's case, restore a photograph, and identify the next checkpoint. No account, installation, camera, location permission, backend, analytics, or background music.

**[Play the published game](https://youssefhany29.github.io/AISC-Treasure-Hunt/)** · [Public source repository](https://github.com/youssefhany29/AISC-Treasure-Hunt) · [Deployment verification](docs/DEPLOYMENT.md)

## Run locally

Requires **Node.js 20+** for the preview server and tests. The game itself needs only a modern browser.

```powershell
cd E:\Learning\TreasureHunt_Case02
npm start
```

Open **http://localhost:4173**. Keep the terminal running. Use an HTTP server rather than double-clicking `index.html`; ES modules and offline caching require HTTP/HTTPS. There are no production dependencies and no build step.

To test a repository subpath like GitHub Pages, open **http://localhost:4173/case02/**. To choose another port:

```powershell
$env:PORT = '4174'
npm start
```

On a phone on the same Wi-Fi, use `http://YOUR-PC-LAN-IP:4173` and allow the Node server through your local firewall if prompted. HTTPS or localhost is required for the optional service worker; ordinary local-LAN HTTP still supports gameplay.

## Playable flow

1. **Classified briefing:** a short cinematic intro, supplied AISC logo, fingerprint scan, and Begin Investigation button.
2. **Cafe evidence:** tap a receipt, lift a cup, unfold a napkin, and flip a coaster. Recovered clues save immediately and can be reexamined.
3. **Security case:** use recovered symbol values in the lock's order on a custom keypad. Clear, delete, unlimited retries, evidence access, hints, and physical case feedback.
4. **Sealed envelope and photo puzzle:** open the envelope, then drag six shuffled rectangular photo pieces into an empty **3 columns × 2 rows** target board. Touch and mouse dragging, picked-up/hover/correct/incorrect feedback, snapping, cancellation, and moving placed pieces back to the tray are supported. Correct placements save immediately. The restored image triggers the success animation/sound and automatically continues to the final deduction. A tap/keyboard placement alternative is also available.
5. **Final deduction:** choose between four illustrated locations using the riddle and restored photograph. Wrong choices give helpful feedback without penalties.
6. **Mission Complete:** the next destination appears only after the correct choice, with a golden reveal, checkpoint badge, and the official AISC logo. The result can be reopened and survives refresh. A visible **PLAY AGAIN** button offers a confirmed restart.

Tap or use Tab plus Enter/Space. The keypad also accepts number keys when focus is outside a control; Backspace deletes, Escape clears, and Enter submits. Standard button keyboard access always works. There is no time limit.

## Sound and accessibility

Only subtle local **sound effects**, with a visible sound toggle. Audio starts after a gesture and failure never blocks play. Sound preference persists. There is **no music**. WAV effects are PCM16 and browser-decoded during QA.

Semantic buttons, descriptive object labels, modal focus management, keyboard controls, visible focus, live status feedback, non-color-only progress, 44px+ primary touch controls, notched-screen safe areas, and `prefers-reduced-motion` support are included. Layouts use a stable desk coordinate system and a centered desktop composition.

## Saves, resets, and offline use

Progress is stored on the participant's browser under `treasureHunt.case02.v1`. It includes stage, evidence, solved puzzles, photo slots and shuffled tray order, envelope state, hint use, completion, and sound preference. Invalid or stale data falls back safely. If storage is blocked, the game still works for the current visit. The photo update preserves the existing save key: unfinished legacy blueprint saves retain earlier progress and receive the new puzzle; previously solved missions retain their deduction/completion.

**PLAY AGAIN** on Mission Complete or **Case settings → Restart Mission** asks “Restart the mission from the beginning?” Confirming immediately returns to Begin Investigation without a refresh. It replaces only this game's saved progress with a fresh mission, retaining sound preference and all unrelated browser storage. Cancel leaves progress untouched. Stage listeners and pending transitions are cleaned up before the new mission renders. Browser Back does not perform stage navigation or erase progress.

On HTTPS/localhost, a service worker caches the game shell and **all images and sound effects** after the first successful load. A participant can continue and reload offline after that cache finishes. A fresh device still needs a first online visit. Caching may be unavailable in some private/restricted browsing modes; gameplay does not require service-worker support.

For a new release, increment `CACHE` in `sw.js`, run `node scripts/prepare-cache.mjs`, and redeploy. Avoid deploying midway through a live event. The storage version is separate from the asset-cache version.

## Organizer configuration

Edit **`js/config.js`**. Central settings:

| Setting | Purpose |
| --- | --- |
| `GAME_TITLE`, `CASE_NUMBER` | Case identity; update matching document title/artwork if changing the whole case |
| `DESTINATION_NAME` | Name shown only after completion |
| `NEXT_LOCATION_URL` | Optional, verified HTTPS checkpoint link |
| `NEXT_LOCATION_URL_VERIFIED` | Must explicitly be `true` to display that link; default is hidden |
| `ENABLE_SOUND`, `ENABLE_HINTS`, `ENABLE_ANIMATIONS` | Event feature toggles |
| `SHOW_PROGRESS`, `ALLOW_RESTART` | Progress display and organizer reset |
| `STORAGE_VERSION`, `STORAGE_NAMESPACE` | Namespaced save version; bump the version if puzzle definitions change |
| `evidence`, `lockOrder` | Clue symbols/values and their sequence; validation derives the answer from these values |
| `puzzle` | Puzzle revision, 3 × 2 dimensions, original photo, and six tile IDs/paths/correct slots |
| `doors`, `correctDoor` | Illustrated choices, feedback, and accepted door |
| `text`, `assets`, `sounds` | Copy, hints, and relative local asset paths |

Safe event edits include wording, hints, destination name, feature toggles, and a verified checkpoint URL. Update the completion message/riddle/photo/door artwork consistently if the destination changes to a different type of place. When changing clue values, keep them single digits; the four-digit code is derived automatically. Puzzle pieces are configured in row-major correct order; do not rearrange their definitions without matching the generated image crops. Run all tests after changes. Do not publish a navigation link until an organizer has checked it.

The exact uploaded sports hall photo is stored at `assets/images/puzzle/indoor-sports-hall.png`. Six lossless crops reconstruct only the original **492 × 361** landscape photo in **3 columns × 2 rows**, with no added frame, text, resizing, filters or generated artwork. Top-row crops are **164 × 180** and bottom-row crops **164 × 181**, preserving every pixel of the odd-height source. To regenerate, install Pillow and run `python scripts/generate-photo-tiles.py`; verify with `npm run test:tiles`. The browser uses local static PNGs in `photo-tiles-v3/`.

The official **AISC logo** is the exact user-supplied PNG at `assets/images/aisc-logo.png`. It is rendered proportionally with no filters, cropping, recoloring, or recreated elements, and appears only on the intro and Mission Complete screens. Do not put it on shared gameplay components.

## Tests

```powershell
npm test
npm run validate
```

These run with Node's built-in runner and no installs. Core tests cover initial state, evidence and duplicates, progression gates, wrong/correct codes, shuffled pieces, correct/incorrect placement, returning placed tiles, completion, doors, destination visibility, persistence/corruption, legacy-save migration, reset, and unavailable/muted audio. The validator resolves configured local assets, CSS image paths, and ES-module imports. `npm run test:tiles` additionally requires Python with Pillow and verifies source identity, rectangular crop dimensions, pixel-perfect reassembly and preservation of every original photo pixel.

Browser QA uses **Playwright** and a running HTTP server. Codex's bundled Playwright is supported automatically. On another PC:

```powershell
npm install --no-save playwright
npx playwright install chromium
npm start
```

In another terminal:

```powershell
npm run test:browser
```

Optional `PLAYWRIGHT_MODULE_PATH` points at a Playwright installation, and `BROWSER_EXECUTABLE` at an existing Chromium/Chrome/Edge executable. `BASE_URL` selects a published site. Reports/screenshots go to ignored `test-results/`.

The browser suite plays the **entire game at 320, 375, 390, 430, 768 and 1024px**, checks missing images, console/network errors, overflow, clipped controls, correct logo placement, hidden destination, wrong choices, refresh persistence, real touch-event/mouse drags, incorrect and correct drops, returning placed pieces, drag cancellation, keyboard placement, automatic puzzle progression, audio decoding, offline refresh, mute, and three complete/restart cycles per width. It also checks confirmation/cancellation, no-refresh restarts, retained unrelated storage and sound, and settings restart at every stage. `TEST_WIDTHS`, `TEST_HEIGHT`, and `TEST_REDUCED_MOTION=false` allow targeted viewport/animation checks. Chromium automation is not a substitute for checking real iPhone Safari and Android Chrome before the event.

## Publish to GitHub Pages

Upload the **contents of this project** so `index.html` is at the repository root. Do not upload a parent folder, credentials, caches, or `node_modules`.

Using an authenticated GitHub CLI:

```powershell
git init -b main
git add index.html css js assets scripts tests package.json README.md ASSET_CREDITS.md docs sw.js asset-manifest.js .nojekyll .gitignore .gitattributes
git commit -m "Build AISC CASE 02 treasure hunt"
```

Check for **`AISC-Treasure-Hunt`** on your account before creating it. Reuse that repository if it already exists and is the intended project; do not create a duplicate or overwrite unrelated work. For a new repository:

```powershell
gh repo create AISC-Treasure-Hunt --public --source=. --remote=origin --push
```

In GitHub: **Repository → Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main → Folder: / (root) → Save**. `.nojekyll` is included. No build action or backend is required; relative URLs work under the repository path.

Reference: [GitHub's publishing-source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) and [Pages REST API](https://docs.github.com/en/rest/pages/pages).

Wait for the Pages deployment to finish under **Actions**. Copy the exact **Visit site** URL from Settings → Pages. Do not assume deployment succeeded from a push alone. Open that URL and check all stages, assets, sound toggle, completion, and refresh. Public HTTPS is required for participant access and offline caching.

If authentication is missing, run `gh auth login --hostname github.com --git-protocol https --web` and complete GitHub's browser authorization with the intended account. Never place tokens in this project's files or send them in chat. Repository creation/push requires repository permissions; Pages settings require repository administration permissions. The CLI can enable Pages using the REST API with `source.branch=main` and `source.path=/`, or an owner can use the exact Settings steps above.

## Make the event QR code

Only after verifying the live URL, encode that exact HTTPS URL with an organizer-approved QR generator. Use a static QR pointing straight to the game, high contrast, a quiet border, and a sufficiently large print. Test the **printed** code using both iPhone and Android camera scanners. There is no need for a QR scanning feature or camera permission inside the game itself.

Before the event, use iPhone Safari and Android Chrome to test the printed QR, portrait widths, all four objects, keypad edits and retries, photo dragging and replay, door feedback, saved progress, muted sound, and completion. Check public access in a private tab while logged out of GitHub. Have the verified URL available as a text fallback.

## Project structure

```text
index.html, .nojekyll        Static entry point and GitHub Pages support
css/                        Main theme, animations, responsive layouts
js/config.js                Organizer settings, text, puzzle/asset definitions
js/game-state.js             Validated game state and backward-compatible saves
js/photo-puzzle-state.js     Six-piece board/tray placement and recovery logic
js/audio-manager.js          Gesture-safe, failure-tolerant local sound effects
js/stages/                   Intro, cafe, lock, blueprint, deduction, completion
js/components/               Pointer drag controller, hints, evidence, modal and UI
assets/images/              Official logo, supplied photo/tiles, scene SVGs, CC0 UI
assets/sounds/              Curated CC0 PCM WAV effects; no music
assets/licenses/            Original licenses and source/hash manifest
sw.js, asset-manifest.js     Relative-path offline cache
scripts/                    HTTP server, cache prep, validation, art and browser QA
tests/                      Automated state/audio tests
docs/                       Organizer solution and validation/deployment reports
```

Asset sources, licenses, and provenance are documented in **ASSET_CREDITS.md**. Detailed solutions in **docs/ORGANIZER_GUIDE.md** are for organizers; they are not linked from the player interface. As with any static client-side puzzle, someone inspecting source code can discover solutions.
