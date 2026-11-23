"""Renderitza un vídeo de Cuerpo al Límite (horitzontal) o un Short vertical.

Ús:
  python3 motor/render_video.py videos/<id>                              # vídeo llarg → video.mp4
  python3 motor/render_video.py videos/<id> --stills 5,40,120            # fotogrames de prova (horitzontal)
  python3 motor/render_video.py videos/<id> --short 9 13 "Ganxo" short1  # Short vertical de les línies 9–13 → short1.mp4
  python3 motor/render_video.py videos/<id> --short 9 13 "Ganxo" short1 --stills 3,10   # proves del Short
Necessita: videos/<id>/video.json, timings.json, voz.mp3 (i marca/musica_fondo.mp3 si existeix)
"""
import json, subprocess, sys, pathlib
import numpy as np, scipy.io.wavfile as wavfile
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent
MUSIC = ROOT.parent / 'marca' / 'musica_fondo.mp3'
FPS = 30
SR = 44100
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


def sfx_track(total, V, starts, t_off=0.0):
    """Efectes segons el tipus d'escena: whoosh als canvis, tic-tac als rellotges, blips als comptadors,
    batecs a l'amígdala, cop suau al zoom de mitja escena."""
    n = int(SR * total); out = np.zeros(n); rng = np.random.default_rng(2)
    def put(at, sig, g=1.0):
        i0 = int((at - t_off) * SR)
        if i0 < 0 or i0 >= n: return
        e = min(len(sig), n - i0); out[i0:i0 + e] += sig[:e] * g
    def tone(f0, f1, dur, decay):
        tt = np.arange(int(dur * SR)) / SR; f = np.linspace(f0, f1, len(tt))
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * decay)
    m = int(.55 * SR); nz = rng.standard_normal(m)
    whoosh = np.convolve(nz, np.ones(40) / 40, 'same') * np.sin(np.linspace(0, np.pi, m)) ** 2 * .35
    tick = tone(2400, 2200, .04, 90) * .25
    blip = lambda k: tone(500 + 90 * k, 700 + 90 * k, .07, 40) * .12
    beat = tone(70, 45, .18, 18) * .5
    thump = tone(110, 60, .25, 14) * .18
    ends = starts[1:] + [V['total']]
    for i, ln in enumerate(V['lines']):
        a, b = starts[i], ends[i]; typ = ln['scene']['type']
        if i: put(a - .25, whoosh)
        if typ == 'clock':
            for k in range(8): put(a + .1 + k * .18, tick)
        if typ in COUNTERS:
            for k in range(10): put(a + .35 + k * .14, blip(k))
        if typ == 'amygdala':
            x = a + 1.3
            while x < b - .3: put(x, beat); put(x + .22, beat, .6); x += .95
        if b - a > 6.5: put(a + (b - a) * .52, thump)
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


def mix(vdir, V, starts, total, t_off, video_in, out):
    bed = sfx_track(total, V, starts, t_off)
    wavfile.write(str(vdir / 'sfx.wav'), SR, (np.stack([bed, bed], 1) * 32767).clip(-32767, 32767).astype(np.int16))
    mus = music_track(total, t_off)
    wavfile.write(str(vdir / 'music.wav'), SR, (np.stack([mus, mus], 1) * 32767 * .9).clip(-32767, 32767).astype(np.int16))
    # la música baixa sola quan parla la veu (sidechain)
    fc = ('[1:a]aresample=44100,asplit=2[v1][v2];'
          '[3:a]volume=0.5[mu];[mu][v1]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[duck];'
          '[2:a]volume=1.0[fx];[v2][duck][fx]amix=inputs=3:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video_in), '-ss', f'{t_off:.3f}', '-t', f'{total:.3f}', '-i', str(vdir / 'voz.mp3'),
                    '-i', str(vdir / 'sfx.wav'), '-i', str(vdir / 'music.wav'), '-filter_complex', fc,
                    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(out)], check=True)


# ---------------- imatge ----------------
def main():
    args = sys.argv[1:]
    vdir = pathlib.Path(args[0]).resolve()
    V = json.loads((vdir / 'video.json').read_text()); T = json.loads((vdir / 'timings.json').read_text())
    V['starts'] = T['starts']; V['total'] = T['total'] + 1.2
    stills = [float(x) for x in args[args.index('--stills') + 1].split(',')] if '--stills' in args else None
    short = None
    if '--short' in args:
        k = args.index('--short'); a, b, hook, name = int(args[k + 1]), int(args[k + 2]), args[k + 3], args[k + 4]
        st = T['starts'] + [T['total']]
        t0, t1 = st[a], min(st[b + 1] + .5, T['total'] + 1.0)
        V.update(vertical=True, hook=hook, segStart=t0, segEnd=t1); short = (t0, t1, name)
    W, H = (1080, 1920) if short else (1920, 1080)
    with sync_playwright() as p:
        br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--force-device-scale-factor=1', '--allow-file-access-from-files'])
        pg = br.new_page(viewport={'width': W, 'height': H})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        pg.goto((ROOT / 'engine.html').as_uri()); pg.wait_for_timeout(300)
        pg.evaluate('V => { window.VIDEO = V; Motor.build(V); }', V)
        if stills:
            for s in stills:
                tt = (short[0] + s) if short else s
                pg.evaluate(f'Motor.render({tt})'); pg.screenshot(path=str(vdir / f"still_{'v' if short else ''}{s:g}.png"))
            br.close()
            if errs: print('ERRORS:', errs[:5])
            return
        t0, t1 = (short[0], short[1]) if short else (0.0, V['total'])
        silent = vdir / ('silent_short.mp4' if short else 'silent.mp4')
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', str(silent)], stdin=subprocess.PIPE)
        N = int((t1 - t0) * FPS)
        for i in range(N):
            pg.evaluate(f'Motor.render({t0 + i / FPS})'); ff.stdin.write(pg.screenshot(type='jpeg', quality=90))
            if i % 900 == 0: print(f'  frame {i}/{N}', flush=True)
        ff.stdin.close(); ff.wait(); br.close()
        if errs: print('ERRORS JS:', errs[:5])
    out = vdir / (f'{short[2]}.mp4' if short else 'video.mp4')
    mix(vdir, V, T['starts'], t1 - t0, t0, silent, out)
    print('OK', out)


if __name__ == '__main__':
    main()
