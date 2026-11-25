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
