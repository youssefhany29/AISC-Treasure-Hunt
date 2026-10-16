# CASE 02 — Asset credits

All gameplay assets load from local relative paths. No background music is included.

## Third-party sound effects

**Kenney — Interface Sounds (1.0)**  
Official source: https://kenney.nl/assets/interface-sounds  
Verified download: https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip  
License: **Creative Commons Zero (CC0 1.0 Universal)**, https://creativecommons.org/publicdomain/zero/1.0/  
Original license file: `assets/licenses/kenney-interface-sounds.txt`.

The following short effects are decoded from the original OGG files to 44.1 kHz, 16-bit PCM WAV for broad mobile/browser compatibility. They are complete one-shot clips, with no added music, trimming, or AI synthesis. Their semantic filenames describe their intended game use.

| Local file in `assets/sounds/` | Original pack file |
| --- | --- |
| `ui-click.wav` | `Audio/click_001.ogg` |
| `evidence-select.wav` | `Audio/select_001.ogg` |
| `tile-place.wav` | `Audio/drop_001.ogg` |
| `puzzle-success.wav` | `Audio/confirmation_001.ogg` |
| `answer-error.wav` | `Audio/error_001.ogg` |
| `case-open.wav` | `Audio/open_001.ogg` |
| `case-close.wav` | `Audio/close_001.ogg` |
| `paper-slide.wav` | `Audio/scroll_001.ogg` |
| `paper-rustle.wav` | `Audio/scratch_001.ogg` |
| `lock-click.wav` | `Audio/switch_001.ogg` |
| `clue-reveal.wav` | `Audio/maximize_001.ogg` |

## Third-party UI imagery

**Kenney — UI Pack - Adventure (archive version 1.1)**  
Official source: https://kenney.nl/assets/ui-pack-adventure  
Verified download: https://kenney.nl/media/pages/assets/ui-pack-adventure/9a877376bc-1723597274/kenney_ui-pack-adventure.zip  
License: **Creative Commons Zero (CC0 1.0 Universal)**.  
Original license file: `assets/licenses/kenney-ui-pack-adventure.txt`.

Unmodified PNG files from the archive's `PNG/Double/` directory are stored in `assets/images/ui/`: `paper.png` (from `pattern_grid_paper.png`), `panel_grid_paper.png`, `pattern_grid_blueprint.png`, and `panel_grid_blueprint.png`. The patterns are 64 × 64 px; the panels are 128 × 128 px.

Kenney's included licenses permit personal, educational, and commercial use, with attribution optional. This project gives credit voluntarily.

## Project-created illustrations

The game scene and prop SVG illustrations authored locally for CASE 02 are original project artwork. They are separate from Kenney's downloaded assets.

## Official AISC branding

`assets/images/aisc-logo.png` is the official **AISC — International Students Club** logo supplied by the user. It is a separate user-provided brand asset, not a Kenney or CC0 asset. Retain its original colors, proportions, and details. Display it only on the intro and Mission Complete screens.

## Acquisition and verification

Downloaded from the official sources and verified on 16 October 2026. Both ZIP archives extracted successfully. All 11 WAV files were decoded and inspected with FFprobe and FFmpeg volume analysis (nonzero PCM signal confirmed); all four PNG files were inspected for valid PNG format and dimensions. `assets/licenses/asset-manifest.json` records local file sizes, durations/dimensions, source filenames, and archive SHA-256 hashes.

