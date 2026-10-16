# Public deployment — CASE 02

Verified on **16 October 2026** (Europe/Istanbul).

**Current puzzle update:** the six-piece sports hall photo release is deployed from game-source commit `e9376a0fb94bdf8823be10f87ea0cff3b698a58e`. [Its Pages deployment succeeded](https://github.com/youssefhany29/AISC-Treasure-Hunt/actions/runs/38949282661). The published game passed complete touch/mouse playthroughs at all six widths. See [PHOTO_PUZZLE_UPDATE.md](PHOTO_PUZZLE_UPDATE.md), the latest [published report](PUBLISHED_TEST_REPORT.json), and the [cached-client migration check](CACHE_UPGRADE_TEST_REPORT.json). The public URL is unchanged.

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

5. **Complete anonymous browser playthroughs on the published site passed at 320, 375, 390, 430, 768 and 1024px.** Tests checked all stages, images, console/network errors, horizontal overflow/clipped controls, wrong codes and doors, inventory, hints, saved progress, touch/mouse dragging, keyboard photo-piece placement, automatic progression, and destination/branding visibility.
6. All **11 sound effects** decoded from the live deployment. The entire 390px game also completed **offline after initial caching**, followed by an offline refresh of Mission Complete.
7. Public-site tests also checked corrupt-save recovery, unavailable AudioContext, saved mute preference, and organizer reset.

Machine-readable public test results: [PUBLISHED_TEST_REPORT.json](PUBLISHED_TEST_REPORT.json). Core and local/normal-motion results: [VALIDATION_REPORT.md](VALIDATION_REPORT.md).

## Remaining event checks

No required game feature remains incomplete. Browser automation used Chromium with touch/mobile emulation. Event organizers should still scan the **printed** QR on physical iPhone Safari and Android Chrome and check venue connectivity before participants arrive. No physical-device test is claimed.

The optional next-checkpoint navigation button is intentionally hidden because no verified destination URL has been supplied. The completed mission still displays the required destination and onward instructions.

## Future deployment updates

Edit the local project, run `npm test` and `npm run validate`, regenerate `asset-manifest.js` if files were added, increment the asset-cache version in `sw.js` for changed runtime releases, commit, and push `main`. Pages republishes from the repository root. Verify the new Actions result and public game URL after each release. Do not expose secrets in a public static repository.

For local play: `cd E:\Learning\TreasureHunt_Case02`, then `npm start`; open `http://localhost:4173`.
