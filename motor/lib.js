// Cuerpo al Límite — motor d'escenes animades (1920x1080, temps determinista).
// Cada escena: builder(scene, ctx) -> {el, render(lt, d)}. lt = temps local (s), d = durada.
(function () {
  const W = 1920, H = 1080;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const prog = (t, s, d) => clamp((t - s) / d);
  const eo = x => 1 - Math.pow(1 - clamp(x), 3);
  const eio = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = x => { x = clamp(x); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const lerp = (a, b, x) => a + (b - a) * x;
  const C = { cyan: '#3EF0FF', mint: '#3EF0FF', blue: '#7FB2FF', red: '#FF3B6B', pink: '#FF3B6B', orange: '#FF8A3D', violet: '#B79CFF', lilac: '#B79CFF', indigo: '#9FB0FF', yellow: '#FFD60A', green: '#4DF0A0', text: '#FFFFFF', muted: '#9AA6F0', soft: '#D3DAFF', ink: '#0B0F4A', panel: '#1724B0' };
  // Marca «Cobalto pop»: FD = titulars i xifres (Bricolage Grotesque condensada) · SHD = ombra d'adhesiu
  const FD = "font-family:'Brico',sans-serif;font-weight:800;font-stretch:76%;letter-spacing:-1px";
  const SHD = 'text-shadow:8px 8px 0 #0A1A8C';
  const col = c => C[c] || (typeof c === 'string' && c[0] === '#' ? c : C.cyan);
  function E(tag, css, html) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; return e; }
  function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  const nl = s => (s || '').replace(/\n/g, '<br>');
  // entrada típica: fade + slide
  function enter(el, lt, start, dy = 30, dur = .6) { const a = eo(prog(lt, start, dur)); el.style.opacity = a; el.style.transform = `translateY(${(1 - a) * dy}px)`; return a; }

  // ---------- SVG del cervell (vista lateral, frontal a l'esquerra) ----------
  const BRAIN = {
    cer: 'M84,252 C66,170 118,96 210,70 C290,44 392,46 460,86 C540,132 572,212 548,280 C534,318 500,334 458,330 C430,352 396,358 368,348 C344,372 300,380 270,366 C236,380 190,376 162,350 C120,340 92,300 84,252 Z',
    cb: 'M418,318 C468,318 512,344 506,384 C500,420 452,436 408,424 C376,416 362,392 372,366 C380,342 396,320 418,318 Z',
    cbl: 'M388,378 C420,368 460,370 496,384 M384,398 C418,390 456,394 488,408 M398,356 C430,350 466,352 496,362',
    bs: 'M332,350 C340,392 344,424 338,466 L372,466 C378,430 382,398 384,360 Z',
    syl: 'M168,286 C220,270 262,262 300,246 C330,234 360,226 392,224',
    cen: 'M318,58 C306,96 322,126 304,160 C292,186 304,212 296,240',
    gyri: 'M120,200 C150,170 140,140 176,124 C206,112 200,90 236,84 M150,236 C186,222 190,196 222,186 C252,178 252,150 280,140 M200,250 C226,236 248,236 262,210 C276,186 276,170 290,150 M352,80 C344,118 366,140 356,176 C350,200 364,214 360,234 M396,90 C388,130 414,150 406,184 C400,208 420,220 430,232 M450,116 C440,150 470,170 466,204 C462,234 488,248 510,250 M486,190 C506,214 526,222 540,214 M214,312 C246,300 276,304 304,292 C330,282 352,286 376,276 M240,340 C268,330 300,336 330,324'
  };
  let uid = 0;
  function brainSVG(w, extra = '') {
    const u = 'b' + (uid++);
    return { u, html: `<svg width="${w}" height="${w * 0.75}" viewBox="0 0 640 480" style="overflow:visible">
      <defs><radialGradient id="${u}f" cx="45%" cy="40%" r="70%"><stop offset="0" stop-color="#2A3AD8"/><stop offset="1" stop-color="#121A90"/></radialGradient>
      <radialGradient id="${u}c" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#2433C4"/><stop offset="1" stop-color="#0E1570"/></radialGradient>
      <filter id="${u}g" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="${u}bg" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="14"/></filter>
      <clipPath id="${u}clip"><path d="${BRAIN.cer}"/></clipPath></defs>
      <g filter="url(#${u}g)">
      <path class="dr" d="${BRAIN.bs}" fill="url(#${u}c)" stroke="#B79CFF" stroke-width="3"/>
      <path class="dr" d="${BRAIN.cb}" fill="url(#${u}c)" stroke="#B79CFF" stroke-width="3"/>
      <path class="dr" d="${BRAIN.cbl}" fill="none" stroke="#B79CFF" stroke-width="2" opacity=".7"/>
      <path class="dr" d="${BRAIN.cer}" fill="url(#${u}f)" stroke="#9FB0FF" stroke-width="3.5"/>
      <path class="dr" d="${BRAIN.syl}" fill="none" stroke="#C7D0FF" stroke-width="3"/>
      <path class="dr" d="${BRAIN.cen}" fill="none" stroke="#C7D0FF" stroke-width="3"/>
      <path class="dr" d="${BRAIN.gyri}" fill="none" stroke="#9FB0FF" stroke-width="2.4" opacity=".75"/></g>
      ${extra}</svg>` };
  }
  function prepDraw(root) { root.querySelectorAll('.dr').forEach(e => { const L = e.getTotalLength(); e.dataset.len = L; e.style.strokeDasharray = L; e.style.strokeDashoffset = L; }); }
  function draw(root, lt, s = 0, d = 1.6) { root.querySelectorAll('.dr').forEach((e, i) => { const L = +e.dataset.len; e.style.strokeDashoffset = L * (1 - eio(prog(lt, s + i * 0.08, d))); e.style.fillOpacity = eo(prog(lt, s + d * .7, .8)); }); }

  // ---------- capçalera reutilitzable (etiqueta + subtítol) ----------

  // etiquetes petites en minúscula normal (no MAJÚSCULES espaiades); respecta sigles i hores
  const ACR = new Set(['REM', 'NASA', 'AAA', 'ADN', 'UV', 'OMS', 'EE.', 'UU.', 'IMC', 'II']);
  const lab = s => { if (!s || typeof s !== 'string' || s !== s.toUpperCase() || !/[A-ZÁÉÍÓÚÑ]{3}/.test(s)) return s;
    return s.split(' ').map((w, i) => ACR.has(w.replace(/[^A-Z.]/g, '')) || /\d/.test(w) ? w : (i === 0 ? w[0] + w.slice(1).toLowerCase() : w.toLowerCase())).join(' '); };

  function header(el, label, sub, color, x = 1060, y = 360, w = 760) {
    const h = E('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px`);
    h.innerHTML = `<div class="lab" style="color:${color};font-size:40px;font-weight:800;letter-spacing:.2px">${lab(label) || ''}</div><div class="sub" style="color:#FFFFFF;font-size:52px;font-weight:700;line-height:1.18;margin-top:16px">${nl(sub)}</div>`;
    el.appendChild(h);
    return lt => { enter(h.children[0], lt, .3, 20); enter(h.children[1], lt, .6, 24); };
  }

  // ---------- protagonista: el Tito (motor/tito.js) ----------
  function personSVG(w, organ) { return window.Tito.svg(w, { organ }); }
  function personRender(svg, t, f, mood, o) { window.Tito.render(svg, t, f, mood, o || {}); }

  const S = {};

  S.counter = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center');
    const c = sc.calm ? C.cyan : (sc.color ? col(sc.color) : C.red);
    el.innerHTML = `<div class="p" style="padding:12px 30px;border-radius:999px;background:${c}22;color:${c};font-weight:800;font-size:36px;letter-spacing:.2px">${lab(sc.pill) || ''}</div>
      <div class="n" style="font-size:302px;${FD};line-height:1;letter-spacing:-8px;margin-top:20px;color:${c};${SHD}">0</div>
      <div class="l" style="color:#fff;font-size:72px;${FD};margin-top:6px">${sc.label || ''}</div>
      <div class="s" style="color:${C.soft};font-size:38px;font-weight:600;margin-top:18px">${sc.sub || ''}</div>`;
    const [p, n, l, s] = el.children;
    return { el, render(lt) { enter(p, lt, 0, 20); n.textContent = Math.round(sc.value * eo(prog(lt, .2, 1.8))); n.style.transform = `scale(${.9 + .1 * eo(prog(lt, .2, .6))})`; enter(l, lt, .6); enter(s, lt, 1.0); } };
  };

  const fitW = (node, max, base) => { if (node.__fit) return; node.__fit = 1; let fs = base; const w = () => Math.max(...[...node.querySelectorAll('div')].map(d => d.scrollWidth), node.scrollWidth); while (w() > max && fs > base * .55) { fs -= 4; node.style.fontSize = fs + 'px'; } };
  S.title = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center');
    const c = sc.calm ? C.cyan : C.red;
    el.innerHTML = `<div style="color:${c};font-size:42px;font-weight:800;letter-spacing:.2px">${lab(sc.kicker) || ''}</div>
      <div class="t" style="color:#fff;font-size:151px;${FD};line-height:.98;letter-spacing:-3px;margin-top:20px"></div>
      <div style="color:${C.soft};font-size:40px;font-weight:600;margin-top:30px">${sc.sub || ''}</div>`;
    const t = el.children[1];
    (sc.title || '').split('\n').forEach((ln, i) => { const d = E('div', 'overflow:hidden'); const s = E('div', '', ln); d.appendChild(s); t.appendChild(d); });
    const bar = E('div', `width:0;height:10px;border-radius:5px;margin:34px auto 0;background:linear-gradient(90deg,${C.cyan},${c})`); el.appendChild(bar);
    return { el, render(lt) { fitW(t, 1700, 150); enter(el.children[0], lt, 0, 16); [...t.children].forEach((d, i) => { const a = eo(prog(lt, .15 + i * .18, .7)); d.firstChild.style.transform = `translateY(${(1 - a) * 110}%)`; }); enter(el.children[2], lt, .8); bar.style.width = 420 * eio(prog(lt, .6, 1)) + 'px'; } };
  };

  S.question = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center');
    el.innerHTML = `<div style="position:absolute;font-size:900px;font-weight:900;color:#9FB0FF;opacity:.08;line-height:1">?</div><div class="q" style="color:#fff;font-size:111px;${FD};line-height:1.08;letter-spacing:-2px">${nl(sc.text)}</div>`;
    const [bg, q] = el.children;
    return { el, render(lt) { enter(q, lt, .1, 40, .8); bg.style.transform = `scale(${1 + .06 * Math.sin(lt * 1.6)}) rotate(${-6 + 4 * Math.sin(lt * .8)}deg)`; } };
  };

  S.brain = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const mode = sc.mode;
    let extra = '';
    const R = rnd(7);
    if (mode === 'adenosine') { for (let i = 0; i < 70; i++) extra += `<circle class="ad" cx="${120 + R() * 400}" cy="${80 + R() * 260}" r="${5 + R() * 5}" fill="#FFD60A" opacity="0"/>`; }
    if (mode === 'flow') { for (let i = 0; i < 9; i++) { const y = 120 + i * 26; extra += `<path class="fl" d="M${90 + i * 6},${y} C200,${y - 40} 330,${y + 40} ${520 - i * 8},${y - 10}" fill="none" stroke="#7FB2FF" stroke-width="5" stroke-linecap="round" stroke-dasharray="18 26" opacity="0" clip-path="url(#CLIP)"/>`; } }
    if (mode === 'scn') { extra += `<g class="scn" opacity="0"><circle class="r1" cx="286" cy="300" r="16" fill="none" stroke="#FFD60A" stroke-width="3"/><circle class="r2" cx="286" cy="300" r="16" fill="none" stroke="#FFD60A" stroke-width="3"/><circle cx="286" cy="300" r="13" fill="#FFD60A"/></g>`; }
    if (mode === 'patches') { const P = [[180, 160], [300, 120], [420, 170], [250, 250], [470, 250], [140, 260]]; P.forEach((p, i) => extra += `<ellipse class="pt" cx="${p[0]}" cy="${p[1]}" rx="70" ry="48" fill="#070B45" opacity="0" clip-path="url(#CLIP)"/>`); }
    const b = brainSVG(900, extra);
    const holder = E('div', 'position:absolute;left:90px;top:250px'); holder.innerHTML = b.html.replace(/url\(#CLIP\)/g, `url(#${b.u}clip)`); el.appendChild(holder);
    const c = mode === 'scn' || mode === 'adenosine' ? C.yellow : mode === 'flow' ? C.blue : C.indigo;
    const hd = header(el, sc.label, sc.sub, c);
    let meter;
    if (mode === 'adenosine') { meter = E('div', 'position:absolute;left:1060px;top:640px;width:700px;height:40px;border-radius:20px;background:rgba(148,163,184,.14)'); meter.innerHTML = `<div style="height:40px;width:0;border-radius:20px;background:linear-gradient(90deg,#FFC800,#FF8A3D);box-shadow:0 0 30px #FFC80088"></div><div style="color:${C.muted};font-size:36px;font-weight:700;margin-top:16px;letter-spacing:2px">PRESIÓN DE SUEÑO</div>`; el.appendChild(meter); }
    if (mode === 'scn') { const lab = E('div', `position:absolute;left:140px;top:880px;color:#fff;font-size:42px;font-weight:800`, 'Hipotálamo'); lab.className = 'scnlab'; el.appendChild(lab); }
    let ready = false;
    return { el, render(lt, d) {
      if (!ready) { prepDraw(holder); ready = true; }
      draw(holder, lt, 0, 1.4); hd(lt);
      holder.style.transform = `scale(${1 + .03 * eio(prog(lt, 1, d))})`;
      const svg = holder.firstChild;
      if (mode === 'adenosine') { const k = prog(lt, 1, Math.max(2, d - 1.5)); svg.querySelectorAll('.ad').forEach((a, i) => { const on = k * 70 > i; a.setAttribute('opacity', on ? .85 : 0); a.setAttribute('transform', `translate(0 ${Math.sin(lt * 2 + i) * 3})`); }); meter.firstChild.style.width = 100 * eo(k) + '%'; meter.style.opacity = eo(prog(lt, .8, .5)); }
      if (mode === 'flow') svg.querySelectorAll('.fl').forEach((f, i) => { f.setAttribute('opacity', eo(prog(lt, 1 + i * .1, .6)) * .9); f.style.strokeDashoffset = -lt * 90 - i * 13; });
      if (mode === 'scn') { const g = svg.querySelector('.scn'); g.setAttribute('opacity', eo(prog(lt, 1.2, .5))); [['r1', 0], ['r2', .5]].forEach(([k, o]) => { const ph = ((lt + o) % 1); const r = g.querySelector('.' + k); r.setAttribute('r', 16 + ph * 50); r.setAttribute('opacity', 1 - ph); }); el.querySelector('.scnlab').style.opacity = eo(prog(lt, 1.6, .5)); }
      if (mode === 'patches') svg.querySelectorAll('.pt').forEach((p, i) => { const ph = Math.sin(lt * 1.3 + i * 1.7); p.setAttribute('opacity', lt < 1.5 ? 0 : clamp(ph) * .8); });
    } };
  };

  S.receptor = () => {
    const el = E('div', 'position:absolute;inset:0');
    const xs = [460, 960, 1460];
    let s = '';
    xs.forEach((x, i) => { s += `<path d="M${x - 90},640 L${x - 90},740 Q${x - 90},800 ${x - 30},800 L${x + 30},800 Q${x + 90},800 ${x + 90},740 L${x + 90},640" fill="none" stroke="#9FB0FF" stroke-width="10" stroke-linecap="round"/><text x="${x}" y="870" fill="#9AA6F0" font-size="34" font-weight="700" text-anchor="middle">Receptor</text>`; });
    s += `<circle class="a1" cx="${xs[0]}" cy="380" r="52" fill="#FFD60A"/><circle class="a2" cx="${xs[1]}" cy="380" r="52" fill="#FFD60A"/>
      <polygon class="caf" points="0,-62 54,-31 54,31 0,62 -54,31 -54,-31" fill="#B4471A" stroke="#FFB37A" stroke-width="6"/>
      <circle class="a3" cx="${xs[2]}" cy="380" r="52" fill="#FFD60A"/>
      <text class="cl" x="${xs[2]}" y="160" fill="#FFB37A" font-size="34" font-weight="900" text-anchor="middle">Cafeína</text>
      <text class="al" x="${xs[0]}" y="330" fill="#FFD60A" font-size="34" font-weight="900" text-anchor="middle">Adenosina</text>`;
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0">${s}</svg><div class="t" style="position:absolute;top:240px;width:100%;text-align:center;color:#fff;font-size:84px;${FD}">El truco del café</div>`;
    const svg = el.firstChild;
    return { el, render(lt) {
      enter(el.children[1], lt, 0, 20);
      const y1 = lerp(380, 720, eio(prog(lt, .6, 1.2))), y2 = lerp(380, 720, eio(prog(lt, 1.0, 1.2)));
      svg.querySelector('.a1').setAttribute('cy', y1); svg.querySelector('.a2').setAttribute('cy', y2);
      const cy = lerp(400, 720, eio(prog(lt, 2.0, 1.0)));
      svg.querySelector('.caf').setAttribute('transform', `translate(${xs[2]} ${cy}) rotate(${lt * 20})`);
      svg.querySelector('.cl').setAttribute('y', cy - 90); svg.querySelector('.cl').setAttribute('opacity', eo(prog(lt, 2.0, .4)));
      // l'adenosina arriba tard i rebota
      const k = prog(lt, 3.2, 1.6); const yb = k < .5 ? lerp(-80, 560, eio(k * 2)) : lerp(560, 360, eo((k - .5) * 2));
      const a3 = svg.querySelector('.a3'); a3.setAttribute('cy', lt < 3.2 ? -100 : yb); a3.setAttribute('cx', xs[2] + (k > .5 ? 160 * eo((k - .5) * 2) : 0));
      svg.querySelector('.al').setAttribute('opacity', eo(prog(lt, .3, .5)));
    } };
  };

  S.clock = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:110px');
    const c = sc.danger ? C.red : C.cyan;
    const [hh, mm] = (sc.time || '07:00').split(':').map(Number);
    let ticks = ''; for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; ticks += `<line x1="${200 + Math.sin(a) * 160}" y1="${200 - Math.cos(a) * 160}" x2="${200 + Math.sin(a) * 180}" y2="${200 - Math.cos(a) * 180}" stroke="#6F7CD6" stroke-width="6" stroke-linecap="round"/>`; }
    el.innerHTML = `<svg width="420" height="420" viewBox="0 0 400 400"><circle cx="200" cy="200" r="190" fill="#0F172A" stroke="${c}" stroke-width="8" style=""/>${ticks}
      <line class="h" x1="200" y1="200" x2="200" y2="95" stroke="#fff" stroke-width="14" stroke-linecap="round"/><line class="m" x1="200" y1="200" x2="200" y2="55" stroke="${c}" stroke-width="8" stroke-linecap="round"/><circle cx="200" cy="200" r="14" fill="#fff"/></svg>
      <div><div style="color:${c};font-size:40px;font-weight:800;letter-spacing:.5px">${sc.time || ''}</div><div class="hn" style="color:#fff;font-size:171px;${FD};line-height:1">HORA ${sc.hour}</div><div style="color:${C.soft};font-size:44px;font-weight:700;margin-top:14px">${sc.text || ''}</div></div>`;
    const svg = el.firstChild, txt = el.children[1];
    return { el, render(lt) {
      const k = eio(prog(lt, 0, 1.4)); const totalMin = (hh % 12) * 60 + mm; const spin = (1 - k) * 720;
      svg.querySelector('.h').setAttribute('transform', `rotate(${totalMin / 2 - spin / 12} 200 200)`);
      svg.querySelector('.m').setAttribute('transform', `rotate(${mm * 6 - spin} 200 200)`);
      svg.style.transform = `scale(${.8 + .2 * back(prog(lt, 0, .7))})`; [...txt.children].forEach((x, i) => enter(x, lt, .2 + i * .2, 24));
    } };
  };

  S.gauge = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    el.innerHTML = `<svg width="1000" height="600" viewBox="0 0 1000 600" style="position:absolute;left:460px;top:270px">
      <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#FF3B6B"/><stop offset=".5" stop-color="#FFD60A"/><stop offset="1" stop-color="#4DF0A0"/></linearGradient></defs>
      <path d="M100,500 A400,400 0 0 1 900,500" fill="none" stroke="#0E1680" stroke-width="56" stroke-linecap="round"/>
      <path class="arc" d="M100,500 A400,400 0 0 1 900,500" fill="none" stroke="url(#gg)" stroke-width="56" stroke-linecap="round"/>
      <line class="nd" x1="500" y1="500" x2="500" y2="150" stroke="#fff" stroke-width="12" stroke-linecap="round"/><circle cx="500" cy="500" r="26" fill="#fff"/></svg>
      <div style="position:absolute;top:200px;width:100%;text-align:center;color:${C.soft};font-size:36px;font-weight:800;letter-spacing:.5px">${sc.label}</div>
      <div class="v" style="position:absolute;top:820px;width:100%;text-align:center;color:#fff;font-size:121px;${FD}">100 %</div>`;
    const svg = el.firstChild; const arc = svg.querySelector('.arc'); let L = 0;
    return { el, render(lt) {
      if (!L) { L = arc.getTotalLength(); arc.style.strokeDasharray = L; }
      const v = lerp(sc.from, sc.to, eio(prog(lt, 1, 2.2))) + (lt > 3.2 ? Math.sin(lt * 9) * .6 : 0);
      arc.style.strokeDashoffset = L * (1 - v / 100);
      svg.querySelector('.nd').setAttribute('transform', `rotate(${-90 + 180 * v / 100} 500 500)`);
      el.querySelector('.v').textContent = Math.round(v) + ' %'; el.querySelector('.v').style.color = v < 92 ? C.yellow : '#fff';
      svg.style.opacity = eo(prog(lt, 0, .5)); enter(el.children[1], lt, .1, 16);
    } };
  };

  S.bars = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const box = E('div', 'position:absolute;left:200px;top:300px;width:1520px'); el.appendChild(box);
    box.innerHTML = `<div style="color:${C.soft};font-size:46px;font-weight:800;letter-spacing:.2px;margin-bottom:50px">${lab(sc.title) || ''}</div>`;
    const rows = sc.items.map(it => { const r = E('div', 'margin-bottom:46px'); const c = col(it.color); r.innerHTML = `<div style="display:flex;justify-content:space-between;color:#fff;font-size:50px;font-weight:700;margin-bottom:16px"><span>${it.label}</span><span class="v" style="color:${c};font-weight:900">0</span></div><div style="position:relative;height:84px;border-radius:42px;background:rgba(148,163,184,.12)"><div class="f" style="height:84px;width:0;border-radius:42px;background:linear-gradient(90deg,${c}99,${c});box-shadow:0 0 30px ${c}66"></div></div>`; box.appendChild(r); return { r, it }; });
    let lim;
    if (sc.limit) { lim = E('div', `position:absolute;top:110px;bottom:-20px;width:0;border-left:5px dashed ${C.yellow};left:${1520 * sc.limit.value / sc.max}px`, `<div style="position:absolute;top:-60px;left:-200px;width:400px;text-align:center;color:${C.yellow};font-size:36px;font-weight:800">${sc.limit.label}</div>`); box.appendChild(lim); }
    return { el, render(lt) {
      enter(box.children[0], lt, 0, 16);
      rows.forEach(({ r, it }, i) => { const st = .4 + i * (rows.length > 1 && i === rows.length - 1 ? .9 : .5); enter(r, lt, st - .2, 20); const k = eo(prog(lt, st, 1.3)); r.querySelector('.f').style.width = 100 * k * it.value / sc.max + '%'; r.querySelector('.v').textContent = (it.value * k).toFixed(1).replace('.', ',') + (it.unit || ''); });
      if (lim) lim.style.opacity = eo(prog(lt, 1.6, .5));
    } };
  };

  S.wave = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    // corba d'alerta circadiana 07:00 -> 07:00 (+24h), mínim cap a les 04:00
    const pts = []; for (let i = 0; i <= 96; i++) { const h = 7 + i / 4; const a = Math.cos((h - 16) / 24 * 2 * Math.PI); pts.push([160 + i * 16, 640 - a * 220]); }
    const d = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' L');
    const [hh] = (sc.time || '04:00').split(':').map(Number); const hi = ((hh - 7 + 24) % 24) * 4;
    const labels = ['07', '13', '19', '01', '07'].map((t, i) => `<text x="${160 + i * 384}" y="940" fill="#6F7CD6" font-size="34" font-weight="700" text-anchor="middle">${t}:00</text>`).join('');
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><line x1="160" y1="640" x2="1696" y2="640" stroke="#0E1680" stroke-width="3"/>${labels}
      <path class="w" d="${d}" fill="none" stroke="url(#wg)" stroke-width="10" stroke-linecap="round"/>
      <defs><linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="#3EF0FF"/><stop offset="1" stop-color="#B79CFF"/></linearGradient></defs>
      <circle class="dot" r="22" fill="${sc.rise ? C.yellow : C.red}"/><circle class="ring" r="22" fill="none" stroke="${sc.rise ? C.yellow : C.red}" stroke-width="4"/></svg>
      <div style="position:absolute;left:160px;top:200px;color:${sc.rise ? C.yellow : C.red};font-size:38px;font-weight:800;letter-spacing:.5px">${sc.label}</div><div style="position:absolute;left:160px;top:255px;color:#fff;font-size:56px;font-weight:800">${sc.sub}</div>`;
    const svg = el.firstChild, w = svg.querySelector('.w'); let L = 0;
    return { el, render(lt) {
      if (!L) { L = w.getTotalLength(); w.style.strokeDasharray = L; }
      w.style.strokeDashoffset = L * (1 - eio(prog(lt, 0, 1.8)));
      const k = eio(prog(lt, 1.2, 1.4)); const idx = Math.round(hi * k); const p = pts[idx];
      const dot = svg.querySelector('.dot'), ring = svg.querySelector('.ring');
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); ring.setAttribute('cx', p[0]); ring.setAttribute('cy', p[1]);
      const ph = (lt % 1); ring.setAttribute('r', 22 + ph * 40); ring.setAttribute('opacity', lt > 2.6 ? 1 - ph : 0); dot.setAttribute('opacity', eo(prog(lt, 1.2, .3)));
      enter(el.children[1], lt, .2, 16); enter(el.children[2], lt, .4, 20);
    } };
  };

  S.flicker = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center');
    el.innerHTML = `<svg width="760" height="380" viewBox="0 0 760 380"><defs><clipPath id="eyec"><path d="M40,190 Q380,-40 720,190 Q380,420 40,190 Z"/></clipPath></defs>
      <path d="M40,190 Q380,-40 720,190 Q380,420 40,190 Z" fill="#FFFFFF"/><g clip-path="url(#eyec)"><circle cx="380" cy="190" r="110" fill="#0E7490"/><circle cx="380" cy="190" r="52" fill="#070B45"/><circle cx="350" cy="160" r="18" fill="#fff"/>
      <rect class="lid" x="0" y="-400" width="760" height="400" fill="#0B0F4A"/><rect class="lid2" x="0" y="380" width="760" height="400" fill="#0B0F4A"/></g>
      <path d="M40,190 Q380,-40 720,190 Q380,420 40,190 Z" fill="none" stroke="#9FB0FF" stroke-width="8"/></svg>
      <div style="color:${C.red};font-size:85px;${FD};margin-top:40px">${sc.label}</div><div style="color:${C.soft};font-size:42px;font-weight:700;margin-top:10px">${sc.sub}</div>
      <div class="blk" style="position:fixed;inset:0;background:#000;opacity:0"></div>`;
    const svg = el.firstChild, blk = el.querySelector('.blk');
    return { el, render(lt) {
      const period = sc.intense ? 1.6 : 2.6; const ph = (lt - .8) % period; const closing = lt > .8 && ph < (sc.intense ? .9 : .7);
      const c = closing ? Math.sin(Math.PI * ph / (sc.intense ? .9 : .7)) : 0;
      svg.querySelector('.lid').setAttribute('y', -400 + c * 590); svg.querySelector('.lid2').setAttribute('y', 380 - c * 190);
      blk.style.opacity = c > .85 ? (c - .85) / .15 * .85 : 0;
      svg.style.opacity = eo(prog(lt, 0, .5)); enter(el.children[1], lt, .3); enter(el.children[2], lt, .5);
    } };
  };

  S.road = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const meters = Math.round(sc.speed / 3.6 * sc.seconds);
    let dashes = ''; for (let i = 0; i < 14; i++) dashes += `<rect class="ds" x="${i * 160}" y="620" width="90" height="16" rx="8" fill="#FFFFFF"/>`;
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><rect x="0" y="470" width="1920" height="320" fill="#080C3D"/><rect x="0" y="470" width="1920" height="10" fill="#4553C8"/><rect x="0" y="780" width="1920" height="10" fill="#4553C8"/>${dashes}
      <g class="car"><rect x="-120" y="-55" width="240" height="110" rx="34" fill="#7FB2FF"/><rect x="-30" y="-44" width="80" height="88" rx="16" fill="#0C4A6E"/><rect x="60" y="-42" width="40" height="84" rx="12" fill="#CDE6FF"/><circle cx="125" cy="-34" r="10" fill="#FFF4B3"/><circle cx="125" cy="34" r="10" fill="#FFF4B3"/></g></svg>
      <div class="cov" style="position:absolute;inset:0;background:#000;opacity:0"></div>
      <div style="position:absolute;top:240px;width:100%;text-align:center"><div style="color:${C.soft};font-size:36px;font-weight:800;letter-spacing:.5px">${sc.speed} KM/H · ${sc.seconds} SEGUNDOS DE MICROSUEÑO</div><div class="m" style="color:#fff;font-size:171px;${FD};line-height:1.1">0 m</div><div style="color:${C.red};font-size:48px;font-weight:800">recorridos a ciegas</div></div>`;
    const svg = el.firstChild, cov = el.querySelector('.cov'), top = el.children[2];
    return { el, render(lt) {
      svg.querySelectorAll('.ds').forEach((d, i) => d.setAttribute('x', ((i * 160 - lt * 900) % 2240 + 2240) % 2240 - 160));
      svg.querySelector('.car').setAttribute('transform', `translate(${lerp(-200, 760, eo(prog(lt, 0, 1.2)))} 630)`);
      const k = prog(lt, 1.4, sc.seconds); top.querySelector('.m').textContent = Math.round(meters * k) + ' m';
      cov.style.opacity = lt > 1.4 && lt < 1.4 + sc.seconds ? .72 : (lt >= 1.4 + sc.seconds ? .72 * (1 - prog(lt, 1.4 + sc.seconds, .4)) : 0);
      [...top.children].forEach((x, i) => enter(x, lt, .1 + i * .2, 20));
    } };
  };

  function bodySil() {
    return `<g stroke="#9FB0FF" stroke-width="5" fill="url(#bodyf)"><circle cx="300" cy="110" r="70"/>
      <path d="M220,200 Q300,175 380,200 L440,250 Q470,270 470,310 L480,520 Q482,548 456,550 Q432,550 430,522 L420,330 L400,330 L410,640 L420,920 Q422,955 390,955 Q360,955 358,922 L330,660 L300,660 L270,660 L242,922 Q240,955 210,955 Q178,955 180,920 L190,640 L200,330 L180,330 L170,522 Q168,550 144,550 Q118,548 120,520 L130,310 Q130,270 160,250 Z"/></g>`;
  }
  S.body = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    el.innerHTML = `<svg width="540" height="880" viewBox="0 0 600 1000" style="position:absolute;left:260px;top:170px"><defs><radialGradient id="bodyf" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#2A3AD8"/><stop offset="1" stop-color="#121A90"/></radialGradient><filter id="sg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="16"/></filter></defs>${bodySil()}
      <ellipse class="org" cx="318" cy="390" rx="62" ry="44" fill="${C.orange}" opacity="0" filter="url(#sg)"/><ellipse class="org2" cx="318" cy="390" rx="40" ry="28" fill="${C.orange}" opacity="0"/></svg>`;
    const card = (txt, sub, up, c, y) => { const d = E('div', `position:absolute;left:1000px;top:${y}px;display:flex;align-items:center;gap:34px`); d.innerHTML = `<svg width="130" height="130" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${c}22" stroke="${c}" stroke-width="5"/><path d="${up ? 'M50,24 L74,56 L60,56 L60,76 L40,76 L40,56 L26,56 Z' : 'M50,76 L74,44 L60,44 L60,24 L40,24 L40,44 L26,44 Z'}" fill="${c}"/></svg><div><div style="color:#fff;font-size:76px;${FD}">${txt}</div><div style="color:${c};font-size:38px;font-weight:700">${sub}</div></div>`; el.appendChild(d); return d; };
    const a = card(sc.up, sc.upSub, true, C.red, 300), b = card(sc.down, sc.downSub, false, C.cyan, 600);
    return { el, render(lt) {
      el.firstChild.style.opacity = eo(prog(lt, 0, .6));
      const g = eo(prog(lt, .6, .6)) * (.6 + .4 * Math.sin(lt * 4)); el.querySelector('.org').setAttribute('opacity', g); el.querySelector('.org2').setAttribute('opacity', g * .9);
      [a, b].forEach((x, i) => { const k = eo(prog(lt, .8 + i * .6, .6)); x.style.opacity = k; x.style.transform = `translateX(${(1 - k) * 60}px)`; x.firstChild.style.transform = `translateY(${Math.sin(lt * 3 + i) * 6 * (i ? 1 : -1)}px)`; });
    } };
  };

  S.stats = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center');
    const row = E('div', 'display:flex;gap:160px'); el.appendChild(row);
    const cells = sc.items.map(it => { const c = col(it.color); const d = E('div', 'text-align:center'); d.innerHTML = `<div class="n" style="font-size:${Math.round((sc.items.length === 1 ? 380 : 257)*.9)}px;${FD};color:${c};letter-spacing:-6px;line-height:1;text-shadow:8px 8px 0 #0A1A8C">0</div><div style="color:#fff;font-size:46px;font-weight:800;margin-top:10px">${it.label}</div>`; row.appendChild(d); return { d, it }; });
    const sub = E('div', `color:${C.soft};font-size:46px;font-weight:600;margin-top:60px`, sc.sub || ''); el.appendChild(sub);
    return { el, render(lt) { cells.forEach(({ d, it }, i) => { enter(d, lt, .2 + i * .5, 30); d.querySelector('.n').textContent = (it.prefix || '') + Math.round(it.value * eo(prog(lt, .3 + i * .5, 1.4))) + (it.suffix || ''); }); enter(sub, lt, 1.4); } };
  };

  S.amygdala = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const extra = `<g class="am" opacity="0"><circle class="r1" cx="214" cy="306" r="20" fill="none" stroke="#FF3B6B" stroke-width="3"/><circle class="r2" cx="214" cy="306" r="20" fill="none" stroke="#FF3B6B" stroke-width="3"/><ellipse class="ag" cx="214" cy="306" rx="34" ry="24" fill="#FF3B6B" filter="url(#BG)"/><ellipse cx="214" cy="306" rx="17" ry="12" transform="rotate(-20 214 306)" fill="#FF8FAB" stroke="#FFE4E6" stroke-width="2"/></g>
      <g class="pf" opacity="0"><circle cx="130" cy="180" r="16" fill="#3EF0FF"/><path class="link" d="M138,194 C160,240 190,270 206,292" fill="none" stroke="#3EF0FF" stroke-width="5" stroke-dasharray="10 8"/></g>`;
    const b = brainSVG(860, extra);
    const holder = E('div', 'position:absolute;left:80px;top:300px'); holder.innerHTML = b.html.replace('url(#BG)', `url(#${b.u}bg)`); el.appendChild(holder);
    const lab1 = E('div', `position:absolute;left:230px;top:880px;color:#fff;font-size:40px;font-weight:800`, `Amígdala <span style="color:${C.red};font-size:36px;letter-spacing:.5px;display:block">Alarma emocional</span>`); el.appendChild(lab1);
    const lab2 = E('div', `position:absolute;left:230px;top:300px;color:#fff;font-size:40px;font-weight:800`, `Corteza prefrontal <span style="color:${C.cyan};font-size:36px;letter-spacing:.5px;display:block">El freno</span>`); el.appendChild(lab2);
    const panel = E('div', 'position:absolute;left:1090px;top:330px;width:680px'); el.appendChild(panel);
    panel.innerHTML = `<div style="color:#D3DAFF;font-size:36px;font-weight:800;margin-bottom:34px">Reactividad de la amígdala</div>
      <div style="margin-bottom:30px"><div style="display:flex;justify-content:space-between;color:#FFFFFF;font-size:36px;font-weight:600;margin-bottom:12px"><span>Descansado</span><span class="v1">0</span></div><div style="height:44px;border-radius:22px;background:rgba(148,163,184,.12)"><div class="f1" style="height:44px;width:0;border-radius:22px;background:linear-gradient(90deg,#0EA5E9,#3EF0FF)"></div></div></div>
      <div><div style="display:flex;justify-content:space-between;color:#FFFFFF;font-size:36px;font-weight:600;margin-bottom:12px"><span>35 h sin dormir</span><span class="v2">0</span></div><div style="height:44px;border-radius:22px;background:rgba(148,163,184,.12)"><div class="f2" style="height:44px;width:0;border-radius:22px;background:linear-gradient(90deg,#FF8A3D,#FF3B6B);box-shadow:0 0 30px rgba(255,59,107,.5)"></div></div></div>
      <div class="big" style="color:#FF3B6B;font-size:171px;${FD};line-height:1;margin-top:30px;text-shadow:8px 8px 0 #0A1A8C">+0 %</div>`;
    let ready = false;
    return { el, render(lt) {
      if (!ready) { prepDraw(holder); ready = true; }
      draw(holder, lt, 0, 1.2); const svg = holder.firstChild;
      const am = svg.querySelector('.am'); am.setAttribute('opacity', eo(prog(lt, 1.2, .5)));
      [['r1', 0], ['r2', .5]].forEach(([k, o]) => { const ph = ((lt + o) % 1 + 1) % 1; const r = am.querySelector('.' + k); r.setAttribute('r', 20 + ph * 60); r.setAttribute('opacity', lt < 1.3 ? 0 : (1 - ph) * .9); });
      am.querySelector('.ag').setAttribute('opacity', .5 + .3 * Math.sin(lt * 6));
      const pf = svg.querySelector('.pf'); pf.setAttribute('opacity', eo(prog(lt, 1.6, .5)) * (lt > 5 ? .5 + .5 * Math.max(0, Math.sin(lt * 9)) * (lt < 6.5 ? 1 : 0) : 1));
      pf.querySelector('.link').style.strokeDashoffset = -lt * 30; if (lt > 6.5) pf.querySelector('.link').setAttribute('opacity', 1 - prog(lt, 6.5, .5));
      enter(lab1, lt, 1.4, 14); enter(lab2, lt, 1.8, 14);
      const pa = eo(prog(lt, 1.8, .6)); panel.style.opacity = pa; panel.style.transform = `translateX(${(1 - pa) * 50}px)`;
      const b1 = eo(prog(lt, 2.2, .9)), b2 = eo(prog(lt, 2.9, 1.3)); panel.querySelector('.f1').style.width = b1 * 62.5 + '%'; panel.querySelector('.v1').textContent = Math.round(100 * b1); panel.querySelector('.f2').style.width = b2 * 100 + '%'; panel.querySelector('.v2').textContent = Math.round(100 + sc.value * b2);
      panel.querySelector('.big').textContent = '+' + Math.round(sc.value * eo(prog(lt, 3.0, 1.2))) + ' %';
    } };
  };

  S.list = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding-left:300px;gap:44px');
    const c = col(sc.color);
    const items = sc.items.map((t, i) => { const d = E('div', 'display:flex;align-items:center;gap:40px'); d.innerHTML = `<div style="width:96px;height:96px;flex:none;border-radius:28px;background:${c}22;border:4px solid ${c};display:flex;align-items:center;justify-content:center;color:${c};font-size:52px;font-weight:900">${i + 1}</div><div style="color:#fff;font-size:${sc.items.length <= 2 ? 84 : sc.items.length === 3 ? 72 : 62}px;font-weight:800;max-width:1350px;line-height:1.15">${t}</div>`; el.appendChild(d); return d; });
    return { el, render(lt, d) { const gap = Math.min(1.1, (d - 1) / items.length); items.forEach((x, i) => { const k = eo(prog(lt, .2 + i * gap, .6)); x.style.opacity = k; x.style.transform = `translateX(${(1 - k) * 80}px)`; x.firstChild.style.transform = `scale(${.6 + .4 * back(prog(lt, .2 + i * gap, .5))})`; }); } };
  };

  S.cells = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const R = rnd(11); let cs = '';
    for (let i = 0; i < 26; i++) cs += `<g class="ce" data-x="${R() * 820}" data-y="${R() * 560}" data-p="${R() * 6.28}"><circle r="${24 + R() * 14}" fill="#4DF0A033" stroke="#4DF0A0" stroke-width="4"/><circle r="9" fill="#4DF0A0"/></g>`;
    el.innerHTML = `<svg width="900" height="640" style="position:absolute;left:120px;top:250px">${cs}</svg>
      <div style="position:absolute;left:1080px;top:330px;width:700px"><div style="color:${C.green};font-size:36px;font-weight:800;letter-spacing:2px">${sc.label}</div>
      <div style="margin-top:40px;height:60px;border-radius:30px;background:rgba(148,163,184,.12)"><div class="f" style="height:60px;width:100%;border-radius:30px;background:linear-gradient(90deg,#1FBF7A,#4DF0A0)"></div></div>
      <div class="v" style="color:#fff;font-size:171px;${FD};margin-top:20px">100 %</div><div style="color:${C.soft};font-size:36px;font-weight:600">tras una noche durmiendo a medias</div></div>`;
    const svg = el.firstChild, p = el.children[1];
    return { el, render(lt) {
      const k = eio(prog(lt, 1.5, 2.2)); const v = lerp(sc.from, sc.to, k);
      svg.querySelectorAll('.ce').forEach((g, i) => { const x = +g.dataset.x + Math.sin(lt * .8 + +g.dataset.p) * 30, y = +g.dataset.y + Math.cos(lt * .7 + +g.dataset.p) * 30; g.setAttribute('transform', `translate(${x + 40} ${y + 40})`); g.setAttribute('opacity', eo(prog(lt, i * .03, .5)) * (i / 26 < v / 100 ? 1 : .15)); });
      p.querySelector('.f').style.width = v + '%'; p.querySelector('.v').textContent = Math.round(v) + ' %'; p.querySelector('.v').style.color = v < 90 ? C.red : '#fff';
      enter(p, lt, .3, 20);
    } };
  };

  S.memory = () => {
    const el = E('div', 'position:absolute;inset:0');
    el.innerHTML = `<div style="position:absolute;top:230px;width:100%;text-align:center;color:${C.violet};font-size:38px;font-weight:800;letter-spacing:.5px">MEMORIA DE TRABAJO</div>`;
    const words = ['Llaves', '¿Qué decía?', 'Nombre', 'Cita 17:00', 'Idea'];
    const cards = words.map((w, i) => { const d = E('div', `position:absolute;left:${210 + i * 310}px;top:420px;width:260px;height:300px;border-radius:30px;background:#0B0F4A;border:4px solid ${C.violet};display:flex;align-items:center;justify-content:center;color:#fff;font-size:40px;font-weight:800;text-align:center`, w); el.appendChild(d); return d; });
    return { el, render(lt) { enter(el.children[0], lt, 0, 16); cards.forEach((c, i) => { const a = eo(prog(lt, .2 + i * .15, .5)); const fall = eio(prog(lt, 2.2 + [0, 2, 1, 3, 4][i] * .45, .9)); c.style.opacity = a * (1 - fall * .85); c.style.transform = `translateY(${(1 - a) * 40 + fall * 260}px) rotate(${fall * (i % 2 ? 14 : -12)}deg)`; c.style.borderStyle = fall > .1 ? 'dashed' : 'solid'; }); } };
  };

  S.steps = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const n = sc.items.length; const cards = sc.items.map((it, i) => { const c = [C.yellow, C.orange, C.red][i] || C.red; const d = E('div', `position:absolute;left:${170 + i * 540}px;top:380px;width:480px;padding:40px;box-sizing:border-box;border-radius:34px;background:${c}14;border:4px solid ${c}`); d.innerHTML = `<div style="color:${c};font-size:54px;font-weight:900">${it.t}</div><div style="color:#fff;font-size:50px;font-weight:800;line-height:1.15;margin-top:18px">${it.x}</div>`; el.appendChild(d); return d; });
    const line = E('div', `position:absolute;left:170px;top:340px;height:8px;width:0;border-radius:4px;background:linear-gradient(90deg,${C.yellow},${C.red})`); el.appendChild(line);
    return { el, render(lt, d) { const gap = Math.min(2.2, (d - 1.5) / n); line.style.width = 1560 * eio(prog(lt, .2, gap * n)) + 'px'; cards.forEach((c, i) => { const k = eo(prog(lt, .3 + i * gap, .6)); c.style.opacity = k; c.style.transform = `translateY(${(1 - k) * 50}px) scale(${.9 + .1 * k})`; }); } };
  };

  S.distort = () => {
    const el = E('div', 'position:absolute;inset:0');
    let lines = ''; for (let i = 0; i < 18; i++) lines += `<line x1="${110 * i}" y1="0" x2="${110 * i}" y2="1080" stroke="#9FB0FF" stroke-width="3" opacity=".35"/>`;
    for (let i = 0; i < 11; i++) lines += `<line x1="0" y1="${110 * i}" x2="1920" y2="${110 * i}" stroke="#9FB0FF" stroke-width="3" opacity=".35"/>`;
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><defs><filter id="tw"><feTurbulence class="tb" type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="60"/></filter><radialGradient id="sh" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#030633" stop-opacity="1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
      <g filter="url(#tw)">${lines}<g class="fig" opacity="0"><ellipse cx="1500" cy="420" rx="70" ry="90" fill="url(#sh)"/><path d="M1400,520 Q1500,470 1600,520 L1640,900 L1360,900 Z" fill="url(#sh)"/></g><g class="fig2" opacity="0"><ellipse cx="380" cy="470" rx="55" ry="70" fill="url(#sh)"/><path d="M300,550 Q380,510 460,550 L490,880 L270,880 Z" fill="url(#sh)"/></g></g></svg>
      <div style="position:absolute;top:250px;width:100%;text-align:center;color:#fff;font-size:72px;${FD};${SHD}">Alucinaciones</div>`;
    const svg = el.firstChild;
    return { el, render(lt) { svg.querySelector('.tb').setAttribute('baseFrequency', (0.004 + 0.004 * Math.sin(lt * .9)).toFixed(4)); svg.querySelector('feDisplacementMap').setAttribute('scale', 40 + 50 * Math.sin(lt * 1.3)); svg.querySelector('.fig').setAttribute('opacity', clamp(Math.sin(lt * 1.1 - 1)) * .9); svg.querySelector('.fig2').setAttribute('opacity', clamp(Math.sin(lt * .9 - 2.5)) * .8); svg.style.opacity = eo(prog(lt, 0, .8)); enter(el.children[1], lt, .2, 16); } };
  };

  S.quote = (sc) => {
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:0 240px');
    el.innerHTML = `<div style="color:${C.red};font-size:262px;${FD};line-height:.6;height:120px">“</div><div class="q" style="color:#fff;font-size:76px;font-weight:800;line-height:1.18">${sc.text}</div><div style="color:${C.soft};font-size:36px;font-weight:700;margin-top:40px">— ${sc.author}</div>`;
    const q = el.children[1]; const words = sc.text.split(' '); q.innerHTML = words.map(w => `<span style="opacity:0">${w} </span>`).join('');
    return { el, render(lt) { enter(el.children[0], lt, 0, 20); [...q.children].forEach((s, i) => s.style.opacity = eo(prog(lt, .3 + i * .12, .3))); enter(el.children[2], lt, .5 + words.length * .12); } };
  };

  S.hypnogram = () => {
    const el = E('div', 'position:absolute;inset:0');
    // fases: 0 vigília, 1 REM, 2 N1, 3 N2, 4 N3 (profund). Nit de recuperació amb rebot de N3 i REM
    const seq = [0, 2, 3, 4, 4, 4, 3, 1, 1, 3, 4, 4, 3, 1, 1, 1, 3, 4, 3, 1, 1, 1, 3, 3, 1, 1, 1, 0];
    const yOf = s => [300, 480, 420, 560, 700][s];
    let segs = ''; const x0 = 200, dx = 1520 / seq.length;
    seq.forEach((s, i) => { const c = s === 4 ? C.blue : s === 1 ? C.violet : '#6F7CD6'; segs += `<rect class="sg" x="${x0 + i * dx}" y="${yOf(s) - 14}" width="${dx + 1}" height="28" rx="6" fill="${c}" opacity="0"/>`; });
    const lbl = [['Despierto', 300], ['REM', 480], ['Ligero', 560], ['Profundo', 700]].map(([t, y]) => `<text x="${x0 - 30}" y="${y + 10}" fill="#9AA6F0" font-size="34" font-weight="700" text-anchor="end">${t}</text>`).join('');
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0">${lbl}${segs}</svg><div style="position:absolute;left:200px;top:220px;color:${C.cyan};font-size:44px;font-weight:800;letter-spacing:.5px">LA NOCHE DE RECUPERACIÓN</div>
      <div style="position:absolute;left:200px;top:820px;display:flex;gap:60px;font-size:38px;font-weight:800"><span style="color:${C.blue}">■ Sueño profundo ↑</span><span style="color:${C.violet}">■ Sueño REM ↑</span></div>`;
    const svg = el.firstChild;
    return { el, render(lt) { svg.querySelectorAll('.sg').forEach((r, i) => { const k = eo(prog(lt, .3 + i * .1, .3)); r.setAttribute('opacity', k); }); enter(el.children[1], lt, 0, 16); enter(el.children[2], lt, 2, 20); } };
  };


  // ---------- òrgans: il·lustracions Servier Medical Art (CC BY 3.0) a motor/organs/ ----------
  // sc.src (nom sense .svg), sc.label, sc.sub, sc.color, sc.pulse (batec), sc.pins [{x,y,text}] (x,y en % de la imatge),
  // comparació: sc.src2 + sc.l1 / sc.l2 (dues imatges una al costat de l'altra, amb títol sc.label a dalt)
  const ORG = n => `organs/${n}.svg`;
  S.organ = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const c = col(sc.color || 'red');
    const box = (n, x, y, s) => { const b = E('div', `position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;display:flex;align-items:center;justify-content:center`);
      b.innerHTML = `<div style="position:absolute;inset:8%;border-radius:50%;background:radial-gradient(${c}33,transparent 70%)"></div><img src="${ORG(n)}" style="position:relative;max-width:88%;max-height:88% saturate(1.1)">`;
      el.appendChild(b); return b; };
    if (sc.src2) {
      const t = E('div', `position:absolute;left:0;right:0;top:180px;text-align:center;color:${c};font-size:38px;font-weight:800;letter-spacing:.5px`, sc.label || ''); el.appendChild(t);
      const a = box(sc.src, 260, 250, 620), b = box(sc.src2, 1040, 250, 620);
      const mk = (txt, x, col2) => { const d = E('div', `position:absolute;left:${x}px;width:620px;top:880px;text-align:center;color:${col2};font-size:46px;font-weight:800`, txt || ''); el.appendChild(d); return d; };
      const la = mk(sc.l1, 260, C.cyan), lb = mk(sc.l2, 1040, c);
      const vs = E('div', `position:absolute;left:910px;top:520px;width:100px;text-align:center;color:${C.soft};font-size:48px;font-weight:900`, 'vs'); el.appendChild(vs);
      return { el, render(lt) { enter(t, lt, 0, 16); [a, b].forEach((x, i) => { const p = eo(prog(lt, .2 + i * .35, .7)); x.style.opacity = p; x.style.transform = `scale(${.85 + .15 * p})`; }); enter(la, lt, .6); enter(lb, lt, .95); enter(vs, lt, .5); } };
    }
    const a = box(sc.src, 170, 190, 760);
    const hd = header(el, sc.label, sc.sub, c, 1020, 400, 780);
    const pins = (sc.pins || []).map((p, i) => { const d = E('div', `position:absolute;left:${170 + 760 * p.x / 100}px;top:${190 + 760 * p.y / 100}px`);
      d.innerHTML = `<div style="position:absolute;left:-11px;top:-11px;width:22px;height:22px;border-radius:50%;background:${c};box-shadow:0 0 18px ${c}"></div><div style="position:absolute;left:26px;top:-22px;white-space:nowrap;color:#fff;font-size:36px;font-weight:800;background:#0B0F4Acc;padding:4px 14px;border-radius:10px;border:2px solid ${c}">${p.text}</div>`;
      el.appendChild(d); return d; });
    return { el, render(lt) { const p = eo(prog(lt, 0, .7)); a.style.opacity = p;
      const beat = sc.pulse ? 1 + .045 * Math.max(0, Math.sin(lt * 2 * Math.PI * 1.2)) ** 6 : 1; a.style.transform = `scale(${(.88 + .12 * p) * beat})`;
      pins.forEach((d, i) => enter(d, lt, 1 + i * .5, 14)); hd(lt); } };
  };

  // persona: el Tito a l'esquerra amb un disc de color al darrere. sc.hour|fatigue, sc.mood, sc.label, sc.sub, sc.big, sc.scan (nom d'òrgan: corazon, pulmones, cerebro, higado_3d, estomago…)
  S.persona = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const c = col(sc.color || (sc.mood === 'angry' || sc.scan ? 'red' : (sc.mood === 'happy' || sc.mood === 'sleep') ? 'cyan' : 'red'));
    const disc = E('div', `position:absolute;left:230px;top:200px;width:640px;height:640px;border-radius:50%;background:#3B5BFF;opacity:.55`); el.appendChild(disc);
    const hold = E('div', 'position:absolute;left:250px;top:150px'); hold.innerHTML = personSVG(600, sc.scan); el.appendChild(hold);
    const hd = header(el, sc.label, sc.sub, sc.scan ? C.cyan : c, 1000, sc.big ? 300 : 420, 820);
    const big = sc.big ? E('div', `position:absolute;left:1000px;top:560px;color:${C.yellow};font-size:230px;${FD};line-height:1;${SHD};font-variant-numeric:tabular-nums`, sc.big) : null;
    if (big) el.appendChild(big);
    return { el, render(lt) { const a = eo(prog(lt, 0, .6)); hold.style.opacity = a; disc.style.transform = `scale(${.8 + .2 * back(prog(lt, 0, .7))})`;
      if (big) { enter(big, lt, .5, 30); }
      hold.style.transform = `translateY(${(1 - a) * 40}px)`;
      personRender(hold.firstChild, lt, sc.fatigue != null ? sc.fatigue : (sc.hour || 0) / (window.VIDEO.hud && window.VIDEO.hud.max || 72), sc.mood || 'ok', { scan: sc.scan ? eo(prog(lt, .6, .7)) : 0, seed: 1.7 }); hd(lt); } };
  };

  // experimento: fitxa d'entrada amb segell. sc.num ('002'), sc.prueba, sc.riesgo
  S.experimento = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const card = E('div', `position:absolute;left:280px;top:230px;width:1080px;height:640px;background:#fff;border-radius:28px;box-shadow:16px 16px 0 rgba(7,11,69,.45);overflow:hidden;color:${C.ink}`);
    card.innerHTML = `<div style="height:96px;background:${C.pink};display:flex;align-items:center;padding:0 50px;color:#fff;font-size:46px;${FD}">Expediente del voluntario</div>
      <div style="position:absolute;left:50px;top:140px;width:330px;height:440px;border-radius:22px;background:${C.yellow};overflow:hidden"><div class="ph" style="position:absolute;left:-15px;top:8px"></div></div>
      <div style="position:absolute;left:430px;top:150px;width:600px">
        <div style="font-size:36px;font-weight:700;color:#5A64B8">Voluntario</div><div style="font-size:110px;${FD};line-height:1">Tito</div>
        <div style="font-size:36px;font-weight:700;color:#5A64B8;margin-top:22px">Prueba</div><div style="font-size:56px;font-weight:800;line-height:1.1">${sc.prueba || ''}</div>
        <div style="font-size:36px;font-weight:700;color:#5A64B8;margin-top:22px">Riesgo</div><div style="font-size:52px;font-weight:800;color:${C.pink}">${sc.riesgo || 'Alto'}</div></div>`;
    el.appendChild(card); card.querySelector('.ph').innerHTML = personSVG(360);
    const st = E('div', `position:absolute;left:1360px;top:740px;transform-origin:50% 50%;border:12px solid ${C.yellow};border-radius:18px;color:${C.yellow};padding:6px 38px 14px;text-align:center;background:rgba(11,15,74,.55)`,
      `<div style="font-size:54px;${FD}">Experimento</div><div style="font-size:140px;${FD};line-height:.85">Nº ${sc.num || '001'}</div>`); el.appendChild(st);
    return { el, render(lt) { const a = eo(prog(lt, 0, .5)); card.style.opacity = a; card.style.transform = `translateY(${(1 - a) * 60}px) rotate(${-3 + (1 - a) * -4}deg)`;
      personRender(card.querySelector('svg'), lt, 0, 'happy', {});
      const p = prog(lt, .75, .35); st.style.opacity = p > 0 ? 1 : 0; st.style.transform = `rotate(-10deg) scale(${p > 0 ? 1 + 1.6 * (1 - eo(p)) : 2.6})`; } };
  };

  // veredicto: frase popular + segell. sc.claim, sc.verdict ('mito' | 'ciencia' | 'a medias'), sc.note
  S.veredicto = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const v = (sc.verdict || 'mito').toLowerCase(), vc = v === 'ciencia' ? C.cyan : v === 'mito' ? C.pink : C.yellow;
    const top = E('div', 'position:absolute;left:180px;right:180px;top:200px;text-align:center');
    top.innerHTML = `<div style="display:inline-block;background:${C.yellow};color:${C.ink};font-size:40px;font-weight:800;padding:8px 24px;border-radius:12px">¿Mito o ciencia?</div>
      <div class="q" style="color:#fff;font-size:130px;${FD};line-height:1;margin-top:36px;${SHD}">«${sc.claim || ''}»</div>
      <div style="color:${C.soft};font-size:44px;font-weight:600;margin-top:34px">${sc.note || ''}</div>`; el.appendChild(top);
    const st = E('div', `position:absolute;left:1230px;top:700px;border:14px solid ${vc};border-radius:20px;color:${vc};padding:0 46px 10px;font-size:190px;${FD};background:rgba(11,15,74,.55)`, v === 'a medias' ? 'A medias' : v[0].toUpperCase() + v.slice(1)); el.appendChild(st);
    const hold = E('div', 'position:absolute;left:190px;top:600px'); hold.innerHTML = personSVG(300); el.appendChild(hold);
    return { el, render(lt) { enter(top.children[0], lt, 0, 16); enter(top.children[1], lt, .2, 26); enter(top.children[2], lt, .6, 16);
      const p = prog(lt, 1.3, .35); st.style.opacity = p > 0 ? 1 : 0; st.style.transform = `rotate(-11deg) scale(${p > 0 ? 1 + 1.4 * (1 - eo(p)) : 2.4})`;
      hold.style.opacity = eo(prog(lt, .3, .5)); personRender(hold.firstChild, lt, .2, lt > 1.3 ? (v === 'ciencia' ? 'happy' : 'shock') : 'ok', {}); } };
  };

  S.endcard = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const disc = E('div', `position:absolute;left:170px;top:230px;width:620px;height:620px;border-radius:50%;background:#3B5BFF;opacity:.55`); el.appendChild(disc);
    const hold = E('div', 'position:absolute;left:190px;top:170px'); hold.innerHTML = personSVG(580); el.appendChild(hold);
    const r = E('div', 'position:absolute;left:930px;top:250px;width:880px');
    r.innerHTML = `<div style="color:#fff;font-size:116px;${FD};line-height:1;${SHD}">${sc.text || '¿Qué le hacemos a Tito la próxima?'}</div>
      <div style="color:${C.soft};font-size:46px;font-weight:700;margin-top:30px">${sc.sub || (sc.text ? 'Un experimento nuevo cada semana' : 'Escríbelo en los comentarios')}</div>
      <div class="b" style="display:inline-block;margin-top:46px;padding:22px 56px;border-radius:999px;background:${C.pink};color:#fff;font-size:52px;${FD};box-shadow:8px 8px 0 rgba(7,11,69,.45)">Suscríbete</div>`;
    el.appendChild(r);
    return { el, render(lt) { hold.style.opacity = eo(prog(lt, 0, .5)); disc.style.transform = `scale(${.8 + .2 * back(prog(lt, 0, .7))})`; personRender(hold.firstChild, lt, 0, 'happy', {});
      enter(r.children[0], lt, .3); enter(r.children[1], lt, .7); enter(r.children[2], lt, 1.0); r.children[2].style.transform += ` scale(${1 + .035 * Math.sin(lt * 5)})`; } };
  };

  function uniq(root, sfx) {
    const ids = [...root.querySelectorAll('[id]')].map(e => e.id).filter(id => !/^b\d+/.test(id));
    if (!ids.length) return;
    root.querySelectorAll('[id]').forEach(e => { if (ids.includes(e.id)) e.id = e.id + '_' + sfx; });
    root.querySelectorAll('*').forEach(e => { for (const a of [...e.attributes]) { let v = a.value, ch = false; ids.forEach(id => { if (v.includes('#' + id + ')') ) { v = v.split('#' + id + ')').join('#' + id + '_' + sfx + ')'); ch = true; } }); if (ch) e.setAttribute(a.name, v); } });
  }
  // ---------- muntatge global ----------
  const BIG = new Set([]);
  function build(V) {
    const stage = document.getElementById('stage');
    const scenes = V.lines.map((ln, i) => {
      const sc = ln.scene; const fn = S[sc.type]; if (!fn) throw new Error('Escena desconeguda: ' + sc.type);
      let o = fn(sc);
      if (BIG.has(sc.type)) { const w = E('div', 'position:absolute;inset:0'); o.el.style.transform = 'scale(1.16)'; o.el.style.transformOrigin = '50% 62%'; w.appendChild(o.el); o.el = w; }
      o.disp = o.el.style.display || 'block'; uniq(o.el, 's' + i); o.el.style.display = 'none'; o.el.classList.add('scene'); stage.appendChild(o.el);
      o.t0 = V.starts[i]; o.t1 = i + 1 < V.lines.length ? V.starts[i + 1] : V.total; o.sc = sc; return o;
    });
    // HUD «Límite»: barra de progrés amb marques. V.hud = {max, unit, marks, title}; per defecte, hores 0–72
    const HU = Object.assign({ max: 72, unit: 'h', marks: [0, 17, 24, 35, 48, 72], title: V.short_title || '' }, V.hud || {}); HU.title = lab(HU.title); window.__hud = HU;
    const hud = document.getElementById('hud');
    hud.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:800;font-size:34px;margin-bottom:12px"><span class="ttl" style="color:${C.yellow}">Límite</span><span style="color:#fff;opacity:.85">${HU.title}</span></div>
      <div style="position:relative;height:26px;border-radius:13px;background:rgba(7,11,69,.38)"><div class="pr" style="position:absolute;left:0;top:0;bottom:0;width:0;border-radius:13px;background:linear-gradient(90deg,${C.cyan},${C.yellow} 55%,${C.pink});background-size:1600px 100%"></div>
      <div class="kn" style="position:absolute;left:0;top:50%;width:44px;height:44px;margin:-22px;border-radius:50%;background:#fff;border:6px solid ${C.pink};box-shadow:4px 4px 0 rgba(7,11,69,.4)"></div></div>` +
      HU.marks.map(h => `<div class="mk" data-h="${h}" style="position:absolute;top:96px;left:${h / HU.max * 1600}px;transform:translateX(-50%);font-weight:700;font-size:30px;white-space:nowrap">${h} ${HU.unit}</div>`).join('');
    // hores per escena (arrossegant l'última definida)
    let last = null; scenes.forEach(s => { if (s.sc.hour != null) last = s.sc.hour; s.hour = s.sc.hour != null ? s.sc.hour : (s.sc.calm || s.sc.type === 'endcard' ? null : last); if (s.sc.calm || s.sc.type === 'title' && s.sc.calm) last = null; });
    window.__scenes = scenes;
    if (V.vertical) {
      document.body.classList.add('vert');
      document.getElementById('vtop').innerHTML = `<div style="padding:10px 28px;border-radius:999px;background:${C.pink};color:#fff;font-size:38px;font-weight:800">Cuerpo al Límite</div><div class="hk" style="color:#fff;font-size:96px;${FD};line-height:1.02;letter-spacing:-2px;margin-top:22px;${SHD}">${V.hook || ''}</div>`;
      document.getElementById('vchar').innerHTML = personSVG(300);
      // paraules amb temps aproximat (proporcional als caràcters dins de cada línia)
      window.__words = [];
      V.lines.forEach((ln, i) => { const ws = ln.text.split(/\s+/); const a = V.starts[i], b = i + 1 < V.lines.length ? V.starts[i + 1] : V.total - 1.2; const tot = ws.reduce((x, w) => x + w.length + 1, 0); let cur = a; ws.forEach(w => { const d = (b - a) * (w.length + 1) / tot; window.__words.push({ w, t0: cur, t1: cur + d, line: i }); cur += d; }); });
    }
  }
  let prevHour = 0;
  function render(t) {
    const sc = window.__scenes; particles(t);
    let active = null, hourFrom = 0, hourTo = null, hourT0 = 0;
    sc.forEach((s, i) => {
      const vis = t >= s.t0 - .05 && t < s.t1 + .4;
      s.el.style.display = vis ? s.disp : 'none';
      if (!vis) return;
      const lt = t - s.t0, d = s.t1 - s.t0;
      const aIn = eo(prog(t, s.t0, .45)), aOut = 1 - prog(t, s.t1, .4);
      s.el.style.opacity = Math.min(aIn, aOut);
      const cam = s.cam || (s.cam = ['in', 'left', 'out', 'right', 'in', 'up'][i % 6]);
      const ck = eio(prog(lt, 0, d + .4)); let sx = 1, tx = 0, ty = 0;
      if (cam === 'in') sx = 1 + .05 * ck; if (cam === 'out') sx = 1.06 - .05 * ck;
      if (cam === 'left') { sx = 1.04; tx = lerp(28, -28, ck); } if (cam === 'right') { sx = 1.04; tx = lerp(-28, 28, ck); } if (cam === 'up') { sx = 1.04; ty = lerp(18, -18, ck); }
      if (d > 6.5) sx *= 1 + .045 * eo(prog(lt, d * .52, .45));
      s.el.style.transform = `translate(${tx}px,${ty}px) scale(${sx * (1.015 - .015 * aIn)})`;
      try { s.render(Math.max(0, lt), d); } catch (e) { console.error(e); }
      if (t >= s.t0 && t < s.t1) { active = s; const prev = sc[i - 1]; hourFrom = prev && prev.hour != null ? prev.hour : (s.hour || 0); hourTo = s.hour; hourT0 = s.t0; }
    });
    const hud = document.getElementById('hud');
    let hv = hourTo == null ? null : lerp(hourFrom, hourTo, eio(prog(t, hourT0, 1.2)));
    if (hv != null) { window.__lastHV = hv; window.__recT = null; }
    let rec = false;
    if (hv == null && window.__lastHV != null && active && active.sc.type !== 'endcard' && active.sc.type !== 'experimento') {
      if (window.__recT == null) window.__recT = t; rec = true; hv = window.__lastHV * (1 - eio(prog(t, window.__recT, 25))); }
    hud.style.opacity = hv == null ? 0 : 1;
    if (hud.dataset.rec !== String(rec)) { hud.dataset.rec = rec; hud.querySelector('.ttl').textContent = rec ? 'Recuperación' : 'Límite'; hud.querySelector('.ttl').style.color = rec ? C.cyan : C.yellow;
      hud.querySelector('.pr').style.background = rec ? C.cyan : `linear-gradient(90deg,${C.cyan},${C.yellow} 55%,${C.pink})`; hud.querySelector('.kn').style.borderColor = rec ? C.cyan : C.pink; }
    if (hv != null) { const HU = window.__hud, x = Math.min(1, hv / HU.max) * 1600; hud.querySelector('.pr').style.width = x + 'px'; hud.querySelector('.kn').style.left = x + 'px';
      hud.querySelector('.kn').style.transform = `scale(${1 + .08 * Math.sin(t * 4)})`;
      hud.querySelectorAll('.mk').forEach(m => { const on = hv >= +m.dataset.h - .01; m.style.color = on ? '#FFFFFF' : 'rgba(199,208,255,.55)'; }); }
    const src = document.getElementById('src'); const st = active && active.sc.source; src.textContent = st ? 'Fuente: ' + st : ''; src.style.opacity = st ? eo(prog(t, active.t0 + 1, .6)) * .9 : 0;
    const V = window.VIDEO, T0 = V.segStart || 0, T1 = V.segEnd || V.total;
    document.getElementById('fade').style.opacity = 1 - eo(prog(t, T0, .35)) + prog(t, T1 - .5, .5);
    if (V.vertical) {
      particles2(t);
      const f = (hv != null ? hv : (active && active.hour != null ? active.hour : 0)) / (window.__hud ? window.__hud.max : 72);
      const mood = active && (active.sc.calm || active.sc.type === 'endcard') ? 'happy' : active && active.sc.type === 'amygdala' ? 'angry' : 'ok';
      personRender(document.querySelector('#vchar svg'), t, f, mood);
      const hk = document.querySelector('#vtop .hk'); if (hk) { const a = eo(prog(t, T0, .6)); hk.style.transform = `scale(${.85 + .15 * back(prog(t, T0, .6))})`; hk.style.opacity = a * (1 - prog(t, T0 + 2.5, .5)); }
      const W2 = window.__words; let k = W2.findIndex(w => t >= w.t0 && t < w.t1); if (k < 0) k = W2.findIndex(w => w.t0 > t) - 1;
      if (k >= 0) { const st = Math.floor(k / 5) * 5; const chunk = W2.slice(st, st + 5).filter(w => w.line === W2[k].line);
        document.getElementById('vcap').innerHTML = '<div>' + chunk.map(w => `<span style="display:inline-block;margin:0 .12em;${w === W2[k] ? `color:${C.yellow};text-shadow:8px 8px 0 #0A1A8C` : ''}">${w.w}</span>`).join('') + '</div>'; }
      if (t > T1 - 2.6) document.getElementById('vcap').innerHTML = `<div style="color:${C.cyan}">Video completo en el canal ▶</div>`;
    }
  }
  // fons: taques orgàniques suaus que es desplacen lentament (res de xarxes de punts)
  const R0 = rnd(42); const BL = []; for (let i = 0; i < 9; i++) BL.push({ x: R0(), y: R0(), r: 380 + R0() * 320, a: R0() * 6.28, sp: .15 + R0() * .35, ph: R0() * 6.28, c: R0() < .25 ? '255,59,107' : R0() < .5 ? '62,240,255' : '120,140,255' });
  function blobs(id, w, h, t) {
    const cv = document.getElementById(id), cx = cv.getContext('2d'); cx.clearRect(0, 0, w, h);
    BL.forEach(p => { const x = (p.x * w + Math.cos(p.a) * t * 12 * p.sp + Math.sin(t * .3 + p.ph) * 40), y = (p.y * h + Math.sin(p.a) * t * 10 * p.sp + Math.cos(t * .25 + p.ph) * 40);
      const g = cx.createRadialGradient(x, y, 0, x, y, p.r); g.addColorStop(0, `rgba(${p.c},.16)`); g.addColorStop(1, `rgba(${p.c},0)`); cx.fillStyle = g; cx.beginPath(); cx.arc(x, y, p.r, 0, 6.28); cx.fill(); });
    const gr = document.getElementById('grain'); if (gr) gr.style.transform = `translate(${-((t * 997) % 37)}px,${-((t * 613) % 41)}px)`;
  }
  function particles(t) { blobs('cv', W, H, t); }
  function particles2(t) { blobs('cv2', 1080, 1920, t); }
  window.Motor = { build, render, S, personSVG, personRender };
})();
