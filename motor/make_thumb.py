"""Miniatures 1280x720. Ús: python3 motor/make_thumb.py videos/<id>
Llegeix 'thumb' de video.json → thumb.jpg. Si hi ha 'thumbs' (llista de 2 variants, cadascuna amb els camps de 'thumb'
que canvien: una sola variable per variant), en fa thumb_b.jpg i thumb_c.jpg per al «Test & Compare» de YouTube Studio."""
import json, sys, pathlib
from playwright.sync_api import sync_playwright
vdir = pathlib.Path(sys.argv[1]).resolve(); V = json.loads((vdir / 'video.json').read_text()); T = V['thumb']
# Fons opcional: thumb.bg_t = segon del vídeo (amb pauses) amb la situació extrema; es renderitza sense medidor ni adhesius
# (thumb.bg_sin_tito: true amaga el Tito del fons perquè no en surtin dos)
if T.get('bg_t') is not None:
    sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import render_video as rv
    TT = rv.paced(vdir, V, json.loads((vdir / 'timings.json').read_text())); V2 = dict(V, starts=TT['starts'], total=TT['total'])
    with sync_playwright() as p:
        br, pg, _ = rv.open_page(p, V2, 1920, 1080)
        pg.evaluate("([t, st]) => { Motor.render(t); for (const id of ['hud','src','ovl','swipe','fade','grainw']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; } if (st) document.querySelectorAll('#stage svg.tito, #stage .sign, #stage .clk').forEach(e => e.style.visibility = 'hidden'); }", [float(T['bg_t']), bool(T.get('bg_sin_tito'))])
        pg.wait_for_timeout(300); pg.screenshot(path=str(vdir / 'thumb_bg.png')); br.close()
    T = dict(T, bgUrl=(vdir / 'thumb_bg.png').as_uri())
jobs = [('thumb.jpg', T)] + [(f'thumb_{c}.jpg', {**T, **v}) for c, v in zip('bc', V.get('thumbs', []))]
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=('/usr/bin/google-chrome' if __import__('os').path.exists('/usr/bin/google-chrome') else None))
    for name, t in jobs:
        pg = b.new_page(viewport={'width': 1280, 'height': 720})
        pg.goto((pathlib.Path(__file__).resolve().parent / 'thumbnail.html').as_uri()); pg.evaluate('document.fonts.ready'); pg.evaluate('T => make(T)', t); pg.wait_for_timeout(700)
        pg.screenshot(path=str(vdir / name), type='jpeg', quality=92); pg.close(); print('OK', vdir / name)
    b.close()
