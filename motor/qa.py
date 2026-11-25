"""Control de qualitat automàtic d'un vídeo de Cuerpo al Límite (abans de publicar).

Ús:
  python3 motor/qa.py videos/<id>            # vídeo horitzontal
  python3 motor/qa.py videos/<id> --short 9 13 "Ganxo"   # un Short (mateixes línies que al render)

Mira cada pla (també els segons plans de scene.then) al 55 % i al 85 % de la durada (quan les animacions ja s'han assentat) i comprova els textos visibles:
  · mida mínima (36 px; les fonts de la cantonada poden ser petites)
  · marges (res a menys de 100 px de les vores en horitzontal, 60 px en vertical)
  · que no toquin el medidor «Límite» de dalt (y < 215) quan és visible
  · que dos textos no se solapin
I el so (si ja s'ha fet el render): els efectes han de quedar ≥ 9,5 dB per sota de la veu (so.json).
Escriu qa.md a la carpeta del vídeo. Surt amb codi 1 si hi ha problemes.
"""
import json, sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from playwright.sync_api import sync_playwright
import render_video as rv

CHECK = r"""(t) => {
  Motor.render(t);
  const W = innerWidth, H = innerHeight, vert = document.body.classList.contains('vert');
  const hud = document.getElementById('hud'), hudOn = !vert && +getComputedStyle(hud).opacity > .1;
  const op = e => { let o = 1; for (let x = e; x && x.nodeType === 1; x = x.parentNode) { const cs = getComputedStyle(x); if (cs.display === 'none' || cs.visibility === 'hidden') return 0; o *= +cs.opacity; } return o; };
  const own = e => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const items = [];
  document.querySelectorAll('#stage *, #ovl *, #vtop *, #vcap *').forEach(e => {
    const txt = own(e); if (!txt || op(e) < .6 || !/[\p{L}\p{N}]/u.test(txt)) return;   // ignora cometes i símbols decoratius
    if (e.closest('svg.tito') || e.closest('#vchar') || e.closest('.deco')) return;   // la targeta del Tito i la matrícula del cotxe són dibuix
    let r;
    if (e instanceof SVGElement) r = e.getBoundingClientRect();
    else { const rg = document.createRange(); const rs = [];                // només on hi ha lletres, no la caixa sencera
      e.childNodes.forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { rg.selectNodeContents(n); rs.push(...rg.getClientRects()); } });
      if (!rs.length) return; r = { left: Math.min(...rs.map(x => x.left)), top: Math.min(...rs.map(x => x.top)), right: Math.max(...rs.map(x => x.right)), bottom: Math.max(...rs.map(x => x.bottom)) };
      r.width = r.right - r.left; r.height = r.bottom - r.top; }
    if (r.width < 2 || r.height < 2) return;
    let px;
    if (e instanceof SVGElement) { const m = e.getScreenCTM(); px = parseFloat(e.getAttribute('font-size') || getComputedStyle(e).fontSize) * (m ? Math.hypot(m.a, m.b) : 1); }
    else { const bb = e.getBoundingClientRect(); const k = e.offsetWidth ? bb.width / e.offsetWidth : 1; px = parseFloat(getComputedStyle(e).fontSize) * k; }
    const sh = (r.bottom - r.top) * .14; r = { left: r.left, right: r.right, top: r.top + sh, bottom: r.bottom - sh };   // caixa de línia → lletres
    items.push({ e, txt: txt.slice(0, 40), r: { l: r.left, t: r.top, r: r.right, b: r.bottom }, px });
  });
  const out = [], M = vert ? 60 : 100;
  items.forEach(it => {
    const r = it.r;
    if (it.px < 35.5 && !(vert && it.e.closest('#vtop'))) out.push(['text petit', `${it.px.toFixed(0)} px`, it.txt]);
    if (r.l < M - 2 || r.r > W - M + 2 || r.b > H - 20 || r.t < (vert ? 40 : 0)) out.push(['fora de marge', `x ${r.l.toFixed(0)}–${r.r.toFixed(0)}, y ${r.t.toFixed(0)}–${r.b.toFixed(0)}`, it.txt]);
    if (hudOn && r.t < 215) out.push(['toca el medidor', `y ${r.t.toFixed(0)}`, it.txt]);
  });
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const w = Math.min(a.r.r, b.r.r) - Math.max(a.r.l, b.r.l), h = Math.min(a.r.b, b.r.b) - Math.max(a.r.t, b.r.t);
    if (w <= 0 || h <= 0) continue;
    const small = Math.min((a.r.r - a.r.l) * (a.r.b - a.r.t), (b.r.r - b.r.l) * (b.r.b - b.r.t));
    if (w * h > .3 * small) out.push(['solapament', `«${a.txt}» / «${b.txt}»`, '']);
  }
  return out;
}"""


def main():
    a = sys.argv[1:]
    vdir = pathlib.Path(a[0]).resolve()
    V = json.loads((vdir / 'video.json').read_text()); T = rv.paced(vdir, V, json.loads((vdir / 'timings.json').read_text()))
    V['starts'] = T['starts']; V['total'] = T['total'] + 1.2
    for ln, b in zip(V['lines'], rv.voice_beats(vdir, T['starts'], T['total'])): ln['scene']['_beats'] = b
    st = T['starts'] + [T['total']]; lines = range(len(V['lines'])); W, H = 1920, 1080
    if '--short' in a:
        k = a.index('--short'); i0, i1, hook = int(a[k + 1]), int(a[k + 2]), a[k + 3]
        V.update(vertical=True, hook=hook, segStart=st[i0], segEnd=min(st[i1 + 1] + .5, T['total'] + 1.0)); lines = range(i0, i1 + 1); W, H = 1080, 1920
    probs = []
    with sync_playwright() as p:
        br, pg, errs = rv.open_page(p, V, W, H)
        # cada pla (una línia pot tenir dos plans amb scene.then), al 55 % i al 85 % de la seva durada
        shots = pg.evaluate("window.__scenes.map(s => [s.t0, s.t1, s.sc.type, s.line])")
        for t0, t1, typ, i in shots:
            if i not in lines: continue
            for f in (.55, .85):
                t = t0 + (t1 - t0) * f
                for kind, where, txt in pg.evaluate(CHECK, t):
                    probs.append((i, round(t, 1), typ, kind, where, txt))
        br.close()
    seen, uniq = set(), []
    for pr in probs:
        key = (pr[0], pr[3], pr[5] or pr[4])
        if key not in seen: seen.add(key); uniq.append(pr)
    so = vdir / 'so.json'
    if so.exists():
        s = json.loads(so.read_text())
        if (s.get('marge_pic_dB') or 99) < 9.5: uniq.append(('-', '-', 'so', 'efectes massa forts', f"{s['marge_pic_dB']} dB per sota de la veu", ''))
    rep = ['# Control de qualitat', '', f'Escenes revisades: {len(lines)} · problemes: {len(uniq)}', '']
    if uniq:
        rep += ['| Línia | Segon | Escena | Problema | On | Text |', '|---|---|---|---|---|---|']
        rep += [f'| {a_} | {b_} | {c_} | {d_} | {e_} | {f_} |' for a_, b_, c_, d_, e_, f_ in uniq]
    if errs: rep += ['', 'Errors JS: ' + '; '.join(errs[:5])]
    (vdir / ('qa_short.md' if '--short' in a else 'qa.md')).write_text('\n'.join(rep) + '\n')
    print('\n'.join(rep[:40]))
    sys.exit(1 if uniq or errs else 0)


if __name__ == '__main__':
    main()
