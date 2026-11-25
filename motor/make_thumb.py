"""Miniatures 1280x720. Ús: python3 motor/make_thumb.py videos/<id>
Llegeix 'thumb' de video.json → thumb.jpg. Si hi ha 'thumbs' (llista de 2 variants, cadascuna amb els camps de 'thumb'
que canvien: una sola variable per variant), en fa thumb_b.jpg i thumb_c.jpg per al «Test & Compare» de YouTube Studio."""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
vdir = pathlib.Path(sys.argv[1]).resolve(); V = json.loads((vdir / 'video.json').read_text()); T = V['thumb']
jobs = [('thumb.jpg', T)] + [(f'thumb_{c}.jpg', {**T, **v}) for c, v in zip('bc', V.get('thumbs', []))]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    for name, t in jobs:
        pg = b.new_page(viewport={'width': 1280, 'height': 720})
        pg.goto((pathlib.Path(__file__).resolve().parent / 'thumbnail.html').as_uri()); pg.evaluate('document.fonts.ready'); pg.evaluate('T => make(T)', t); pg.wait_for_timeout(700)
        pg.screenshot(path=str(vdir / name), type='jpeg', quality=92); pg.close(); print('OK', vdir / name)
    b.close()
