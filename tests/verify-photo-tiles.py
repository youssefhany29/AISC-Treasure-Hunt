"""Verify source identity, square tile dimensions, and exact reconstruction."""
from pathlib import Path
from PIL import Image
import hashlib
import json

root = Path(__file__).resolve().parents[1]
folder = root / 'assets' / 'images' / 'puzzle'
manifest = json.loads((folder / 'source-manifest.json').read_text(encoding='utf-8'))
source = root / manifest['source']
expected = '6da34c8cdfdf39d1e305de627a90ab1c7e909af17f59ba84b914a443ab98bc9e'
assert hashlib.sha256(source.read_bytes()).hexdigest() == expected, 'Supplied photo was modified'
photo = Image.open(source).convert('RGB')
frame = Image.open(folder / 'evidence-frame.png').convert('RGB')
assert photo.size == (492, 361)
assert frame.size == (492, 738)
assembled = Image.new('RGB', frame.size)
assert len(manifest['tiles']) == 6
for tile in manifest['tiles']:
    image = Image.open(root / tile['path']).convert('RGB')
    assert image.size == (246, 246), 'Every tile must be square'
    assembled.paste(image, (tile['column'] * 246, tile['row'] * 246))
assert assembled.tobytes() == frame.tobytes(), 'Six tiles must reconstruct the complete board exactly'
x, y, width, height = manifest['photoRectangle']
assert assembled.crop((x, y, x + width, y + height)).tobytes() == photo.tobytes(), 'Photo pixels changed'
print('PASS: original source SHA-256, six 246x246 tiles, exact 2x3 reconstruction, all original photo pixels unchanged.')
