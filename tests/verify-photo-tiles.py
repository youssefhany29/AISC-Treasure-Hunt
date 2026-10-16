"""Verify the supplied file and exact six-tile reconstruction of the photo."""
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
assert photo.size == (492, 361)
assert manifest['boardSize'] == [492, 361]
assert (manifest['columns'], manifest['rows']) == (3, 2)
assembled = Image.new('RGB', photo.size)
assert len(manifest['tiles']) == 6
for tile in manifest['tiles']:
    image = Image.open(root / tile['path']).convert('RGB')
    expected_height = 180 if tile['row'] == 0 else 181
    assert image.size == (164, expected_height)
    assert image.tobytes() == photo.crop(tile['box']).tobytes(), 'Tile changed original pixels'
    assembled.paste(image, (tile['box'][0], tile['box'][1]))
assert assembled.tobytes() == photo.tobytes(), 'Six tiles must reconstruct only the original photo exactly'
print('PASS: exact source SHA-256; six photo crops; 3x2 reconstruction; all original pixels unchanged.')
