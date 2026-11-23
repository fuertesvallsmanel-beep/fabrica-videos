"""Talla un Short vertical (1080x1920) d'un vídeo llarg ja renderitzat.

Ús: python3 motor/make_short.py videos/<id> <linia_inici> <linia_fi> "<títol ganxo>" <nom_sortida>
- Agafa el tram de video.mp4 entre l'inici de <linia_inici> i el final de <linia_fi> (índexs de video.json).
- Fons: el mateix vídeo ampliat i difuminat; al centre el 16:9; títol a dalt; subtítols grans a baix.
"""
import json, subprocess, sys, pathlib, textwrap

vdir = pathlib.Path(sys.argv[1]).resolve(); a, b = int(sys.argv[2]), int(sys.argv[3]); hook = sys.argv[4]; name = sys.argv[5]
V = json.loads((vdir / 'video.json').read_text()); T = json.loads((vdir / 'timings.json').read_text())
st = T['starts'] + [T['total']]
t0, t1 = st[a], st[b + 1] + 0.3
dur = t1 - t0

def ts(x):
    h = int(x // 3600); m = int(x % 3600 // 60); s = x % 60
    return f'{h}:{m:02d}:{s:05.2f}'

ass = ['[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', '',
       '[V4+ Styles]', 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
       'Style: Hook,Inter Display Black,78,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,0,0,8,70,70,230,1',
       'Style: Cap,Inter Display ExtraBold,64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,5,0,2,80,80,330,1',
       'Style: End,Inter Display ExtraBold,58,&H0085B7FB,&H00FFFFFF,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,4,0,2,80,80,200,1', '',
       '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
ass.append(f'Dialogue: 0,{ts(0)},{ts(dur)},Hook,,0,0,0,,' + '\\N'.join(textwrap.wrap(hook.upper(), 22)))
# subtítols: cada línia partida en trossos de ~5 paraules repartits pel temps de la línia
for i in range(a, b + 1):
    words = V['lines'][i]['text'].split(); l0, l1 = st[i] - t0, st[i + 1] - t0
    chunks = [' '.join(words[k:k + 5]) for k in range(0, len(words), 5)]
    tot = sum(len(c) for c in chunks); cur = l0
    for c in chunks:
        d = (l1 - l0) * len(c) / tot
        ass.append(f'Dialogue: 1,{ts(cur)},{ts(cur + d)},Cap,,0,0,0,,{c}'); cur += d
ass.append(f'Dialogue: 2,{ts(dur - 2.6)},{ts(dur)},End,,0,0,0,,{{\\fad(300,0)}}Vídeo completo en el canal ▶')
(vdir / f'{name}.ass').write_text('\n'.join(ass), encoding='utf-8')
out = vdir / f'{name}.mp4'
fc = ('[0:v]split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=-0.25[bg];'
      '[b]scale=1080:-2[fg];[bg][fg]overlay=0:(H-h)/2-60,'
      f"subtitles={vdir / (name + '.ass')}:fontsdir=/usr/share/fonts/opentype/inter[v]")
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{t0:.3f}', '-t', f'{dur:.3f}', '-i', str(vdir / 'video.mp4'),
                '-filter_complex', fc, '-map', '[v]', '-map', '0:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
                '-c:a', 'aac', '-b:a', '160k', '-af', 'afade=t=out:st=%.2f:d=0.5' % (dur - 0.5), '-movflags', '+faststart', str(out)], check=True)
print('OK', out, round(dur, 1), 's')
