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
    w = Math.min(w, 1730 - x); const h = E('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px`);
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
    const c = sc.calm ? C.cyan : (sc.color ? col(sc.color) : C.red), cn = sc.calm ? C.cyan : C.yellow;
    el.innerHTML = `<div class="p" style="padding:12px 30px;border-radius:999px;background:${c}22;color:${c};font-weight:800;font-size:36px;letter-spacing:.2px">${lab(sc.pill) || ''}</div>
      <div class="n" style="font-size:302px;${FD};line-height:1;letter-spacing:-8px;margin-top:20px;color:${cn};${SHD}">0</div>
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
    if (mode === 'scn') { const lab = E('div', `position:absolute;left:200px;top:880px;color:#fff;font-size:42px;font-weight:800`, 'Hipotálamo'); lab.className = 'scnlab'; el.appendChild(lab); }
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
    el.innerHTML = `<svg width="1000" height="600" viewBox="0 0 1000 600" style="position:absolute;left:460px;top:300px">
      <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#FF3B6B"/><stop offset=".5" stop-color="#FFD60A"/><stop offset="1" stop-color="#3EF0FF"/></linearGradient></defs>
      <path d="M100,500 A400,400 0 0 1 900,500" fill="none" stroke="rgba(7,11,69,.38)" stroke-width="64" stroke-linecap="round"/>
      <path class="arc" d="M100,500 A400,400 0 0 1 900,500" fill="none" stroke="url(#gg)" stroke-width="64" stroke-linecap="round"/>
      <line class="nd" x1="500" y1="500" x2="500" y2="150" stroke="#fff" stroke-width="14" stroke-linecap="round"/><circle cx="500" cy="500" r="30" fill="#fff"/></svg>
      <div style="position:absolute;top:236px;width:100%;text-align:center;color:${C.soft};font-size:46px;font-weight:800">${lab(sc.label) || ''}</div>
      <div class="v" style="position:absolute;top:830px;width:100%;text-align:center;color:${C.yellow};font-size:140px;${FD};line-height:1;${SHD}">100 %</div>`;
    const svg = el.firstChild; const arc = svg.querySelector('.arc'); let L = 0;
    return { el, render(lt) {
      if (!L) { L = arc.getTotalLength(); arc.style.strokeDasharray = L; }
      const v = lerp(sc.from, sc.to, eio(prog(lt, 1, 2.2))) + (lt > 3.2 ? Math.sin(lt * 9) * .6 : 0);
      arc.style.strokeDashoffset = L * (1 - v / 100);
      svg.querySelector('.nd').setAttribute('transform', `rotate(${-90 + 180 * v / 100} 500 500)`);
      el.querySelector('.v').textContent = Math.round(v) + ' %';
      svg.style.opacity = eo(prog(lt, 0, .5)); enter(el.children[1], lt, .1, 16);
    } };
  };

  // bars: dany en rosa, neutre en blanc suau, recuperació en cian (només si sc.calm); la xifra més alta en groc
  S.bars = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const box = E('div', `position:absolute;left:200px;right:${sc.tito ? 400 : 200}px;top:240px;bottom:110px;display:flex;flex-direction:column;justify-content:center`); el.appendChild(box); // amb el Tito petit a la dreta, deixa-li lloc
    box.innerHTML = `<div style="color:${C.soft};font-size:50px;font-weight:800;margin-bottom:${sc.limit ? 96 : 44}px"><span>${lab(sc.title) || ''}</span></div>`;
    const top = Math.max(...sc.items.map(i => i.value)), W1 = sc.tito ? 1320 : 1520;
    const fillC = it => /red|pink|orange/.test(it.color || '') || /^#FF/.test(it.color || '') ? C.pink : sc.calm && /cyan|mint|green/.test(it.color || '') ? C.cyan : 'rgba(211,218,255,.7)';
    const rows = sc.items.map((it, i) => { const r = E('div', `position:relative;margin-bottom:${i < sc.items.length - 1 ? 48 : 0}px`);
      const vc = it.value === top ? C.yellow : C.soft;
      r.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px"><span style="color:#fff;font-size:56px;font-weight:800">${it.label}</span><span class="v" style="color:${vc};font-size:76px;${FD};line-height:1">0</span></div>
        <div style="position:relative;height:110px;border-radius:55px;background:rgba(7,11,69,.38)"><div class="f" style="height:110px;width:0;border-radius:55px;background:${fillC(it)};overflow:hidden;position:relative"><div class="sh" style="position:absolute;top:0;bottom:0;width:180px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.28),rgba(255,255,255,0))"></div></div>
        ${sc.limit ? `<div class="lm" style="position:absolute;top:-12px;bottom:-12px;left:${W1 * sc.limit.value / sc.max}px;border-left:4px dashed #fff;opacity:0"></div>` : ''}</div>`;
      box.appendChild(r); return { r, it }; });
    let chip;
    if (sc.limit) { chip = E('div', `position:absolute;transform:translateX(-50%);background:#fff;color:${C.ink};font-size:36px;font-weight:800;padding:6px 20px 10px;border-radius:12px;white-space:nowrap;opacity:0`, lab(sc.limit.label).replace(/\s*\(.*\)/, '')); rows[0].r.appendChild(chip); chip.style.left = W1 * sc.limit.value / sc.max + 'px'; chip.style.top = '-170px'; }
    return { el, render(lt) {
      enter(box.children[0], lt, 0, 16);
      if (chip && !chip.__fx) { chip.__fx = 1; const tw = box.children[0].firstChild.offsetWidth, cw = chip.offsetWidth; chip.style.left = Math.max(W1 * sc.limit.value / sc.max, tw + cw / 2 + 40) + 'px'; } // la fitxa no trepitja mai el títol
      rows.forEach(({ r, it }, i) => { const st = .3 + i * (rows.length > 1 && i === rows.length - 1 ? .9 : .5); enter(r, lt, st - .25, 20, .35); const k = (sc._prev || []).includes(it.label) ? 1 : eo(prog(lt, st, sc._prev ? .8 : 1.3)); r.querySelector('.f').style.width = 100 * k * it.value / sc.max + '%'; r.querySelector('.v').textContent = (it.value * k).toFixed(1).replace('.', ',') + (it.unit || '');
        const shp = ((lt - st - 1.3) * .5 + i * .3) % 1.6; r.querySelector('.sh').style.left = (lt > st + 1.3 ? -200 + shp * 1100 : -400) + 'px'; });
      const lk = sc._prev ? 1 : prog(lt, 1.6, .4); box.querySelectorAll('.lm').forEach(m => m.style.opacity = lk > 0 ? 1 : 0); if (chip) { chip.style.opacity = lk > 0 ? 1 : 0; chip.style.transform = `translateX(-50%) scale(${lk >= 1 ? 1 : .7 + .3 * back(lk)})`; }
    } };
  };

  S.wave = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    // corba d'alerta circadiana 07:00 -> 07:00 (+24h), mínim cap a les 04:00
    const X0 = 250, X1 = 1670, CY = 660, AMP = 215;
    const pts = []; for (let i = 0; i <= 96; i++) { const h = 7 + i / 4; const a = Math.cos((h - 16) / 24 * 2 * Math.PI); pts.push([X0 + i * (X1 - X0) / 96, CY - a * AMP]); }
    const d = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' L');
    const [hh] = (sc.time || '04:00').split(':').map(Number); const hi = ((hh - 7 + 24) % 24) * 4;
    const dc = sc.rise ? C.cyan : C.pink;
    const labels = ['07', '13', '19', '01', '07'].map((t, i) => `<text x="${X0 + i * (X1 - X0) / 4}" y="960" fill="${C.soft}" font-size="40" font-weight="700" text-anchor="middle">${t}:00</text>`).join('');
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0;overflow:visible"><line x1="${X0}" y1="${CY}" x2="${X1}" y2="${CY}" stroke="rgba(211,218,255,.25)" stroke-width="3" stroke-dasharray="12 12"/>${labels}
      <text x="${X0}" y="${CY - AMP - 22}" fill="${C.soft}" font-size="40" font-weight="700">↑ más alerta</text><text x="${X0}" y="${CY + AMP + 36}" fill="${C.soft}" font-size="40" font-weight="700">↓ menos alerta</text>
      <path class="w" d="${d}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round"/>
      <circle class="ring" r="24" fill="none" stroke="${dc}" stroke-width="5"/><circle class="dot" r="24" fill="${dc}"/>
      <text class="tl" text-anchor="middle" fill="${C.yellow}" font-family="Brico" font-weight="800" font-stretch="76%" font-size="68" style="paint-order:stroke" stroke="#0A1A8C" stroke-width="10">${sc.time || ''}</text></svg>
      <div style="position:absolute;left:${X0}px;top:250px;color:${dc};font-size:44px;font-weight:800">${sc.sub ? '' : lab(sc.label) || ''}</div><div style="position:absolute;left:${X0}px;top:${sc.sub ? 260 : 304}px;color:#fff;font-size:58px;font-weight:800">${sc.sub || ''}</div>`;
    const hd = E('div', `position:absolute;left:0;top:0;width:150px;height:150px;border-radius:50%;overflow:hidden;background:#3B5BFF;border:7px solid #fff;box-shadow:8px 8px 0 rgba(7,11,69,.45);opacity:0`);
    hd.innerHTML = `<div style="position:absolute;left:-95px;top:-62px">${personSVG(320)}</div>`; el.appendChild(hd);
    const svg = el.firstChild, w = svg.querySelector('.w'), tl = svg.querySelector('.tl'); let L = 0;
    return { el, render(lt) {
      if (!L) { L = w.getTotalLength(); w.style.strokeDasharray = L; }
      w.style.strokeDashoffset = L * (1 - eio(prog(lt, 0, 1.8)));
      const k = eio(prog(lt, 1.2, 1.6)); const idx = Math.round(hi * k); const p = pts[idx];
      const dot = svg.querySelector('.dot'), ring = svg.querySelector('.ring');
      dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]); ring.setAttribute('cx', p[0]); ring.setAttribute('cy', p[1]);
      const ph = (lt % 1); ring.setAttribute('r', 24 + ph * 44); ring.setAttribute('opacity', lt > 2.8 ? 1 - ph : 0); dot.setAttribute('opacity', eo(prog(lt, 1.2, .3)));
      hd.style.opacity = eo(prog(lt, 1.2, .3)); hd.style.transform = `translate(${p[0] - 75}px,${p[1] - 200 + Math.sin(lt * 5) * 4}px)`;
      const fl = idx / 96 > .5 ? 'tired' : 'ok'; personRender(hd.querySelector('svg'), lt, Math.min(1, idx / 96 * 1.4), lt > 2.8 && !sc.rise ? 'tired' : fl, { seed: .3 });
      tl.setAttribute('x', p[0]); tl.setAttribute('y', p[1] + 96); tl.setAttribute('opacity', eo(prog(lt, 2.8, .4)));
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
    const el = E('div', 'position:absolute;inset:0;overflow:hidden');
    const meters = Math.round(sc.speed / 3.6 * sc.seconds);
    let dashes = ''; for (let i = 0; i < 14; i++) dashes += `<rect class="ds" x="${i * 180}" y="732" width="100" height="16" rx="8" fill="#EEF1FF"/>`;
    let side = ''; for (let i = 0; i < 12; i++) { const x = i * 200 + (i % 3) * 30; side += false ? `<g class="sd" data-x="${x}"><rect x="-70" y="930" width="140" height="120" rx="8" fill="${i % 2 ? '#FF3B6B' : '#4A68FF'}"/><path d="M-70,990 H70" stroke="#0B0F4A" stroke-width="6" opacity=".25"/></g>`
      : `<g class="sd" data-x="${x}"><circle cx="0" cy="${960 + (i % 2) * 40}" r="58" fill="#1A4FB0"/><circle cx="-14" cy="${948 + (i % 2) * 40}" r="34" fill="#2A63D0"/></g>`; }
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><rect x="0" y="580" width="1920" height="320" fill="#0D1470"/><rect x="0" y="580" width="1920" height="12" fill="#C7D0FF"/><rect x="0" y="888" width="1920" height="12" fill="#C7D0FF"/>${dashes}${side}
      <g class="car"><path d="M150,0 L520,-110 L520,110Z" fill="#FFE9A8" opacity=".22"/>
        <rect x="-150" y="-76" width="300" height="152" rx="46" fill="#F2F4FF"/><rect x="-150" y="-76" width="300" height="152" rx="46" fill="none" stroke="#C7D0FF" stroke-width="6"/>
        <path d="M34,-58 C70,-50 84,-30 86,0 C84,30 70,50 34,58 Z" fill="#0C1170"/><path d="M-96,-54 C-120,-40 -124,40 -96,54 L-70,48 L-70,-48Z" fill="#0C1170"/>
        <rect x="-66" y="-60" width="98" height="120" rx="20" fill="#DCE2FF"/><rect x="-70" y="-90" width="26" height="16" rx="6" fill="#F2F4FF"/><rect x="-70" y="74" width="26" height="16" rx="6" fill="#F2F4FF"/>
        <rect x="128" y="-62" width="20" height="30" rx="8" fill="#FFE9A8"/><rect x="128" y="32" width="20" height="30" rx="8" fill="#FFE9A8"/><rect x="-150" y="-56" width="12" height="26" rx="4" fill="#FF3B6B"/><rect x="-150" y="30" width="12" height="26" rx="4" fill="#FF3B6B"/></g></svg>
      <div class="cov" style="position:absolute;left:0;right:0;top:560px;height:540px;background:#05082E;opacity:0"></div>
      <div style="position:absolute;top:232px;width:100%;text-align:center"><div style="color:${C.soft};font-size:46px;font-weight:800">${sc.title || `A ${sc.speed} km/h, ${sc.seconds} segundos dormido`}</div><div class="m" style="color:${C.yellow};font-size:220px;${FD};line-height:1;margin-top:4px;${SHD}">0 m</div><div style="color:${C.pink};font-size:52px;font-weight:800;margin-top:-6px">recorridos a ciegas</div></div>`;
    const svg = el.firstChild, cov = el.querySelector('.cov'), top = el.children[2];
    return { el, render(lt) {
      const v = 900; svg.querySelectorAll('.ds').forEach((d, i) => d.setAttribute('x', ((i * 180 - lt * v) % 2520 + 2520) % 2520 - 180));
      svg.querySelectorAll('.sd').forEach(g => g.setAttribute('transform', `translate(${((+g.dataset.x - lt * v) % 2400 + 2400) % 2400 - 200} 0)`));
      svg.querySelector('.car').setAttribute('transform', `translate(${lerp(-260, 760, eo(prog(lt, 0, 1.2))).toFixed(1)} ${(740 + Math.sin(lt * 23) * 1.5).toFixed(1)})`);
      const k = prog(lt, 1.4, sc.seconds); top.querySelector('.m').textContent = Math.round(meters * k) + ' m';
      cov.style.opacity = lt > 1.4 && lt < 1.4 + sc.seconds ? .78 : (lt >= 1.4 + sc.seconds ? .78 * (1 - prog(lt, 1.4 + sc.seconds, .4)) : 0);
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
    const el = E('div', 'position:absolute;inset:0');
    const blk = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;transform-origin:50% 50%'); el.appendChild(blk);
    const one = sc.items.length === 1, it0 = sc.items[0], pct = one && /%/.test(it0.suffix || '') && it0.value <= 100 && it0.value >= 1;
    const row = E('div', 'display:flex;gap:160px'); blk.appendChild(row);
    const cells = sc.items.map(it => { const c = one ? (sc.calm ? C.cyan : C.yellow) : col(it.color); const d = E('div', 'text-align:center'); d.innerHTML = `<div class="n" style="font-size:${one ? 342 : 231}px;${FD};color:${c};letter-spacing:-6px;line-height:1;${SHD}">0</div><div style="color:#fff;font-size:50px;font-weight:800;margin-top:10px">${it.label}</div>`; row.appendChild(d); return { d, it }; });
    const sub = E('div', `color:${C.soft};font-size:46px;font-weight:600;margin-top:44px;max-width:1180px;text-align:center;line-height:1.2`, (sc.sub || '').replace(/(\d)–(\d)/g, '$1\u2060–\u2060$2').replace(/\((.*?)\)/g, '<span style="white-space:nowrap">($1)</span>')); blk.appendChild(sub);
    let grid, cap, cs = [];
    if (pct) { grid = E('div', 'position:absolute;left:1010px;top:300px;width:500px;display:grid;grid-template-columns:repeat(10,44px);gap:6px;opacity:0'); for (let i = 0; i < 100; i++) { const c = E('div', 'width:44px;height:44px;border-radius:10px;background:rgba(211,218,255,.25)'); grid.appendChild(c); cs.push(c); } el.appendChild(grid);
      cap = E('div', `position:absolute;left:1010px;top:820px;width:500px;text-align:center;color:${C.soft};font-size:44px;font-weight:800;opacity:0`, `${Math.round(it0.value)} de cada 100`); el.appendChild(cap); }
    return { el, render(lt, d) { cells.forEach(({ d: e, it }, i) => { enter(e, lt, .2 + i * .5, 30); e.querySelector('.n').textContent = (it.prefix || '') + Math.round(it.value * eo(prog(lt, .3 + i * .5, 1.4))) + (it.suffix || ''); }); enter(sub, lt, 1.4);
      if (pct && d > 5.5) { const T = 3, k = eio(prog(lt, T, .7)); blk.style.left = lerp(0, 150, k) + 'px'; blk.style.right = lerp(0, 1000, k) + 'px'; cells[0].d.querySelector('.n').style.fontSize = lerp(342, 230, k) + 'px'; grid.style.opacity = k; sub.style.opacity = 1 - k; cap.style.opacity = eo(prog(lt, T + 1.6, .4));
        const n = Math.round(it0.value * prog(lt, T + .5, 1.2)); cs.forEach((c, i) => { c.style.background = i < n ? C.pink : 'rgba(211,218,255,.25)'; c.style.transform = i < n && i >= n - 3 ? 'scale(1.12)' : ''; }); }
    }, sfx(a, b) { return pct && b - a > 5.5 ? [{ t: a + 3.5, d: 1.2, k: 'fill', n: Math.min(24, Math.round(it0.value)) }] : []; } };
  };

  S.amygdala = (sc) => {
    const el = E('div', 'position:absolute;inset:0');
    const extra = `<g class="am" opacity="0"><circle class="r1" cx="214" cy="306" r="20" fill="none" stroke="#FF3B6B" stroke-width="3"/><circle class="r2" cx="214" cy="306" r="20" fill="none" stroke="#FF3B6B" stroke-width="3"/><ellipse class="ag" cx="214" cy="306" rx="34" ry="24" fill="#FF3B6B" filter="url(#BG)"/><ellipse cx="214" cy="306" rx="17" ry="12" transform="rotate(-20 214 306)" fill="#FF8FAB" stroke="#FFE4E6" stroke-width="2"/></g>
      <g class="pf" opacity="0"><circle cx="130" cy="180" r="16" fill="#3EF0FF"/><path class="link" d="M138,194 C160,240 190,270 206,292" fill="none" stroke="#3EF0FF" stroke-width="5" stroke-dasharray="10 8"/></g>`;
    const b = brainSVG(860, extra);
    const holder = E('div', 'position:absolute;left:80px;top:300px'); holder.innerHTML = b.html.replace('url(#BG)', `url(#${b.u}bg)`); el.appendChild(holder);
    const lab1 = E('div', `position:absolute;left:230px;top:880px;color:#fff;font-size:40px;font-weight:800`, `Amígdala <span style="color:${C.red};font-size:36px;letter-spacing:.5px;display:block">Alarma emocional</span>`); el.appendChild(lab1);
    const lab2 = E('div', `position:absolute;left:230px;top:300px;color:#fff;font-size:40px;font-weight:800`, `Corteza prefrontal <span style="color:${C.cyan};font-size:36px;letter-spacing:.5px;display:block">El freno</span>`); el.appendChild(lab2);
    const panel = E('div', 'position:absolute;left:1090px;top:330px;width:620px'); el.appendChild(panel);
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
    const el = E('div', 'position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding-left:260px;padding-right:200px;gap:44px');
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
    const yOf = s => [350, 530, 470, 610, 750][s];
    let segs = ''; const x0 = 420, dx = 1300 / seq.length;
    seq.forEach((s, i) => { const c = s === 4 ? C.blue : s === 1 ? C.violet : '#6F7CD6'; segs += `<rect class="sg" x="${x0 + i * dx}" y="${yOf(s) - 14}" width="${dx + 1}" height="28" rx="6" fill="${c}" opacity="0"/>`; });
    const lbl = [['Despierto', 350], ['REM', 530], ['Ligero', 610], ['Profundo', 750]].map(([t, y]) => `<text x="${x0 - 30}" y="${y + 12}" fill="${C.soft}" font-size="40" font-weight="700" text-anchor="end">${t}</text>`).join('');
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0">${lbl}${segs}</svg><div style="position:absolute;left:200px;top:258px;color:${C.cyan};font-size:46px;font-weight:800">La noche de recuperación</div>
      <div style="position:absolute;left:420px;top:850px;display:flex;gap:60px;font-size:40px;font-weight:800"><span style="color:${C.blue}">■ Sueño profundo ↑</span><span style="color:${C.violet}">■ Sueño REM ↑</span></div>`;
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
      b.innerHTML = `<div style="position:absolute;inset:8%;border-radius:50%;background:#3B5BFF;opacity:.55"></div>` + (window.OrganArt && OrganArt.has(n) ? `<div style="position:relative;width:86%;height:86%">${OrganArt.svg(n, '100%', '100%')}</div>` : `<img src="${ORG(n)}" style="position:relative;max-width:88%;max-height:88%">`);
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


  // situacion: el Tito fent el que explica el narrador. sc.lugar: coche | cama | escritorio · sc.time ('03:47'), sc.hour|fatigue, sc.mood, sc.label, sc.sub, sc.microsueno (coche)
  S.situacion = (sc) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden');
    const L = sc.lugar || 'escritorio', f = sc.fatigue != null ? sc.fatigue : (sc.hour || 0) / ((window.VIDEO && window.VIDEO.hud && window.VIDEO.hud.max) || 72);
    const bg = E('div', 'position:absolute;inset:0'), tito = E('div', 'position:absolute'), fg = E('div', 'position:absolute;inset:0');
    el.appendChild(bg); el.appendChild(tito); el.appendChild(fg);
    tito.innerHTML = personSVG(L === 'cama' ? 380 : 420);
    const clockTxt = sc.time || '';
    let upd = () => {};
    if (L === 'coche') {
      bg.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><rect y="840" width="1920" height="240" fill="#0A1270"/><rect y="836" width="1920" height="8" fill="#3B5BFF"/>
        <g class="dash"></g><g class="poles"></g></svg>`;
      const dash = bg.querySelector('.dash'), poles = bg.querySelector('.poles');
      for (let i = 0; i < 12; i++) dash.innerHTML += `<rect x="${i * 240}" y="950" width="120" height="14" rx="7" fill="#D3DAFF" opacity=".7"/>`;
      for (let i = 0; i < 4; i++) poles.innerHTML += `<g><rect x="-6" y="380" width="12" height="460" fill="#4553C8"/><rect x="-6" y="380" width="90" height="12" rx="6" fill="#4553C8"/><ellipse cx="78" cy="400" rx="26" ry="12" fill="#FFF4B3"/><path d="M60,404 L-40,836 L200,836 L98,404Z" fill="#FFF4B3" opacity=".08"/></g>`;
      tito.style.cssText += ';left:640px;top:300px;clip-path:inset(0 0 150px 0)';
      fg.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0;overflow:visible"><g class="car">
        <path fill-rule="evenodd" d="M300,700 C300,640 340,620 400,612 L560,600 C620,520 700,470 820,466 L1040,466 C1120,470 1170,520 1220,590 L1400,606 C1470,616 1500,650 1500,700 L1500,780 C1500,800 1486,812 1466,812 L334,812 C314,812 300,800 300,780Z M600,600 C650,540 720,504 820,500 L1036,500 C1100,504 1140,546 1180,598Z" fill="#EEF1FF"/>
        <path d="M600,600 L1180,598" stroke="#C7D0FF" stroke-width="6"/><rect x="900" y="500" width="14" height="100" fill="#C7D0FF"/>
        <path d="M1500,700 L1500,690 L1460,690 L1460,712 L1500,712Z" fill="#FFD60A"/><path d="M300,700 L340,700 L340,724 L300,724Z" fill="#FF3B6B"/>
        <rect x="300" y="740" width="1200" height="14" fill="#C7D0FF"/>
        <g class="w1" transform="translate(520 812)"><circle r="78" fill="#0B0F4A"/><circle r="40" fill="#9FB0FF"/><path d="M-36,0 L36,0 M0,-36 L0,36" stroke="#0B0F4A" stroke-width="8"/></g>
        <g class="w2" transform="translate(1290 812)"><circle r="78" fill="#0B0F4A"/><circle r="40" fill="#9FB0FF"/><path d="M-36,0 L36,0 M0,-36 L0,36" stroke="#0B0F4A" stroke-width="8"/></g>
        </g>
        <path class="beam" d="M1500,700 L1920,610 L1920,810 Z" fill="#FFF4B3" opacity=".16"/></svg>`;
      upd = lt => { const v = 620; dash.setAttribute('transform', `translate(${-((lt * v) % 240)} 0)`);
        [...poles.children].forEach((g, i) => g.setAttribute('transform', `translate(${((i * 620 - lt * v * .8) % 2480 + 2480) % 2480 - 280} 0)`));
        const nod = sc.microsueno ? Math.max(0, Math.sin(lt * 1.3)) : 0, drift = sc.microsueno ? Math.sin(lt * .9) * 10 : 0;
        const car = fg.querySelector('.car'); car.setAttribute('transform', `translate(0 ${Math.sin(lt * 9) * 2.5}) rotate(${drift * .15} 900 812)`);
        fg.querySelectorAll('.w1,.w2').forEach((w, i) => w.setAttribute('transform', `translate(${i ? 1290 : 520} 812) rotate(${lt * 520})`));
        tito.style.transform = `translate(0 ${Math.sin(lt * 9) * 2.5}px) rotate(${nod * 14}deg)`;
        personRender(tito.firstChild, lt, sc.microsueno ? Math.max(f, .7 + .3 * nod) : f, nod > .8 ? 'sleep' : (sc.mood || 'tired'), { seed: .4 }); };
    }
    if (L === 'cama') {
      bg.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><g transform="translate(0 90)"><rect x="180" y="150" width="380" height="300" rx="20" fill="#0C1170" stroke="#4553C8" stroke-width="10"/><circle cx="460" cy="250" r="46" fill="#FFF4B3"/><circle cx="440" cy="236" r="46" fill="#0C1170"/>
        <circle cx="300" cy="230" r="4" fill="#fff"/><circle cx="250" cy="330" r="3" fill="#fff"/><circle cx="380" cy="380" r="3" fill="#fff"/><path d="M370,150 V450 M180,300 H560" stroke="#4553C8" stroke-width="8"/></g>
        <rect x="140" y="520" width="60" height="420" rx="20" fill="#4553C8"/><rect x="190" y="700" width="1180" height="120" rx="24" fill="#EEF1FF"/><rect x="190" y="800" width="1180" height="40" fill="#C7D0FF"/>
        <rect x="1360" y="700" width="40" height="240" rx="14" fill="#4553C8"/><rect x="240" y="620" width="300" height="110" rx="50" fill="#fff"/>
        <rect x="1440" y="700" width="260" height="240" rx="18" fill="#2433C4"/><rect x="1470" y="620" width="200" height="90" rx="16" fill="#0B0F4A"/>
        <text class="clk" x="1570" y="682" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="62" fill="#FF3B6B">${clockTxt}</text></svg>`;
      tito.style.cssText += ';left:500px;top:300px;transform-origin:0 0';
      fg.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><path class="bl" d="M660,520 C800,470 980,500 1050,560 C1160,620 1300,612 1370,650 L1370,840 L660,840 Z" fill="#7FB2FF"/><path d="M700,560 C820,520 960,540 1030,600 M1060,640 C1180,670 1300,660 1360,690" stroke="#9FB0FF" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M660,520 C680,560 680,800 660,840" stroke="#5F86E6" stroke-width="8" fill="none"/></svg>`;
      upd = lt => { tito.style.transform = `translate(-150px, 580px) rotate(-90deg)`; fg.querySelector('.bl').setAttribute('transform', `translate(0 ${Math.sin(lt * 1.6) * 4})`);
        const c = bg.querySelector('.clk'); if (c && clockTxt) c.textContent = clockTxt.replace(':', Math.floor(lt * 2) % 2 ? ' ' : ':');
        personRender(tito.firstChild, lt, f, sc.mood || 'tired', { seed: 1.1 }); };
    }
    if (L === 'escritorio') {
      bg.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><circle cx="1180" cy="360" r="90" fill="#EEF1FF" stroke="#4553C8" stroke-width="12"/><line class="hh" x1="1180" y1="360" x2="1180" y2="312" stroke="#0B0F4A" stroke-width="10" stroke-linecap="round"/><line class="mh" x1="1180" y1="360" x2="1238" y2="360" stroke="#FF3B6B" stroke-width="6" stroke-linecap="round"/>
        <text x="1180" y="510" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="56" fill="#fff">${clockTxt}</text></svg>`;
      tito.style.cssText += ';left:420px;top:180px';
      fg.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0"><defs><radialGradient id="glw" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3EF0FF" stop-opacity=".16"/><stop offset="1" stop-color="#3EF0FF" stop-opacity="0"/></radialGradient></defs>
        <ellipse class="glow" cx="630" cy="560" rx="360" ry="260" fill="url(#glw)"/>
        <rect x="120" y="800" width="1240" height="40" rx="12" fill="#EEF1FF"/><rect x="160" y="840" width="1160" height="240" fill="#2433C4"/>
        <path d="M470,800 L520,610 L800,610 L850,800Z" fill="#C7D0FF"/><circle cx="660" cy="700" r="22" fill="#9FB0FF"/><rect x="430" y="790" width="460" height="14" rx="6" fill="#9FB0FF"/>
        <rect x="1000" y="700" width="90" height="100" rx="14" fill="#FF3B6B"/><path d="M1090,722 C1130,722 1130,778 1090,778" stroke="#FF3B6B" stroke-width="14" fill="none"/>
        <path class="st1" d="M1025,690 C1010,660 1040,640 1025,610" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/><path class="st2" d="M1060,690 C1045,660 1075,640 1060,610" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
        <path d="M240,800 L240,620 L320,560" stroke="#4553C8" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M290,540 L380,560 L340,620 Z" fill="#FFD60A"/></svg>`;
      upd = lt => { fg.querySelectorAll('.st1,.st2').forEach((p, i) => { const k = (lt * .8 + i * .5) % 1; p.setAttribute('transform', `translate(0 ${-k * 40})`); p.setAttribute('opacity', .7 * (1 - k)); });
        fg.querySelector('.glow').setAttribute('opacity', .8 + .2 * Math.sin(lt * 7) * Math.sin(lt * 3.1));
        bg.querySelector('.mh').setAttribute('transform', `rotate(${lt * 30} 1180 360)`);
        personRender(tito.firstChild, lt, f, sc.mood || 'tired', { seed: .8 }); };
    }
    const hd = sc.label || sc.sub ? header(el, sc.label, sc.sub, sc.microsueno ? C.red : C.yellow, 1430, 380, 440) : () => {};
    return { el, render(lt) { const a = eo(prog(lt, 0, .5)); el.style.opacity = 1; bg.style.opacity = a; fg.style.transform = `translateX(${(1 - a) * 80}px)`; upd(lt); hd(lt); } };
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
    // plans: una línia pot tenir dos plans (scene.then = {…escena, at: segons}) sense tocar la veu
    let ovl = document.getElementById('ovl'); if (!ovl) { ovl = E('div', 'position:absolute;inset:0;pointer-events:none'); ovl.id = 'ovl'; stage.after(ovl); }
    const shots = [];
    V.lines.forEach((ln, i) => { const a = V.starts[i], b = i + 1 < V.lines.length ? V.starts[i + 1] : V.total, sc = ln.scene;
      if (sc.then) { const at = Math.min(b - 1, a + (sc.then.at || (b - a) / 2)); shots.push([sc, a, at, i], [Object.assign({ hour: sc.hour, source: sc.source }, sc.then), at, b, i]); } else shots.push([sc, a, b, i]); });
    const scenes = shots.map(([sc, t0, t1, li], i) => {
      const fn = S[sc.type]; if (!fn) throw new Error('Escena desconeguda: ' + sc.type);
      let o = fn(sc);
      if (BIG.has(sc.type)) { const w = E('div', 'position:absolute;inset:0'); o.el.style.transform = 'scale(1.16)'; o.el.style.transformOrigin = '50% 62%'; w.appendChild(o.el); o.el = w; }
      if (DATA.has(sc.type)) o.el.prepend(E('div', 'position:absolute;inset:-80px;background-image:linear-gradient(rgba(150,168,255,.05) 2px,transparent 2px),linear-gradient(90deg,rgba(150,168,255,.05) 2px,transparent 2px);background-size:60px 60px'));
       // segon temps de les barres: el Tito reacciona als 3 s
      if (sc.tito && sc.type !== 'persona' && sc.type !== 'situacion') { // el Tito petit reaccionant a la cantonada dreta
        const cm = E('div', 'position:absolute;left:1570px;top:700px;width:213px;height:320px'); cm.innerHTML = personSVG(213); const dl = sc.type === 'bars' && !sc._tAuto ? 0 : 0; o.el.appendChild(cm);
        const r0 = o.render; o.render = (lt, d) => { r0(lt, d); const a = back(prog(lt, sc._tAuto ? 3 : .4, .6)); cm.style.transform = `translateY(${(1 - a) * 260}px)`;
          personRender(cm.firstChild, lt, sc.fatigue != null ? sc.fatigue : (sc.hour || 0) / 72, sc.tito, { seed: i * .37 }); };
      }
      o.disp = o.el.style.display || 'block'; uniq(o.el, 's' + i); o.el.style.display = 'none'; o.el.classList.add('scene'); stage.appendChild(o.el);
      o.t0 = t0; o.t1 = t1; o.sc = sc; o.line = li;
      const ov = [...o.el.querySelectorAll('[data-ovl]')]; // adhesius: fixos a pantalla, fora del moviment de càmera
      if (ov.length) { o.ov = E('div', 'position:absolute;inset:0;display:none;pointer-events:none'); ov.forEach(n => o.ov.appendChild(n)); ovl.appendChild(o.ov); }
      return o;
    });
    // transicions: cortineta de marca quan canvia el lloc o el tipus de pla gran; si no, tall sec amb empenta
    scenes.forEach((s, i) => { if (!i) { s.tr = 'none'; s.pre = 0; return; } const p = scenes[i - 1].sc, c = s.sc;
      s.tr = c.tr || ((BIGT.has(c.type) || BIGT.has(p.type)) && (c.type !== p.type || c.lugar !== p.lugar) ? 'swipe' : 'cut');
      s.pre = PRE; if (c.type === 'bars' && p.type === 'bars' && c.title === p.title) c._prev = p.items.map(x => x.label); });
    scenes.forEach((s, i) => { s.nx = scenes[i + 1] || null; });
    let sw = document.getElementById('swipe');
    if (!sw) { sw = E('div', 'position:absolute;inset:0;overflow:hidden;pointer-events:none;display:none'); sw.id = 'swipe';
      sw.innerHTML = `<div style="position:absolute;top:-210px;height:1500px;width:${BW}px;transform:skewX(-12deg);transform-origin:50% 50%;background:linear-gradient(90deg,#0C1170 0 230px,#FFD60A 230px 280px,#FF3B6B 280px ${BW}px)"></div>`; document.getElementById('vig').before(sw); }
    // HUD «Límite»: barra de progrés amb marques. V.hud = {max, unit, marks, title}; per defecte, hores 0–72
    const HU = Object.assign({ max: 72, unit: 'h', marks: [0, 17, 24, 35, 48, 72], title: V.short_title || '' }, V.hud || {}); HU.title = lab(HU.title); window.__hud = HU;
    const hud = document.getElementById('hud');
    hud.innerHTML = `<div style="position:absolute;left:-50px;top:-14px;width:1700px;height:158px;border-radius:32px;background:rgba(12,17,112,.8);z-index:-1"></div><div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:800;font-size:34px;margin-bottom:12px"><span class="ttl" style="color:${C.yellow}">Límite</span><span style="color:#fff;opacity:.85">${HU.title}</span></div>
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
  const BIGT = new Set(['situacion', 'escaner', 'experimento', 'veredicto', 'persona', 'endcard']);
  // cortineta: banda estreta (cobalt 230 + groc 50 + rosa 140) que creua la pantalla en 0,3 s; darrere hi ha el pla nou, davant el vell
  const DATA = new Set(['counter', 'stats', 'bars', 'gauge', 'wave', 'road', 'title', 'question', 'list', 'clock', 'hypnogram', 'steps', 'quote', 'cells', 'memory', 'receptor', 'brain', 'amygdala', 'distort', 'flicker', 'body']);
  const BW = 420, SWD = .9, PRE = .4, TAN = Math.tan(12 * Math.PI / 180);
  const seamX = (t, T) => lerp(-500, 2420, eio((t - (T - SWD / 2)) / SWD)) + 115; // costura al mig de la franja cobalt
  function clipFor(t, T, keepLeft, s) { // polígon a coordenades locals de l'escena (desfà la càmera)
    const X = seamX(t, T), yT = -120, yB = 1200, xT = X + TAN * (540 - yT), xB = X + TAN * (540 - yB);
    const loc = (x, y) => s ? [960 + (x - s.tx - 960) / s.sc, 540 + (y - s.ty - 540) / s.sc] : [x, y];
    const P = keepLeft ? [[-400, yT], [xT, yT], [xB, yB], [-400, yB]] : [[xT, yT], [2400, yT], [2400, yB], [xB, yB]];
    return 'polygon(' + P.map(([x, y]) => loc(x, y)).map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',') + ')';
  }
  let prevHour = 0;
  function render(t) {
    const sc = window.__scenes; particles(t);
    let active = null, hourFrom = 0, hourTo = null, hourT0 = 0;
    sc.forEach((s, i) => {
      const inW = s.tr === 'swipe' ? SWD / 2 : 0, outW = s.nx && s.nx.tr === 'swipe' ? SWD / 2 : 0;
      const vis = t >= s.t0 - inW && (t < s.t1 + outW || i === sc.length - 1);
      s.el.style.display = vis ? s.disp : 'none'; if (s.ov) s.ov.style.display = vis ? 'block' : 'none';
      if (!vis) return;
      const lt = t - s.t0 + s.pre, d = s.t1 - s.t0 + s.pre;
      s.el.style.opacity = 1;
      const aIn = s.tr === 'cut' ? 1 - 1.4 * (1 - eio(prog(lt, s.pre, .9))) : 1;
      const cam = s.cam || (s.cam = ['in', 'left', 'out', 'right', 'in', 'up'][i % 6]);
      const ck = eio(prog(lt, 0, d + .4)); let sx = 1, tx = 0, ty = 0;
      if (cam === 'in') sx = 1 + .05 * ck; if (cam === 'out') sx = 1.06 - .05 * ck;
      if (cam === 'left') { sx = 1.03; tx = lerp(14, -14, ck); } if (cam === 'right') { sx = 1.03; tx = lerp(-14, 14, ck); } if (cam === 'up') { sx = 1.03; ty = lerp(10, -10, ck); }
      if (d > 6.5) sx *= 1 + .045 * eo(prog(lt, d * .52, .45));
      const S2 = sx * (1.015 - .015 * aIn); s.el.style.transform = `translate(${tx}px,${ty}px) scale(${S2})`; // aIn < 1 → empenta d'entrada
      const cv = { tx, ty, sc: S2 }, cin = inW && t < s.t0 + inW, cout = outW && t >= s.t1 - outW;
      s.el.style.clipPath = cin ? clipFor(t, s.t0, true, cv) : cout ? clipFor(t, s.t1, false, cv) : 'none';
      if (s.ov) s.ov.style.clipPath = cin ? clipFor(t, s.t0, true) : cout ? clipFor(t, s.t1, false) : 'none';
      try { s.render(Math.max(0, lt), d); } catch (e) { console.error(e); }
      if (t >= s.t0 && t < s.t1) { active = s; const prev = sc[i - 1]; hourFrom = prev && prev.hour != null ? prev.hour : (s.hour || 0); hourTo = s.hour; hourT0 = s.t0; }
    });
    // cortineta: banda inclinada amb franges de marca; el tall passa just quan tapa tota la pantalla
    const swp = document.getElementById('swipe'), band = swp.firstChild; let on = false;
    sc.forEach(s => { if (s.tr !== 'swipe' || Math.abs(t - s.t0) > SWD / 2) return; on = true; band.style.left = (seamX(t, s.t0) - 115).toFixed(0) + 'px'; });
    swp.style.display = on ? 'block' : 'none';
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
    const src = document.getElementById('src'); const st = active && active.sc.source; src.textContent = st ? 'Fuente: ' + st : ''; const big = active && (BIGT.has(active.sc.type) && !['escaner','experimento','veredicto'].includes(active.sc.type)); src.style.left = big ? 'auto' : '60px'; src.style.right = big ? '120px' : 'auto'; src.style.opacity = st ? eo(prog(t, active.t0 + 1, .6)) * .9 : 0;
    const V = window.VIDEO, T0 = V.segStart || 0, T1 = V.segEnd || V.total;
    document.getElementById('fade').style.opacity = 1 - eo(prog(t, T0, .35)) + prog(t, T1 - .5, .5);
    if (V.vertical) {
      particles2(t);
      const f = (hv != null ? hv : (active && active.hour != null ? active.hour : 0)) / (window.__hud ? window.__hud.max : 72);
      const mood = active && (active.sc.calm || active.sc.type === 'endcard') ? 'happy' : active && active.sc.type === 'amygdala' ? 'angry' : 'ok';
      personRender(document.querySelector('#vchar svg'), t, f, mood);
      const hT = x => !!x && (BIGT.has(x.sc.type) || !!x.sc.tito), hasT = hT(active); // si el Tito ja surt al pla, no en posem un altre a sota
      const ai = sc.indexOf(active), vc = document.getElementById('vchar'); vc.style.opacity = hasT ? 0 : hT(sc[ai - 1]) ? eo(prog(t, active.t0, .4)) : 1;
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
  window.Motor = { build, render, S, personSVG, personRender, h: { E, eo, eio, prog, back, lerp, clamp, rnd, C, col, FD, SHD, header, enter, lab } };
})();
