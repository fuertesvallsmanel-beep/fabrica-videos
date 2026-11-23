"""Miniatura 1280x720. Ús: python3 motor/make_thumb.py videos/<id>  (llegeix 'thumb' de video.json)"""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
vdir = pathlib.Path(sys.argv[1]).resolve(); T = json.loads((vdir / 'video.json').read_text())['thumb']
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome'); pg = b.new_page(viewport={'width': 1280, 'height': 720})
    pg.goto((pathlib.Path(__file__).resolve().parent / 'thumbnail.html').as_uri()); pg.evaluate('T => make(T)', T); pg.wait_for_timeout(200)
    pg.screenshot(path=str(vdir / 'thumb.jpg'), type='jpeg', quality=92); b.close()
print('OK', vdir / 'thumb.jpg')
