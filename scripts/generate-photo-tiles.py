"""Slice the exact supplied photo into six lossless crops, with no added art."""
from pathlib import Path
from PIL import Image
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'images' / 'puzzle'
SOURCE = OUT / 'indoor-sports-hall.png'
photo = Image.open(SOURCE).convert('RGB')
width, height = photo.size
columns, rows = 3, 2
tile_folder = OUT / 'photo-tiles-v3'
tile_folder.mkdir(parents=True, exist_ok=True)
tiles = []
for row in range(rows):
    for column in range(columns):
        index = row * columns + column
        # Integer boundaries retain every original pixel, including the odd row.
        box = (column * width // columns, row * height // rows,
               (column + 1) * width // columns, (row + 1) * height // rows)
        tile = photo.crop(box)
        tile_path = tile_folder / f'tile-{index + 1:02d}.png'
        tile.save(tile_path, optimize=True)
        tiles.append({'slot': index, 'row': row, 'column': column,
                      'size': list(tile.size), 'box': list(box),
                      'path': tile_path.relative_to(ROOT).as_posix()})
manifest = {'source': SOURCE.relative_to(ROOT).as_posix(),
            'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'sourceSize': [width, height], 'boardSize': [width, height],
            'columns': columns, 'rows': rows,
            'method': 'Six lossless rectangular crops of the original photo. No frame, resize, filters or added imagery.',
            'tiles': tiles}
(OUT / 'source-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Generated six original-photo crops, {columns}x{rows}, reconstructing {width}x{height}.')
