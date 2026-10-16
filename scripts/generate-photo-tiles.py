"""Generate six square tiles from the supplied photograph without AI or edits.

The landscape original is copied pixel-for-pixel into a portrait evidence
frame. Only the surrounding frame is drawn. Tiles are lossless square crops.
Pillow is needed to regenerate assets; the deployed game needs no Python.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib
import json

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets' / 'images' / 'puzzle'
SOURCE = OUT / 'indoor-sports-hall.png'

def font(size):
    for name in ('DejaVuSansMono.ttf', 'consola.ttf', 'C:/Windows/Fonts/consola.ttf'):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()

photo = Image.open(SOURCE).convert('RGB')
width, height = photo.size
assert width % 2 == 0 and height <= width * 3 // 2
side = width // 2
canvas = Image.new('RGB', (width, side * 3), '#142637')
draw = ImageDraw.Draw(canvas)
gold = '#D9B978'
for y in range(14, canvas.height, 18):
    draw.line((0, y, width, y), fill='#192D3D', width=1)
for x in range(14, width, 18):
    draw.line((x, 0, x, canvas.height), fill='#192D3D', width=1)
draw.rectangle((14, 14, width - 15, canvas.height - 15), outline='#53606A', width=1)
draw.line((28, 55, width - 29, 55), fill='#53606A', width=1)
draw.text((29, 27), 'RECOVERED / CASE 02', font=font(14), fill=gold)
draw.text((29, 82), 'THE MISSING', font=font(24), fill='#E8D9BF')
draw.text((29, 115), 'PHOTOGRAPH', font=font(24), fill='#E8D9BF')
top = (canvas.height - height) // 2
# No resize, crop, filter, generated replacement, or recoloring of the photo.
canvas.paste(photo, (0, top))
draw.line((0, top - 2, width, top - 2), fill=gold, width=2)
draw.line((0, top + height + 1, width, top + height + 1), fill=gold, width=2)
draw.text((29, top + height + 31), 'LOCATION: ERASED', font=font(18), fill=gold)
draw.text((29, top + height + 66), 'FOLLOW WHAT REMAINS.', font=font(14), fill='#B5C1CF')
draw.line((29, canvas.height - 65, width - 29, canvas.height - 65), fill='#53606A', width=1)
draw.text((29, canvas.height - 48), 'FIELD EVIDENCE // CONFIDENTIAL', font=font(12), fill='#8B9BA8')
OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'tiles').mkdir(exist_ok=True)
canvas.save(OUT / 'evidence-frame.png', optimize=True)
tiles = []
for row in range(3):
    for column in range(2):
        index = row * 2 + column
        box = (column * side, row * side, (column + 1) * side, (row + 1) * side)
        tile = canvas.crop(box)
        tile_path = OUT / 'tiles' / f'tile-{index + 1:02d}.png'
        tile.save(tile_path, optimize=True)
        tiles.append({'slot': index, 'row': row, 'column': column, 'size': [side, side],
                      'path': tile_path.relative_to(ROOT).as_posix()})
        assert tile.tobytes() == canvas.crop(box).tobytes()
assert canvas.crop((0, top, width, top + height)).tobytes() == photo.tobytes()
manifest = {'source': SOURCE.relative_to(ROOT).as_posix(),
            'sourceSha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
            'sourceSize': [width, height], 'boardSize': list(canvas.size),
            'photoRectangle': [0, top, width, height], 'columns': 2, 'rows': 3,
            'method': 'Original photo pixels preserved inside a portrait evidence frame; lossless square crops.',
            'tiles': tiles}
(OUT / 'source-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
print(f'Generated 6 lossless {side}x{side} tiles, {width}x{canvas.height} board; photo pixels verified unchanged.')
