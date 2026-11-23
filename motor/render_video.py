"""Renderitza un vídeo de Cuerpo al Límite.

Ús:
  python3 motor/render_video.py videos/<id>            # vídeo complet (video.mp4)
  python3 motor/render_video.py videos/<id> --stills 5,40,120   # fotogrames de prova
Necessita: videos/<id>/video.json, timings.json, voz.mp3
"""
import json, subprocess, sys, pathlib, math
import numpy as np, scipy.io.wavfile as wavfile
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent
FPS = 30


def music_bed(total, path, sr=44100, seed=1):
    """Fons ambiental sintetitzat (lliure de drets) + whooshes als canvis d'escena."""
    n = int(sr * total); t = np.arange(n) / sr
    chords = [[110, 164.8, 220, 277.2], [98, 146.8, 196, 246.9], [87.3, 130.8, 174.6, 220], [98, 146.8, 196, 293.7]]
    pad = np.zeros(n); seg = 8.0
    for k in range(int(total // seg) + 1):
        ch = chords[k % 4]; s0 = int(k * seg * sr); s1 = min(n, int((k + 1) * seg * sr + sr))
        if s0 >= n: break
        tt = t[s0:s1] - k * seg; env = np.clip(tt / 2, 0, 1) * np.clip((seg + 1 - tt) / 2, 0, 1)
        for f in ch:
            pad[s0:s1] += (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.003 * tt)) * env * .035
    pad += np.sin(2 * np.pi * 55 * t) * .03 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t))
    pad *= np.clip(t / 3, 0, 1) * np.clip((total - t) / 3, 0, 1)
    return pad


def sfx(total, starts, sr=44100, seed=2):
    n = int(sr * total); out = np.zeros(n); rng = np.random.default_rng(seed)
    for s in starts[1:]:
        i0 = int(max(0, s - .25) * sr); m = int(.6 * sr); nz = rng.standard_normal(m)
        k = np.convolve(nz, np.ones(40) / 40, 'same') * np.sin(np.linspace(0, np.pi, m)) ** 2 * .35
        e = min(m, n - i0); out[i0:i0 + e] += k[:e]
    return out


def main():
    vdir = pathlib.Path(sys.argv[1]).resolve()
    V = json.loads((vdir / 'video.json').read_text())
    T = json.loads((vdir / 'timings.json').read_text())
    V['starts'] = T['starts']; V['total'] = T['total'] + 1.2
    stills = None
    if '--stills' in sys.argv: stills = [float(x) for x in sys.argv[sys.argv.index('--stills') + 1].split(',')]
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--force-device-scale-factor=1', '--allow-file-access-from-files'])
        pg = b.new_page(viewport={'width': 1920, 'height': 1080})
        errs = []; pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto((ROOT / 'engine.html').as_uri()); pg.wait_for_timeout(300)
        pg.evaluate('V => { window.VIDEO = V; Motor.build(V); }', V)
        if stills:
            for s in stills:
                pg.evaluate(f'Motor.render({s})'); pg.screenshot(path=str(vdir / f'still_{s:g}.png'))
        else:
            silent = vdir / 'silent.mp4'
            ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                                   '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', str(silent)], stdin=subprocess.PIPE)
            N = int(V['total'] * FPS)
            for i in range(N):
                pg.evaluate(f'Motor.render({i / FPS})')
                ff.stdin.write(pg.screenshot(type='jpeg', quality=90))
                if i % 900 == 0: print(f'  frame {i}/{N}', flush=True)
            ff.stdin.close(); ff.wait()
        b.close()
        if errs: print('ERRORS JS:', errs[:5])
    if stills: return
    sr = 44100; total = V['total']
    bed = music_bed(total, None) + sfx(total, T['starts'])
    wavfile.write(str(vdir / 'bed.wav'), sr, (np.stack([bed, bed], 1) * 32767 * .9).clip(-32767, 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(vdir / 'silent.mp4'), '-i', str(vdir / 'voz.mp3'), '-i', str(vdir / 'bed.wav'),
                    '-filter_complex', '[1:a]volume=1.0[v];[2:a]volume=0.55[m];[v][m]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]',
                    '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(vdir / 'video.mp4')], check=True)
    print('OK', vdir / 'video.mp4')


if __name__ == '__main__':
    main()
