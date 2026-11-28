// Cuerpo al Límite — escenes amb GSAP (MorphSVG, DrawSVG, MotionPath, CustomBounce/Wiggle).
// Es carrega després de lib.js i afegeix tipus d'escena a Motor.S. Tot és determinista: cada escena té una
// línia de temps GSAP pausada que es posiciona amb tl.time(lt) a cada fotograma.
// Sincronia amb la veu: render_video.py posa a sc._beats l'inici de cada frase de la línia (pauses reals de la veu).
// Efectes de so: cada escena exposa o.sfx = [[tipus, segon_local], ...]; el render els barreja (i en limita el volum).
(function () {
  gsap.registerPlugin(MorphSVGPlugin, DrawSVGPlugin, MotionPathPlugin, CustomEase, CustomWiggle, CustomBounce);
  CustomWiggle.create('fxShake', { wiggles: 7, type: 'easeOut' });
  CustomBounce.create('fxBnc', { strength: 0.55, squash: 2.2, squashID: 'fxBnc-squash' });
  const P = { orange: '#FF8A3D', pink: '#FF3B6B', red: '#FF3B6B', cyan: '#3EF0FF', lilac: '#B79CFF', violet: '#B79CFF', yellow: '#FFD60A', green: '#4DF0A0', soft: '#D3DAFF', white: '#FFFFFF', ink: '#0A1A8C' };
  const col = (c, d) => P[c] || (typeof c === 'string' && c[0] === '#' ? c : d);
  const FD = "font-family:'Brico',sans-serif;font-weight:800;font-stretch:76%;letter-spacing:-1px";
  let uid = 0;

  // n moments d'inici de frase a partir de les pauses reals (sc._beats); si no n'hi ha, repartits.
  function anchors(sc, n, d) {
    let b = (sc._beats || []).filter(x => x < d - .6).slice();
    if (!b.length || b[0] > .3) b.unshift(0);
    if (sc.at && sc.at.length >= n) return sc.at.slice(0, n);         // temps fixats a mà al guió
    while (b.length > n) { let k = 1, g = 1e9; for (let i = 1; i < b.length; i++) { const gg = (i + 1 < b.length ? b[i + 1] : d) - b[i - 1]; if (gg < g) { g = gg; k = i; } } b.splice(k, 1); }
    while (b.length < n) { let k = 0, g = 0; for (let i = 0; i < b.length; i++) { const gg = (i + 1 < b.length ? b[i + 1] : d) - b[i]; if (gg > g) { g = gg; k = i; } } b.splice(k + 1, 0, b[k] + g / 2); }
    return b;
  }
  // titular amb paraules marcades: "La *cafeína* se encaja" → la paraula entre * va de color
  function headHTML(txt, c) {
    return txt.split(/\s+/).map(w => { const m = /^\*(.+)\*$/.exec(w); return `<span class="w" style="display:inline-block;margin-right:.22em;color:${m ? c : '#fff'}">${m ? m[1] : w}</span>`; }).join('');
  }

  // ---------------------------------------------------------------------------------------------
  // ENCAJE: una molècula (cafeïna, fàrmac, alcohol…) arriba i encaixa en receptors d'una cèl·lula;
  // opcionalment els bloqueja, el Tito reacciona i una altra molècula es queda esperant fora.
  // { type:"encaje", ligand:"Cafeína", color:"orange", desde:"cafe"|"pastilla"|"gota"|"none",
  //   receptor:"Receptores", cell:"Tu neurona", block:true, waiting:"adenosina", waitColor:"lilac",
  //   heads:["La *cafeína* se encaja","Y *bloquea* el receptor","Tu cerebro *se engaña*","Pero la *adenosina* sigue ahí"],
  //   wake:true (el Tito es desperta a la 3a frase), at:[0,1.75,4.8,5.7,7.4] (opcional) }
  // Frases: 1 = encaixa · 2 = bloqueja · 3 = el Tito reacciona · 4 = arriba la que espera (· 5 = «esperando»).
  Motor.S.encaje = (sc) => {
    const u = 'fx' + (uid++);
    const LC = col(sc.color, P.orange), WC = col(sc.waitColor, P.lilac);
    const heads = sc.heads || [`La *${(sc.ligand || 'molécula').toLowerCase()}* se encaja`, 'Y *bloquea* el receptor'];
    const HC = [LC, P.pink, P.cyan, WC, P.yellow];
    const RX = [300, 590, 880], MY = 860, SX = 330, SY = 330;
    const DROP = 'M0,-42 C14,-22 34,0 34,18 C34,38 18,50 0,50 C-18,50 -34,38 -34,18 C-34,0 -14,-22 0,-42Z';
    const HEX = 'M0,-46 C13,-38 27,-31 40,-23 C40,-8 40,8 40,23 C27,31 13,38 0,46 C-13,38 -27,31 -40,23 C-40,8 -40,-8 -40,-23 C-27,-31 -13,-38 0,-46Z';
    const REC_OPEN = 'M-74,-118 C-74,-44 -58,0 0,0 C58,0 74,-44 74,-118', REC_CLAMP = 'M-52,-104 C-64,-40 -54,4 0,4 C54,4 64,-40 52,-104';
    const nAd = sc.waiting ? 11 : 0, src = sc.desde || 'cafe';
    let s = `<defs><filter id="${u}k" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="7" dy="7" stdDeviation="0" flood-color="${P.ink}" flood-opacity="1"/></filter>
      <radialGradient id="${u}a" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".35" stop-color="${WC}"/><stop offset="1" stop-color="${WC}"/></radialGradient>
      <linearGradient id="${u}n" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2433C4"/><stop offset="1" stop-color="#121A90" stop-opacity="0"/></linearGradient>
      <linearGradient id="${u}x" x1="0" y1="0" x2="1" y2="0"><stop offset=".75" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      <mask id="${u}m" maskUnits="userSpaceOnUse" x="100" y="700" width="1000" height="420"><rect x="100" y="700" width="1000" height="420" fill="url(#${u}x)"/></mask></defs>
      <g class="cam">
      <path class="cell" d="M100,${MY} C260,${MY - 18} 420,${MY + 16} 590,${MY} S900,${MY - 16} 1080,${MY} L1080,1100 L100,1100Z" fill="url(#${u}n)" opacity="0" mask="url(#${u}m)"/>
      <path class="mem" d="M100,${MY} C260,${MY - 18} 420,${MY + 16} 590,${MY} S900,${MY - 16} 1080,${MY}" fill="none" stroke="#9FB0FF" stroke-width="12" stroke-linecap="round" opacity="0"/>
      <text class="cl" x="190" y="950" fill="${P.soft}" font-size="38" font-weight="700" opacity="0">${sc.cell || 'Tu neurona'}</text>`;
    for (let i = 0; i < nAd; i++) s += `<g class="ad ad${i}" opacity="0"><g class="adi"><circle r="30" fill="url(#${u}a)" filter="url(#${u}k)"/></g></g>`;
    RX.forEach((x, i) => { s += `<g transform="translate(${x} ${MY})"><path class="rec rec${i}" d="${REC_OPEN}" fill="none" stroke="${P.cyan}" stroke-width="20" stroke-linecap="round" opacity="0"/></g>`; });
    s += `<g class="rl" opacity="0"><path d="M${RX[0] + 80},${MY - 150} Q${RX[0] + 160},${MY - 230} ${RX[0] + 250},${MY - 236}" fill="none" stroke="${P.soft}" stroke-width="5" stroke-linecap="round"/>
      <text x="${RX[0] + 262}" y="${MY - 224}" fill="${P.soft}" font-size="40" font-weight="800">${sc.receptor || 'Receptores'}</text></g>`;
    if (src === 'cafe') s += `<g class="src" transform="translate(240 380)"><g class="srcb" filter="url(#${u}k)">
        <path d="M-92,-40 L92,-40 L76,70 C72,96 52,108 26,108 L-26,108 C-52,108 -72,96 -76,70Z" fill="#fff"/>
        <path d="M88,-14 C150,-14 150,62 80,62" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round"/>
        <ellipse cx="0" cy="-40" rx="92" ry="20" fill="#7A3B1A"/><ellipse cx="0" cy="-42" rx="78" ry="13" fill="#A45424"/><rect x="-92" y="6" width="184" height="18" fill="${P.pink}"/></g>
        ${[[-36, -158], [8, -176], [50, -152]].map(([x, y], k) => `<path class="stm" d="M${x},-70 C${x - 20},-100 ${x + 20},-120 ${x},${y}" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".75"/>`).join('')}</g>`;
    if (src === 'pastilla') s += `<g class="src" transform="translate(240 380)"><g class="srcb" filter="url(#${u}k)" transform="rotate(-25)">
        <rect x="-110" y="-46" width="220" height="92" rx="46" fill="#fff"/><path d="M0,-46 L64,-46 A46,46 0 0 1 64,46 L0,46Z" fill="${LC}"/></g></g>`;
    if (src === 'gota') s += `<g class="src" transform="translate(240 380)"><g class="srcb" filter="url(#${u}k)"><path d="${DROP}" transform="scale(2.2)" fill="${LC}"/></g></g>`;
    RX.forEach((x, i) => {
      s += `<g class="cf cf${i}" opacity="0"><g class="cfi"><path class="cfs" d="${DROP}" fill="${LC}" stroke="#fff" stroke-opacity=".55" stroke-width="6" filter="url(#${u}k)"/></g></g>`;
      if (sc.block !== false) s += `<g class="lk lk${i}" transform="translate(${x + 62} ${MY - 128})" opacity="0"><circle r="34" fill="${P.pink}" filter="url(#${u}k)"/>
          <rect x="-15" y="-4" width="30" height="22" rx="5" fill="#fff"/><path d="M-9,-4 L-9,-12 C-9,-24 9,-24 9,-12 L9,-4" fill="none" stroke="#fff" stroke-width="6"/></g>`;
    });
    s += `<g class="dots" opacity="0">${[0, 1, 2].map(k => `<circle class="dt" cx="${520 + k * 44}" cy="520" r="13" fill="#fff"/>`).join('')}</g></g>`;
    const el = document.createElement('div'); el.style.cssText = 'position:absolute;inset:0';
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0;overflow:visible">${s}</svg>
      <div class="hd" style="position:absolute;left:1130px;top:270px;width:690px;height:260px"></div>
      ${sc.tito === false ? '' : `<div class="tt" style="position:absolute;left:1350px;top:575px;width:330px;height:495px">${Motor.personSVG(330)}</div>`}`;
    const hd = el.querySelector('.hd');
    heads.forEach((h, i) => { const d = document.createElement('div'); d.className = 'h' + i; d.style.cssText = `position:absolute;inset:0;color:#fff;font-size:96px;line-height:1.02;${FD};text-shadow:8px 8px 0 ${P.ink}`; d.innerHTML = headHTML(h, HC[i % HC.length]); hd.appendChild(d); });

    const o = { el, sfx: [] };
    let tl = null, A = null;
    function plan(d) {                       // temps de cada fase (font única per a imatge i so)
      // anclatges: [intro, frase 1, frase 2, …, «esperando»]
      A = anchors(sc, 1 + heads.length + (nAd ? 1 : 0), d); const q = A.slice(1);
      const T = { encaja: q[0], bloquea: q[1] != null ? q[1] : q[0] + 2.2, wake: q[2] != null ? q[2] : d - 2, espera: q[3] != null ? q[3] : d - 2.2 };
      T.dots = nAd ? (q[heads.length] != null ? q[heads.length] : Math.min(d - .8, T.espera + 1.6)) : d;
      T.heads = heads.map((_, i) => q[i]);
      o.sfx = [];
      RX.forEach((x, i) => { const t0 = T.encaja + .1 + i * .45; o.sfx.push(['whoosh', t0 + .05], ['click', t0 + .85]); });
      if (sc.block !== false) RX.forEach((x, i) => o.sfx.push(['stamp', T.bloquea + i * .12 + .2]));
      for (let i = 0; i < nAd; i += 2) o.sfx.push(['pop', T.espera + .05 + i * .1 + .36]);
      if (nAd) o.sfx.push(['tick', T.dots], ['tick', T.dots + .3], ['tick', T.dots + .6]);
      return T;
    }
    function build(T) {
      const q = c => el.querySelector(c), qa = c => el.querySelectorAll(c);
      tl = gsap.timeline({ paused: true });
      if (q('.src')) tl.from(q('.src'), { scale: 0, transformOrigin: '50% 80%', duration: .55, ease: 'back.out(2.2)' }, .1);
      qa('.stm').forEach((p, k) => tl.fromTo(p, { drawSVG: '0% 0%' }, { drawSVG: '55% 100%', duration: 1.1, repeat: 9, ease: 'none', delay: k * .25 }, .2));
      tl.set(q('.mem'), { opacity: 1 }, .25).fromTo(q('.mem'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: .9, ease: 'power2.inOut' }, .25);
      tl.to(q('.cell'), { opacity: .7, duration: .8 }, .6).to(q('.cl'), { opacity: 1, duration: .5 }, .9);
      tl.set(qa('.rec'), { opacity: 1 }, .55).fromTo(qa('.rec'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: .6, stagger: .15, ease: 'power3.out' }, .55);
      tl.to(q('.rl'), { opacity: 1, duration: .3 }, .9).fromTo(q('.rl path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: .5 }, .9).to(q('.rl'), { opacity: 0, duration: .3 }, Math.max(1.6, T.encaja));
      for (let i = 0; i < Math.min(4, nAd); i++) {
        const a = q('.ad' + i), x0 = 200 + i * 230, y0 = 430 + (i % 2) * 70;
        tl.set(a, { x: x0, y: y0 }, 0).to(a, { opacity: .45, duration: .6 }, .3 + i * .15)
          .to(a, { motionPath: { path: [{ x: x0 + 60, y: y0 - 40 }, { x: x0 + 10, y: y0 + 30 }, { x: x0 - 30, y: y0 - 10 }], curviness: 1.5 }, duration: T.espera, ease: 'sine.inOut' }, 0);
      }
      if (q('.srcb')) tl.to(q('.srcb'), { rotation: '-=14', transformOrigin: '50% 100%', duration: .35, ease: 'power2.out', yoyo: true, repeat: 1 }, T.encaja - .1);
      tl.to(q('.cam'), { scale: 1.07, transformOrigin: '590px 760px', duration: 2.6, ease: 'sine.inOut' }, T.encaja);
      const fx = src === 'none' ? null : SX, fy = SY;
      RX.forEach((x, i) => {
        const t0 = T.encaja + .1 + i * .45, c = q('.cf' + i), ci = c.querySelector('.cfi'), sx = fx == null ? x + 200 : fx, sy = fx == null ? 180 : fy;
        tl.set(c, { x: sx, y: sy, opacity: 1 }, t0).set(ci, { scale: .4, svgOrigin: '0 0' }, t0)
          .to(c, { motionPath: { path: [{ x: sx, y: sy }, { x: (sx + x) / 2 + 60, y: 230 }, { x, y: MY - 56 }], curviness: 1.25 }, duration: .85, ease: 'power2.in' }, t0)
          .to(ci, { scale: 1, rotation: 240, svgOrigin: '0 0', duration: .85, ease: 'power2.in' }, t0)
          .to(c.querySelector('.cfs'), { morphSVG: HEX, duration: .7, ease: 'power1.inOut' }, t0 + .1)
          .to(ci, { scaleY: .72, scaleX: 1.22, svgOrigin: '0 0', duration: .09, yoyo: true, repeat: 1, ease: 'power2.out' }, t0 + .85)
          .to(q('.rec' + i), { morphSVG: REC_CLAMP, duration: .3, ease: 'back.out(3)' }, t0 + .85)
          .to(q('.rec' + i), { stroke: LC, duration: .2 }, t0 + .85);
      });
      if (sc.block !== false) {
        RX.forEach((x, i) => { const t0 = T.bloquea + i * .12;
          tl.fromTo(q('.lk' + i), { opacity: 0, scale: 2.4, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .28, ease: 'back.out(2.5)' }, t0).to(q('.rec' + i), { stroke: P.pink, duration: .15 }, t0); });
        tl.to(q('.cam'), { x: 14, duration: .45, ease: 'fxShake' }, T.bloquea + .2);
      }
      if (nAd) {
        tl.to(q('.cam'), { scale: 1, duration: 1.2, ease: 'power2.inOut' }, T.espera - .3);
        for (let i = 0; i < nAd; i++) {
          const a = q('.ad' + i), rx = RX[i % 3] + ((i * 37) % 70 - 35), t0 = T.espera + .05 + i * .1, yr = 560 + (i % 4) * 42;
          if (i >= 4) tl.set(a, { x: rx + (i % 2 ? 160 : -160), y: 250, opacity: 0 }, 0).to(a, { opacity: 1, duration: .2 }, t0);
          else tl.to(a, { opacity: 1, duration: .3 }, t0);
          tl.to(a, { x: rx, duration: .9, ease: 'power1.out' }, t0).to(a, { y: yr, duration: .9, ease: 'fxBnc' }, t0)
            .to(a.querySelector('.adi'), { scaleX: 1.25, scaleY: .75, duration: .9, ease: 'fxBnc-squash', svgOrigin: '0 30' }, t0);
        }
        tl.to(q('.dots'), { opacity: 1, duration: .2 }, T.dots);
        qa('.dt').forEach((d, k) => tl.fromTo(d, { y: 0 }, { y: -26, duration: .25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, T.dots + k * .12));
        for (let i = 0; i < nAd; i++) tl.to(q('.ad' + i + ' .adi'), { rotation: 10, svgOrigin: '0 0', duration: .5, ease: 'fxShake' }, T.dots + .1 + (i % 4) * .08);
      }
      heads.forEach((h, i) => {
        const ws = hd.querySelectorAll('.h' + i + ' .w');
        tl.set(ws, { opacity: 0 }, 0).fromTo(ws, { opacity: 0, y: 70, rotation: 6 }, { opacity: 1, y: 0, rotation: 0, duration: .45, stagger: .07, ease: 'back.out(2.4)' }, T.heads[i]);
        if (i + 1 < heads.length) tl.to(ws, { opacity: 0, y: -40, duration: .2, stagger: .03, ease: 'power2.in' }, T.heads[i + 1] - .25);
      });
    }
    let T = null;
    o.plan = d => { T = plan(d); };
    o.render = (lt, d) => {
      if (!T) T = plan(d);
      if (!tl) build(T);
      tl.time(lt, false);
      const tt = el.querySelector('.tt svg'); if (!tt) return;
      const ap = gsap.parseEase('back.out(1.6)')(Math.min(1, Math.max(0, (lt - .3) / .6)));
      el.querySelector('.tt').style.transform = `translateY(${(1 - ap) * 260}px)`;
      let f = sc.fatigue != null ? sc.fatigue : .72, mood = sc.mood || 'tired';
      if (sc.wake !== false && lt >= T.wake) { f = f - (f - .2) * Math.min(1, (lt - T.wake) / .6); mood = 'happy'; }
      if (sc.wake !== false && nAd && lt >= T.espera) { mood = 'ok'; f = .2 + .25 * Math.min(1, (lt - T.espera) / 2.4); }
      Motor.personRender(tt, lt, f, mood, { seed: 2.3 });
    };
    return o;
  };
})();

// =====================================================================================================
// Escenes noves (28/11/2026). 002: presion, pulmon, cuenta, ebullicion, termo, linea. 003: apagon, bebida, freno, curva, memoria, cola.
// Totes amb GSAP (línia de temps pausada + tl.time(lt)), titulars sincronitzats amb les frases (sc._beats) i sons a o.sfx.
// Titulars: sc.heads = ["text amb *paraula* clau", …]; per defecte el titular i surt a la frase i (sc.hb = [índexs de frase] per canviar-ho).
(function () {
  const P = { orange: '#FF8A3D', pink: '#FF3B6B', red: '#FF3B6B', cyan: '#3EF0FF', lilac: '#B79CFF', yellow: '#FFD60A', soft: '#D3DAFF', white: '#FFFFFF', ink: '#0A1A8C', blue: '#7FB2FF', deep: '#0C1170', mid: '#2433C4' };
  const col = (c, d) => P[c] || (typeof c === 'string' && c[0] === '#' ? c : d);
  const FD = "font-family:'Brico',sans-serif;font-weight:800;font-stretch:76%;letter-spacing:-1px";
  const SH = `text-shadow:8px 8px 0 ${P.ink}`;
  let uid = 0; const px = n => (+n).toFixed(1);
  const Ehtml = (css, html) => { const e = document.createElement('div'); e.style.cssText = css; e.innerHTML = html; return e; };
  function beatsOf(sc, d) { let b = (sc._beats || []).filter(x => x < d - .6).slice(); if (!b.length || b[0] > .3) b.unshift(0); return b; }
  // moment de cada titular: frase i (o sc.hb[i]); si falten frases, es reparteixen
  function headTimes(sc, n, d) {
    const b = beatsOf(sc, d); if (sc.at && sc.at.length >= n) return sc.at.slice(0, n);
    return [...Array(n)].map((_, i) => { const k = sc.hb ? sc.hb[i] : i; if (k < b.length) return b[k]; const last = b[b.length - 1] || 0; return last + (d - last) * ((k - b.length + 1) / (n - b.length + 1)); });
  }
  function hHTML(txt, c) {
    const t = txt.replace(/\*([^*]+)\*/g, (m, g) => '\u0001' + g.replace(/ /g, '\u0002') + '\u0001');
    return t.split(/\s+/).filter(Boolean).map(w => { const k = w.includes('\u0001'); const html = w.replace(/\u0001([^\u0001]*)\u0001/g, (m, g) => `<span style="color:${c}">${g.replace(/\u0002/g, ' ')}</span>`);
      return `<span class="w" style="display:inline-block;margin-right:.22em;color:#fff">${html}</span>`; }).join(''); }
  // bloc de titulars: x, y, ample, mida de lletra, colors de les paraules clau
  function heads(el, list, x, y, w, fs, cols, align) {
    const hd = Ehtml(`position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${fs * 2.4}px;${align ? 'text-align:' + align : ''}`, '');
    (list || []).forEach((h, i) => { const d = Ehtml(`position:absolute;left:0;right:0;top:0;color:#fff;font-size:${fs}px;line-height:1.04;${FD};${SH}`, hHTML(h, cols[i % cols.length])); d.className = 'h' + i; hd.appendChild(d); });
    el.appendChild(hd); return hd;
  }
  function headsTL(tl, hd, n, T) {
    for (let i = 0; i < n; i++) { const ws = hd.querySelectorAll('.h' + i + ' .w');
      tl.set(ws, { opacity: 0 }, 0).fromTo(ws, { opacity: 0, y: 60, rotation: 5 }, { opacity: 1, y: 0, rotation: 0, duration: .42, stagger: .06, ease: 'back.out(2.2)' }, T[i]);
      if (i + 1 < n) tl.to(ws, { opacity: 0, y: -36, duration: .2, stagger: .025, ease: 'power2.in' }, T[i + 1] - .22); }
  }
  // fàbrica: opts.svg(u) → contingut SVG; opts.dom(el, u) → extres HTML; opts.plan(d) → temps; opts.build(tl, q, qa, T, d); opts.tick(lt, d, T); opts.sfx(T, d) → [[tipus, t]]
  function mk(sc, opts) {
    const u = 'n' + (uid++), el = document.createElement('div'); el.style.cssText = 'position:absolute;inset:0';
    el.innerHTML = `<svg width="1920" height="1080" style="position:absolute;inset:0;overflow:visible"><defs><filter id="${u}k" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="7" dy="7" stdDeviation="0" flood-color="${P.ink}" flood-opacity="1"/></filter></defs>${opts.svg(u)}</svg>`;
    const hd = opts.dom ? opts.dom(el, u) : null;
    const q = c => el.querySelector(c), qa = c => el.querySelectorAll(c);
    const o = { el, sfx: [] }; let tl = null, T = null;
    o.plan = d => { T = opts.plan ? opts.plan(d) : {}; o.sfx = opts.sfx ? opts.sfx(T, d) : []; };
    o.render = (lt, d) => { if (!T) o.plan(d); if (!tl) { tl = gsap.timeline({ paused: true }); opts.build(tl, q, qa, T, d, hd); } tl.time(lt, false); if (opts.tick) opts.tick(lt, d, T, q, qa); };
    return o;
  }
  const S = Motor.S;
  const organ = (n, x, y, w, h) => window.OrganArt && OrganArt.has(n) ? OrganArt.svg(n, w, h, `x="${x}" y="${y}"`) : `<image href="organs/${n}.svg" x="${x}" y="${y}" width="${w}" height="${h}"/>`;

  // ---------------------------------------------------------------------------------------------
  // PRESION: modo "barras" (tubs d'aire amb %), "hervor" (termòmetre: el punt d'ebullició baixa de 100 a 37 °C), "armstrong" (escala d'altitud)
  // barras: { title, unit:"%", items:[{label, value, color}], show: n (quantes es veuen al final), from: n (quantes ja hi són a l'inici) }
  S.presion = (sc) => {
    const modo = sc.modo || 'barras';
    if (modo === 'barras') {
      const its = sc.items || [], n = its.length, show = Math.min(n, sc.show || n), from = Math.min(show, sc.from || 0), unit = sc.unit || '%';
      const CW = 230, CH = 470, gap = n > 2 ? 150 : 260, X0 = 960 - (n * CW + (n - 1) * gap) / 2, Y0 = 350;
      return mk(sc, {
        svg: u => `<defs><linearGradient id="${u}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FB0FF"/><stop offset="1" stop-color="#4A68FF"/></linearGradient>${its.map((_, i) => `<clipPath id="${u}c${i}"><rect x="${X0 + i * (CW + gap)}" y="${Y0}" width="${CW}" height="${CH}" rx="40"/></clipPath>`).join('')}</defs>` +
          its.map((it, i) => { const x = X0 + i * (CW + gap), c = it.color ? col(it.color) : null;
            return `<g class="col c${i}" opacity="${i >= show ? .22 : 0}"><rect x="${x}" y="${Y0}" width="${CW}" height="${CH}" rx="40" fill="${P.deep}" opacity=".7"/>
              <g clip-path="url(#${u}c${i})"><rect class="fill" x="${x}" y="${Y0 + CH}" width="${CW}" height="0" fill="${c || `url(#${u}f)`}" opacity="${c ? .85 : 1}"/>${[...Array(16)].map((_, k) => `<circle class="dot" cx="${x + 20 + (k * 53) % (CW - 40)}" cy="${Y0 + 30 + (k * 97) % (CH - 60)}" r="9" fill="#fff" opacity="0"/>`).join('')}</g>
              <rect x="${x}" y="${Y0}" width="${CW}" height="${CH}" rx="40" fill="none" stroke="${P.soft}" stroke-width="6" opacity=".6"/>
              <text class="lb" x="${x + CW / 2}" y="${Y0 + CH + 70}" text-anchor="middle" fill="#fff" font-size="44" font-weight="800">${it.label}</text>
              <text class="vl" x="${x + CW / 2}" y="${Y0 + CH - 20}" text-anchor="middle" style="${FD}" font-size="110" fill="${P.yellow}" filter="url(#${u}k)">${i >= show ? '?' : ''}</text></g>`; }).join('') +
          `<text x="${X0}" y="300" fill="#fff" style="${FD}" font-size="64">${sc.title || ''}</text>`,
        plan: d => { const k = Math.max(1, show - from), t0 = .5, span = Math.max(1.2, Math.min(3.2, (d - 1.5) / k)); return { at: its.map((_, i) => i < from ? -1 : t0 + (i - from) * span), span }; },
        build: (tl, q, qa, T) => { its.forEach((it, i) => { if (i >= show) return; const g = q('.c' + i), fill = g.querySelector('.fill'), vl = g.querySelector('.vl'), t = T.at[i], h = CH * it.value / 100;
          const prev = i > 0 ? its[i - 1].value : 100, ystart = i < from ? h : CH * prev / 100;
          if (t < 0) { tl.set(g, { opacity: 1 }, 0).set(fill, { attr: { y: Y0 + CH - h, height: h } }, 0); }
          else { tl.fromTo(g, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .45, ease: 'back.out(1.8)' }, t).set(fill, { attr: { y: Y0 + CH - ystart, height: ystart } }, t)
            .to(fill, { attr: { y: Y0 + CH - h, height: h }, duration: 1.3, ease: 'power2.inOut' }, t + .45); }
          const cnt = { v: t < 0 ? it.value : (i > 0 ? prev : it.value) };
          tl.to(cnt, { v: it.value, duration: t < 0 ? 0 : 1.3, ease: 'power2.inOut', onUpdate: () => { vl.textContent = Math.round(cnt.v) + (unit === '%' ? ' %' : ' ' + unit); } }, Math.max(0, t + .45));
          const inside = Y0 + CH - Math.max(h, 0) - 24 < Y0 + 110; // el número queda dins de la barra
          tl.set(vl, { attr: { fill: inside && it.color ? P.ink : (i === show - 1 ? P.yellow : '#fff') } }, 0);
          tl.set(vl, { attr: { y: Y0 + CH - Math.max(h, 0) - 24 < Y0 + 110 ? Y0 + 120 : Y0 + CH - h - 24 } }, Math.max(0, t + 1.75));
          const dots = g.querySelectorAll('.dot'), nd = Math.round(16 * it.value / 100);
          dots.forEach((dt, k) => tl.to(dt, { opacity: k < nd ? .55 : 0, duration: .5 }, Math.max(0, t + 1))); }); },
        tick: (lt, d, T, q, qa) => { qa('.dot').forEach((dt, k) => { dt.setAttribute('transform', `translate(${px(Math.sin(lt * 2.2 + k) * 10)} ${px(Math.cos(lt * 1.8 + k * 1.3) * 12)})`); }); },
        sfx: T => T.at.filter(t => t >= 0).flatMap(t => [['pop', t + .1], ['blip', t + 1.5]])
      });
    }
    if (modo === 'hervor') {
      const TX = 440, TY0 = 900, TY1 = 300, yT = c => TY0 - (TY0 - TY1) * c / 110;
      return mk(sc, {
        svg: u => `<rect x="${TX - 34}" y="${TY1 - 40}" width="68" height="${TY0 - TY1 + 40}" rx="34" fill="${P.deep}" stroke="${P.soft}" stroke-width="6"/><circle cx="${TX}" cy="${TY0 + 40}" r="62" fill="${P.pink}" stroke="${P.soft}" stroke-width="6"/>
          <rect class="merc" x="${TX - 16}" y="${yT(37)}" width="32" height="${TY0 - yT(37) + 40}" rx="16" fill="${P.pink}"/>
          ${[0, 20, 40, 60, 80, 100].map(c => `<path d="M${TX + 40},${yT(c)} h22" stroke="${P.soft}" stroke-width="5"/><text x="${TX - 56}" y="${yT(c) + 14}" text-anchor="end" fill="${P.soft}" font-size="38" font-weight="700">${c}°</text>`).join('')}
          <g class="body"><path d="M${TX + 70},${yT(37)} H760" stroke="#fff" stroke-width="8"/><rect x="760" y="${yT(37) + 14}" width="340" height="80" rx="18" fill="#fff"/><text x="930" y="${yT(37) + 70}" text-anchor="middle" fill="${P.ink}" font-size="44" font-weight="800">Tu cuerpo: 37 °C</text></g>
          <g class="boil"><path d="M${TX + 70},0 H700" stroke="${P.pink}" stroke-width="8" stroke-dasharray="18 12"/><rect x="700" y="-100" width="430" height="84" rx="20" fill="#fff"/><text x="915" y="-44" text-anchor="middle" fill="${P.ink}" font-size="44" font-weight="800">El agua hierve aquí</text>
            ${[0, 1, 2, 3, 4].map(k => `<circle class="bb" cx="${TX + 100 + k * 34}" cy="-30" r="12" fill="none" stroke="#fff" stroke-width="5" opacity="0"/>`).join('')}</g>
          <text class="alt" x="1500" y="560" text-anchor="middle" style="${FD}" font-size="200" fill="${P.yellow}" filter="url(#${u}k)">0 km</text><text x="1500" y="640" text-anchor="middle" fill="${P.soft}" font-size="46" font-weight="800">de altura</text>
          <g class="mtn"><path d="M1320,900 L1430,760 L1480,800 L1560,700 L1680,900Z" fill="${P.mid}"/><path d="M1560,700 L1600,755 L1575,750 L1555,770 L1530,740Z" fill="#fff"/></g>
          <g class="flash" opacity="0">${[...Array(10)].map((_, k) => `<circle cx="${TX + 120 + (k * 53) % 420}" cy="${yT(37) - 30 - (k * 37) % 70}" r="${8 + (k % 3) * 5}" fill="none" stroke="#fff" stroke-width="5"/>`).join('')}</g>`,
        plan: d => ({ h: headTimes(sc, 2, d), d }),
        build: (tl, q, qa, T, d) => { const boil = q('.boil'), alt = q('.alt'), t0 = Math.max(1.2, T.h[1] - .3), t1 = Math.min(d - 1.2, t0 + 3.2);
          tl.set(boil, { y: yT(100) }, 0).from(boil, { opacity: 0, x: -40, duration: .5 }, .2).from(q('.body'), { opacity: 0, x: -40, duration: .5 }, .5);
          tl.to(boil, { y: yT(37), duration: t1 - t0, ease: 'power1.inOut' }, t0);
          const a = { v: 0 }; tl.to(a, { v: 19, duration: t1 - t0, ease: 'power1.inOut', onUpdate: () => { alt.textContent = Math.round(a.v) + ' km'; } }, t0);
          qa('.bb').forEach((b, k) => tl.fromTo(b, { opacity: 0, attr: { cy: -20 } }, { opacity: .9, attr: { cy: -70 }, duration: .7, repeat: 6, ease: 'none', delay: k * .14 }, .6));
          tl.to(q('.flash'), { opacity: 1, duration: .2 }, t1).to(q('.flash'), { opacity: 0, duration: .6 }, t1 + 1.2).fromTo(q('.flash'), { scale: .6, transformOrigin: '600px 560px' }, { scale: 1.1, duration: 1.2 }, t1);
          tl.from(q('.mtn'), { opacity: 0, y: 40, duration: .6 }, .3); },
        sfx: (T, d) => [['tick', Math.max(1.2, T.h[1] - .3)], ['pop', Math.min(d - 1.2, Math.max(1.2, T.h[1] - .3) + 3.2)]]
      });
    }
    // armstrong: escala d'altitud (0–40 km), l'Everest, un avió i la línia de 19 km; un globus puja i en creuar-la surten bombolles
    const AX = 560, A0 = 930, A1 = 270, yA = k => A0 - (A0 - A1) * k / 40;
    return mk(sc, {
      svg: u => `<rect x="${AX + 10}" y="${yA(19)}" width="1150" height="${yA(0) - yA(19)}" fill="${P.blue}" opacity=".06"/><rect x="${AX + 10}" y="${yA(40)}" width="1150" height="${yA(19) - yA(40)}" fill="${P.pink}" opacity=".1"/>
        <path d="M${AX},${A0} V${A1}" stroke="${P.soft}" stroke-width="6"/>${[0, 10, 20, 30, 40].map(k => `<path d="M${AX - 16},${yA(k)} h32" stroke="${P.soft}" stroke-width="5"/><text x="${AX - 34}" y="${yA(k) + 14}" text-anchor="end" fill="${P.soft}" font-size="38" font-weight="700">${k} km</text>`).join('')}
        <g class="mtn"><path d="M${AX + 40},${A0} L${AX + 180},${yA(8.8)} L${AX + 240},${yA(6)} L${AX + 330},${A0}Z" fill="${P.mid}"/><path d="M${AX + 180},${yA(8.8)} L${AX + 210},${yA(7.4)} L${AX + 160},${yA(7.6)}Z" fill="#fff"/><text x="${AX + 190}" y="${A0 - 20}" text-anchor="middle" fill="#fff" font-size="36" font-weight="800">Everest</text></g>
        <g class="plane" transform="translate(${AX + 520} ${yA(11)})"><path d="M-70,0 L60,-6 C80,-6 86,6 60,6 L-70,6Z M-10,-2 L-40,-40 L-20,-40 L20,-2Z M-10,4 L-40,40 L-20,40 L20,4Z M-60,0 L-74,-22 L-62,-22 L-46,0Z" fill="#EEF1FF"/></g>
        <g class="line"><path d="M${AX + 10},${yA(19)} H1720" stroke="${P.pink}" stroke-width="8" stroke-dasharray="22 14"/><rect x="1180" y="${yA(19) - 104}" width="540" height="84" rx="18" fill="#fff"/><text x="1450" y="${yA(19) - 48}" text-anchor="middle" fill="${P.ink}" font-size="44" font-weight="800">Línea de Armstrong</text>
          <text x="1450" y="${yA(19) + 60}" text-anchor="middle" style="${FD}" font-size="64" fill="${P.yellow}">19 km</text></g>
        <g class="bal"><path d="M0,-70 C40,-70 56,-40 50,-10 C44,18 18,34 0,44 C-18,34 -44,18 -50,-10 C-56,-40 -40,-70 0,-70Z" fill="${P.yellow}"/><path d="M0,44 L0,70" stroke="#fff" stroke-width="4"/><circle cx="0" cy="84" r="16" fill="#EBAA80"/>
          ${[0, 1, 2, 3, 4, 5].map(k => `<circle class="bb" cx="${(k - 2.5) * 22}" cy="80" r="8" fill="none" stroke="#fff" stroke-width="4" opacity="0"/>`).join('')}</g>
        <text class="warn" x="1030" y="${yA(31)}" text-anchor="middle" fill="#fff" font-size="46" font-weight="800" opacity="0">Sin traje, tu cuerpo empieza a hervir</text>`,
      plan: d => ({ d }),
      build: (tl, q, qa, T, d) => { tl.from(q('.mtn'), { opacity: 0, y: 30, duration: .5 }, .1).from(q('.plane'), { opacity: 0, x: -80, duration: .8 }, .4).from(q('.line'), { opacity: 0, duration: .5 }, .9).fromTo(q('.line path'), { drawSVG: '0%' }, { drawSVG: '100%', duration: .9 }, .9);
        const bal = q('.bal'), tc = Math.min(d * .55, 4.6); tl.set(bal, { x: 1000, y: yA(2) }, 0).to(bal, { y: yA(30), duration: d - 1, ease: 'sine.inOut' }, .5);
        qa('.bb').forEach((b, k) => tl.fromTo(b, { opacity: 0, attr: { cy: 84 } }, { opacity: .9, attr: { cy: 30 }, duration: .6, repeat: 8, ease: 'none', delay: k * .1 }, tc));
        tl.to(q('.warn'), { opacity: 1, duration: .4 }, tc + .3); },
      tick: (lt, d, T, q) => { q('.plane').setAttribute('transform', `translate(${px(AX + 420 + lt * 40)} ${px(yA(11) + Math.sin(lt * 2) * 4)})`); },
      sfx: (T, d) => [['tick', 1.0], ['pop', Math.min(d * .55, 4.6)]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // PULMON (modo "aguanta"): els pulmons en un disc; la boca tancada (cadenat); fora no hi ha pressió i el que hi ha dins s'expandeix
  S.pulmon = (sc) => {
    const hs = sc.heads || [], CX = 560, CY = 610, R = 320;
    return mk(sc, {
      svg: u => `<g class="dots">${[...Array(28)].map((_, k) => { const a = k / 28 * Math.PI * 2, r = R + 60 + (k % 3) * 34; return `<circle cx="${px(CX + Math.cos(a) * r)}" cy="${px(CY + Math.sin(a) * r)}" r="10" fill="${P.soft}" data-a="${a}" data-r="${r}"/>`; }).join('')}</g>
        <circle cx="${CX}" cy="${CY}" r="${R}" fill="#3B5BFF" opacity=".5"/><circle class="ring" cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${P.soft}" stroke-width="8"/>
        <g class="lungs">${organ('pulmones', CX - 250, CY - 240, 500, 480)}</g>
        <g class="lock" transform="translate(${CX} ${CY - R - 30})"><circle r="52" fill="${P.pink}" filter="url(#${u}k)"/><rect x="-22" y="-6" width="44" height="34" rx="7" fill="#fff"/><path d="M-13,-6 L-13,-18 C-13,-36 13,-36 13,-18 L13,-6" fill="none" stroke="#fff" stroke-width="8"/></g>
        <g class="arr">${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k / 8 * Math.PI * 2 + .3; return `<path d="M${px(CX + Math.cos(a) * (R - 40))},${px(CY + Math.sin(a) * (R - 40))} L${px(CX + Math.cos(a) * (R + 50))},${px(CY + Math.sin(a) * (R + 50))}" stroke="${P.pink}" stroke-width="14" stroke-linecap="round" marker-end="url(#${u}ah)" opacity="0"/>`; }).join('')}</g>
        <defs><marker id="${u}ah" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto"><path d="M0,0 L10,5 L0,10Z" fill="${P.pink}"/></marker></defs>
        <g class="warn" opacity="0" transform="translate(${CX + 250} ${CY + 230})"><path d="M0,-70 L66,50 L-66,50Z" fill="${P.yellow}" stroke="${P.ink}" stroke-width="6"/><text x="0" y="36" text-anchor="middle" style="${FD}" font-size="90" fill="${P.ink}">!</text></g>`,
      dom: el => heads(el, hs, 1120, 330, 600, 92, [P.cyan, P.pink, P.pink]),
      plan: d => ({ h: headTimes(sc, hs.length, d) }),
      build: (tl, q, qa, T, d, hd) => { const t1 = T.h[1] != null ? T.h[1] : 2, t2 = T.h[2] != null ? T.h[2] : d - 2;
        tl.from(q('.lungs'), { opacity: 0, scale: .8, transformOrigin: `${CX}px ${CY}px`, duration: .6, ease: 'back.out(1.6)' }, .1).from(q('.lock'), { scale: 0, transformOrigin: '50% 50%', duration: .4, ease: 'back.out(3)' }, .7);
        qa('.dots circle').forEach((c, k) => { const a = +c.dataset.a, r = +c.dataset.r; tl.to(c, { attr: { cx: CX + Math.cos(a) * (r + 340), cy: CY + Math.sin(a) * (r + 340) }, opacity: 0, duration: 1.2, ease: 'power2.in' }, t1 - .4 + (k % 7) * .05); });
        tl.to(q('.lungs'), { scale: 1.2, transformOrigin: `${CX}px ${CY}px`, duration: Math.max(1, t2 - t1), ease: 'power1.in' }, t1).to(q('.ring'), { attr: { r: R * 1.16 }, stroke: P.pink, duration: Math.max(1, t2 - t1), ease: 'power1.in' }, t1);
        qa('.arr path').forEach((a, k) => tl.fromTo(a, { opacity: 0, drawSVG: '0%' }, { opacity: 1, drawSVG: '100%', duration: .5 }, t1 + .3 + k * .06));
        tl.to(q('.warn'), { opacity: 1, duration: .2 }, t2).fromTo(q('.warn'), { scale: 2 }, { scale: 1, duration: .35, ease: 'back.out(3)' }, t2).to(q('.lungs'), { x: 10, duration: .5, ease: 'fxShake' }, t2);
        headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q) => { q('.ring').setAttribute('stroke-width', (8 + 4 * Math.max(0, Math.sin(lt * 6)) * (lt > (T.h[2] || 99) ? 1 : 0)).toFixed(1)); },
      sfx: T => [['pop', .7], ['whoosh', (T.h[1] || 2) - .2], ['stamp', T.h[2] || 5]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // CUENTA: compte enrere en un anell (from → to) + el camí de la sang sense oxigen: pulmons → cor → cervell
  // { from, to, label, pill, heads }  (el compte comença al 2n titular i va a 1 per segon)
  S.cuenta = (sc) => {
    const hs = sc.heads || [], from = sc.from != null ? sc.from : 15, to = sc.to != null ? sc.to : 0, RX = 1200, RY = 600, RR = 210;
    const PATH = 'M470,700 C470,640 520,620 560,640 C600,660 590,600 560,560 C520,500 520,420 560,380 C600,340 600,300 560,280';
    return mk(sc, {
      svg: u => `<g class="fig"><path d="M330,980 C336,780 400,700 500,690 C600,700 664,780 670,980Z" fill="${P.mid}" stroke="${P.soft}" stroke-width="6"/><rect x="470" y="560" width="60" height="140" fill="${P.mid}" stroke="${P.soft}" stroke-width="6"/>
          <ellipse cx="500" cy="380" rx="150" ry="170" fill="${P.mid}" stroke="${P.soft}" stroke-width="6"/>
          <g class="brain">${organ('cerebro', 395, 270, 210, 180)}</g>
          <g opacity=".95">${organ('pulmones', 395, 740, 210, 200)}</g><g class="heart">${organ('corazon', 500, 800, 90, 90)}</g>
          <path class="road" d="${PATH}" fill="none" stroke="#9FB0FF" stroke-width="12" stroke-dasharray="2 18" stroke-linecap="round" transform="translate(-60 160)"/>
          <circle class="drop" r="20" fill="${P.lilac}" stroke="#fff" stroke-width="5"/></g>
        <circle cx="${RX}" cy="${RY}" r="${RR}" fill="${P.deep}" opacity=".75"/><circle cx="${RX}" cy="${RY}" r="${RR}" fill="none" stroke="#2B3BC8" stroke-width="30"/>
        <circle class="arc" cx="${RX}" cy="${RY}" r="${RR}" fill="none" stroke="${P.yellow}" stroke-width="30" stroke-linecap="round" transform="rotate(-90 ${RX} ${RY})" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="0"/>
        <text class="num" x="${RX}" y="${RY + 80}" text-anchor="middle" style="${FD}" font-size="240" fill="${P.yellow}" filter="url(#${u}k)">${from}</text>
        <text x="${RX}" y="${RY + RR + 80}" text-anchor="middle" fill="${P.soft}" font-size="46" font-weight="800">${sc.label || ''}</text>
        ${sc.pill ? `<rect x="${RX - 210}" y="${RY + RR + 110}" width="420" height="62" rx="31" fill="${P.pink}"/><text x="${RX}" y="${RY + RR + 153}" text-anchor="middle" fill="#fff" font-size="36" font-weight="800">${sc.pill}</text>` : ''}`,
      dom: el => heads(el, hs, 760, 250, 960, 72, [P.lilac, P.pink, P.pink]),
      plan: d => { const h = headTimes(sc, hs.length, d), t0 = hs.length > 1 ? h[1] : .8; return { h, t0, t1: Math.min(d - .3, t0 + Math.abs(from - to)) }; },
      build: (tl, q, qa, T, d, hd) => { const num = q('.num'), arc = q('.arc'), c = { v: from };
        tl.from(q('.fig'), { opacity: 0, x: -60, duration: .6 }, 0).fromTo(q('.road'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.2 }, .4);
        tl.set(q('.drop'), { x: 410, y: 860 }, 0).to(q('.drop'), { motionPath: { path: q('.road'), align: q('.road'), alignOrigin: [.5, .5] }, duration: Math.max(2, T.t1 - .8), ease: 'none' }, .8);
        tl.to(c, { v: to, duration: T.t1 - T.t0, ease: 'none', onUpdate: () => { const v = Math.max(to, Math.ceil(c.v - 1e-6)); num.textContent = v; arc.setAttribute('stroke-dashoffset', (100 * (1 - (c.v - to) / Math.max(1, from - to))).toFixed(1)); } }, T.t0);
        tl.to(q('.brain'), { opacity: .25, duration: .6 }, Math.max(1.5, T.t1 - .6));
        headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q) => { q('.heart').setAttribute('transform', `translate(545 845) scale(${(1 + .07 * Math.pow(Math.max(0, Math.sin(lt * Math.PI * 2.4)), 8)).toFixed(3)}) translate(-545 -845)`); },
      sfx: T => { const ev = []; for (let t = T.t0; t < T.t1 - .05; t += 1) ev.push(['tick', t]); return ev; }
    });
  };

  // ---------------------------------------------------------------------------------------------
  // EBULLICION: tall de la pell (buit a sobre). modo "piel" (l'aigua es fa vapor i la pell s'infla), "tension" (¿rebenta?),
  // "mano" (la mà de Kittinger: 1× vs 2×), "resumen" (tres conclusions amb icona; els titulars són les files)
  S.ebullicion = (sc) => {
    const modo = sc.modo || 'piel', hs = sc.heads || [];
    if (modo === 'resumen') {
      const RY0 = 610 - (hs.length - 1) * 95; // bloc centrat en vertical
      const ic = [`<path d="M-50,10 C-50,-30 -20,-50 0,-50 C20,-50 50,-30 50,10 C50,40 25,52 0,52 C-25,52 -50,40 -50,10Z" fill="#EBAA80"/><path d="M-30,-6 Q0,-26 30,-6" stroke="#C98058" stroke-width="6" fill="none"/>`,
        `<g stroke="#fff" stroke-width="9" stroke-linecap="round">${[0, 60, 120].map(a => `<path d="M0,-50 V50" transform="rotate(${a})"/>`).join('')}</g>`,
        `<circle r="48" fill="none" stroke="${P.pink}" stroke-width="9"/><text x="0" y="18" text-anchor="middle" style="${FD}" font-size="54" fill="${P.pink}">O₂</text>`];
      return mk(sc, {
        svg: u => hs.map((h, i) => `<g transform="translate(0 ${RY0 + i * 190})"><g class="row r${i}" opacity="0"><rect x="250" y="-75" width="1420" height="150" rx="34" fill="${P.deep}" opacity=".7"/><g transform="translate(360 0)">${ic[i] || ''}</g>
          ${i < 2 ? `<path class="x" d="M320,-40 L400,40 M400,-40 L320,40" stroke="${P.pink}" stroke-width="12" stroke-linecap="round" opacity="0"/>` : ''}</g></g>`).join(''),
        dom: el => { const d = Ehtml('position:absolute;inset:0', ''); hs.forEach((h, i) => { const r = Ehtml(`position:absolute;left:480px;top:${RY0 + i * 190 - 52}px;width:1160px;color:#fff;font-size:84px;line-height:1.1;${FD};opacity:0`, hHTML(h, [P.cyan, P.cyan, P.pink][i])); r.className = 'rt' + i; d.appendChild(r); }); el.appendChild(d); return d; },
        plan: d => ({ h: headTimes(sc, hs.length, d) }),
        build: (tl, q, qa, T, d, hd) => { hs.forEach((_, i) => { tl.fromTo(q('.r' + i), { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .45, ease: 'back.out(1.8)' }, T.h[i]).fromTo(hd.querySelector('.rt' + i), { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .45, ease: 'back.out(1.8)' }, T.h[i] + .05);
          const x = q('.r' + i + ' .x'); if (x) tl.to(x, { opacity: 1, duration: .15 }, T.h[i] + .5).fromTo(x, { scale: 1.8, transformOrigin: '50% 50%' }, { scale: 1, duration: .3, ease: 'back.out(3)' }, T.h[i] + .5); }); },
        sfx: T => T.h.map(t => ['pop', t + .1])
      });
    }
    if (modo === 'mano') {
      const HAND = 'M-60,140 L-62,20 C-90,10 -110,-30 -100,-50 C-90,-60 -70,-50 -58,-30 L-56,-120 C-56,-140 -30,-140 -30,-120 L-28,-40 L-26,-160 C-26,-180 2,-180 2,-160 L4,-50 L8,-150 C8,-170 36,-170 36,-150 L34,-40 L42,-120 C42,-140 68,-140 68,-120 L66,30 C66,90 40,140 20,140Z';
      return mk(sc, {
        svg: u => `<g transform="translate(380 560) scale(1.3)"><path d="${HAND}" fill="#EBAA80" stroke="#C98058" stroke-width="5"/></g><text x="380" y="860" text-anchor="middle" fill="${P.soft}" font-size="46" font-weight="800">Normal</text>
          <g class="big" transform="translate(800 560) scale(1.3)"><path class="hand2" d="${HAND}" fill="#EBAA80" stroke="${P.pink}" stroke-width="5"/></g><text x="800" y="930" text-anchor="middle" fill="#fff" font-size="46" font-weight="800">A 31 km, sin presión</text>
          <text class="x2" x="1060" y="560" text-anchor="middle" style="${FD}" font-size="130" fill="${P.yellow}" filter="url(#${u}k)" opacity="0">× 2</text>`,
        dom: el => heads(el, hs, 1170, 340, 560, 88, [P.yellow, P.pink]),
        plan: d => ({ h: headTimes(sc, hs.length, d) }),
        build: (tl, q, qa, T, d, hd) => { const t = T.h[1] != null ? T.h[1] : 2; tl.from(q('.big'), { opacity: 0, duration: .4 }, .3);
          tl.fromTo(q('.hand2'), { scale: 1 }, { scale: 1.42, transformOrigin: '0px 60px', duration: 1.4, ease: 'back.out(1.4)' }, t).to(q('.x2'), { opacity: 1, duration: .2 }, t + .9).fromTo(q('.x2'), { scale: 1.8, transformOrigin: '1060px 520px' }, { scale: 1, duration: .35, ease: 'back.out(3)' }, t + .9);
          headsTL(tl, hd, hs.length, T.h); },
        sfx: T => [['whoosh', (T.h[1] || 2)], ['pop', (T.h[1] || 2) + .9]]
      });
    }
    // tall de pell: buit (fosc) a sobre, epidermis, dermis i teixit amb cèl·lules i gotes d'aigua
    const X0 = 210, X1 = 1080, SY = 520, flat = `M${X0},${SY} C380,${SY - 8} 820,${SY + 8} ${X1},${SY}`, bulge = `M${X0},${SY} C330,${SY - 150} 870,${SY - 150} ${X1},${SY}`, max = `M${X0},${SY} C300,${SY - 250} 900,${SY - 250} ${X1},${SY}`;
    const skin = d => `${d} L${X1},940 L${X0},940Z`;
    return mk(sc, {
      svg: u => `<defs><clipPath id="${u}cl"><path class="clp" d="${skin(flat)}"/></clipPath></defs>
        <rect x="${X0}" y="260" width="${X1 - X0}" height="${SY - 260}" fill="#02052A" opacity=".55"/><text x="${X0 + 30}" y="320" fill="${P.soft}" font-size="40" font-weight="800">Vacío</text>
        <path class="sk" d="${skin(flat)}" fill="#C98058"/><g clip-path="url(#${u}cl)"><rect x="${X0}" y="${SY - 260}" width="${X1 - X0}" height="${940 - SY + 260}" fill="#E29E76"/>
          <path class="epi" d="${flat}" stroke="#EBAA80" stroke-width="60" fill="none"/>
          ${[...Array(22)].map((_, k) => `<ellipse cx="${X0 + 60 + (k * 137) % (X1 - X0 - 120)}" cy="${SY + 120 + (k * 89) % 300}" rx="54" ry="34" fill="#F0B490" stroke="#C98058" stroke-width="4"/>`).join('')}
          ${[...Array(18)].map((_, k) => `<g class="wd" transform="translate(${X0 + 90 + (k * 151) % (X1 - X0 - 180)} ${SY + 70 + (k * 71) % 280})"><circle class="w" r="12" fill="${P.cyan}"/><circle class="v" r="12" fill="#fff" fill-opacity=".25" stroke="#fff" stroke-width="5" opacity="0"/></g>`).join('')}</g>
        <path class="edge" d="${flat}" stroke="#F7C9A6" stroke-width="10" fill="none"/>
        <g class="tens" opacity="0">${[0, 1, 2, 3, 4].map(k => `<path d="M${300 + k * 140},${SY - 150} l-26,-40 M${300 + k * 140},${SY - 150} l26,-40" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".7"/>`).join('')}</g>
        <g class="hold" opacity="0"><path class="hl" d="${max}" stroke="${P.cyan}" stroke-width="14" fill="none" stroke-linecap="round"/><text x="600" y="${SY - 270}" text-anchor="middle" fill="${P.cyan}" font-size="46" font-weight="800">La piel aguanta</text></g>
         <g class="qm" opacity="0"><circle cx="930" cy="340" r="64" fill="#fff"/><text x="930" y="370" text-anchor="middle" style="${FD}" font-size="96" fill="#2B3FE6">?</text></g>
        <text x="${X1 - 20}" y="900" text-anchor="end" fill="#fff" font-size="40" font-weight="800">Tu piel, por dentro</text>`,
      dom: el => heads(el, hs, 1140, 340, 590, 88, [P.yellow, '#fff', P.cyan]),
      plan: d => ({ h: headTimes(sc, hs.length, d) }),
      build: (tl, q, qa, T, d, hd) => { const t1 = T.h[1] != null ? T.h[1] : 2, sh = modo === 'tension' ? max : bulge;
        if (modo === 'tension' || modo === 'aguanta') { [q('.sk'), q('.clp')].forEach(p => tl.set(p, { attr: { d: skin(bulge) } }, 0)); tl.set([q('.edge'), q('.epi')], { attr: { d: bulge } }, 0); qa('.wd').forEach(g => { tl.set(g.querySelector('.w'), { opacity: 0 }, 0).set(g.querySelector('.v'), { opacity: 1, scale: 2.2 }, 0); }); }
        else qa('.wd').forEach((g, k) => { const t = .6 + (k % 9) * .25; tl.to(g.querySelector('.w'), { scale: 0, duration: .3 }, t).fromTo(g.querySelector('.v'), { opacity: 0, scale: .4 }, { opacity: 1, scale: 2.4, duration: 1.4, ease: 'back.out(1.6)' }, t); });
        const tb = modo === 'piel' ? 1.4 : .4; [q('.sk'), q('.clp')].forEach(p => tl.to(p, { morphSVG: skin(sh), duration: 2.2, ease: 'power1.inOut' }, tb)); tl.to([q('.edge'), q('.epi')], { morphSVG: sh, duration: 2.2, ease: 'power1.inOut' }, tb);
        if (modo === 'tension') { tl.to(q('.tens'), { opacity: 1, duration: .3 }, .8).to(q('.qm'), { opacity: 1, duration: .2 }, t1 - .2).fromTo(q('.qm'), { scale: 1.8, transformOrigin: '930px 340px' }, { scale: 1, duration: .35, ease: 'back.out(3)' }, t1 - .2); }
        if (modo === 'aguanta') { tl.to(q('.hold'), { opacity: 1, duration: .2 }, t1).fromTo(q('.hl'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: .8 }, t1); }
        headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q, qa) => { qa('.wd').forEach((g, k) => { g.querySelector('.v').setAttribute('cy', px(-((lt * 18 + k * 7) % 22))); }); },
      sfx: (T, d) => modo === 'piel' ? [...Array(8)].map((_, k) => ['pop', .7 + k * .5]) : [['pop', T.h[1] || 2]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // TERMO: per defecte, «¿congelat a l'instant?» (floc de neu ratllat i termòmetre que es queda a 37 °C);
  // modo "termo": tall d'un termo (doble paret amb buit): la calor rebota i la temperatura gairebé no baixa
  S.termo = (sc) => {
    const hs = sc.heads || [], tm = sc.modo === 'termo';
    return mk(sc, {
      svg: u => tm ? `<rect x="250" y="270" width="560" height="680" rx="120" fill="#C7D0FF"/><rect x="290" y="310" width="480" height="600" rx="90" fill="#02052A"/><text x="530" y="300" text-anchor="middle" fill="${P.ink}" font-size="38" font-weight="800">Vacío</text>
          <rect x="340" y="360" width="380" height="500" rx="70" fill="#EEF1FF"/><rect x="370" y="420" width="320" height="420" rx="54" fill="#7A3B1A"/><rect x="370" y="420" width="320" height="40" rx="20" fill="#A45424"/>
          ${[0, 1, 2, 3, 4, 5].map(k => `<path class="ht" d="M0,0 c10,-14 20,14 30,0 c10,-14 20,14 30,0" stroke="${P.pink}" stroke-width="9" fill="none" stroke-linecap="round" data-k="${k}"/>`).join('')}
          <text class="tc" x="530" y="660" text-anchor="middle" style="${FD}" font-size="120" fill="${P.yellow}" filter="url(#${u}k)">37,0°</text>`
        : `<g class="flake" transform="translate(560 600)"><circle r="270" fill="${P.deep}" opacity=".6"/><g stroke="#fff" stroke-width="22" stroke-linecap="round">${[0, 60, 120].map(a => `<g transform="rotate(${a})"><path d="M0,-190 V190"/><path d="M0,-130 l-50,-50 M0,-130 l50,-50 M0,130 l-50,50 M0,130 l50,50"/></g>`).join('')}</g></g>
          <path class="x" d="M330,370 L790,830" stroke="${P.pink}" stroke-width="34" stroke-linecap="round"/>
          <g class="th" transform="translate(940 0)"><rect x="-30" y="330" width="60" height="460" rx="30" fill="${P.deep}" stroke="${P.soft}" stroke-width="6"/><circle cx="0" cy="830" r="54" fill="${P.pink}" stroke="${P.soft}" stroke-width="6"/><rect x="-14" y="540" width="28" height="300" rx="14" fill="${P.pink}"/><text x="56" y="585" fill="${P.yellow}" style="${FD}" font-size="132" filter="url(#${u}k)">37°</text></g>`,
      dom: el => tm ? heads(el, hs, 1140, 340, 590, 90, [P.yellow, P.cyan]) : heads(el, hs, 1240, 340, 500, 84, [P.cyan, P.pink]),
      plan: d => ({ h: headTimes(sc, hs.length, d) }),
      build: (tl, q, qa, T, d, hd) => { const t1 = T.h[1] != null ? T.h[1] : 2;
        if (tm) { tl.from(q('svg rect'), { opacity: 0, duration: .5 }, 0); const c = { v: 37 }; tl.to(c, { v: 36.8, duration: d, ease: 'none', onUpdate: () => { q('.tc').textContent = c.v.toFixed(1).replace('.', ',') + '°'; } }, 0); }
        else { tl.from(q('.flake'), { scale: .6, opacity: 0, transformOrigin: '560px 600px', duration: .6, ease: 'back.out(1.8)' }, .1).from(q('.th'), { opacity: 0, x: 40, duration: .5 }, .4).fromTo(q('.x'), { drawSVG: '0%' }, { drawSVG: '100%', duration: .35, ease: 'power3.out' }, t1); }
        headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q, qa) => { if (!tm) { q('.flake').setAttribute('transform', `translate(560 600) rotate(${px(lt * 8)})`); return; }
        qa('.ht').forEach((p, k) => { const u = ((lt * .55 + k / 6) % 1), side = k % 2 ? 1 : -1, y = 470 + (k * 67) % 340, x0 = 530 + side * 60, x = x0 + side * (u < .5 ? u * 2 * 150 : (1 - u) * 2 * 150);
          p.setAttribute('transform', `translate(${px(x - 30)} ${px(y)}) scale(${side} 1)`); p.setAttribute('opacity', (Math.sin(u * Math.PI) * .9).toFixed(2)); }); },
      sfx: T => tm ? [] : [['stamp', T.h[1] || 2]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // LINEA: línia de temps (0..max s) amb zones de color, marques i un capçal que avança fins a «at»; resumen + big = frase final
  S.linea = (sc) => {
    const max = sc.max || 120, at = sc.at != null ? sc.at : max, LX0 = 300, LX1 = sc.tito ? 1480 : 1640, LY = 690, xT = t => LX0 + (LX1 - LX0) * t / max;
    const step = max > 120 ? 30 : max > 60 ? 15 : 10, ticks = []; for (let t = 0; t <= max; t += step) ticks.push(t);
    return mk(sc, {
      svg: u => `${(sc.zones || []).map((z, i) => `<g class="zn z${i}"><rect x="${xT(z.a)}" y="${LY + 24}" width="${xT(z.b) - xT(z.a)}" height="84" rx="16" fill="${col(z.color, P.cyan)}" opacity=".85"/>${z.text ? `<text x="${(xT(z.a) + xT(z.b)) / 2}" y="${LY + 80}" text-anchor="middle" fill="${P.ink}" font-size="40" font-weight="800">${z.text}</text>` : ''}</g>`).join('')}
        <path d="M${LX0},${LY} H${LX1}" stroke="${P.soft}" stroke-width="8" stroke-linecap="round"/>${ticks.map(t => `<path d="M${xT(t)},${LY - 14} v28" stroke="${P.soft}" stroke-width="5"/><text x="${xT(t)}" y="${LY + 150}" text-anchor="middle" fill="${P.soft}" font-size="38" font-weight="700">${t} s</text>`).join('')}
        ${(sc.marks || []).map((m, i) => { const up = i % 2 === 0, y = up ? LY - 125 : LY - 238; return `<g class="mk m${i}"><path d="M${xT(m.t)},${LY} V${y + 40}" stroke="#fff" stroke-width="5" stroke-dasharray="8 8"/><circle cx="${xT(m.t)}" cy="${LY}" r="14" fill="#fff"/>
          <rect x="${xT(m.t) - (m.text.length * 11.5 + 30)}" y="${y - 30}" width="${m.text.length * 23 + 60}" height="74" rx="18" fill="#fff"/><text x="${xT(m.t)}" y="${y + 20}" text-anchor="middle" fill="${P.ink}" font-size="40" font-weight="800">${m.text}</text></g>`; }).join('')}
        <g class="ph"><path d="M0,${LY - 40} V${LY + 40}" stroke="${P.yellow}" stroke-width="10" stroke-linecap="round"/><circle cx="0" cy="${LY}" r="22" fill="${P.yellow}" stroke="${P.ink}" stroke-width="6"/></g>
        <text class="big" x="${LX0}" y="388" style="${FD}" font-size="130" fill="${sc.big && sc.resumen ? '#fff' : P.yellow}" filter="url(#${u}k)">0 s</text>
        ${sc.pill ? `<rect x="${LX1 - 440}" y="250" width="440" height="70" rx="35" fill="${P.pink}"/><text x="${LX1 - 220}" y="298" text-anchor="middle" fill="#fff" font-size="38" font-weight="800">${sc.pill}</text>` : ''}
        ${sc.big && sc.resumen ? `<text class="fin" x="960" y="948" text-anchor="middle" style="${FD}" font-size="110" fill="${P.yellow}" filter="url(#${u}k)" opacity="0">${sc.big}</text>` : ''}`,
      plan: d => ({ d, ta: Math.min(d * .6, 4) }),
      build: (tl, q, qa, T, d) => { const ph = q('.ph'), big = q('.big'), c = { v: 0 };
        (sc.zones || []).forEach((z, i) => tl.fromTo(q('.z' + i + ' rect'), { attr: { width: 0 } }, { attr: { width: xT(z.b) - xT(z.a) }, duration: .7, ease: 'power2.out' }, .3 + i * .5).from(q('.z' + i + ' text') || {}, { opacity: 0, duration: .3 }, .8 + i * .5));
        tl.set(ph, { x: LX0 }, 0).to(ph, { x: xT(at), duration: T.ta, ease: 'power1.inOut' }, .3).to(c, { v: at, duration: T.ta, ease: 'power1.inOut', onUpdate: () => { big.textContent = Math.round(c.v) + ' s'; } }, .3);
        (sc.marks || []).forEach((m, i) => { const tm = .3 + T.ta * Math.min(1, m.t / Math.max(1, at)); tl.from(q('.m' + i), { opacity: 0, y: 30, duration: .4, ease: 'back.out(2)' }, Math.min(d - 1, tm)); });
        if (q('.fin')) tl.to(q('.fin'), { opacity: 1, duration: .2 }, T.ta + .6).fromTo(q('.fin'), { scale: 1.6, transformOrigin: '960px 910px' }, { scale: 1, duration: .4, ease: 'back.out(3)' }, T.ta + .6); },
      sfx: (T, d) => [['tick', .3], ['tick', .3 + T.ta], ...(sc.resumen ? [['stamp', T.ta + .6]] : [])]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // APAGON: el cervell com una casa amb llums: 1 escorça prefrontal (judici), 2 cerebel (equilibri), 3 hipocamp (memòria), 4 tronc (funcions vitals)
  // { foco: 1–4 (la que s'apaga ara; les anteriors ja estan apagades), modo: teaser | trampa | recompensa | habla | peligro | enciende | resumen, heads }
  const BR = { cer: 'M84,252 C66,170 118,96 210,70 C290,44 392,46 460,86 C540,132 572,212 548,280 C534,318 500,334 458,330 C430,352 396,358 368,348 C344,372 300,380 270,366 C236,380 190,376 162,350 C120,340 92,300 84,252 Z',
    cb: 'M418,318 C468,318 512,344 506,384 C500,420 452,436 408,424 C376,416 362,392 372,366 C380,342 396,320 418,318 Z', bs: 'M332,350 C340,392 344,424 338,466 L372,466 C378,430 382,398 384,360 Z',
    gyri: 'M120,200 C150,170 140,140 176,124 C206,112 200,90 236,84 M150,236 C186,222 190,196 222,186 C252,178 252,150 280,140 M200,250 C226,236 248,236 262,210 C276,186 276,170 290,150 M352,80 C344,118 366,140 356,176 C350,200 364,214 360,234 M396,90 C388,130 414,150 406,184 C400,208 420,220 430,232 M450,116 C440,150 470,170 466,204 C462,234 488,248 510,250 M214,312 C246,300 276,304 304,292 C330,282 352,286 376,276',
    hip: 'M246,296 C262,276 316,276 340,294 C358,308 352,332 332,332 C316,331 312,318 298,318 C284,318 276,332 258,328 C240,324 236,308 246,296Z' };
  S.apagon = (sc) => {
    const modo = sc.modo || 'foco', foco = sc.foco || 0, hs = sc.heads || [], list = !['teaser'].includes(modo), cap = ['teaser', 'trampa', 'recompensa', 'habla', 'peligro', 'enciende'].includes(modo) || (modo === 'foco' && sc.then === undefined && false);
    const BX = 70, BY = 236, BS = 1.5, LB = ['El juicio', 'El equilibrio', 'La memoria', 'Lo vital'], TAG = [[150, 150], [444, 372], [300, 250], [358, 428]];
    const on = '#FFE9A8';
    return mk(sc, {
      svg: u => `<g transform="translate(${BX} ${BY}) scale(${BS})"><defs><clipPath id="${u}cc"><path d="${BR.cer}"/></clipPath></defs>
          <path d="${BR.bs}" fill="${P.mid}" stroke="#9FB0FF" stroke-width="3"/><path d="${BR.cb}" fill="${P.mid}" stroke="#9FB0FF" stroke-width="3"/><path d="${BR.cer}" fill="${P.mid}" stroke="#9FB0FF" stroke-width="3.5"/>
          <g clip-path="url(#${u}cc)"><ellipse class="rg r1" cx="150" cy="196" rx="112" ry="118" fill="${on}"/></g><path class="rg r2" d="${BR.cb}" fill="${on}"/><path class="rg r4" d="${BR.bs}" fill="${on}"/>
          <path d="${BR.gyri}" stroke="#9FB0FF" stroke-width="2.4" fill="none" opacity=".7"/><path d="${BR.cb}" fill="none" stroke="${P.ink}" stroke-width="5" opacity=".55"/><path d="${BR.bs}" fill="none" stroke="${P.ink}" stroke-width="4" opacity=".4"/><path class="rg r3" d="${BR.hip}" fill="${on}" stroke="#fff" stroke-width="3" stroke-dasharray="6 5"/>
          <g class="acc" opacity="0">${[...Array(14)].map((_, k) => `<circle class="sp" cx="290" cy="250" r="9" fill="${P.yellow}"/>`).join('')}<circle cx="290" cy="250" r="20" fill="${P.yellow}"/></g>
          ${TAG.map(([x, y], i) => `<g class="tg t${i + 1}" transform="translate(${x} ${y})"><circle r="22" fill="#fff" stroke="${P.ink}" stroke-width="4"/><text y="9" text-anchor="middle" style="${FD}" font-size="28" fill="${P.ink}">${i + 1}</text></g>`).join('')}</g>
        ${modo === 'peligro' ? `<path class="br" d="" stroke="${P.cyan}" stroke-width="10" fill="none" stroke-linecap="round"/><text x="1130" y="908" fill="${P.soft}" font-size="38" font-weight="800">Respiración</text>` : ''}
        ${list ? LB.map((l, i) => `<g transform="translate(1130 ${310 + i * 124})"><g class="row w${i + 1}"><rect class="pill" x="-24" y="-50" width="560" height="100" rx="28" fill="#fff" opacity="0"/><circle r="40" fill="${P.deep}" stroke="${P.soft}" stroke-width="5" class="bd"/><text y="15" text-anchor="middle" style="${FD}" font-size="46" fill="#fff" class="bn">${i + 1}</text>
          <text class="lt" x="70" y="20" style="${FD}" font-size="60" fill="#fff">?</text><path class="ck" d="M560,-4 L588,24 L640,-30" stroke="${P.cyan}" stroke-width="12" fill="none" stroke-linecap="round" opacity="0"/></g></g>`).join('') : ''}`,
      dom: el => list ? heads(el, hs.length && cap ? hs : [], 1110, modo === 'peligro' ? 800 : 840, 740, 64, modo === 'peligro' ? [P.pink] : [P.yellow, P.pink, P.cyan]) : heads(el, hs, 1110, 360, 620, 88, [P.yellow, P.pink]),
      plan: d => { const n = modo === 'resumen' ? 5 : Math.max(1, hs.length); return { h: headTimes(sc, n, d), d }; },
      build: (tl, q, qa, T, d, hd) => {
        const R = i => q('.r' + i), row = i => q('.w' + i), off = (i, t, flick) => { if (flick) tl.to(R(i), { opacity: .2, duration: .06, yoyo: true, repeat: 3 }, t); tl.to(R(i), { attr: { fill: '#0C1170' }, opacity: .85, duration: .25 }, t + (flick ? .3 : 0)); };
        const reveal = (i, t, focus) => { const r = row(i); if (!r) return; tl.set(r.querySelector('.lt'), { textContent: LB[i - 1] }, t).fromTo(r, { x: 40, opacity: .4 }, { x: 0, opacity: 1, duration: .4, ease: 'back.out(2)' }, t);
          if (focus) tl.to(r.querySelector('.pill'), { opacity: 1, duration: .25 }, t).set(r.querySelector('.lt'), { attr: { fill: P.ink } }, t).set(r.querySelector('.bd'), { attr: { fill: P.yellow, stroke: P.ink } }, t).set(r.querySelector('.bn'), { attr: { fill: P.ink } }, t); };
        tl.from(q('svg > g'), { opacity: 0, scale: .92, transformOrigin: '540px 600px', duration: .5 }, 0);
        if (list) for (let i = 1; i <= 4; i++) tl.set(row(i), { opacity: .45 }, 0);
        if (modo === 'teaser') { for (let i = 1; i <= 4; i++) off(i, (T.h[1] || 2) + (i - 1) * .4, true); }
        else if (modo === 'resumen') { for (let i = 1; i <= 4; i++) { const t = T.h[i] != null ? T.h[i] : .8 + i; reveal(i, t, false); off(i, t, true); tl.set(q('.t' + i + ' circle'), { attr: { fill: P.yellow } }, t); } }
        else if (modo === 'enciende') { for (let i = 1; i <= 4; i++) { tl.set(R(i), { attr: { fill: '#0C1170' }, opacity: .85 }, 0); reveal(i, .1, false); tl.to(R(i), { attr: { fill: on }, opacity: 1, duration: .3 }, .6 + i * .45).to(row(i).querySelector('.ck'), { opacity: 1, duration: .2 }, .6 + i * .45); } }
        else { const f = foco || 1; for (let i = 1; i < f; i++) { tl.set(R(i), { attr: { fill: '#0C1170' }, opacity: .85 }, 0); reveal(i, 0, false); }
          reveal(f, .35, true); off(f, Math.min(1.4, d * .25), true); tl.set(q('.t' + f + ' circle'), { attr: { fill: P.yellow } }, .35);
          if (modo === 'recompensa') tl.to(q('.acc'), { opacity: 1, duration: .3 }, .6);
        }
        if (cap || modo === 'teaser') headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q, qa) => {
        qa('.sp').forEach((s, k) => { const u = ((lt * .8 + k / 10) % 1), a = k * 2.4; s.setAttribute('cx', px(290 + Math.cos(a) * u * 140)); s.setAttribute('cy', px(250 + Math.sin(a) * u * 100)); s.setAttribute('opacity', (1 - u).toFixed(2)); });
        const br = q('.br'); if (br) { const slow = 1 - .75 * Math.min(1, lt / Math.max(1, d - 1)); let p = ''; for (let x = 1360; x <= 1800; x += 8) { const ph = (x - 1360) / 440 * 4 * slow * Math.PI + lt * 2 * slow; p += (x === 1360 ? 'M' : 'L') + x + ',' + px(896 - Math.sin(ph) * 30 * (.4 + .6 * slow)); } br.setAttribute('d', p); br.setAttribute('stroke', slow < .5 ? P.pink : P.cyan); }
        if (modo === 'peligro') q('.r4').setAttribute('opacity', (.5 + .4 * Math.abs(Math.sin(lt * 3))).toFixed(2)); },
      sfx: (T, d) => { const ev = []; if (modo === 'teaser') for (let i = 0; i < 4; i++) ev.push(['click', (T.h[1] || 2) + i * .4 + .3]);
        else if (modo === 'resumen') for (let i = 1; i <= 4; i++) ev.push(['click', (T.h[i] != null ? T.h[i] : .8 + i) + .3]);
        else if (modo === 'enciende') for (let i = 1; i <= 4; i++) ev.push(['pop', .6 + i * .45]);
        else ev.push(['click', Math.min(1.4, d * .25) + .3]); return ev; }
    });
  };

  // ---------------------------------------------------------------------------------------------
  // BEBIDA: fase 1 = «14 g» d'alcohol pur; fase 2 = llauna de cervesa, copa de vi, xarrup i còctel (≥ 2) amb la mateixa quantitat
  S.bebida = (sc) => {
    const f2 = sc.fase === 2, X = [330, 760, 1190, 1620], BY = 760;
    const can = `<rect x="-70" y="-300" width="140" height="300" rx="20" fill="#EEF1FF"/><rect x="-70" y="-220" width="140" height="120" fill="${P.orange}"/><rect x="-56" y="-318" width="112" height="24" rx="10" fill="#C7D0FF"/><path d="M-46,-280 V-30" stroke="#fff" stroke-width="10" opacity=".6"/>`;
    const wine = `<path d="M-80,-320 L80,-320 C80,-220 50,-170 0,-166 C-50,-170 -80,-220 -80,-320Z" fill="#EEF1FF" opacity=".3"/><path d="M-74,-260 L74,-260 C70,-200 44,-172 0,-170 C-44,-172 -70,-200 -74,-260Z" fill="${P.pink}"/><path d="M-80,-320 L80,-320 C80,-220 50,-170 0,-166 C-50,-170 -80,-220 -80,-320Z" fill="none" stroke="#fff" stroke-width="6"/><path d="M0,-166 V-10 M-60,0 H60" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`;
    const shot = `<path d="M-60,-170 L60,-170 L48,0 L-48,0Z" fill="#EEF1FF" opacity=".3"/><path d="M-56,-110 L56,-110 L48,0 L-48,0Z" fill="${P.orange}"/><path d="M-60,-170 L60,-170 L48,0 L-48,0Z" fill="none" stroke="#fff" stroke-width="6"/>`;
    const cock = `<path d="M-100,-300 L100,-300 L0,-170Z" fill="${P.lilac}" opacity=".85"/><path d="M-100,-300 L100,-300 L0,-170Z" fill="none" stroke="#fff" stroke-width="6"/><path d="M0,-170 V-10 M-60,0 H60" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="60" cy="-300" r="22" fill="${P.yellow}"/>`;
    const D = [[can, 'Cerveza', '355 ml · 5 %'], [wine, 'Vino', '150 ml · 12 %'], [shot, 'Destilado', '45 ml · 40 %'], [cock, 'Cóctel', '¡Ojo!']];
    return mk(sc, {
      svg: u => f2 ? D.map(([g, a, b], i) => `<g transform="translate(${X[i]} ${BY})"><g class="dk d${i}">${g}<text y="80" text-anchor="middle" fill="#fff" font-size="48" font-weight="800">${a}</text><text y="134" text-anchor="middle" fill="${P.soft}" font-size="40" font-weight="700">${b}</text>
          <g transform="translate(0 -380)"><g class="bd"><rect x="-90" y="-40" width="180" height="80" rx="40" fill="${i === 3 ? P.pink : '#fff'}"/><text y="18" text-anchor="middle" style="${FD}" font-size="54" fill="${i === 3 ? '#fff' : P.ink}">${i === 3 ? '≥ 2' : '14 g'}</text></g></g></g></g>`).join('') +
          [0, 1].map(i => `<text class="eq" x="${(X[i] + X[i + 1]) / 2}" y="${BY - 150}" text-anchor="middle" style="${FD}" font-size="90" fill="${P.soft}">=</text>`).join('')
        : `<g class="drop" transform="translate(620 600)"><path d="M0,-200 C70,-100 150,0 150,80 C150,170 80,220 0,220 C-80,220 -150,170 -150,80 C-150,0 -70,-100 0,-200Z" fill="${P.orange}" filter="url(#${u}k)"/><path d="M-80,40 C-80,0 -60,-30 -40,-50" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".6" fill="none"/></g>
          <text class="g" x="1220" y="610" text-anchor="middle" style="${FD}" font-size="300" fill="${P.yellow}" filter="url(#${u}k)">14 g</text>
          <text x="1220" y="700" text-anchor="middle" fill="#fff" font-size="52" font-weight="800">de alcohol puro</text><text x="1220" y="770" text-anchor="middle" fill="${P.soft}" font-size="42" font-weight="700">= 1 bebida estándar (EE. UU.)</text>`,
      plan: d => ({ b: beatsOf(sc, d), d }),
      build: (tl, q, qa, T, d) => { if (!f2) { tl.from(q('.drop'), { scale: 0, transformOrigin: '620px 640px', duration: .6, ease: 'back.out(2)' }, .2); const c = { v: 0 }; tl.to(c, { v: 14, duration: 1.4, ease: 'power2.out', onUpdate: () => { q('.g').textContent = Math.round(c.v) + ' g'; } }, .5); return; }
        const t3 = T.b[T.b.length - 1] > 1.5 ? T.b[T.b.length - 1] : d - 2.5;
        [0, 1, 2].forEach(i => tl.from(q('.d' + i), { y: 80, opacity: 0, duration: .5, ease: 'back.out(1.8)' }, .2 + i * .45).from(q('.d' + i + ' .bd'), { scale: 0, transformOrigin: '50% 50%', duration: .35, ease: 'back.out(3)' }, 1.6 + i * .3));
        qa('.eq').forEach((e, i) => tl.from(e, { opacity: 0, duration: .3 }, 1.4 + i * .3));
        tl.from(q('.d3'), { y: 80, opacity: 0, duration: .5, ease: 'back.out(1.8)' }, t3).from(q('.d3 .bd'), { scale: 0, duration: .35, ease: 'back.out(3)' }, t3 + .4); },
      tick: (lt, d, T, q) => { const dr = q('.drop'); if (dr) dr.setAttribute('transform', `translate(620 ${px(600 + Math.sin(lt * 2) * 10)})`); },
      sfx: (T, d) => f2 ? [['pop', .3], ['pop', .75], ['pop', 1.2], ['blip', 1.7], ['blip', 2.0], ['blip', 2.3]] : [['pop', .3]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // FRENO: pedals del cervell (freno = GABA, accelerador = glutamat) i velocímetre «actividad de tus neuronas»; modo "lento" = xarxa de neurones que es van alentint
  S.freno = (sc) => {
    const hs = sc.heads || [], lento = sc.modo === 'lento', GX = 1440, GY = 560, GR = 230;
    const gauge = `<path d="M${GX - GR},${GY} A${GR},${GR} 0 0 1 ${GX + GR},${GY}" fill="none" stroke="#2B3BC8" stroke-width="34" stroke-linecap="round"/><path d="M${GX - GR},${GY} A${GR},${GR} 0 0 1 ${GX + GR},${GY}" fill="none" stroke="${P.soft}" stroke-width="34" stroke-linecap="round" pathLength="100" stroke-dasharray="100" class="garc"/>
      <line class="ndl" x1="${GX}" y1="${GY}" x2="${GX}" y2="${GY - GR + 40}" stroke="${P.yellow}" stroke-width="14" stroke-linecap="round"/><circle cx="${GX}" cy="${GY}" r="24" fill="${P.yellow}"/><text x="${GX}" y="${GY + 90}" text-anchor="middle" fill="#fff" font-size="44" font-weight="800">Actividad de</text><text x="${GX}" y="${GY + 144}" text-anchor="middle" fill="#fff" font-size="44" font-weight="800">tus neuronas</text>`;
    const NODES = [[220, 500], [470, 420], [720, 530], [960, 440], [330, 760], [600, 800], [860, 740], [1060, 680]], ED = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [6, 7], [2, 6], [1, 5], [3, 7]];
    return mk(sc, {
      svg: u => (lento ? ED.map(([a, b], i) => `<path class="ax" id="${u}e${i}" d="M${NODES[a][0]},${NODES[a][1]} L${NODES[b][0]},${NODES[b][1]}" stroke="#9FB0FF" stroke-width="8" opacity=".6"/>`).join('') +
          NODES.map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="44" fill="${P.mid}" stroke="${P.soft}" stroke-width="6"/><circle r="16" fill="${P.soft}"/>${[0, 1, 2, 3, 4].map(k => `<path d="M0,0 L${px(Math.cos(k * 1.26) * 70)},${px(Math.sin(k * 1.26) * 70)}" stroke="${P.soft}" stroke-width="5" opacity=".5"/>`).join('')}</g>`).join('') +
          [...Array(14)].map(() => `<circle class="sig" r="13" fill="${P.yellow}" opacity="0"/>`).join('')
        : `<g transform="translate(0 -50)"><rect x="200" y="840" width="860" height="44" rx="16" fill="${P.deep}"/>
          <g class="pb"><path d="M440,840 L470,690" stroke="#9FB0FF" stroke-width="26" stroke-linecap="round"/><rect class="pad" x="320" y="570" width="300" height="130" rx="30" fill="#EEF1FF"/><path d="M350,610 H590 M350,640 H590 M350,670 H590" stroke="#C7D0FF" stroke-width="8"/></g>
          <g class="pa"><path d="M860,840 L880,750" stroke="#9FB0FF" stroke-width="26" stroke-linecap="round"/><rect class="pad2" x="790" y="490" width="180" height="270" rx="30" fill="#EEF1FF"/><path d="M820,540 V720 M850,540 V720 M880,540 V720 M910,540 V720 M940,540 V720" stroke="#C7D0FF" stroke-width="7"/></g>
          <text x="470" y="935" text-anchor="middle" fill="#fff" style="${FD}" font-size="58">Freno</text><text x="470" y="985" text-anchor="middle" fill="${P.cyan}" font-size="44" font-weight="800">GABA</text>
          <text x="880" y="935" text-anchor="middle" fill="#fff" style="${FD}" font-size="58">Acelerador</text><text x="880" y="985" text-anchor="middle" fill="${P.pink}" font-size="44" font-weight="800">glutamato</text>
          <g class="mol"><path d="M0,-60 C30,-30 60,0 60,30 C60,66 32,84 0,84 C-32,84 -60,66 -60,30 C-60,0 -30,-30 0,-60Z" fill="${P.orange}" filter="url(#${u}k)"/><text y="44" text-anchor="middle" fill="${P.ink}" font-size="36" font-weight="800">alcohol</text></g></g>`) + gauge,
      dom: el => heads(el, hs, 210, 250, 1000, 80, lento ? [P.yellow, P.pink] : [P.cyan, P.pink]),
      plan: d => ({ h: headTimes(sc, hs.length, d), d }),
      build: (tl, q, qa, T, d, hd) => { const ndl = q('.ndl'), t0 = T.h[0] || 0, t1 = T.h[1] != null ? T.h[1] : d * .55;
        tl.set(ndl, { rotation: lento ? 20 : 60, svgOrigin: `${GX} ${GY}` }, 0).set(q('.garc'), { attr: { 'stroke-dashoffset': lento ? 39 : 17 } }, 0);
        if (!lento) { tl.set(q('.mol'), { x: 470, y: 340, opacity: 0 }, 0).to(q('.mol'), { opacity: 1, duration: .2 }, t0 + .3).to(q('.mol'), { y: 486, duration: .6, ease: 'power2.in' }, t0 + .4).to(q('.pb'), { y: 60, duration: .25, ease: 'back.out(2)' }, t0 + 1.0).to(q('.mol'), { y: 546, duration: .25, ease: 'back.out(2)' }, t0 + 1.0).to(q('.pad'), { attr: { fill: P.cyan } }, t0 + 1.0);
          tl.to(q('.pa'), { y: -50, opacity: .55, duration: .5, ease: 'back.out(2)' }, t1 + .3).to(ndl, { rotation: -50, svgOrigin: `${GX} ${GY}`, duration: 1.4, ease: 'power2.inOut' }, t0 + 1.2).to(q('.garc'), { attr: { 'stroke-dashoffset': 72 }, duration: 1.4 }, t0 + 1.2);
          tl.to(ndl, { rotation: -70, svgOrigin: `${GX} ${GY}`, duration: 1.2, ease: 'power2.inOut' }, t1 + .4).to(q('.garc'), { attr: { 'stroke-dashoffset': 83 }, duration: 1.2 }, t1 + .4); }
        else tl.to(ndl, { rotation: -70, svgOrigin: `${GX} ${GY}`, duration: d - 1, ease: 'power1.inOut' }, .5).to(q('.garc'), { attr: { 'stroke-dashoffset': 83 }, duration: d - 1 }, .5);
        headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q, qa) => { if (!lento) return; const sl = Math.max(.15, 1 - lt / d);
        qa('.sig').forEach((s, k) => { const e = ED[k % ED.length], per = 1.2 / sl, ph = ((lt + k * .37) % (per * 1.6)) / per; if (ph > 1 || (k / 14) > sl + .1) { s.setAttribute('opacity', 0); return; }
          const [a, b] = [NODES[e[0]], NODES[e[1]]]; s.setAttribute('cx', px(a[0] + (b[0] - a[0]) * ph)); s.setAttribute('cy', px(a[1] + (b[1] - a[1]) * ph)); s.setAttribute('opacity', .95); }); },
      sfx: (T, d) => lento ? [] : [['thump', (T.h[0] || 0) + 1.1], ['whoosh', (T.h[1] != null ? T.h[1] : d * .55) + .3]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // CURVA: alcohol en sang en el temps (qualitatiu, sense xifres): modo comparar | comparar2 | tolerancia | rapido | sigue
  S.curva = (sc) => {
    const m = sc.modo || 'comparar', X0 = 300, X1 = 1660, YB = 860;
    const HI = `M${X0},${YB} C380,${YB} 420,360 560,360 C720,360 900,560 1100,700 C1300,820 1500,850 ${X1},856`, LO = `M${X0},${YB} C420,${YB} 560,620 760,600 C960,590 1180,700 1360,780 C1500,830 1600,850 ${X1},856`;
    const FEEL = `M${X0},${YB} C380,${YB} 420,600 560,600 C720,600 900,720 1100,780 C1300,836 1500,852 ${X1},857`, UP = `M${X0},${YB} C400,${YB} 520,700 640,640 C760,580 860,420 980,400 C1120,380 1300,560 1460,700 C1560,780 1620,830 ${X1},850`;
    const cfg = { comparar: [[HI, P.pink, 'En ayunas y rápido', 940, 400], [LO, P.soft, 'Con comida y despacio', 1060, 640]], comparar2: [[HI, P.lilac, 'Ella', 760, 400], [LO, P.soft, 'Él', 960, 620]],
      tolerancia: [[HI, P.pink, 'Lo que hay en tu sangre', 960, 400], [FEEL, P.soft, 'Lo que sientes', 1000, 690, true]], rapido: [[HI, P.pink, 'De golpe', 1240, 640], [LO, P.soft, 'Despacio', 960, 620]], sigue: [[UP, P.pink, 'Sigue subiendo', 1260, 450]] }[m];
    return mk(sc, {
      svg: u => `<path d="M${X0},300 V${YB} H${X1 + 40}" stroke="${P.soft}" stroke-width="6" fill="none" stroke-linecap="round"/><text transform="translate(${X0 - 36} 580) rotate(-90)" text-anchor="middle" fill="${P.soft}" font-size="42" font-weight="800">Alcohol en sangre</text><text x="${sc.tito ? 1440 : X1 + 30}" y="${YB + 64}" text-anchor="end" fill="${P.soft}" font-size="42" font-weight="800">Tiempo →</text>
        ${m === 'comparar2' ? `<text x="${X1}" y="330" text-anchor="end" fill="#fff" style="${FD}" font-size="64">Misma cantidad</text>` : ''}
        ${m === 'rapido' ? `<path d="M${X0},420 H${X1}" stroke="#fff" stroke-width="6" stroke-dasharray="20 14"/><rect x="${X1 - 380}" y="328" width="380" height="68" rx="16" fill="#fff"/><text x="${X1 - 190}" y="376" text-anchor="middle" fill="${P.ink}" font-size="42" font-weight="800">Zona de lagunas</text>` : ''}
        ${m === 'tolerancia' ? `<path class="gap" d="${HI} L${X1},857 ${FEEL.replace('M', 'L')}" fill="${P.pink}" opacity="0"/>` : ''}
        ${m === 'sigue' ? `<path d="M640,${YB} V300" stroke="#fff" stroke-width="5" stroke-dasharray="10 10"/><rect x="510" y="250" width="260" height="66" rx="16" fill="#fff"/><text x="640" y="296" text-anchor="middle" fill="${P.ink}" font-size="40" font-weight="800">Última copa</text>` : ''}
        ${cfg.map(([d, c, t, lx, ly, dash], i) => `<path class="cv c${i}" d="${d}" stroke="${c}" stroke-width="${i ? 10 : 14}" fill="none" stroke-linecap="round" ${dash ? 'stroke-dasharray="24 16"' : ''}/>
          <g class="lb l${i}" opacity="0"><rect x="${lx - t.length * 13 - 30}" y="${ly - (i ? -30 : 120)}" width="${t.length * 26 + 60}" height="76" rx="20" fill="${c === P.pink ? P.pink : '#fff'}"/><text x="${lx}" y="${ly - (i ? -30 : 120) + 52}" text-anchor="middle" fill="${c === P.pink ? '#fff' : P.ink}" font-size="44" font-weight="800">${t}</text></g>`).join('')}
        ${m === 'sigue' ? `<path class="seg" d="M640,640 C760,580 860,420 980,400" stroke="${P.yellow}" stroke-width="18" fill="none" stroke-linecap="round"/><g class="moon" opacity="0" transform="translate(1500 600)"><circle r="40" fill="#EEF1FF"/><circle cx="-16" cy="-10" r="40" fill="#1E2BB0"/><text x="50" y="-20" fill="#fff" style="${FD}" font-size="50">z z</text></g>` : ''}
        ${m !== 'sigue' ? [380, 520, 660].map(x => `<g transform="translate(${x} ${YB + 50})"><path d="M-16,-30 L16,-30 L12,10 L-12,10Z" fill="${P.orange}" stroke="#fff" stroke-width="4"/></g>`).join('') : ''}`,
      plan: d => ({ d }),
      build: (tl, q, qa, T, d) => { cfg.forEach((c, i) => { tl.fromTo(q('.c' + i), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, ease: 'power1.inOut' }, .2 + i * .6).to(q('.l' + i), { opacity: 1, duration: .3 }, .2 + i * .6 + .8).fromTo(q('.l' + i), { y: 20 }, { y: 0, duration: .4, ease: 'back.out(2)' }, .2 + i * .6 + .8); });
        if (q('.gap')) tl.to(q('.gap'), { opacity: .16, duration: .6 }, 2.4);
        if (q('.seg')) { tl.fromTo(q('.seg'), { drawSVG: '0%' }, { drawSVG: '100%', duration: 1 }, 2.2).to(q('.moon'), { opacity: 1, duration: .4 }, 3); } },
      sfx: () => [['whoosh', .3], ['pop', 1.3]]
    });
  };

  // ---------------------------------------------------------------------------------------------
  // MEMORIA: el hipocamp com una gravadora (tira de pel·lícula). modo per defecte: grava i en un moment deixa de gravar (fotogrames buits);
  // "laguna": xifra gran (big) + barres «límit per manejar» vs «llacunes»; "tipos": dues tires (illes de records / llacuna completa)
  S.memoria = (sc) => {
    const m = sc.modo || 'rec', hs = sc.heads || [];
    const ICON = [`<path d="M-28,-40 L28,-40 L22,34 L-22,34Z" fill="${P.orange}" stroke="#fff" stroke-width="5"/>`, `<text y="30" text-anchor="middle" style="${FD}" font-size="96" fill="${P.yellow}">♪</text>`,
      `<circle r="44" fill="#EBAA80"/><path d="M-20,8 Q0,28 20,8" stroke="#8E3B3B" stroke-width="6" fill="none"/><circle cx="-14" cy="-10" r="6" fill="#140B07"/><circle cx="14" cy="-10" r="6" fill="#140B07"/>`,
      `<path d="M0,-46 L13,-14 L46,-12 L20,8 L28,42 L0,22 L-28,42 L-20,8 L-46,-12 L-13,-14Z" fill="${P.yellow}"/>`, `<rect x="-36" y="-30" width="72" height="60" rx="10" fill="${P.pink}"/><circle r="16" fill="#fff"/>`];
    const strip = (cls, y, h) => `<g class="${cls}"><rect x="-200" y="${y}" width="2400" height="${h}" fill="#05083A"/>${[...Array(8)].map((_, i) => `<g class="fr" data-i="${i}"><rect y="${y + 34}" width="${h * 1.25}" height="${h - 68}" rx="12" fill="#2B3BC8"/><g class="ic">${ICON[i % 5]}</g><text class="qq" text-anchor="middle" style="${FD}" font-size="${h * .4}" fill="#4553C8" opacity="0">?</text></g>`).join('')}
      ${[...Array(30)].map((_, k) => `<rect class="hole" x="${k * 80}" y="${y + 8}" width="40" height="18" rx="5" fill="#2B3BC8"/><rect class="hole" x="${k * 80}" y="${y + h - 26}" width="40" height="18" rx="5" fill="#2B3BC8"/>`).join('')}</g>`;
    const big = sc.big || '';
    return mk(sc, {
      svg: u => m === 'tipos' ? strip('s1', 340, 210) + strip('s2', 660, 210) + `<text x="230" y="320" fill="#fff" font-size="44" font-weight="800" class="t1" opacity="0">Islas de recuerdos</text><text x="230" y="640" fill="#fff" font-size="44" font-weight="800" class="t2" opacity="0">Laguna completa</text>`
        : m === 'laguna' ? `<text class="bg" x="960" y="450" text-anchor="middle" style="${FD}" font-size="230" fill="${P.yellow}" filter="url(#${u}k)">${big}</text>
          <g transform="translate(360 590)"><text x="0" y="0" fill="#fff" font-size="46" font-weight="800">Límite para manejar (EE. UU.)</text><rect class="b1" x="0" y="22" width="0" height="80" rx="40" fill="${P.soft}" opacity=".9"/><text class="v1" x="28" y="78" fill="${P.ink}" font-size="46" font-weight="800">0,8 g/L</text></g>
          <g transform="translate(360 780)"><text x="0" y="0" fill="#fff" font-size="46" font-weight="800">Suelen empezar las lagunas</text><rect class="b2" x="0" y="22" width="0" height="80" rx="40" fill="${P.pink}"/><text class="v2" x="28" y="78" fill="#fff" font-size="46" font-weight="800">1,6 g/L</text></g>`
        : strip('s1', 400, 300) + `<g class="rec" transform="translate(180 300)"><circle class="dot" r="24" fill="${P.pink}"/><text class="rt" x="44" y="16" fill="#fff" font-size="48" font-weight="800">Grabando</text></g><text x="1740" y="320" text-anchor="end" fill="${P.soft}" font-size="40" font-weight="800">Hipocampo</text>`,
      dom: el => m === 'rec' ? heads(el, hs, 210, 780, 1500, 84, [P.cyan, P.pink]) : null,
      plan: d => ({ h: headTimes(sc, Math.max(1, hs.length), d), d }),
      build: (tl, q, qa, T, d, hd) => { tl.from(q('svg g'), { opacity: 0, duration: .4 }, 0);
        if (m === 'laguna') { const bb = beatsOf(sc, d), tA = bb[1] != null ? bb[1] + .5 : 1.5, tB = bb[2] != null ? bb[2] : Math.max(tA + 2, d * .6); // cada barra surt amb la seva frase
          tl.from(q('.bg'), { scale: .6, opacity: 0, transformOrigin: '960px 380px', duration: .5, ease: 'back.out(2)' }, .2).to(q('.b2'), { attr: { width: 1120 }, duration: 1, ease: 'power2.out' }, tA).to(q('.b1'), { attr: { width: 560 }, duration: .8, ease: 'power2.out' }, tB)
            .fromTo(q('.bg'), { scale: 1 }, { scale: 1.08, transformOrigin: '960px 380px', duration: .25, yoyo: true, repeat: 1 }, tA); }
        if (m === 'tipos') { tl.to(q('.t1'), { opacity: 1, duration: .3 }, T.h[0] || 0).to(q('.t2'), { opacity: 1, duration: .3 }, T.h[1] != null ? T.h[1] : d * .5); }
        if (hd) headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q, qa) => { const stopT = m === 'rec' ? (T.h[1] != null ? T.h[1] : d * .5) : -1, spd = 140;
        ['s1', 's2'].forEach((s, si) => { const g = q('.' + s); if (!g) return; const y = +g.querySelector('rect').getAttribute('y'), hh = +g.querySelector('rect').getAttribute('height'), fw = hh * 1.25 + 40;
          g.querySelectorAll('.hole').forEach((h, k) => h.setAttribute('x', px(((k * 80 - lt * spd) % 2400 + 2400) % 2400 - 200)));
          g.querySelectorAll('.fr').forEach(f => { const i = +f.dataset.i, span = 8 * fw, x = ((i * fw - lt * spd) % span + span) % span - fw, born = lt + (x - 1700) / spd; // moment en què el fotograma ha passat pel «capçal» (dreta)
            f.querySelector('rect').setAttribute('x', px(x)); const cx = x + hh * .625; f.querySelector('.ic').setAttribute('transform', `translate(${px(cx)} ${px(y + hh / 2)})`); f.querySelector('.qq').setAttribute('x', px(cx)); f.querySelector('.qq').setAttribute('y', px(y + hh / 2 + hh * .14));
            let blank = m === 'laguna' || (m === 'tipos' && (si === 1 || i % 3 !== 0)) || (m === 'rec' && born > stopT && lt > stopT - .1);
            f.querySelector('.ic').setAttribute('opacity', blank ? 0 : 1); f.querySelector('.qq').setAttribute('opacity', blank ? 1 : 0); f.querySelector('rect').setAttribute('fill', blank ? '#121A86' : '#2B3BC8'); }); });
        const r = q('.rec'); if (r) { const stopped = lt > stopT; r.querySelector('.dot').setAttribute('fill', stopped ? '#4553C8' : P.pink); r.querySelector('.dot').setAttribute('opacity', stopped ? 1 : (Math.floor(lt * 2) % 2 ? 1 : .35)); r.querySelector('.rt').textContent = stopped ? 'Sin grabar' : 'Grabando'; } },
      sfx: (T, d) => m === 'rec' ? [['click', T.h[1] != null ? T.h[1] : d * .5]] : m === 'laguna' ? [['blip', .9], ['blip', 1.5]] : []
    });
  };

  // ---------------------------------------------------------------------------------------------
  // COLA: el fetge treballa a ritme fix: molècules d'alcohol en fila sobre una cinta que entren al fetge d'una en una.
  // { big, label } (xifra), modo: fila | quimica (alcohol → acetaldehído → acetato) | cafe (un cafè empeny i la fila no s'accelera)
  S.cola = (sc) => {
    const m = sc.modo || 'num', hs = sc.heads || [], LX = 1420, LY = m === 'quimica' ? 660 : 600, LR = m === 'quimica' ? 240 : 280, BY = 790;
    return mk(sc, {
      svg: u => `<g class="plant"><circle cx="${LX}" cy="${LY}" r="${LR}" fill="#3B5BFF" opacity=".5"/><g class="liv">${organ('higado', LX - LR * .82, LY - LR * .72, LR * 1.64, LR * 1.43)}</g>
        <rect x="260" y="${BY}" width="940" height="34" rx="17" fill="#9FB0FF"/>${[...Array(10)].map((_, k) => `<circle class="rl" cx="${300 + k * 90}" cy="${BY + 17}" r="12" fill="${P.mid}"/>`).join('')}
        ${[...Array(9)].map(() => `<g class="mo"><path d="M0,-50 C26,-24 50,0 50,24 C50,54 26,70 0,70 C-26,70 -50,54 -50,24 C-50,0 -26,-24 0,-50Z" fill="${P.orange}" stroke="#fff" stroke-width="5"/></g>`).join('')}</g>
        ${m === 'cafe' ? `<g class="cup"><path d="M-60,-100 L60,-100 L48,0 L-48,0Z" fill="#fff"/><path d="M58,-80 C100,-80 100,-30 52,-30" stroke="#fff" stroke-width="14" fill="none"/><rect x="-60" y="-62" width="120" height="20" fill="${P.pink}"/></g>
          <g transform="translate(1420 960)"><rect x="-190" y="-50" width="380" height="80" rx="40" fill="${P.deep}"/><text y="8" text-anchor="middle" fill="#fff" font-size="44" font-weight="800">Velocidad: <tspan fill="${P.yellow}">× 1</tspan></text></g>` : ''}
        ${m === 'num' ? `<text x="220" y="430" style="${FD}" font-size="220" fill="${P.yellow}" filter="url(#${u}k)">${sc.big || ''}</text><text x="230" y="510" fill="#fff" font-size="56" font-weight="800">${sc.label || ''}</text>
          <g transform="translate(700 340)"><circle r="70" fill="#EEF1FF" stroke="#4553C8" stroke-width="10"/><line class="hand" x1="0" y1="0" x2="0" y2="-50" stroke="${P.ink}" stroke-width="8" stroke-linecap="round"/></g>` : ''}
        ${m === 'quimica' ? `<g class="ch">${[['Alcohol', P.orange, ''], ['Acetaldehído', P.pink, 'tóxico'], ['Acetato', P.soft, 'mucho menos dañino']].map(([t, c, s], i) => `<g transform="translate(${360 + i * 520} 300)"><g class="k${i}"><rect x="-190" y="-54" width="380" height="108" rx="30" fill="${c}"/><text y="16" text-anchor="middle" style="${FD}" font-size="56" fill="${c === P.soft ? P.ink : '#fff'}">${t}</text>${s ? `<text y="96" text-anchor="middle" fill="${c === P.soft ? P.cyan : P.pink}" font-size="40" font-weight="800">${s}</text>` : ''}</g></g>${i < 2 ? `<path d="M${360 + i * 520 + 200},300 h100" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M${360 + i * 520 + 320},300 l-22,-17 v34Z" fill="#fff"/>` : ''}`).join('')}</g>` : ''}`,
      dom: el => (m === 'fila' || m === 'cafe') ? heads(el, hs, 210, 300, 1000, 88, [P.yellow, P.cyan]) : null,
      plan: d => ({ h: headTimes(sc, Math.max(1, hs.length), d), d }),
      build: (tl, q, qa, T, d, hd) => { tl.from(q('.liv'), { opacity: 0, scale: .85, transformOrigin: `${LX}px ${LY}px`, duration: .5 }, 0);
        if (m === 'quimica') { const tP = (T.h[1] != null ? T.h[1] : d * .6) + .5; tl.from(q('.plant'), { opacity: 0, duration: .5 }, tP).fromTo(q('.ch'), { y: 260 }, { y: 0, duration: .6, ease: 'power2.inOut' }, tP - .3); tl.from(q('.k0'), { opacity: 0, y: 30, duration: .4 }, .2).from(q('.k1'), { opacity: 0, y: 30, duration: .4, ease: 'back.out(2)' }, T.h[0] + .2).from(q('.k2'), { opacity: 0, y: 30, duration: .4, ease: 'back.out(2)' }, T.h[1] != null ? T.h[1] : d * .6); }
        if (hd) headsTL(tl, hd, hs.length, T.h); },
      tick: (lt, d, T, q, qa) => { const per = 1.7, gap = 125, n = 9;
        qa('.mo').forEach((g, k) => { const pos = ((k * gap + (lt / per) * gap) % (n * gap)), x = 310 + pos, inL = x > 1150; const s = inL ? Math.max(0, 1 - (x - 1150) / 100) : 1;
          let fill = P.orange; if (m === 'quimica' && inL) fill = x > 1200 ? P.soft : P.pink;
          g.setAttribute('transform', `translate(${px(inL ? lerp2(x, 1150, LX - 120) : x)} ${px(inL ? BY - 70 - (x - 1150) * 1.5 : BY - 72)}) scale(${px(s)})`); g.querySelector('path').setAttribute('fill', fill); });
        qa('.rl').forEach((r, k) => r.setAttribute('transform', `rotate(${px(lt * 120)} ${300 + k * 90} ${BY + 17})`));
        const hand = q('.hand'); if (hand) hand.setAttribute('transform', `rotate(${px(lt * 40)})`);
        const cup = q('.cup'); if (cup) { const b = Math.max(0, Math.sin(lt * 3)); cup.setAttribute('transform', `translate(${px(285 + b * 40)} ${BY - 4}) rotate(${px(-b * 8)})`); }
        q('.liv').setAttribute('transform', `translate(${LX} ${LY}) scale(${(1 + .02 * Math.sin(lt * 2)).toFixed(3)}) translate(${-LX} ${-LY})`); },
      sfx: (T, d) => { const ev = []; for (let t = .8; t < d - .3; t += 1.7) ev.push(['pop', t]); return ev; }
    });
  };
  const lerp2 = (x, a, b) => b;
})();
