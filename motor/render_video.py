"""Renderitza un vídeo de Cuerpo al Límite (horitzontal) o un Short vertical.

Ús:
  python3 motor/render_video.py videos/<id>                              # vídeo llarg → video.mp4
  python3 motor/render_video.py videos/<id> --stills 5,40,120            # fotogrames de prova (horitzontal)
  python3 motor/render_video.py videos/<id> --short 9 13 "Ganxo" short1  # Short vertical de les línies 9–13 → short1.mp4
  python3 motor/render_video.py videos/<id> --short 9 13 "Ganxo" short1 --stills 3,10   # proves del Short
  python3 motor/render_video.py videos/<id> --seg 10 17 tros                       # tros horitzontal de les línies 10–17 → tros.mp4
  Opcions: --range 50 62 (només aquest tros, amb so → clip.mp4) · --workers N (render en paral·lel; per defecte, un per nucli fins a 4)
           --audio (refà només el so sobre el silent.mp4 que ja hi ha)
Necessita: videos/<id>/video.json, timings.json, voz.mp3 (i marca/musica_fondo.mp3 si existeix)
"""
import json, os, re, subprocess, sys, pathlib, tempfile
from concurrent.futures import ProcessPoolExecutor
import multiprocessing as mp
import numpy as np, scipy.io.wavfile as wavfile
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent
MUSIC = ROOT.parent / 'marca' / 'musica_fondo.mp3'
FPS = 30
SR = 44100
SCENE_SFX = []   # [(tipus, segon absolut)] que exposen les escenes (fx.js)
SFX_BELOW_VOICE_DB = 10   # els pics dels efectes queden com a mínim 10 dB per sota dels de la veu
COUNTERS = {'counter', 'stats', 'gauge', 'bars', 'cells', 'amygdala'}


# ---------------- so ----------------
def synth_pad(total):
    n = int(SR * total); t = np.arange(n) / SR
    chords = [[110, 164.8, 220, 277.2], [98, 146.8, 196, 246.9], [87.3, 130.8, 174.6, 220], [98, 146.8, 196, 293.7]]
    pad = np.zeros(n); seg = 8.0
    for k in range(int(total // seg) + 1):
        ch = chords[k % 4]; s0 = int(k * seg * SR); s1 = min(n, int((k + 1) * seg * SR + SR))
        if s0 >= n: break
        tt = t[s0:s1] - k * seg; env = np.clip(tt / 2, 0, 1) * np.clip((seg + 1 - tt) / 2, 0, 1)
        for f in ch: pad[s0:s1] += np.sin(2 * np.pi * f * tt) * env * .035
    return pad * np.clip(t / 3, 0, 1) * np.clip((total - t) / 3, 0, 1)


def sfx_track(total, SH, t_off=0.0):
    """Efectes per pla (SH ve del motor: tipus, t0, t1, transició i esdeveniments de l'escena):
    cortineta = whoosh, tall = cop curt, rellotges, comptadors, batecs, segells i ambients propis de cada lloc
    (motor del cotxe, grills, teclat, escàner, cor…)."""
    from scipy.signal import butter, lfilter
    n = int(SR * total); out = np.zeros(n); rng = np.random.default_rng(2)
    def put(at, sig, g=1.0):
        i0 = int(round((at - t_off) * SR)); s0 = 0
        if i0 < 0: s0, i0 = -i0, 0
        if i0 >= n or s0 >= len(sig): return
        e = min(len(sig) - s0, n - i0); out[i0:i0 + e] += sig[s0:s0 + e] * g
    def tone(f0, f1, dur, decay):
        tt = np.arange(int(dur * SR)) / SR; f = np.linspace(f0, f1, len(tt))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * decay)
    def filt(x, lo=None, hi=None, order=2):
        if lo and hi: b, a = butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
        elif lo: b, a = butter(order, lo / (SR / 2), 'high')
        else: b, a = butter(order, hi / (SR / 2), 'low')
        return lfilter(b, a, x)
    def fade(x, fi=.3, fo=.3):
        m = len(x); e = np.ones(m); a, b = min(int(fi * SR), m), min(int(fo * SR), m)
        if a: e[:a] *= np.linspace(0, 1, a)
        if b: e[-b:] *= np.linspace(1, 0, b)
        return x * e
    def noise(d): return rng.standard_normal(max(1, int(d * SR)))
    m = int(.55 * SR)
    whoosh = filt(noise(.55), 300, 5000) * np.sin(np.linspace(0, np.pi, m)) ** 2 * .3
    cutk = filt(noise(.16), 1500, 9000) * np.exp(-np.arange(int(.16 * SR)) / SR * 30) * .12; cutk[:int(.14 * SR)] += tone(140, 70, .14, 22) * .16
    tick = tone(2400, 2200, .04, 90) * .25
    blip = lambda k: tone(500 + 90 * k, 700 + 90 * k, .07, 40) * .12
    beat = tone(70, 45, .18, 18) * .5
    thump = tone(110, 60, .25, 14) * .18
    stamp = tone(90, 40, .35, 11) * .55
    stamp_hi = filt(noise(.12), 800, None) * np.exp(-np.arange(int(.12 * SR)) / SR * 40) * .25
    def car(d):
        t = np.arange(int(d * SR)) / SR; f0 = 36 + 2.5 * np.sin(2 * np.pi * .13 * t); ph = 2 * np.pi * np.cumsum(f0) / SR
        eng = sum(np.sin(h * ph) / h for h in range(1, 8)) * (1 + .25 * np.sin(ph * .5))
        eng = filt(eng, None, 400) * .05; road = filt(noise(d), 40, 380) * .065
        sw = np.zeros(len(t))
        for x in np.arange(.6, d, 1.2):
            i0 = int(x * SR); s = filt(noise(.5), 400, 3000) * np.sin(np.linspace(0, np.pi, int(.5 * SR))) ** 3 * .035
            e = min(len(s), len(sw) - i0); sw[i0:i0 + e] += s[:e] if e > 0 else 0
        return fade(eng + road + sw, .25, .25)
    def rumble():
        d = .75; t = np.arange(int(d * SR)) / SR; pul = (np.sin(2 * np.pi * 26 * t) > 0) * 1.0
        x = filt(noise(d), 30, 260) * pul * .45 + np.sin(2 * np.pi * 62 * t) * pul * .18
        return x * np.minimum(1, t / .04) * np.minimum(1, (d - t) / .15)
    def night(d):
        t = np.arange(int(d * SR)) / SR; x = filt(noise(d), None, 300) * .008
        for f, per, off in ((4300, .95, .1), (4720, 1.3, .55)):
            u = (t + off) % per; gate = ((u < .27) & ((u * 30) % 1 < .55)) * 1.0
            x += np.sin(2 * np.pi * f * t) * filt(gate, None, 300) * .02
        return fade(x, .3, .3)
    def birds(d):
        t = np.arange(int(d * SR)) / SR; x = filt(noise(d), None, 400) * .006
        for c in np.arange(.4, d - .4, .9):
            if rng.random() < .65:
                dd = .14; tt = np.arange(int(dd * SR)) / SR; f = 2600 + 900 * np.sin(np.pi * tt / dd) + rng.random() * 600
                s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / dd) ** 2 * .03; i0 = int(c * SR); e = min(len(s), len(x) - i0); x[i0:i0 + e] += s[:e]
        return fade(x, .3, .3)
    def buzz():
        d = .32; t = np.arange(int(d * SR)) / SR; s = np.sign(np.sin(2 * np.pi * 165 * t)) * .5 + np.sin(2 * np.pi * 330 * t) * .3
        s = filt(s, None, 900) * np.minimum(1, t / .02) * np.minimum(1, (d - t) / .03) * .16
        return np.concatenate([s, np.zeros(int(.14 * SR)), s])
    def alarm(d):
        t = np.arange(int(d * SR)) / SR; on = ((t % .5) < .32) & (((t % .5) * 8) % 1 < .6)
        return np.sin(2 * np.pi * 2350 * t) * filt(on * 1.0, None, 400) * .085
    def typing(d):
        x = np.zeros(int(d * SR)); c = 0.0
        while c < d - .05:
            k = filt(noise(.012), 1800, 7000) * np.exp(-np.arange(int(.012 * SR)) / SR * 400) * (.05 + .05 * rng.random())
            i0 = int(c * SR); e = min(len(k), len(x) - i0); x[i0:i0 + e] += k[:e]
            c += rng.exponential(.085) + .03 + (.45 if rng.random() < .06 else 0)
        return x
    def scan(d):
        t = np.arange(int(d * SR)) / SR; f = np.linspace(240, 900, len(t)); ph = 2 * np.pi * np.cumsum(f) / SR
        s = (np.sin(ph) + .35 * np.sin(2 * ph)) * (.6 + .4 * np.sin(2 * np.pi * 14 * t)) * .05 + filt(noise(d), 2500, None) * .012
        return fade(s, .08, .12)
    beep = np.concatenate([tone(1320, 1320, .09, 4) * .11, np.zeros(int(.04 * SR)), tone(1760, 1760, .14, 6) * .11])
    def zoom(d):
        t = np.arange(int(d * SR)) / SR; s = filt(noise(d), 300, 4000) * (t / d) ** 2 * .22 + np.sin(2 * np.pi * np.cumsum(np.linspace(180, 900, len(t))) / SR) * (t / d) ** 2 * .05
        return np.concatenate([s, thump * 1.6])
    lub, dub = tone(62, 44, .14, 22) * .55, tone(78, 56, .11, 28) * .38
    def breath(d, o, a):
        t = np.arange(int(d * SR)) / SR; lt = t + (a - o); env = np.abs(np.cos(1.7 * lt)) ** 2
        return fade(filt(noise(d), 400, 1800) * env * .035, .2, .3)
    # sons de les escenes GSAP de fx.js (cada escena diu quan passa cada cosa: o.sfx)
    click = np.pad(tone(1800, 900, .05, 70) * .22, (0, int(.03 * SR))) + tone(300, 180, .08, 40) * .25
    m2 = int(.4 * SR); w2 = np.convolve(rng.standard_normal(m2), np.ones(25) / 25, 'same') * np.sin(np.linspace(0, np.pi, m2)) ** 2 * .22
    KIND = {'whoosh': w2, 'click': click, 'stamp': stamp * .9, 'pop': tone(600, 1100, .06, 50) * .14, 'tick': tick * .8, 'thump': thump, 'blip': blip(3)}
    # sintonia de marca (3 notes de marimba, igual a tots els vídeos): a la fitxa experimento i al tancament
    def mar(f, dur=.45): tt = np.arange(int(dur * SR)) / SR; return (np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * 4 * f * tt) * np.exp(-tt * 30)) * np.exp(-tt * 9)
    logo = np.zeros(int(1.1 * SR))
    for k, (f, g) in enumerate(((523.25, .5), (659.25, .5), (987.77, .65))): i0 = int(k * .13 * SR); x = mar(f) * g * .55; logo[i0:i0 + len(x)] += x[:len(logo) - i0]
    for s in SH:
        if s['type'] == 'experimento': put(s.get('ta', s['t0']) + .35, logo)
        if s['type'] == 'endcard': put(s.get('ta', s['t0']) + .25, logo)
    for kind, at in SCENE_SFX:
        if kind in KIND: put(at, KIND[kind])
        if kind == 'stamp': put(at, stamp_hi, .8)
    for i, s in enumerate(SH):
        t0, b, typ = s['t0'], s['t1'], s['type']; a = s.get('ta', t0)  # a = rellotge intern de l'escena (amb pre-roll)
        # transicions sense so (el Manel no el vol)
        if typ == 'clock':
            for k in range(8): put(a + .1 + k * .18, tick)
        if typ in COUNTERS:
            for k in range(10): put(a + .35 + k * .14, blip(k))
        if typ == 'amygdala':
            x = a + 1.3
            while x < b - .3: put(x, beat); put(x + .22, beat, .6); x += .95
        if typ == 'experimento': put(a + .75, stamp); put(a + .78, stamp_hi)
        if typ == 'veredicto': put(a + 1.3, stamp); put(a + 1.33, stamp_hi)
        if b - a > 6.5: put(a + (b - a) * .52, thump)
        for e in s.get('ev') or []:
            k, t, d = e['k'], e['t'], max(.1, e.get('d', .5))
            if k == 'car': put(t, car(d + .3))
            elif k == 'rumble': put(t, rumble())
            elif k == 'night': put(t, night(d + .3))
            elif k == 'birds': put(t, birds(d + .3))
            elif k == 'buzz': put(t, buzz())
            elif k == 'alarm': put(t, alarm(d))
            elif k == 'typing': put(t, typing(d))
            elif k == 'scan': put(t, scan(d))
            elif k == 'beep': put(t, beep)
            elif k == 'zoom': put(t, zoom(d))
            elif k == 'heart':
                bpm = e.get('bpm', 1.25); o = a; j = int(np.ceil((t - o) * bpm - .25))
                while o + (j + .25) / bpm < t + d - .2: x = o + (j + .25) / bpm - .03; put(x, lub); put(x + .2, dub); j += 1
            elif k == 'breath': put(t, breath(d, a, t))
            elif k == 'fill':
                nn = e.get('n', 12)
                for q in range(nn): put(t + q * d / nn, blip(q % 10), .8)
    return out


def load_audio(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.int16).astype(np.float32) / 32768


def music_track(total, t_off=0.0):
    if MUSIC.exists() and MUSIC.stat().st_size > 10000:
        m = load_audio(MUSIC); n = int(SR * total); i0 = int(t_off * SR) % len(m)
        reps = np.tile(m, int((i0 + n) / len(m)) + 2)[i0:i0 + n]
        t = np.arange(n) / SR
        return reps * np.clip(t / 1.5, 0, 1) * np.clip((total - t) / 2, 0, 1)
    return synth_pad(total)


def limit_sfx(bed, vdir, t_off, total):
    """Que els efectes no tapin mai la veu: pics ≥ SFX_BELOW_VOICE_DB per sota dels de la veu i,
    on sonen, ≥ 16 dB de mitjana per sota de la veu parlada. Escriu l'informe a so.json."""
    v = load_audio(VOICE[0])[int(t_off * SR):int((t_off + total) * SR)]
    db = lambda x: 20 * np.log10(max(float(x), 1e-9))
    fr = lambda x: np.sqrt(np.mean(x[:len(x) // 1024 * 1024].reshape(-1, 1024) ** 2, axis=1)) if len(x) >= 1024 else np.array([0.0])
    vpk = np.percentile(np.abs(v), 99.9) if len(v) else .5; vf = fr(v); vrms = np.sqrt(np.mean(vf[vf > .02] ** 2)) if (vf > .02).any() else .1
    bf = fr(bed); act = bf[bf > 1e-3]; brms = np.sqrt(np.mean(act ** 2)) if len(act) else 0
    bpk = np.max(np.abs(bed)) if len(bed) else 0
    g = 1.0
    if bpk > 0: g = min(g, 10 ** (-SFX_BELOW_VOICE_DB / 20) * vpk / bpk)
    if brms > 0: g = min(g, 10 ** (-16 / 20) * vrms / brms)
    rep = {'veu_pic_dB': float(round(db(vpk), 1)), 'efectes_pic_dB': float(round(db(bpk * g), 1)), 'marge_pic_dB': float(round(db(vpk) - db(bpk * g), 1)),
           'marge_mitjana_dB': float(round(db(vrms) - db(brms * g), 1)) if brms else None, 'guany_aplicat': float(round(g, 3))}
    (vdir / 'so.json').write_text(json.dumps(rep, indent=1)); print('  so:', rep, flush=True)
    return bed * g


def mix(vdir, SH, total, t_off, video_in, out):
    bed = sfx_track(total, SH, t_off)
    bed = limit_sfx(bed, vdir, t_off, total)
    wavfile.write(str(vdir / 'sfx.wav'), SR, (np.stack([bed, bed], 1) * 32767).clip(-32767, 32767).astype(np.int16))
    mus = music_track(total, t_off)
    wavfile.write(str(vdir / 'music.wav'), SR, (np.stack([mus, mus], 1) * 32767 * .9).clip(-32767, 32767).astype(np.int16))
    # la música baixa sola quan parla la veu (sidechain)
    fc = ('[1:a]aresample=44100,asplit=2[v1][v2];'
          '[3:a]volume=0.24[mu];[mu][v1]sidechaincompress=threshold=0.015:ratio=10:attack=15:release=500[duck];'
          '[2:a]volume=1.0[fx];[v2][duck][fx]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video_in), '-ss', f'{t_off:.3f}', '-t', f'{total:.3f}', '-i', str(VOICE[0]),
                    '-i', str(vdir / 'sfx.wav'), '-i', str(vdir / 'music.wav'), '-filter_complex', fc,
                    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(out)], check=True)


# ---------------- imatge ----------------
PAUSA = 0.5   # segons de silenci afegits entre línies de la veu (respira; el Manel ho volia menys atapeït)
VOICE = [None]


def paced(vdir, V, T):
    """Afegeix PAUSA s de silenci abans de cada línia (excepte la primera) i retorna els temps nous.
    La veu original no es toca: es desa voz_p.wav. video.json pot canviar-ho amb "pausa": 0.3."""
    gap = float(V.get('pausa', PAUSA)); src = vdir / 'voz.mp3'
    if gap <= 0: VOICE[0] = src; return T
    out = vdir / 'voz_p.wav'; a = load_audio(src); st = T['starts']; parts = []; new = []
    for i, s0 in enumerate(st):
        i0 = int(s0 * SR); i1 = int(st[i + 1] * SR) if i + 1 < len(st) else len(a)
        new.append(s0 + gap * i); parts.append(a[i0:i1])
        if i + 1 < len(st): parts.append(np.zeros(int(gap * SR)))
    x = np.concatenate(parts); wavfile.write(str(out), SR, (x * 32767).clip(-32767, 32767).astype(np.int16))
    VOICE[0] = out
    return dict(T, starts=new, total=T['total'] + gap * (len(st) - 1))


def voice_beats(vdir, starts, total):
    """Inici de cada frase dins de cada línia, a partir de les pauses reals de la veu (gratis, sense IA)."""
    r = subprocess.run(['ffmpeg', '-v', 'info', '-i', str(VOICE[0]), '-af', 'silencedetect=n=-35dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True)
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r.stderr)]
    st = list(starts) + [total]
    return [[round(e - st[i], 3) for e in ends if st[i] + .2 < e < st[i + 1] - .4] for i in range(len(starts))]


def open_page(p, V, W, H):
    br = p.chromium.launch(executable_path=('/usr/bin/google-chrome' if __import__('os').path.exists('/usr/bin/google-chrome') else None), args=['--force-device-scale-factor=1', '--allow-file-access-from-files'])
    pg = br.new_page(viewport={'width': W, 'height': H})
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
    pg.goto((ROOT / 'engine.html').as_uri()); pg.wait_for_timeout(300)
    pg.evaluate('V => { window.VIDEO = V; Motor.build(V); }', V)
    pg.wait_for_function('[...document.images].every(i => i.complete)', timeout=20000)
    return br, pg, errs


def frame_times(t0, t1):
    return [t0 + i / FPS for i in range(int((t1 - t0) * FPS))]


def render_chunk(args):
    """Un treballador: renderitza els fotogrames [a, b) en un fitxer propi. Abans «escalfa» l'estat del HUD
    (recuperació) visitant només els fotogrames on canvia d'escena, així el resultat és idèntic al d'un sol procés."""
    V, W, H, times, a, b, out = args
    with sync_playwright() as p:
        br, pg, errs = open_page(p, V, W, H)
        if a:
            cuts = set()
            for s0 in V['starts']:
                k = next((i for i, t in enumerate(times) if t >= s0), None)
                if k is not None and k < a: cuts.update({max(0, k - 1), k})
            for k in sorted(cuts): pg.evaluate(f'Motor.render({times[k]})')
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', str(out)], stdin=subprocess.PIPE)
        for i in range(a, b):
            pg.evaluate(f'Motor.render({times[i]})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=90))
            if (i - a) % 900 == 0: print(f'  [{a}-{b}] frame {i}', flush=True)
        ff.stdin.close(); ff.wait(); br.close()
    return errs[:5]


def main():
    args = sys.argv[1:]
    vdir = pathlib.Path(args[0]).resolve()
    V = json.loads((vdir / 'video.json').read_text()); T = paced(vdir, V, json.loads((vdir / 'timings.json').read_text()))
    V['starts'] = T['starts']; V['total'] = T['total'] + 1.2
    for ln, b in zip(V['lines'], voice_beats(vdir, T['starts'], T['total'])): ln['scene']['_beats'] = b
    stills = [float(x) for x in args[args.index('--stills') + 1].split(',')] if '--stills' in args else None
    workers = int(args[args.index('--workers') + 1]) if '--workers' in args else max(1, min(4, os.cpu_count() or 1))
    short = None; seg = None
    if '--seg' in args:  # tros horitzontal: --seg <línia_ini> <línia_fi> <nom>
        k = args.index('--seg'); a, b, name = int(args[k + 1]), int(args[k + 2]), args[k + 3]
        st = T['starts'] + [T['total']]; t0, t1 = st[a], min(st[b + 1] + .4, T['total'] + 1.0)
        V.update(segStart=t0, segEnd=t1); seg = (t0, t1, name)
    if '--short' in args:
        k = args.index('--short'); a, b, hook, name = int(args[k + 1]), int(args[k + 2]), args[k + 3], args[k + 4]
        st = T['starts'] + [T['total']]
        t0, t1 = st[a], min(st[b + 1] + .5, T['total'] + 1.0)
        V.update(vertical=True, hook=hook, segStart=t0, segEnd=t1); short = (t0, t1, name)
    W, H = (1080, 1920) if short else (1920, 1080)
    with sync_playwright() as p:
        br, pg, errs = open_page(p, V, W, H)
        if stills:
            for s in stills:
                tt = (short[0] + s) if short else s
                pg.evaluate(f'Motor.render({tt})'); pg.screenshot(path=str(vdir / f"still_{'v' if short else ''}{s:g}.png"))
            br.close()
            if errs: print('ERRORS:', errs[:5])
            return
        # efectes de so de cada pla: escenes GSAP (o.sfx = [[tipus, segon local]]) i escenes de lloc/escàner (o.sfx(a, b) → esdeveniments)
        SCENE_SFX[:] = [tuple(x) for x in pg.evaluate("""() => window.__scenes.flatMap(s => { const pre = s.pre || 0; if (s.plan) s.plan(s.t1 - s.t0 + pre);
            return Array.isArray(s.sfx) ? s.sfx.map(([k, t]) => [k, t + s.t0 - pre]) : []; })""")]
        SH = pg.evaluate("window.__scenes.map(s => ({type: s.sc.type, t0: s.t0, t1: s.t1, ta: s.t0 - (s.pre || 0), tr: s.tr, ev: typeof s.sfx === 'function' ? s.sfx(s.t0 - (s.pre || 0), s.t1) : []}))")
        for s in SH:  # avís: plans llargs sense segon temps
            if s['t1'] - s['t0'] > 8 and s['type'] not in ('situacion', 'escaner', 'stats', 'endcard', 'encaje'): print(f"  AVÍS: pla de {s['t1'] - s['t0']:.1f} s ({s['type']} a {s['t0']:.1f} s): parteix-lo amb scene.then")
        br.close()
    cut = short or seg
    t0, t1 = (cut[0], cut[1]) if cut else (0.0, V['total'])
    rng_ = None
    if '--range' in args:   # tros de prova amb so: --range 50 62 → clip.mp4
        k = args.index('--range'); t0, t1 = float(args[k + 1]), float(args[k + 2]); rng_ = 'clip'
    silent = vdir / ('silent_short.mp4' if short else 'silent.mp4')
    out = vdir / (f'{cut[2]}.mp4' if cut else (f'{rng_}.mp4' if rng_ else 'video.mp4'))
    if '--audio' in args and silent.exists():  # només refà el so (el vídeo mut ja hi és)
        mix(vdir, SH, t1 - t0, t0, silent, out); print('OK', out); return
    times = frame_times(t0, t1); N = len(times); n = max(1, min(workers, N // 60 or 1))
    bounds = [N * k // n for k in range(n + 1)]
    with tempfile.TemporaryDirectory() as td:
        parts = [pathlib.Path(td) / f'p{k}.mp4' for k in range(n)]
        jobs = [(V, W, H, times, bounds[k], bounds[k + 1], parts[k]) for k in range(n)]
        print(f'  render: {N} fotogrames amb {n} treballadors', flush=True)
        if n == 1: errs = render_chunk(jobs[0])
        else:
            with ProcessPoolExecutor(n, mp_context=mp.get_context('spawn')) as ex: errs = sum(ex.map(render_chunk, jobs), [])
        (pathlib.Path(td) / 'list.txt').write_text(''.join(f"file '{x}'\n" for x in parts))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(pathlib.Path(td) / 'list.txt'), '-c', 'copy', str(silent)], check=True)
    if errs: print('ERRORS JS:', errs[:5])
    mix(vdir, SH, t1 - t0, t0, silent, out)
    print('OK', out)


if __name__ == '__main__':
    main()
