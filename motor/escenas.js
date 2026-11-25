// Cuerpo al Límite — escenes detallades: situacions (coche, cama, escritorio) i escàner.
// Es carrega després de lib.js i en substitueix S.situacion. Lloc nou: LUG.<nom> = (sc, f) => ({ el, render(lt, d), sfx(a, b) }).
// sfx(a, b) retorna efectes de so amb temps absoluts: {t, k} o {t, d, k} (vegeu render_video.py).
(function () {
  const M = window.Motor, S = M.S, { E, eo, eio, prog, back, lerp, clamp, rnd, C, FD, lab } = M.h;
  const W = 1920, H = 1080, SK = '#EBAA80', SD = '#C98058', INK = '#0B0F4A';
  const nl = s => (s || '').replace(/\n/g, '<br>');
  const fatOf = sc => sc.fatigue != null ? sc.fatigue : (sc.hour || 0) / ((window.VIDEO && window.VIDEO.hud && window.VIDEO.hud.max) || 72);
  const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };
  const R = (svg, lt, f, mood, o) => M.personRender(svg, lt, f, mood, o);
  const addHead = (svg, extra) => { const h = svg.querySelector('.head'); h.setAttribute('transform', h.getAttribute('transform') + ' ' + extra); };
  const LUG = {};

  // adhesiu blanc amb hora, etiqueta i frase (el mateix a totes les situacions)
  const CLK = `<svg width="36" height="36" viewBox="0 0 34 34" style="flex:none"><circle cx="17" cy="17" r="13" fill="none" stroke="currentColor" stroke-width="4"/><path d="M17,9 V17 L23,21" stroke="currentColor" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
  function sticker(el, sc, x, y, w, alarm) {
    if (!sc.label && !sc.sub && !sc.time) return () => {};
    x = Math.min(x, 1790 - w); if (window.VIDEO && window.VIDEO.vertical) x = Math.min(x, 1780 - w); // al Short la vora dreta queda fora
    const h = E('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;box-sizing:border-box;background:#fff;border-radius:26px;padding:24px 32px 28px;box-shadow:12px 12px 0 rgba(7,11,69,.5);color:${INK};transform-origin:30% 60%;opacity:0`);
    h.dataset.ovl = 1;
    h.innerHTML = (sc.time ? `<div style="display:inline-flex;align-items:center;gap:12px;background:${INK};color:${C.yellow};border-radius:12px;padding:2px 18px 6px;font-size:46px;${FD}">${CLK}${sc.time}</div>` : '') +
      (sc.label ? `<div style="color:${alarm ? C.pink : '#2B3FE6'};font-size:40px;font-weight:800;margin-top:${sc.time ? 14 : 0}px">${lab(sc.label)}</div>` : '') +
      (sc.sub ? `<div style="font-size:48px;font-weight:800;line-height:1.12;margin-top:6px">${nl(sc.sub)}</div>` : '');
    el.appendChild(h);
    return lt => { const u = prog(lt, .5, .27), sc2 = u < .6 ? lerp(.55, 1.08, eo(u / .6)) : lerp(1.08, 1, eio((u - .6) / .4));
      h.style.opacity = lt >= .5 ? 1 : 0; h.style.transform = `rotate(${lerp(-3, -1.5, u).toFixed(2)}deg) scale(${sc2.toFixed(3)})`; };
  }

  // ================= COTXE: vista frontal, carretera en perspectiva, el Tito al volant =================
  LUG.coche = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden');
    const VX = 1010, VY = 470, FOC = 1100, CH = .55, ZN = .9, ZF = 26, L = ZF - ZN, SPD = 5.2, RW = 1.5, CX = 800, GY = 1050;
    const R0 = rnd(11), px = n => n.toFixed(1);
    let stars = ''; for (let i = 0; i < 70; i++) stars += `<circle cx="${px(R0() * W)}" cy="${px(R0() * (VY - 70))}" r="${px(1 + R0() * 2)}" fill="#fff" opacity="${(.3 + R0() * .6).toFixed(2)}"/>`;
    let city = ''; for (let x = 1180; x < 1780;) { const w = 34 + R0() * 60, h = 30 + R0() * 80; city += `<rect x="${px(x)}" y="${px(VY - h)}" width="${px(w)}" height="${px(h + 2)}" fill="#1A2499"/>`; for (let k = 0; k < 5; k++) if (R0() < .55) city += `<rect x="${px(x + 5 + R0() * (w - 12))}" y="${px(VY - h + 6 + R0() * (h - 14))}" width="5" height="6" fill="#FFE9A8" opacity=".85"/>`; x += w + 4 + R0() * 22; }
    const YB = H + 60, zb = CH * FOC / (YB - VY), xr = RW * FOC / zb, xe = RW * .93 * FOC / zb;
    const bg = E('div', `position:absolute;inset:0;transform-origin:${VX}px ${VY}px`);
    bg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><defs>
      <linearGradient id="csk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060A40"/><stop offset=".75" stop-color="#1F2FC8"/><stop offset="1" stop-color="#3B5BFF"/></linearGradient>
      <linearGradient id="crd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3442B8"/><stop offset=".22" stop-color="#1E278F"/><stop offset="1" stop-color="#11166A"/></linearGradient>
      <radialGradient id="cmn"><stop offset=".38" stop-color="#FFF4B3" stop-opacity=".45"/><stop offset="1" stop-color="#FFF4B3" stop-opacity="0"/></radialGradient></defs>
      <rect x="-300" y="-300" width="${W + 600}" height="${VY + 302}" fill="url(#csk)"/>${stars}
      <circle cx="1600" cy="300" r="160" fill="url(#cmn)"/><circle cx="1600" cy="300" r="60" fill="#FFF4B3"/><circle cx="1582" cy="284" r="12" fill="#EFE29A"/><circle cx="1620" cy="318" r="8" fill="#EFE29A"/><circle cx="1614" cy="274" r="6" fill="#EFE29A"/>
      <path d="M-300,${VY} L-300,${VY - 40} C200,${VY - 120} 520,${VY - 30} 820,${VY - 62} C1100,${VY - 100} 1400,${VY - 34} 2220,${VY - 86} L2220,${VY}Z" fill="#1A2499" opacity=".7"/>${city}
      <rect x="-300" y="${VY}" width="${W + 600}" height="${H - VY + 300}" fill="#0D1470"/>
      <path d="M${px(VX - xr)},${YB} L${px(VX + xr)},${YB} L${VX + 5},${VY} L${VX - 5},${VY}Z" fill="url(#crd)"/>
      <path d="M${px(VX - xe)},${YB} L${VX - 4},${VY} M${px(VX + xe)},${YB} L${VX + 4},${VY}" stroke="#D3DAFF" stroke-width="9" opacity=".5"/>
      <g class="dash"></g><g class="obj"></g></svg>`;
    el.appendChild(bg);
    // objectes de la vora (unitats ×100, origen a la base)
    const tree = k => k ? `<rect x="-8" y="-50" width="16" height="52" fill="#0B0F4A"/><circle cy="-112" r="64" fill="#123A8C"/><circle cx="-20" cy="-132" r="40" fill="#1A4FB0"/><circle cx="22" cy="-98" r="34" fill="#164496"/>`
      : `<rect x="-7" y="-40" width="14" height="42" fill="#0B0F4A"/><path d="M-54,-34 L0,-162 L54,-34Z" fill="#123A8C"/><path d="M-42,-94 L0,-208 L42,-94Z" fill="#1A4FB0"/><path d="M0,-208 L42,-94 L10,-94Z" fill="#123A8C" opacity=".6"/>`;
    const lamp = s => `<ellipse cx="${-s * 70}" cy="0" rx="130" ry="18" fill="#FFF4B3" opacity=".16"/><rect x="-5" y="-280" width="10" height="282" fill="#5563D8"/><path d="M0,-276 Q0,-298 ${-s * 52},-298" stroke="#5563D8" stroke-width="9" fill="none"/><ellipse cx="${-s * 58}" cy="-293" rx="22" ry="9" fill="#FFF4B3"/><circle cx="${-s * 58}" cy="-286" r="48" fill="#FFF4B3" opacity=".22"/>`;
    const house = k => { const c = ['#FF3B6B', '#4A68FF', '#FF6E8F', '#2B3FE6'][k % 4], w = 170 + (k % 3) * 30;
      return `<rect x="${-w / 2}" y="-120" width="${w}" height="122" fill="#2B3BC8"/><rect x="${-w / 2}" y="-120" width="${w * .45}" height="122" fill="#3647D8"/><path d="M${-w / 2 - 14},-118 L0,-192 L${w / 2 + 14},-118Z" fill="${c}"/><path d="M0,-192 L${w / 2 + 14},-118 L${w * .1},-118Z" fill="${INK}" opacity=".25"/>` +
        `<rect x="${-w / 2 + 22}" y="-92" width="34" height="34" rx="4" fill="${k % 2 ? '#FFE9A8' : INK}"/><rect x="${w / 2 - 56}" y="-92" width="34" height="34" rx="4" fill="${k % 3 ? '#FFE9A8' : INK}"/><rect x="-16" y="-62" width="32" height="64" rx="4" fill="${INK}"/>`; };
    const OB = [];
    for (let i = 0; i < 16; i++) OB.push({ X: (i % 2 ? 1 : -1) * (2.0 + R0() * .9), z0: i * L / 16 + R0() * .8, html: tree(i % 3 === 0) });
    for (let i = 0; i < 4; i++) { const s = i % 2 ? 1 : -1; OB.push({ X: s * 1.75, z0: i * L / 4 + 2, html: lamp(s) }); }
    for (let i = 0; i < 6; i++) OB.push({ X: (i % 2 ? 1 : -1) * (3.6 + R0() * .6), z0: i * L / 6 + 1.3, html: house(i) });
    const og = bg.querySelector('.obj'); OB.forEach(o => { o.g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); o.g.innerHTML = o.html; og.appendChild(o.g); });
    const dash = bg.querySelector('.dash'); const NDS = 18, PD = L / NDS;
    for (let k = 0; k < NDS; k++) dash.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path')).setAttribute('fill', '#FFD60A');
    // cotxe (origen al terra, al centre del cotxe). El Tito seu al lloc del conductor (a la dreta de la imatge)
    const TW = 255, ts = TW / 400, tx = 190 - TW / 2, ty = -745 - 68 * ts, PX = CX + 190, PY = GY + ty + 210 * ts;
    const car = E('div', `position:absolute;inset:0;transform-origin:${PX}px ${PY}px`);
    const mir = s => `<path d="M${s * 466},-500 L${s * 516},-522" stroke="#C7D0FF" stroke-width="16"/><ellipse cx="${s * 560}" cy="-532" rx="66" ry="44" fill="#EEF1FF"/><ellipse cx="${s * 562}" cy="-532" rx="46" ry="28" fill="#2B3FE6"/>`;
    const hl = s => `<path transform="scale(${s} 1)" d="M-556,-330 C-552,-300 -530,-272 -490,-266 L-340,-270 C-322,-272 -316,-290 -322,-306 L-336,-336 C-340,-344 -350,-348 -360,-348 L-520,-350 C-544,-350 -558,-344 -556,-330Z" fill="#FFF4B3"/><circle cx="${s * 420}" cy="-306" r="26" fill="#fff"/>`;
    car.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><defs>
      <clipPath id="cws"><path d="M-430,-450 L430,-450 L330,-760 L-330,-760Z"/></clipPath>
      <radialGradient id="cgl"><stop offset="0" stop-color="#FFF8CC" stop-opacity=".9"/><stop offset=".3" stop-color="#FFF4B3" stop-opacity=".32"/><stop offset="1" stop-color="#FFF4B3" stop-opacity="0"/></radialGradient>
      <linearGradient id="csw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFE9A8" stop-opacity="0"/><stop offset=".5" stop-color="#FFE9A8" stop-opacity=".34"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></linearGradient></defs>
      <g class="rig"><ellipse cx="0" cy="0" rx="650" ry="40" fill="#050838" opacity=".6"/><ellipse cx="0" cy="50" rx="900" ry="130" fill="#FFF4B3" opacity=".07"/>
       <rect x="-575" y="-160" width="135" height="170" rx="26" fill="${INK}"/><rect x="440" y="-160" width="135" height="170" rx="26" fill="${INK}"/>
       <path d="M-610,-100 C-618,-200 -606,-290 -566,-350 L-510,-410 L510,-410 L566,-350 C606,-290 618,-200 610,-100 C608,-66 588,-52 560,-52 L-560,-52 C-588,-52 -608,-66 -610,-100Z" fill="#EEF1FF"/>
       <path d="M-610,-130 C-612,-110 -608,-80 -596,-66 C-588,-56 -575,-52 -560,-52 L560,-52 C575,-52 588,-56 596,-66 C608,-80 612,-110 610,-130Z" fill="#C7D0FF"/>
       <path d="M-510,-410 L510,-410 L446,-452 L-446,-452Z" fill="#DCE2FF"/><path d="M-560,-344 C-420,-370 420,-370 560,-344" stroke="#C7D0FF" stroke-width="8" fill="none"/>
       <rect x="-240" y="-320" width="480" height="112" rx="36" fill="#2433C4"/><path d="M-206,-290 H206 M-214,-264 H214 M-206,-238 H206" stroke="#1A2499" stroke-width="9" stroke-linecap="round"/>
       <circle cx="0" cy="-264" r="27" fill="#FF3B6B"/><text class="deco" x="0" y="-252" text-anchor="middle" font-family="Brico" font-weight="800" font-size="34" fill="#fff">T</text>
       ${hl(1)}${hl(-1)}
       <rect x="-612" y="-196" width="1224" height="44" rx="22" fill="#C7D0FF"/><circle cx="-505" cy="-174" r="14" fill="#FFE9A8"/><circle cx="505" cy="-174" r="14" fill="#FFE9A8"/>
       <rect x="-96" y="-188" width="192" height="58" rx="10" fill="#fff" stroke="#9FB0FF" stroke-width="4"/><text class="deco" x="0" y="-144" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="42" fill="${INK}">TITO</text>
       ${mir(-1)}${sc.label || sc.sub ? '' : mir(1)}
       <g clip-path="url(#cws)">
        <rect x="-440" y="-780" width="880" height="340" fill="#0A1060"/><rect x="-440" y="-780" width="880" height="56" fill="#1A2499"/>
        <rect x="-300" y="-616" width="200" height="200" rx="40" fill="#1E2BB0"/><rect x="-266" y="-702" width="132" height="96" rx="30" fill="#2433C4"/><rect x="124" y="-716" width="140" height="100" rx="30" fill="#2433C4"/>
        <g transform="translate(${tx} ${ty})">${M.personSVG(TW)}</g>
        <path d="M-430,-452 L430,-452 L418,-488 C200,-502 -200,-502 -418,-488Z" fill="#141B7A"/><path d="M-418,-488 C-200,-502 200,-502 418,-488" stroke="#2B3BC8" stroke-width="6" fill="none"/>
        <rect x="-6" y="-772" width="12" height="40" fill="${INK}"/><rect x="-82" y="-744" width="164" height="44" rx="14" fill="${INK}"/><rect x="-70" y="-736" width="140" height="28" rx="9" fill="#3B5BFF" opacity=".6"/>
        <g class="fresh"><path d="M0,0 L0,44" stroke="#fff" stroke-width="3"/><path d="M0,40 L-20,70 L-10,70 L-26,96 L26,96 L10,70 L20,70Z" fill="#FF3B6B"/></g>
        <rect class="sweep" x="-300" y="-780" width="300" height="340" fill="url(#csw)"/>
        <path d="M-150,-780 L-60,-780 L-240,-440 L-330,-440Z" fill="#fff" opacity=".09"/><path d="M-30,-780 L0,-780 L-180,-440 L-210,-440Z" fill="#fff" opacity=".07"/>
       </g>
       <path d="M-472,-452 L-368,-772 L-324,-772 L-428,-452Z" fill="#EEF1FF"/><path d="M472,-452 L368,-772 L324,-772 L428,-452Z" fill="#DCE2FF"/>
       <path d="M-372,-770 C-360,-808 360,-808 372,-770 L330,-760 L-330,-760Z" fill="#EEF1FF"/><path d="M-438,-447 L438,-447" stroke="#C7D0FF" stroke-width="10"/>
       <path d="M-390,-458 L-60,-478 M40,-458 L370,-478" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
       <g class="glow"><circle cx="-440" cy="-306" r="230" fill="url(#cgl)"/><circle cx="440" cy="-306" r="230" fill="url(#cgl)"/></g>
      </g></svg>`;
    el.appendChild(car);
    const rig = car.querySelector('.rig'), tsvg = car.querySelector('svg.tito'), sweep = car.querySelector('.sweep'), fresh = car.querySelector('.fresh'), glow = car.querySelector('.glow');
    const micro = !!sc.microsueno, P = 4.2, U0 = .8;
    const st = sticker(el, sc, 1320, 620, 470, micro);
    const phase = lt => { if (!micro || lt < U0) return { n: 0, j: 0 }; const u = (lt - U0) % P;
      return u < 2.4 ? { n: eio(u / 2.4), j: 0 } : u < 2.9 ? { n: 1 - eo((u - 2.4) / .25), j: 1 - (u - 2.4) / .5 } : { n: 0, j: 0 }; };
    return { el, render(lt, d) {
      const { n, j } = phase(lt);
      const zm = sc.plano === 'abierto' ? 0 : sc.plano === 'cerca' ? 1 : eio(prog(lt, .9, Math.min(2.2, Math.max(1, d * .4)))), push = sc.plano === 'cerca' ? .08 * eio(prog(lt, 0, d)) : 0;
      bg.style.transform = `scale(${1 + .12 * zm})`;
      car.style.transform = `scale(${1 + .7 * zm + push})`;
      OB.forEach(o => { o.z = ZN + ((o.z0 + SPD * lt) % L); const s = FOC / o.z;
        o.g.setAttribute('transform', `translate(${px(VX + o.X * s)} ${px(VY + CH * s)}) scale(${(s / 100).toFixed(4)})`);
        o.g.setAttribute('opacity', (clamp((ZF - o.z) / 5) * clamp((o.z - ZN) / .5)).toFixed(3)); });
      OB.slice().sort((a, b) => b.z - a.z).forEach(o => og.appendChild(o.g));
      [...dash.children].forEach((p, k) => { const z1 = ZN + ((k * PD + SPD * lt) % L), z2 = z1 + .55, a = FOC / z1, b = FOC / z2, w = .04;
        p.setAttribute('d', `M${px(VX - w * a)},${px(VY + CH * a)} L${px(VX + w * a)},${px(VY + CH * a)} L${px(VX + w * b)},${px(VY + CH * b)} L${px(VX - w * b)},${px(VY + CH * b)}Z`);
        p.setAttribute('opacity', (.85 * clamp((ZF - z1) / 6)).toFixed(3)); });
      const dx = -n * 170 + (j > 0 ? Math.sin(j * 9) * 40 * j : 0) + Math.sin(lt * .7) * 8, sh = j > 0 ? j : 0;
      const vib = Math.sin(lt * 31) * 1.3 + Math.max(0, Math.sin(lt * 2.3)) ** 12 * 5;
      rig.setAttribute('transform', `translate(${px(CX + dx + Math.sin(lt * 83) * 7 * sh)} ${px(GY + vib + Math.cos(lt * 71) * 5 * sh)}) rotate(${(-n * 1.6 + Math.sin(lt * 61) * sh).toFixed(2)})`);
      fresh.setAttribute('transform', `translate(44 -700) rotate(${(Math.sin(lt * 2.4) * 9 + n * 14 - j * 20).toFixed(1)})`);
      const ph = (lt % 1.7) / .55; sweep.setAttribute('x', px(300 - 900 * clamp(ph))); sweep.setAttribute('opacity', ph < 1 ? 1 : 0);
      glow.setAttribute('opacity', .85 + .15 * Math.sin(lt * 5));
      const mood = j > .05 ? 'shock' : n > .72 ? 'sleep' : (sc.mood || 'tired');
      R(tsvg, lt, micro ? Math.max(f, .62 + .38 * n) : f, mood, { pose: 'wheel', seed: .4 });
      if (n > 0) addHead(tsvg, `translate(0 ${(n * 20).toFixed(1)}) rotate(${(-n * 11).toFixed(1)} 201 300)`);
      st(lt);
    }, sfx(a, b) { const ev = [{ t: a, d: b - a, k: 'car' }]; if (micro) for (let x = a + U0 + 2.4; x < b - .3; x += P) ev.push({ t: x, k: 'rumble' }); return ev; } };
  };

  // ================= LLIT: vista zenital, el Tito estirat, lluna per la finestra =================
  LUG.cama = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden');
    const mood = sc.mood || 'tired', sleep = mood === 'sleep', hh = parseInt(sc.time || '3', 10), dia = sc.dia != null ? sc.dia : hh >= 6 && hh < 19, phoneHand = !sleep && sc.movil != null ? sc.movil : !sleep && !dia;
    let fl = ''; for (let i = 0; i < 17; i++) { fl += `<rect x="${i * 120}" y="0" width="120" height="${H}" fill="${i % 2 ? '#18228E' : '#1B269A'}"/><rect x="${i * 120}" y="0" width="3" height="${H}" fill="#111A7C"/>`; for (let k = 0; k < 3; k++) fl += `<rect x="${i * 120}" y="${(i * 337 + k * 397) % H}" width="120" height="4" fill="#111A7C"/>`; }
    const bg = E('div', 'position:absolute;inset:0');
    bg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${fl}
      <rect x="250" y="760" width="1260" height="420" rx="60" fill="#B79CFF" opacity=".22"/><rect x="280" y="790" width="1200" height="360" rx="44" fill="none" stroke="#B79CFF" stroke-width="6" opacity=".3"/>
      <g transform="translate(300 820) rotate(-12)"><rect x="-40" y="-26" width="80" height="52" rx="26" fill="#FF3B6B"/><rect x="-34" y="-20" width="34" height="40" rx="17" fill="#C81E4F"/></g><g transform="translate(330 900) rotate(-4)"><rect x="-40" y="-26" width="80" height="52" rx="26" fill="#FF3B6B"/><rect x="-34" y="-20" width="34" height="40" rx="17" fill="#C81E4F"/></g>
      <rect x="462" y="200" width="796" height="980" rx="28" fill="#2433C4"/><rect x="484" y="246" width="752" height="934" rx="16" fill="#EEF1FF"/>
      <rect x="446" y="192" width="828" height="62" rx="22" fill="#5B7BFF"/><rect x="460" y="198" width="800" height="14" rx="7" fill="#8FA8FF"/>
      <rect x="606" y="262" width="508" height="214" rx="70" fill="#D3DAFF"/><rect x="600" y="256" width="508" height="206" rx="70" fill="#fff"/><path d="M640,300 C700,280 760,292 790,312 M1060,296 C1010,282 960,290 930,306" stroke="#E4E8FF" stroke-width="10" fill="none" stroke-linecap="round"/>
      <rect x="1290" y="290" width="250" height="280" rx="18" fill="#1E2BB0"/><rect x="1302" y="300" width="226" height="256" rx="12" fill="#2B3BC8"/>
      <circle cx="1362" cy="370" r="62" fill="#EEF1FF"/><circle cx="1362" cy="370" r="40" fill="none" stroke="#C7D0FF" stroke-width="6"/><circle cx="1362" cy="370" r="10" fill="#C7D0FF"/>
      <rect x="1314" y="446" width="200" height="88" rx="16" fill="${INK}"/><text class="clk" x="1414" y="508" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="60" fill="#FF3B6B">${sc.time || ''}</text>
      <g class="ph2" opacity="${sleep ? 1 : 0}"><rect x="1446" y="318" width="64" height="112" rx="13" fill="${INK}"/><rect class="scr2" x="1452" y="328" width="52" height="92" rx="8" fill="#3EF0FF" opacity="0"/><circle class="gl2" cx="1478" cy="374" r="120" fill="#3EF0FF" opacity="0"/></g></svg>`;
    el.appendChild(bg);
    const TW = 440, s = TW / 400, TL = 860 - TW / 2, TT = 165;
    const tito = E('div', `position:absolute;left:${TL}px;top:${TT}px`); tito.innerHTML = M.personSVG(TW); el.appendChild(tito);
    const face = E('div', `position:absolute;left:${TL + 60}px;top:${TT + 90}px;width:320px;height:380px;background:radial-gradient(ellipse at 50% 78%,rgba(62,240,255,.5),rgba(62,240,255,0) 62%);mix-blend-mode:screen;opacity:0`); el.appendChild(face);
    const arm = (d, w) => `<path d="${d}" fill="none" stroke="${SD}" stroke-width="${w + 9}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${SK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="30" fill="${SK}"/><path d="M${x - 14},${y + 10} Q${x},${y + 19} ${x + 14},${y + 10}" stroke="${SD}" stroke-width="3" fill="none"/>`;
    const fg = E('div', 'position:absolute;inset:0');
    fg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><g class="bl"><g transform="translate(0 -46)">
      <path d="M478,646 C640,632 1080,632 1242,646 L1242,1120 L478,1120Z" fill="#7FB2FF"/>
      <path d="M700,700 C688,820 724,1000 752,1120 L968,1120 C996,1000 1032,820 1020,700Z" fill="#9CC4FF" opacity=".6"/>
      <path d="M860,880 C862,960 860,1040 858,1120" stroke="#6A9DF5" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M478,820 H700 M1020,820 H1242 M478,940 H720 M1000,940 H1242 M478,1060 H740 M980,1060 H1242" stroke="#6E9EF0" stroke-width="10" opacity=".5"/>
      <path d="M478,632 C640,618 1080,618 1242,632 L1242,700 C1080,688 640,688 478,700Z" fill="#EEF1FF"/><path d="M478,690 C640,678 1080,678 1242,690" stroke="#9FB0FF" stroke-width="10" fill="none"/>
      ${arm('M756,700 C716,770 712,836 774,874', 46)}${hand(790, 880)}<path d="M760,690 L748,736" stroke="#FF3B6B" stroke-width="62" stroke-linecap="round"/>
      ${phoneHand ? arm('M962,700 C998,780 978,826 920,812', 46) + `<g transform="translate(904 800) rotate(-18)"><circle r="150" fill="#3EF0FF" opacity=".16"/><rect x="-36" y="-60" width="72" height="120" rx="14" fill="${INK}"/><circle cx="-16" cy="-40" r="6" fill="#2B3BC8"/></g>` + hand(924, 820)
        : arm('M964,700 C1004,770 1008,836 946,874', 46) + hand(930, 880)}<path d="M960,690 L972,736" stroke="#FF3B6B" stroke-width="62" stroke-linecap="round"/>
      </g></g>
      <path class="moon" d="M0,170 L520,110 C700,500 900,800 1060,1080 L0,1080Z" fill="${dia ? '#FFE07A' : '#D9E6FF'}" opacity=".09"/>
      <path d="M262,140 C420,480 560,800 700,1080" stroke="#0B0F4A" stroke-width="26" opacity=".1" fill="none"/><path d="M0,620 C300,590 520,570 760,560" stroke="#0B0F4A" stroke-width="22" opacity=".1" fill="none"/></svg>`;
    el.appendChild(fg);
    const bl = fg.querySelector('.bl'), mn = fg.querySelector('.moon'), clk = bg.querySelector('.clk'), scr2 = bg.querySelector('.scr2'), gl2 = bg.querySelector('.gl2'), ph2 = bg.querySelector('.ph2');
    const ck = bg.querySelector('.clk').parentNode, st = sticker(el, { label: sc.label, sub: sc.sub }, 1290, 640, 500, false), buzz = lt => { const u = (lt - 1.6) % 3.4; return lt > 1.6 && u < 1.3 ? 1 - u / 1.3 : 0; };
    return { el, render(lt) {
      bl.setAttribute('transform', `translate(0 ${(Math.sin(lt * 1.6) * 3).toFixed(2)})`);
      mn.setAttribute('opacity', ((dia ? .2 : .08) + .025 * Math.sin(lt * .7)).toFixed(3));
      const ring = sc.alarma && lt < 2.6 ? 1 : 0; ck.setAttribute('transform', ring ? `translate(${(Math.sin(lt * 90) * 6).toFixed(1)} 0) rotate(${(Math.sin(lt * 70) * 1.5).toFixed(2)} 1414 430)` : '');
      if (clk && sc.time) clk.textContent = sc.time.replace(':', Math.floor(lt * 2) % 2 ? ' ' : ':');
      const tv = tito.firstChild; R(tv, lt, f, mood, { seed: 1.1 });
      if (!sleep) addHead(tv, `rotate(${(Math.sin(lt * .9) * 3).toFixed(2)} 201 300)`);
      face.style.opacity = phoneHand ? (.75 + .25 * Math.sin(lt * 9) * Math.sin(lt * 2.3)).toFixed(2) : 0;
      const b = sleep ? buzz(lt) : 0; scr2.setAttribute('opacity', b); gl2.setAttribute('opacity', b * .25); ph2.setAttribute('transform', b > .6 ? `translate(${Math.sin(lt * 120) * 3} 0)` : '');
      st(lt);
    }, sfx(a, b) { const ev = [{ t: a, d: b - a, k: dia ? 'birds' : 'night' }]; if (sc.alarma) ev.push({ t: a + .1, d: 2.5, k: 'alarm' }); if (sleep) for (let x = a + 1.6; x < b - .4; x += 3.4) ev.push({ t: x, k: 'buzz' }); return ev; } };
  };

  // ================= ESCRIPTORI: el Tito davant la pantalla (la càmera és el monitor) =================
  LUG.escritorio = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden');
    const R0 = rnd(23), pose = sc.pose || 'type';
    let wall = ''; for (let x = 0; x < W; x += 96) wall += `<rect x="${x}" y="0" width="44" height="${H}" fill="#2232C4" opacity=".45"/>`;
    let city = '', wins = 0; const blds = [];
    for (let x = 136; x < 556;) { const w = 50 + R0() * 50, h = 110 + R0() * 230; blds.push([x, w, h]); x += w + 6; }
    blds.forEach(([x, w, h], i) => { city += `<rect x="${x.toFixed(0)}" y="${(680 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="${i % 2 ? '#0E157A' : '#121B88'}"/>`;
      for (let yy = 680 - h + 14; yy < 660; yy += 30) for (let xx = x + 9; xx < x + w - 16; xx += 22) city += `<rect class="cw" data-k="${wins++}" x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="12" height="15" rx="2" fill="#1A2399"/>`; });
    const tall = blds.reduce((a, b) => b[2] > a[2] ? b : a); const ant = [tall[0] + tall[1] / 2, 680 - tall[2]];
    const books = []; for (let x = 1372; x < 1700;) { const w = 30 + R0() * 22, h = 96 + R0() * 40; books.push(`<rect x="${x.toFixed(0)}" y="${(488 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="4" fill="${['#4A68FF', '#EEF1FF', '#2B3FE6', '#FF3B6B', '#9FB0FF', '#EEF1FF', '#3B5BFF'][books.length % 7]}"/><rect x="${(x + 5).toFixed(0)}" y="${(488 - h + 16).toFixed(0)}" width="${(w - 10).toFixed(0)}" height="8" fill="${INK}" opacity=".2"/>`); x += w + 3; }
    const [hh, mm] = (sc.time || '03:00').split(':').map(Number);
    const bg = E('div', 'position:absolute;inset:0');
    bg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><defs><linearGradient id="esk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070B45"/><stop offset="1" stop-color="#2B3FE6"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="#1D2AB8"/>${wall}
      <rect x="130" y="240" width="440" height="440" fill="url(#esk)"/><circle cx="470" cy="318" r="34" fill="#FFF4B3"/><circle cx="458" cy="310" r="7" fill="#EFE29A"/>
      <circle cx="200" cy="300" r="2.5" fill="#fff"/><circle cx="300" cy="270" r="2" fill="#fff"/><circle cx="380" cy="330" r="2.5" fill="#fff"/><circle cx="250" cy="370" r="2" fill="#fff"/>
      ${city}<rect x="${ant[0] - 2}" y="${ant[1] - 40}" width="4" height="40" fill="#121B88"/><circle class="ant" cx="${ant[0]}" cy="${ant[1] - 42}" r="6" fill="#FF3B6B"/>
      <rect x="130" y="240" width="440" height="440" fill="none" stroke="#EEF1FF" stroke-width="20"/><path d="M350,240 V680 M130,460 H570" stroke="#EEF1FF" stroke-width="12"/><rect x="104" y="676" width="492" height="26" rx="8" fill="#EEF1FF"/>
      <path d="M60,226 H640" stroke="#FFD60A" stroke-width="10" stroke-linecap="round"/>
      <g class="cl"><path d="M70,226 L176,226 L170,720 L64,720Z" fill="#FF3B6B"/><path d="M96,232 C92,400 100,560 92,716 M132,232 C140,420 128,560 136,716" stroke="#C81E4F" stroke-width="8" fill="none"/></g>
      <g class="cr"><path d="M524,226 L630,226 L636,720 L530,720Z" fill="#FF3B6B"/><path d="M560,232 C556,400 566,560 558,716 M598,232 C604,420 592,560 600,716" stroke="#C81E4F" stroke-width="8" fill="none"/></g>
      <g transform="translate(640 300) rotate(-6)"><rect width="84" height="84" fill="#FFE9A8"/><path d="M14,30 H66 M14,48 H56" stroke="${INK}" stroke-width="6" opacity=".35"/></g>
      <g transform="translate(652 404) rotate(5)"><rect width="78" height="78" fill="#FF8FAB"/><path d="M14,28 H60 M14,46 H50" stroke="${INK}" stroke-width="6" opacity=".35"/></g>
      <circle cx="1130" cy="330" r="86" fill="#EEF1FF" stroke="#4553C8" stroke-width="12"/>${[...Array(12)].map((_, i) => `<path d="M1130,${330 - 70} V${330 - (i % 3 ? 62 : 56)}" stroke="${INK}" stroke-width="${i % 3 ? 4 : 7}" transform="rotate(${i * 30} 1130 330)"/>`).join('')}
      <line class="hh" x1="1130" y1="330" x2="1130" y2="290" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><line class="mh" x1="1130" y1="330" x2="1130" y2="268" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line class="sh" x1="1130" y1="344" x2="1130" y2="262" stroke="#FF3B6B" stroke-width="3"/><circle cx="1130" cy="330" r="8" fill="#FF3B6B"/>
      <rect x="1352" y="488" width="470" height="24" rx="8" fill="#EEF1FF"/>${books.join('')}
      <g transform="translate(1770 488)"><path d="M-30,-60 L30,-60 L22,0 L-22,0Z" fill="#FF3B6B"/><path d="M0,-60 C-10,-110 -50,-120 -60,-100 C-40,-96 -20,-84 0,-60 M0,-60 C10,-120 50,-130 60,-110 C40,-100 20,-86 0,-60 M0,-60 C0,-130 0,-150 0,-150" stroke="#9FB0FF" stroke-width="12" fill="none" stroke-linecap="round"/></g></svg>`;
    el.appendChild(bg);
    const TW = 420, TL = 820 - TW / 2, TT = 166;
    const tito = E('div', `position:absolute;left:${TL}px;top:${TT}px`); tito.innerHTML = M.personSVG(TW); el.appendChild(tito);
    const face = E('div', `position:absolute;left:${TL + 20}px;top:${TT + 40}px;width:380px;height:480px;background:radial-gradient(ellipse at 50% 46%,rgba(62,240,255,.34),rgba(62,240,255,0) 64%);mix-blend-mode:screen`); el.appendChild(face);
    const n = Math.round(clamp(sc.latas != null ? sc.latas / 6 : f) * 6);
    let cans = ''; for (let i = 0; i < n; i++) { const c = i % 2 ? '#EEF1FF' : '#FF3B6B';
      cans += i < 3 ? `<g transform="translate(${430 + i * 58} 716)"><rect width="44" height="78" rx="9" fill="${c}"/><rect y="24" width="44" height="22" fill="${INK}" opacity=".85"/><rect x="6" y="4" width="32" height="6" rx="3" fill="#fff" opacity=".6"/></g>`
        : `<g transform="translate(${360 + (i - 3) * 86} 770) rotate(${i % 2 ? 84 : -78})"><rect x="-20" y="-36" width="40" height="64" rx="9" fill="${c}"/><path d="M-20,-4 L20,4" stroke="${INK}" stroke-width="10"/></g>`; }
    const fg = E('div', 'position:absolute;inset:0');
    fg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible">
      <path d="M1276,560 L1450,792 L1150,792Z" fill="#FFF4B3" opacity=".13"/>
      <rect x="-20" y="788" width="${W + 40}" height="40" rx="10" fill="#EEF1FF"/><rect x="-20" y="824" width="${W + 40}" height="260" fill="#2433C4"/><rect x="-20" y="824" width="${W + 40}" height="12" fill="#1A2499"/>
      ${[[160, 860], [160, 976], [1240, 860], [1240, 976]].map(([x, y]) => `<rect x="${x}" y="${y}" width="420" height="100" rx="14" fill="#2B3BC8"/><rect x="${x + 176}" y="${y + 40}" width="68" height="14" rx="7" fill="#C7D0FF"/>`).join('')}<rect x="640" y="860" width="540" height="240" rx="14" fill="#1E2BB0"/>
      <ellipse cx="820" cy="796" rx="300" ry="26" fill="#3EF0FF" opacity=".18"/>
      <path d="M690,800 L950,800 L936,776 L704,776Z" fill="#C7D0FF"/><path d="M712,784 H928 M716,792 H924" stroke="#9FB0FF" stroke-width="4" stroke-dasharray="10 6"/>
      <ellipse cx="1012" cy="790" rx="24" ry="12" fill="#C7D0FF"/>
      <g transform="translate(150 790)"><path d="M0,0 L150,0 L160,-14 L10,-14Z" fill="#fff"/><path d="M6,-14 L156,-14 L150,-26 L0,-26Z" fill="#D3DAFF" transform="rotate(-3)"/><path d="M14,-36 L170,-36 L164,-48 L8,-48Z" fill="#fff" transform="rotate(4 80 -40)"/></g>
      ${cans}
      <g transform="translate(1070 700)" opacity="${pose === 'mug' ? 0 : 1}"><rect width="84" height="94" rx="14" fill="#FF3B6B"/><path d="M84,22 C122,22 122,74 84,74" stroke="#FF3B6B" stroke-width="14" fill="none"/><rect x="8" y="8" width="16" height="70" rx="8" fill="#fff" opacity=".25"/>
        <path class="s1" d="M26,-10 C12,-40 40,-60 26,-90" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><path class="s2" d="M58,-10 C44,-40 72,-60 58,-90" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/></g>
      <ellipse cx="1260" cy="792" rx="70" ry="14" fill="#C7D0FF"/><path d="M1260,790 L1226,640 L1286,560" stroke="#4553C8" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M1250,548 L1336,560 L1300,620Z" fill="#FFE9A8"/><circle cx="1312" cy="592" r="30" fill="#FFF4B3" opacity=".55"/></svg>`;
    el.appendChild(fg);
    const cw = [...bg.querySelectorAll('.cw')], ant2 = bg.querySelector('.ant'), cl = bg.querySelector('.cl'), cr = bg.querySelector('.cr');
    const st = sticker(el, sc, 1320, 610, 470, false);
    return { el, render(lt) {
      cw.forEach(w => { const k = +w.dataset.k; w.setAttribute('fill', hash(k, Math.floor(lt * .9 + k * .37)) > .58 ? '#FFD60A' : '#1A2399'); });
      ant2.setAttribute('opacity', Math.floor(lt * 1.4) % 2 ? 1 : .15);
      cl.setAttribute('transform', `skewX(${(Math.sin(lt * .8) * 1.2).toFixed(2)})`); cr.setAttribute('transform', `skewX(${(Math.sin(lt * .8 + 1) * -1.2).toFixed(2)})`);
      const mins = mm + lt * 3; bg.querySelector('.mh').setAttribute('transform', `rotate(${(mins * 6).toFixed(1)} 1130 330)`); bg.querySelector('.hh').setAttribute('transform', `rotate(${((hh % 12 + mins / 60) * 30).toFixed(1)} 1130 330)`); bg.querySelector('.sh').setAttribute('transform', `rotate(${(lt * 180).toFixed(0)} 1130 330)`);
      fg.querySelectorAll('.s1,.s2').forEach((p, i) => { const k = (lt * .8 + i * .5) % 1; p.setAttribute('transform', `translate(0 ${(-k * 40).toFixed(1)})`); p.setAttribute('opacity', (.7 * (1 - k)).toFixed(2)); });
      face.style.opacity = (.8 + .2 * Math.sin(lt * 6) * Math.sin(lt * 2.7)).toFixed(2);
      R(tito.firstChild, lt, f, sc.mood || 'tired', { pose, seed: .8 });
      st(lt);
    }, sfx(a, b) { return pose === 'type' ? [{ t: a + .3, d: b - a - .5, k: 'typing' }] : []; } };
  };

  S.situacion = (sc) => { const f = fatOf(sc); return (LUG[sc.lugar] || LUG.escritorio)(sc, f); };
  S.situacion.LUG = LUG;

  // ================= ESCÀNER: raig que recorre el Tito → s'obre la finestra → zoom fins a l'òrgan =================
  // sc.organ (corazon | pulmones | cerebro | higado | higado_cirrosis | estomago | rinon …), sc.label, sc.sub, sc.hour|fatigue, sc.mood, sc.pins [{x,y,text}] (% del disc), sc.bpm
  S.escaner = (sc) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden');
    const organ = sc.organ || sc.scan || 'corazon', head = /cerebro|ojo/.test(organ), f = fatOf(sc);
    const TW = 460, s = TW / 400, TL = 530, TT = 290, DX = 730, DY = 610, DR = 350;
    const [sx, sy0, sr] = head ? [201, 190, 80] : window.Tito.spot(organ), sy = sy0, lx = sx * s, ly = sy * s;
    let grid = ''; for (let x = 0; x <= W; x += 80) grid += `<path d="M${x},0 V${H}" stroke="#3EF0FF" stroke-width="1.5" opacity=".07"/>`; for (let y = 0; y <= H; y += 80) grid += `<path d="M0,${y} H${W}" stroke="#3EF0FF" stroke-width="1.5" opacity=".07"/>`;
    const bay = E('div', 'position:absolute;inset:0');
    bay.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${grid}
      <rect x="420" y="250" width="46" height="740" rx="20" fill="#2433C4"/><rect x="1056" y="250" width="46" height="740" rx="20" fill="#2433C4"/><rect x="400" y="236" width="722" height="40" rx="20" fill="#2B3BC8"/>
      <rect x="436" y="300" width="14" height="640" rx="7" fill="#3EF0FF" opacity=".35"/><rect x="1072" y="300" width="14" height="640" rx="7" fill="#3EF0FF" opacity=".35"/></svg>`;
    el.appendChild(bay);
    const tito = E('div', `position:absolute;left:${TL}px;top:${TT}px;transform-origin:0 0`); tito.innerHTML = M.personSVG(TW, organ); el.appendChild(tito);
    const pod = E('div', 'position:absolute;inset:0'); pod.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0"><ellipse cx="760" cy="946" rx="380" ry="54" fill="#3EF0FF" opacity=".14"/><path d="M380,940 C380,912 400,900 430,900 L1090,900 C1120,900 1140,912 1140,940 L1140,1100 L380,1100Z" fill="#1E2BB0"/><path d="M400,930 H1120" stroke="#3EF0FF" stroke-width="6" opacity=".6"/></svg>`; el.appendChild(pod);
    const beam = E('div', `position:absolute;left:400px;width:722px;height:130px;opacity:0;background:linear-gradient(180deg,rgba(62,240,255,0),rgba(62,240,255,.28));border-bottom:9px solid ${C.cyan};box-shadow:0 10px 34px rgba(62,240,255,.8)`); el.appendChild(beam);
    const read = E('div', `position:absolute;left:1180px;top:430px;opacity:0`, `<div style="display:inline-block;background:${C.cyan};color:${INK};font-size:40px;font-weight:800;padding:6px 22px 10px;border-radius:12px">Modo escáner</div><div class="pc" style="color:#fff;font-size:150px;${FD};line-height:1;margin-top:18px">0%</div>`); el.appendChild(read);
    const disc = E('div', `position:absolute;left:${DX - DR}px;top:${DY - DR}px;width:${2 * DR}px;height:${2 * DR}px;opacity:0`);
    disc.innerHTML = `<div style="position:absolute;inset:-36px;border-radius:50%;background:radial-gradient(circle,rgba(62,240,255,.32) 60%,rgba(62,240,255,0) 72%)"></div>
      <div class="in" style="position:absolute;inset:0;border-radius:50%;background:#0C1170;overflow:hidden;box-shadow:inset 0 0 0 14px ${C.cyan}">
        <div class="og" style="position:absolute;left:${DR * .15}px;top:${DR * .15}px;width:${DR * 1.7}px;height:${DR * 1.7}px">${window.OrganArt && OrganArt.has(organ) ? OrganArt.svg(organ, '100%', '100%') : `<img src="organs/${organ}.svg" style="width:100%;height:100%;object-fit:contain">`}</div>
        <div class="sl" style="position:absolute;left:0;right:0;height:90px;background:linear-gradient(180deg,rgba(62,240,255,0),rgba(62,240,255,.3));border-bottom:5px solid ${C.cyan}"></div></div>
      <svg class="rg" width="${2 * DR + 120}" height="${2 * DR + 120}" style="position:absolute;left:-60px;top:-60px;overflow:visible"><circle cx="${DR + 60}" cy="${DR + 60}" r="${DR + 34}" fill="none" stroke="${C.cyan}" stroke-width="6" stroke-dasharray="26 22" opacity=".7"/></svg>`;
    el.appendChild(disc);
    const pins = (sc.pins || []).map(p => { const e = E('div', `position:absolute;left:${DX - DR + p.x / 100 * 2 * DR}px;top:${DY - DR + p.y / 100 * 2 * DR}px;opacity:0`,
      `<div style="position:absolute;left:-13px;top:-13px;width:26px;height:26px;border-radius:50%;background:${C.yellow};box-shadow:0 0 0 7px rgba(255,214,10,.3)"></div><div style="position:absolute;${p.x > 50 || DX - DR + p.x / 100 * 2 * DR - 30 - p.text.length * 21 < 130 ? 'left:30px' : 'right:30px'};top:-30px;white-space:nowrap;background:#fff;color:${INK};font-size:36px;font-weight:800;padding:4px 18px 8px;border-radius:12px">${p.text}</div>`); el.appendChild(e); return e; });
    const st = sticker(el, { label: sc.label, sub: sc.sub }, 1150, 560, 640, false);
    const og = disc.querySelector('.og'), sl = disc.querySelector('.sl'), rg = disc.querySelector('.rg'), pc = read.querySelector('.pc');
    const k = d => clamp(d / 5, .7, 1);
    const T = d => { const q = k(d); return { b0: .25 * q, b1: 1.3 * q, z0: 1.65 * q, zd: .85 * q }; };
    const beamY = (lt, t) => lerp(TT + 20, TT + 1.5 * TW - 130, eio(prog(lt, t.b0, t.b1 - t.b0)));
    const tOpen = t => { const y0 = TT + 20, y1 = TT + 1.5 * TW - 130, ys = TT + ly - 130; return lerp(t.b0, t.b1, clamp((ys - y0) / (y1 - y0))); };
    const rWin = head ? 78 * s : sr * s, Zt = DR / rWin, bpm = sc.bpm || 1.25;
    return { el, render(lt, d) {
      const t = T(d), to = tOpen(t), e = eio(prog(lt, t.z0, t.zd)), sw = t.z0 + t.zd * .72;
      const by = beamY(lt, t); beam.style.top = by + 'px'; beam.style.opacity = lt > t.b0 - .05 && lt < t.b1 + .25 ? 1 - prog(lt, t.b1, .25) : 0;
      read.style.opacity = clamp(prog(lt, .1, .3)) * (1 - prog(lt, t.z0, .3)); pc.textContent = Math.round(100 * prog(lt, t.b0, t.b1 - t.b0)) + '%';
      bay.style.opacity = pod.style.opacity = 1 - prog(lt, t.z0, .5);
      const scan = eo(prog(lt, to - .05, .4));
      R(tito.firstChild, lt, f, sc.mood || (f > .5 ? 'tired' : 'ok'), { scan, seed: .2, bpm });
      const Z = Math.pow(Zt, e), X = lerp(TL + lx, DX, e), Y = lerp(TT + ly + (head ? 14 * s : 0), DY, e);
      tito.style.transform = `translate(${(X - TL).toFixed(1)}px,${(Y - TT).toFixed(1)}px) scale(${Z.toFixed(3)}) translate(${(-lx).toFixed(1)}px,${(-ly - (head ? 14 * s : 0)).toFixed(1)}px)`;
      tito.style.opacity = 1 - prog(lt, sw + .08, .14);
      disc.style.opacity = prog(lt, sw, .16);
      const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 2 * bpm)), 8);
      og.style.transform = /corazon/.test(organ) ? `scale(${1 + .07 * beat})` : /pulmon/.test(organ) ? `scale(${1 + .03 * Math.sin(lt * 1.7)},${1 + .05 * Math.sin(lt * 1.7)})` : `translateY(${(Math.sin(lt * 1.4) * 8).toFixed(1)}px)`;
      const u = (lt % 2.2) / 2.2; sl.style.top = (-90 + u * (2 * DR + 90)) + 'px'; sl.style.opacity = lt > sw + .3 ? .9 : 0;
      rg.style.transform = `rotate(${(lt * 18).toFixed(1)}deg)`;
      pins.forEach((p, i) => { const a = back(prog(lt, sw + .55 + i * .3, .4)); p.style.opacity = clamp(a); p.style.transform = `scale(${.6 + .4 * a})`; });
      st(lt - sw + .1);
    }, sfx(a, b) { const t = T(b - a), ev = [{ t: a + t.b0, k: 'scan', d: t.b1 - t.b0 }, { t: a + tOpen(t), k: 'beep' }, { t: a + t.z0, k: 'zoom', d: t.zd }];
      if (/corazon/.test(organ)) ev.push({ t: a + t.z0 + t.zd, d: b - a - t.z0 - t.zd, k: 'heart', bpm });
      if (/pulmon/.test(organ)) ev.push({ t: a + t.z0 + t.zd, d: b - a - t.z0 - t.zd, k: 'breath' });
      return ev; } };
  };
})();
