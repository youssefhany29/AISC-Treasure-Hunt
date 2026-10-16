# Public deployment — CASE 02

Verified on **16 October 2026** (Europe/Istanbul).

**Current visual theme:** Warm Vintage Detective / Olive & Cream, from commit `0f82ef1af1d1b1bb1b49da7c02154d7f5fb2573e`. [Its Pages deployment succeeded](https://github.com/youssefhany29/AISC-Treasure-Hunt/actions/runs/38962843669). All interface colors and shadows are centralized in `css/theme.css`, with a matching browser theme color and favicon. The original logo, photographs, artwork, audio and gameplay modules are unchanged. See [theme and contrast verification](OLIVE_THEME.md), [local contrast report](THEME_CONTRAST_REPORT.json), and [saved-mission cache-upgrade check](THEME_CACHE_UPGRADE_REPORT.json).

**Previous photo/replay release:** deployed from game-source commit `53f1d0ea54d6445654a94454b624b9e95137a099`. [Its Pages deployment succeeded](https://github.com/youssefhany29/AISC-Treasure-Hunt/actions/runs/38953933777). The board now reconstructs only the supplied sports hall photo as **3 columns × 2 rows**, with six shuffled crops and no added evidence frame. **PLAY AGAIN** and **Case settings → Restart Mission** offer confirmed resets that preserve sound and unrelated storage. See [PHOTO_PUZZLE_UPDATE.md](PHOTO_PUZZLE_UPDATE.md), the [published report](PUBLISHED_TEST_REPORT.json), and the [cached-client migration check](CACHE_UPGRADE_TEST_REPORT.json). The public site passed **18 complete/restart cycles across six viewport widths**, plus settings resets, touch/mouse puzzle input, offline play and asset checks. The public URL is unchanged.

## Public game URL

**https://youssefhany29.github.io/AISC-Treasure-Hunt/**

Use this exact HTTPS URL for the event QR code. It opens the game directly without a download, installation, GitHub login, or account creation.

- Repository: https://github.com/youssefhany29/AISC-Treasure-Hunt
- Visibility: **public**
- GitHub account: **youssefhany29**, authenticated using the existing account
- Publishing: **GitHub Pages → Deploy from a branch → main → / (root)**
- HTTPS: enforced
- Initial game-source commit: `9f9c26fc980ff165035b1800f3a090137b1409d9`
- Successful initial Pages build/deployment: https://github.com/youssefhany29/AISC-Treasure-Hunt/actions/runs/38945398232
- Local project: `E:\Learning\TreasureHunt_Case02`

The repository was checked before creation; no duplicate was created. Git was initialized with `main`, the complete source/assets/documentation were committed, and the matching branch was pushed. Only explicit project files were uploaded; no credentials, tokens, private-key files, unrelated documents, build caches, or test screenshots were included.

## Public verification performed

1. GitHub's Pages API reported **built**, a public site, HTTPS enabled, and the requested main/root source.
2. The Pages Actions build and deployment both completed successfully.
3. An anonymous HTTPS request to the game URL returned **200 OK**, `text/html`, the game title, and the entry ES module.
4. The public logo returned **200 OK**, 385,945 bytes, and the exact supplied image's SHA-256:

   `5FBFE27DCE694128AC767A016C2AE2B5CEC3D1E144897AC1B152D785F4DCE1DB`

5. **The current theme passed local visual/contrast checks at 320, 375, 390, 430, 768, 1024 and 1440px; anonymous public gameplay and contrast were rechecked at 390 and 1024px.** Tests checked all stages, images, console/network errors, horizontal overflow/clipped controls, wrong codes and doors, inventory, hints, saved progress, touch/mouse dragging, keyboard photo-piece placement, automatic progression, and destination/branding visibility.
6. The live source photo returned **200 OK** and matched SHA-256 `6da34c8cdfdf39d1e305de627a90ab1c7e909af17f59ba84b914a443ab98bc9e`. Its six local crops reconstruct the original image without added content.
7. All **11 sound effects** decoded from the live deployment. The entire 390px game also completed **offline after initial caching**, followed by an offline refresh of Mission Complete.
8. Public-site tests also checked corrupt-save recovery, unavailable AudioContext, saved mute preference, and settings restart. The current release checks three complete/restart cycles per viewport, Cancel, confirmed no-refresh resets, sound and unrelated-storage preservation, settings restarts at each stage, and cancellation of pending puzzle/evidence transitions.

Machine-readable public test results: [PUBLISHED_TEST_REPORT.json](PUBLISHED_TEST_REPORT.json). Core and local/normal-motion results: [VALIDATION_REPORT.md](VALIDATION_REPORT.md).

## Remaining event checks

No required game feature remains incomplete. Browser automation used Chromium with touch/mobile emulation. Event organizers should still scan the **printed** QR on physical iPhone Safari and Android Chrome and check venue connectivity before participants arrive. No physical-device test is claimed.

The optional next-checkpoint navigation button is intentionally hidden because no verified destination URL has been supplied. The completed mission still displays the required destination and onward instructions.

## Future deployment updates

Edit the local project, run `npm test` and `npm run validate`, regenerate `asset-manifest.js` if files were added, increment the asset-cache version in `sw.js` for changed runtime releases, commit, and push `main`. Pages republishes from the repository root. Verify the new Actions result and public game URL after each release. Do not expose secrets in a public static repository.

For local play: `cd E:\Learning\TreasureHunt_Case02`, then `npm start`; open `http://localhost:4173`.
