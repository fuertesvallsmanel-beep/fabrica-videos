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
    const K = window.VIDEO && window.VIDEO.vertical ? 1.3 : 1; // al Short l'adhesiu es veu a ×0,64: es dibuixa un 30 % més gran perquè es llegeixi
    x = Math.min(x, 1790 - w); if (K > 1) x = Math.min(x, 1770 - w * 1.21); // al Short es veu fins a x ≈ 1803
    const h = E('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;box-sizing:border-box;background:#fff;border-radius:26px;padding:24px 32px 28px;box-shadow:12px 12px 0 rgba(7,11,69,.5);color:${INK};transform-origin:30% 60%;opacity:0`);
    h.dataset.ovl = 1;
    h.innerHTML = (sc.time ? `<div style="display:inline-flex;align-items:center;gap:12px;background:${INK};color:${C.yellow};border-radius:12px;padding:2px 18px 6px;font-size:46px;${FD}">${CLK}${sc.time}</div>` : '') +
      (sc.label ? `<div style="color:${alarm ? C.pink : '#2B3FE6'};font-size:40px;font-weight:800;margin-top:${sc.time ? 14 : 0}px">${lab(sc.label)}</div>` : '') +
      (sc.sub ? `<div style="font-size:48px;font-weight:800;line-height:1.12;margin-top:6px">${nl(sc.sub)}</div>` : '');
    el.appendChild(h);
    return lt => { const u = prog(lt, .5, .27), sc2 = u < .6 ? lerp(.55, 1.08, eo(u / .6)) : lerp(1.08, 1, eio((u - .6) / .4));
      h.style.opacity = lt >= .5 ? 1 : 0; h.style.transform = `rotate(${lerp(-3, -1.5, u).toFixed(2)}deg) scale(${(sc2 * K).toFixed(3)})`; };
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
      const close = d >= 7 && lt >= 4.5 && sc.plano !== 'abierto'; // pla llarg: tall a primer pla de la cara (que no quedi quiet)
      bg.style.transform = `scale(${close ? 1.3 : 1 + .12 * zm})`;
      car.style.transformOrigin = close ? `${CX + 190}px ${GY - 697}px` : `${PX}px ${PY}px`;
      car.style.transform = close ? `scale(${(2.5 + .08 * eio(prog(lt, 4.5, d - 4.5))).toFixed(3)})` : `scale(${1 + .7 * zm + push})`;
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
      <g class="alarm"><rect x="1290" y="290" width="250" height="280" rx="18" fill="#1E2BB0"/><rect x="1302" y="300" width="226" height="256" rx="12" fill="#2B3BC8"/>
      <circle cx="1362" cy="370" r="62" fill="#EEF1FF"/><circle cx="1362" cy="370" r="40" fill="none" stroke="#C7D0FF" stroke-width="6"/><circle cx="1362" cy="370" r="10" fill="#C7D0FF"/>
      <rect x="1314" y="446" width="200" height="88" rx="16" fill="${INK}"/><text class="clk" x="1414" y="508" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="60" fill="#FF3B6B">${sc.time || ''}</text></g>
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
    const ck = bg.querySelector('.alarm'), st = sticker(el, { label: sc.label, sub: sc.sub }, 1290, 640, 500, false), buzz = lt => { const u = (lt - 1.6) % 3.4; return lt > 1.6 && u < 1.3 ? 1 - u / 1.3 : 0; };
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
      
      <circle cx="1130" cy="330" r="86" fill="#EEF1FF" stroke="#4553C8" stroke-width="12"/>${[...Array(12)].map((_, i) => `<path d="M1130,${330 - 70} V${330 - (i % 3 ? 62 : 56)}" stroke="${INK}" stroke-width="${i % 3 ? 4 : 7}" transform="rotate(${i * 30} 1130 330)"/>`).join('')}
      <line class="hh" x1="1130" y1="330" x2="1130" y2="290" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><line class="mh" x1="1130" y1="330" x2="1130" y2="268" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line class="sh" x1="1130" y1="344" x2="1130" y2="262" stroke="#FF3B6B" stroke-width="3"/><circle cx="1130" cy="330" r="8" fill="#FF3B6B"/>
      <rect x="1352" y="488" width="470" height="24" rx="8" fill="#EEF1FF"/>${books.join('')}
      <g transform="translate(1770 488)"><path d="M-30,-60 L30,-60 L22,0 L-22,0Z" fill="#FF3B6B"/><path d="M0,-60 C-10,-110 -50,-120 -60,-100 C-40,-96 -20,-84 0,-60 M0,-60 C10,-120 50,-130 60,-110 C40,-100 20,-86 0,-60 M0,-60 C0,-130 0,-150 0,-150" stroke="#9FB0FF" stroke-width="12" fill="none" stroke-linecap="round"/></g></svg>`;
    el.appendChild(bg);
    const TW = 420, TL = 820 - TW / 2, TT = 166;
    const tito = E('div', `position:absolute;left:${TL}px;top:${TT}px`); tito.innerHTML = M.personSVG(TW); el.appendChild(tito);
    const face = E('div', `position:absolute;left:${TL + 20}px;top:${TT + 40}px;width:380px;height:480px;background:radial-gradient(ellipse at 50% 46%,rgba(62,240,255,.34),rgba(62,240,255,0) 64%);mix-blend-mode:screen`); el.appendChild(face);
    const n = Math.round(clamp(sc.latas != null ? sc.latas / 6 : f) * 3);
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
  S.situacion.kit = { sticker, R, addHead, fatOf, hash, SK, SD, INK, nl };

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

// =====================================================================================================
// Llocs nous (28/11/2026): esclusa i espai (002), cambra de buit dels anys 60 (002), bar del laboratori (003).
// Tots reutilitzables: cada lloc té diversos plans (plano) i estats (paràmetres de l'escena).
(function () {
  const M = window.Motor, S = M.S, { E, eo, eio, prog, back, lerp, clamp, rnd, C, FD, lab } = M.h;
  const LUG = S.situacion.LUG, { sticker, R, addHead, hash, SK, SD, INK } = S.situacion.kit;
  const W = 1920, H = 1080, px = n => (+n).toFixed(1);
  // el Tito amb una capa de dibuix a sobre (mateix viewBox 400x600) per a vestits, galtes, bombolles…
  // capes amb data-into="head" (segueixen el cap: galtes, bombolles, gebre, casc) o "body" (vestit, manta) o "legs" (cames, darrere la samarreta)
  function titoBox(TW, extra = '') {
    const d = E('div', `position:absolute;width:${TW}px;height:${TW * 1.5}px;transform-origin:50% 40%`);
    d.innerHTML = M.personSVG(TW);
    const t = d.querySelector('svg.tito'), tmp = document.createElementNS('http://www.w3.org/2000/svg', 'g'); tmp.innerHTML = extra;
    [...tmp.children].forEach(g => { const w = g.getAttribute('data-into'); if (w === 'legs') t.querySelector('.body').prepend(g); else if (w === 'body') t.querySelector('.body').appendChild(g); else t.querySelector('.head').appendChild(g); });
    return d;
  }
  const LEGS = `<g class="legs" data-into="legs" opacity="0"><path class="lg" d="M96,560 C92,640 104,720 124,800 L190,800 C182,720 186,650 196,590Z" fill="#23308F"/><path class="lg" d="M306,560 C318,630 330,700 312,786 L246,780 C252,710 236,650 206,590Z" fill="#1E2A84"/>
    <path class="sh" d="M118,792 C116,822 132,836 170,836 L206,834 C212,814 200,798 190,796Z" fill="#fff"/><path class="sh" d="M248,774 C240,804 252,820 290,822 L326,818 C332,798 322,782 312,780Z" fill="#fff"/><path d="M120,820 H204 M250,808 H328" stroke="#FF3B6B" stroke-width="7"/></g>`;
  const SUIT = `<g class="suitHelm" data-into="head" opacity="0"><circle class="helm" cx="201" cy="206" r="160" fill="#BFE9FF" fill-opacity=".13" stroke="#fff" stroke-width="10"/><path d="M96,150 Q122,84 188,62" stroke="#fff" stroke-width="13" stroke-linecap="round" opacity=".75" fill="none"/><path d="M300,260 Q296,300 270,330" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".4" fill="none"/></g>
  <g class="suit" data-into="body" opacity="0"><g class="suitB"><path d="M26,600 C30,438 98,366 200,358 C302,366 370,438 374,600Z" fill="#EEF1FF"/><path d="M300,404 C350,440 368,510 372,600 L326,600 C322,520 306,454 276,416Z" fill="#C7D0FF"/>
    <rect x="146" y="446" width="108" height="74" rx="14" fill="#C7D0FF"/><circle cx="172" cy="470" r="9" fill="#FF3B6B"/><circle cx="200" cy="470" r="9" fill="#3EF0FF"/><circle cx="228" cy="470" r="9" fill="#FFD60A"/><rect x="164" y="492" width="72" height="12" rx="6" fill="#9FB0FF"/>
    <path d="M90,470 C110,520 120,560 118,600 M310,470 C290,520 280,560 282,600" stroke="#C7D0FF" stroke-width="10" fill="none"/></g>
    <ellipse cx="200" cy="366" rx="124" ry="28" fill="#C7D0FF" stroke="#9FB0FF" stroke-width="6"/></g>`;
  const PUFF = `<g class="puff" data-into="head" opacity="0"><ellipse cx="146" cy="268" rx="30" ry="26" fill="${SK}"/><ellipse cx="258" cy="268" rx="28" ry="25" fill="#E29E76"/><path d="M128,262 Q132,250 146,248" stroke="#F7C9A6" stroke-width="6" fill="none" stroke-linecap="round"/><ellipse cx="146" cy="276" rx="12" ry="6" fill="#F08A80" opacity=".5"/><ellipse cx="258" cy="276" rx="11" ry="6" fill="#F08A80" opacity=".45"/></g>`;
  const MANTA = `<g class="manta" data-into="body" opacity="0"><path d="M36,600 C46,468 108,396 200,388 C292,396 354,468 364,600Z" fill="#E4E9F8"/><path d="M200,388 L176,600 M200,388 L250,600 M110,450 L150,600 M296,450 L300,600" stroke="#B9C3E6" stroke-width="7" fill="none"/>
    <path d="M60,560 L120,440 M330,540 L290,450" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/><path d="M150,396 C170,420 230,420 250,396" stroke="#B9C3E6" stroke-width="8" fill="none"/></g>`;
  const FROST = `<g class="frost" data-into="head" opacity="0">${[[172, 290], [200, 302], [230, 290], [186, 306], [216, 306], [160, 300], [244, 300]].map(([x, y], i) => `<path d="M${x - 9},${y} L${x + 9},${y} M${x},${y - 9} L${x},${y + 9} M${x - 6},${y - 6} L${x + 6},${y + 6} M${x - 6},${y + 6} L${x + 6},${y - 6}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>`).join('')}<path d="M178,288 Q201,298 224,288" stroke="#DFF6FF" stroke-width="7" fill="none" stroke-linecap="round"/></g>`;
  const BUB = `<g class="bub" data-into="head">${[...Array(9)].map(() => `<circle r="6" fill="#BFE9FF" fill-opacity=".45" stroke="#fff" stroke-width="2.5" opacity="0"/>`).join('')}</g>`;
  // anima les capes de dibuix del Tito
  function titoFx(box, lt, o) {
    const q = c => box.querySelector('.' + c);
    if (q('legs')) { q('legs').setAttribute('opacity', o.legs ? 1 : 0); box.querySelectorAll('.lg').forEach(e => e.setAttribute('fill', o.traje ? '#E4E9F8' : '#23308F')); q('legs').setAttribute('transform', `rotate(${(Math.sin(lt * 1.1) * 4).toFixed(2)} 200 590)`); }
    if (q('suitHelm')) q('suitHelm').setAttribute('opacity', o.traje ? 1 : 0);
    if (q('suit')) { q('suit').setAttribute('opacity', o.traje ? 1 : 0); const inf = o.inflado ? 1 + .3 * (o.infK != null ? o.infK : 1) : 1; q('suitB').setAttribute('transform', `translate(200 480) scale(${inf.toFixed(3)} ${(1 + (inf - 1) * .7).toFixed(3)}) translate(-200 -480)`); q('helm').setAttribute('r', 160 * (1 + (inf - 1) * .4)); }
    if (q('puff')) { const h = o.hinchado || 0; q('puff').setAttribute('opacity', clamp(h * 1.6)); q('puff').setAttribute('transform', `translate(201 266) scale(${(.6 + .5 * h).toFixed(3)}) translate(-201 -266)`); }
    if (q('manta')) q('manta').setAttribute('opacity', o.manta ? 1 : 0);
    if (q('frost')) q('frost').setAttribute('opacity', o.escarcha ? .55 + .35 * Math.sin(lt * 3) : 0);
    if (q('bub')) [...q('bub').children].forEach((c, i) => { if (!o.burbujas) { c.setAttribute('opacity', 0); return; }
      const per = 1.1, u = ((lt + i * per / 9) % per) / per, sd = hash(i, 3) - .5, x = 201 + sd * 54 + Math.sign(sd || 1) * u * 26, y = 296 + (hash(i, 8) - .5) * 10 - u * 14 + u * u * 8;
      c.setAttribute('cx', px(x)); c.setAttribute('cy', px(y)); c.setAttribute('r', px(3 + 6 * u + 3 * hash(i, 5))); c.setAttribute('opacity', (u < .85 ? 1 : 0).toFixed(2)); });
  }
  const tR = (box, lt, f, mood, o = {}) => { const svg = box.querySelector('svg.tito'); R(svg, lt, f, mood, Object.assign({ seed: .6 }, o)); return svg; };

  // ================= ESCLUSA: compartiment d'aire de la nau, vist de cara; comporta gran a la dreta =================
  // sc: plano abierto|cerca · pantalla (text del panell) · cuenta (3-2-1 als últims temps) · abre (la comporta s'obre i el Tito surt disparat)
  //     repress (torna l'aire: indicador de pressió 0→100 %, el Tito es desinfla) · inconsciente · despierta · manta · leonov (vestit inflat que es desinfla) · traje
  LUG.esclusa = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden'), wd = E('div', 'position:absolute;inset:0;transform-origin:430px 560px'); el.appendChild(wd);
    const R0 = rnd(31), DX = 1220, DY = 590, DR = 290;
    let st = ''; for (let i = 0; i < 46; i++) st += `<circle cx="${px(DX - 280 + R0() * 560)}" cy="${px(DY - 280 + R0() * 560)}" r="${px(1.2 + R0() * 2.4)}" fill="#fff" opacity="${(.4 + R0() * .6).toFixed(2)}"/>`;
    let seams = ''; for (let x = 0; x <= W; x += 160) seams += `<rect x="${x}" y="230" width="6" height="720" fill="#1424A0" opacity=".7"/>`;
    let rv = ''; for (let x = 80; x < W; x += 160) for (const y of [262, 918]) rv += `<circle cx="${x}" cy="${y}" r="6" fill="#4553C8"/>`;
    let grate = ''; for (let x = 0; x < W; x += 54) grate += `<rect x="${x}" y="950" width="30" height="130" fill="#0C1170"/>`;
    const space = `<rect x="${DX - DR}" y="${DY - DR}" width="${2 * DR}" height="${2 * DR}" fill="#03062E"/>${st}
      <circle cx="${DX + 120}" cy="${DY + 980}" r="900" fill="#2457E8"/><circle cx="${DX + 120}" cy="${DY + 980}" r="912" fill="none" stroke="#9FE8FF" stroke-width="16" opacity=".55"/>
      <path d="M${DX - 260},${DY + 150} C${DX - 120},${DY + 110} ${DX + 20},${DY + 150} ${DX + 160},${DY + 120} S${DX + 330},${DY + 140} ${DX + 400},${DY + 130}" stroke="#EEF1FF" stroke-width="22" fill="none" opacity=".75" stroke-linecap="round"/>
      <ellipse cx="${DX - 40}" cy="${DY + 230}" rx="120" ry="34" fill="#4A68FF"/>`;
    const bg = E('div', 'position:absolute;inset:0');
    bg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><defs><clipPath id="ehole"><circle cx="${DX}" cy="${DY}" r="${DR}"/></clipPath><clipPath id="eport"><circle cx="${DX}" cy="${DY}" r="104"/></clipPath>
      <linearGradient id="ewall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2232C4"/><stop offset="1" stop-color="#16219C"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#ewall)"/>${seams}<rect y="0" width="${W}" height="230" fill="#111A86"/><rect y="226" width="${W}" height="10" fill="#4553C8"/>${rv}
      <rect y="940" width="${W}" height="140" fill="#1A2499"/>${grate}<rect y="936" width="${W}" height="10" fill="#4553C8"/>
      <g class="vents">${[300, 1000, 1640].map(x => `<rect x="${x - 70}" y="244" width="140" height="40" rx="10" fill="#0C1170"/>${[0, 1, 2, 3].map(k => `<rect x="${x - 56 + k * 30}" y="252" width="16" height="24" rx="5" fill="#2B3BC8"/>`).join('')}`).join('')}</g>
      <g clip-path="url(#ehole)">${space}</g>
      <circle cx="${DX}" cy="${DY}" r="${DR + 46}" fill="none" stroke="#2433C4" stroke-width="56"/>
      <circle cx="${DX}" cy="${DY}" r="${DR + 24}" fill="none" stroke="#FFD60A" stroke-width="20" stroke-dasharray="34 30"/><circle cx="${DX}" cy="${DY}" r="${DR + 24}" fill="none" stroke="${INK}" stroke-width="20" stroke-dasharray="30 34" stroke-dashoffset="-34"/>
      <g class="door"><circle cx="${DX}" cy="${DY}" r="${DR}" fill="#EEF1FF"/><circle cx="${DX}" cy="${DY}" r="${DR - 26}" fill="none" stroke="#C7D0FF" stroke-width="14"/>
        <path d="M${DX + 120},${DY - 250} A${DR - 40},${DR - 40} 0 0 1 ${DX + 250},${DY - 60}" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" opacity=".8"/>
        <circle cx="${DX}" cy="${DY}" r="122" fill="#C7D0FF"/><g clip-path="url(#eport)">${space}</g><circle cx="${DX}" cy="${DY}" r="104" fill="none" stroke="#9FB0FF" stroke-width="10"/>
        <path d="M${DX - 70},${DY - 50} L${DX - 30},${DY - 90}" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".5"/>
        <g class="wheel">${[0, 60, 120].map(a => `<rect x="${DX - 175}" y="${DY - 9}" width="350" height="18" rx="9" fill="#4553C8" transform="rotate(${a} ${DX} ${DY})"/>`).join('')}<circle cx="${DX}" cy="${DY}" r="175" fill="none" stroke="#4553C8" stroke-width="18"/></g>
        <rect x="${DX - DR - 34}" y="${DY - 90}" width="44" height="60" rx="10" fill="#9FB0FF"/><rect x="${DX - DR - 34}" y="${DY + 40}" width="44" height="60" rx="10" fill="#9FB0FF"/></g>
      <g class="beacon"><rect x="${DX - 30}" y="236" width="60" height="22" rx="6" fill="#4553C8"/><path d="M${DX - 26},238 A26,26 0 0 1 ${DX + 26},238Z" fill="#FF3B6B"/><path class="ray" d="M${DX},228 L${DX - 220},330 L${DX - 180},360Z" fill="#FF3B6B" opacity="0"/></g>
      <g transform="translate(300 360)"><rect width="250" height="420" rx="26" fill="#0C1170"/><rect x="18" y="18" width="214" height="140" rx="14" fill="#060A40" stroke="#2B3BC8" stroke-width="5"/>
        <text class="scr" x="125" y="118" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="76" fill="#FFD60A"></text>
        <path d="M45,300 A80,80 0 0 1 205,300" fill="none" stroke="#2B3BC8" stroke-width="18" stroke-linecap="round"/><path class="garc" d="M45,300 A80,80 0 0 1 205,300" fill="none" stroke="#3EF0FF" stroke-width="18" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100" stroke-dashoffset="100"/>
        <line class="needle" x1="125" y1="300" x2="125" y2="236" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="125" cy="300" r="12" fill="#fff"/>
        <circle class="btn" cx="125" cy="368" r="30" fill="#FF3B6B"/><circle cx="125" cy="368" r="30" fill="none" stroke="#C81E4F" stroke-width="6"/></g></svg>`;
    wd.appendChild(bg);
    const flyers = E('div', 'position:absolute;inset:0'); flyers.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><g class="air">${[...Array(26)].map(() => `<path d="M0,0 L-46,0" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0"/>`).join('')}</g>
      <g class="paper" opacity="0"><rect x="-44" y="-56" width="88" height="112" rx="6" fill="#fff"/><path d="M-28,-30 H28 M-28,-10 H28 M-28,10 H18" stroke="#9FB0FF" stroke-width="6"/></g>
      <g class="sock" opacity="0"><path d="M-14,-50 L14,-50 L14,20 C14,44 -4,52 -30,44 L-40,30 C-24,30 -14,24 -14,10Z" fill="#FFD60A"/><rect x="-14" y="-50" width="28" height="14" fill="#FF3B6B"/></g></svg>`;
    const TW = 400, TL = 610, TT = 330;
    const tito = titoBox(TW, SUIT + PUFF + MANTA); tito.style.left = TL + 'px'; tito.style.top = TT + 'px';
    wd.appendChild(tito); wd.appendChild(flyers);
    const door = bg.querySelector('.door'), wheel = bg.querySelector('.wheel'), ray = bg.querySelector('.ray'), scr = bg.querySelector('.scr'), needle = bg.querySelector('.needle'), garc = bg.querySelector('.garc');
    const air = [...flyers.querySelectorAll('.air path')], paper = flyers.querySelector('.paper'), sock = flyers.querySelector('.sock');
    const stk = sticker(el, sc, 1320, 720, 470, false);
    const beats = d => { const b = (sc._beats || []).filter(x => x > .3 && x < d - .3); return b; };
    return { el, render(lt, d) {
      const cerca = sc.plano === 'cerca';
      wd.style.transform = cerca ? `scale(${(1.42 + .05 * eio(prog(lt, 0, d))).toFixed(3)})` : `scale(${(1 + .03 * eio(prog(lt, 0, d))).toFixed(3)})`;
      let open = 0, pres = sc.repress ? eio(prog(lt, .6, Math.max(2, d * .6))) : (sc.abre ? 1 - eio(prog(lt, .5, .6)) : 1);
      if (sc.abre) open = eio(prog(lt, .45, .7));
      door.setAttribute('transform', `translate(${px(DX - DR - 10)} 0) scale(${(1 - .9 * open).toFixed(3)} 1) translate(${px(-(DX - DR - 10))} 0)`);
      door.setAttribute('opacity', (1 - .2 * open).toFixed(2));
      wheel.setAttribute('transform', `rotate(${(sc.abre ? -120 * eio(prog(lt, 0, .5)) : sc.repress ? 120 * eio(prog(lt, 0, .5)) : 0).toFixed(1)} ${DX} ${DY})`);
      const alarm = sc.abre || sc.cuenta;
      ray.setAttribute('opacity', alarm ? .14 : 0); ray.setAttribute('transform', `translate(${DX} 247) rotate(${(lt * 220) % 360}) scale(.7 ${(.45 + .3 * Math.abs(Math.cos(lt * 3.8))).toFixed(2)}) translate(${-DX} -247)`);
      // panell: compte enrere, text o pressió
      let txt = sc.pantalla || '', col = '#FFD60A';
      if (sc.cuenta) { const b = beats(d), t3 = b.length >= 3 ? b.slice(-3) : [d - 3.2, d - 2.2, d - 1.2], k = t3.filter(x => lt >= x - .05).length; txt = k ? String(4 - k) : 'LISTO'; col = k ? '#FF3B6B' : '#3EF0FF'; }
      if (sc.abre) { txt = lt < .45 ? '0' : 'VACÍO'; col = '#FF3B6B'; }
      if (sc.repress || sc.despierta || sc.manta || sc.leonov) { txt = Math.round(100 * pres) + ' %'; col = pres > .95 ? '#3EF0FF' : '#FFD60A'; }
      scr.textContent = txt; scr.setAttribute('fill', col); scr.setAttribute('font-size', txt.length > 4 ? 64 : 84);
      needle.setAttribute('transform', `rotate(${(-90 + 180 * pres).toFixed(1)} 125 300)`); garc.setAttribute('stroke-dashoffset', (100 - 100 * pres).toFixed(1));
      // aire que surt (abre) o que entra (repress)
      air.forEach((a, i) => { const ph = hash(i, 7), y0 = 320 + ph * 560;
        if (sc.abre && lt > .45) { const u = ((lt - .45) * 1.6 + ph) % 1, x = lerp(200, DX, u); a.setAttribute('transform', `translate(${px(x)} ${px(lerp(y0, DY + (ph - .5) * 300, u))}) rotate(${px((Math.atan2(DY - y0, DX - 200)) * 57.3)})`); a.setAttribute('opacity', (lt < 3.5 ? .7 * Math.sin(u * Math.PI) : 0).toFixed(2)); }
        else if (sc.repress && lt > .6 && lt < d - .5) { const u = ((lt - .6) * .9 + ph) % 1, vx = [300, 1000, 1640][i % 3] + (ph - .5) * 90; a.setAttribute('transform', `translate(${px(vx)} ${px(290 + u * 420)}) rotate(90)`); a.setAttribute('opacity', (.55 * Math.sin(u * Math.PI)).toFixed(2)); }
        else a.setAttribute('opacity', 0); });
      // el Tito
      let tx = 0, ty = 0, rot = 0, scl = 1, op = 1, mood = sc.mood || 'ok', ff = f, o = { traje: sc.traje || sc.leonov, inflado: sc.leonov, manta: sc.manta, hinchado: 0 };
      if (sc.abre) { const u = eio(prog(lt, 1.0, 1.6)); tx = (DX - TL - TW / 2) * u; ty = (DY - TT - 300) * u - Math.sin(u * Math.PI) * 80; rot = 260 * u; scl = 1 - .78 * u; op = 1 - prog(lt, 2.2, .4); mood = 'shock';
        [[paper, .7, -1], [sock, 1.3, 1]].forEach(([g, t0, s]) => { const v = eio(prog(lt, t0, 1.2)); g.setAttribute('opacity', v > 0 && v < 1 ? 1 : 0); g.setAttribute('transform', `translate(${px(lerp(s < 0 ? 300 : 980, DX, v))} ${px(lerp(s < 0 ? 760 : 900, DY, v))}) rotate(${px(v * 540 * s)}) scale(${px(1 - .7 * v)})`); }); }
      if (sc.repress) { o.hinchado = .8 * (1 - pres); mood = 'sleep'; tx = -20; ty = -20 + Math.sin(lt * 1.2) * 12; rot = -10 + Math.sin(lt * .8) * 5; }
      if (sc.inconsciente && !sc.repress) mood = 'sleep';
      if (sc.despierta) { const w = prog(lt, Math.max(.8, (sc.diceAt || 3) - 1.2), .4); mood = w > .5 ? 'happy' : 'sleep'; o.hinchado = .25 * (1 - eio(prog(lt, 0, d))); }
      if (sc.leonov) { o.infK = 1 - eio(prog(lt, .8, Math.max(1.5, d - 1.6))); mood = o.infK > .4 ? 'shock' : 'happy'; }
      tito.style.transform = `translate(${px(tx)}px,${px(ty)}px) rotate(${px(rot)}deg) scale(${px(scl * (1 + .06 * (o.hinchado || 0)))})`; tito.style.opacity = op;
      tR(tito, lt, ff, mood, { noZ: true, pose: sc.leonov ? 'none' : undefined });
      titoFx(tito, lt, o);
      stk(lt);
    }, sfx(a, b) { const ev = [{ t: a, d: b - a, k: 'hum' }];
      if (sc.abre) ev.push({ t: a + .45, d: 2.8, k: 'hiss' }, { t: a + .1, d: Math.min(3, b - a - .2), k: 'klaxon' });
      if (sc.cuenta) { const bb = (sc._beats || []).filter(x => x > .3 && x < b - a - .3), t3 = bb.length >= 3 ? bb.slice(-3) : [b - a - 3.2, b - a - 2.2, b - a - 1.2]; t3.forEach(x => ev.push({ t: a + x, k: 'beep' })); }
      if (sc.repress) ev.push({ t: a + .6, d: Math.max(2, (b - a) * .6), k: 'refill' });
      if (sc.leonov) ev.push({ t: a + .8, d: Math.max(1.5, b - a - 1.6), k: 'hiss' });
      return ev; } };
  };

  // ================= ESPAI: el Tito flotant fora de la nau, la Terra a sota =================
  // sc.plano: abierto (per defecte) | cerca (cara) | lejos (petit, molt espai) | globo (globus estratosfèric de Kittinger, sense Tito)
  // sc.vacio (sense Tito) · burbujas · hinchado 0–1 · inconsciente · escarcha · borroso · saluda · nada · silencio · traje · inflado · cine · rescate
  LUG.espacio = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden'), wd = E('div', 'position:absolute;inset:0'); el.appendChild(wd);
    const R0 = rnd(77), pl = sc.plano || 'abierto', globo = pl === 'globo', lejos = pl === 'lejos', cerca = pl === 'cerca';
    let stars = ''; for (let i = 0; i < 120; i++) stars += `<circle class="${i % 9 ? '' : 'tw'}" cx="${px(R0() * W)}" cy="${px(R0() * 900)}" r="${px(.9 + R0() * 2.3)}" fill="#fff" opacity="${(.35 + R0() * .65).toFixed(2)}"/>`;
    const EY = globo ? 2300 : lejos ? 1990 : 2110, ER = globo ? 1500 : 1180;
    let land = ''; for (let i = 0; i < 7; i++) land += `<ellipse cx="${px(100 + i * 290 + R0() * 80)}" cy="${px(EY - ER + 60 + R0() * 140)}" rx="${px(70 + R0() * 120)}" ry="${px(20 + R0() * 26)}" fill="#3550E0"/>`;
    let clouds = ''; for (let i = 0; i < 9; i++) clouds += `<path d="M${px(i * 240 + R0() * 60)},${px(EY - ER + 40 + R0() * 120)} c40,-14 90,-10 130,4 c30,10 70,8 96,-2" stroke="#EEF1FF" stroke-width="${px(10 + R0() * 10)}" fill="none" stroke-linecap="round" opacity=".7"/>`;
    const SX = lejos ? 1240 : cerca ? 1560 : 1420, SY = lejos ? 300 : cerca ? 560 : 330, SKL = lejos ? 1.05 : cerca ? .7 : .9; // al pla de prop, l'estació baixa perquè la bafarada no la tapi
    const station = globo || (cerca && (sc.label || sc.sub)) ? '' : `<g class="stn" transform="translate(${SX} ${SY}) scale(${SKL})">
      <rect x="-40" y="120" width="560" height="22" fill="#9FB0FF"/>${[0, 1, 2, 3].map(k => `<g transform="translate(${-30 + k * 130} 0)"><rect x="0" y="-150" width="110" height="250" fill="#2433C4" stroke="#9FB0FF" stroke-width="5"/>${[1, 2, 3, 4].map(j => `<path d="M0,${-150 + j * 50} H110" stroke="#4553C8" stroke-width="3"/>`).join('')}<path d="M55,-150 V100" stroke="#4553C8" stroke-width="3"/></g>`).join('')}
      <rect x="-20" y="150" width="420" height="160" rx="70" fill="#EEF1FF"/><rect x="-20" y="150" width="420" height="34" rx="16" fill="#fff"/><path d="M60,150 V310 M160,150 V310 M260,150 V310" stroke="#C7D0FF" stroke-width="6"/>
      <circle cx="-30" cy="230" r="78" fill="#C7D0FF"/><circle class="hatch" cx="-30" cy="230" r="54" fill="#060A40" stroke="#FFD60A" stroke-width="10"/><circle cx="-30" cy="230" r="54" fill="none" stroke="${INK}" stroke-width="10" stroke-dasharray="14 14"/>
      <rect x="110" y="200" width="44" height="44" rx="10" fill="#3EF0FF" opacity=".7"/><rect x="190" y="200" width="44" height="44" rx="10" fill="#3EF0FF" opacity=".7"/>
      <g class="arm" opacity="${sc.rescate ? 1 : 0}"><path class="armP" d="M-30,300 L-120,420 L-260,400" stroke="#C7D0FF" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle class="claw" cx="-260" cy="400" r="26" fill="#FFD60A"/></g></g>`;
    const balloon = globo ? `<g transform="translate(880 412) scale(.58)"><path d="M0,-260 C230,-260 330,-60 250,140 C200,260 80,330 0,380 C-80,330 -200,260 -250,140 C-330,-60 -230,-260 0,-260Z" fill="#EEF1FF"/><path d="M0,-260 C90,-200 110,120 0,380 M0,-260 C-90,-200 -110,120 0,380" stroke="#C7D0FF" stroke-width="8" fill="none"/>
      <path d="M-20,380 L-60,560 M20,380 L60,560 M0,380 L0,560" stroke="#9FB0FF" stroke-width="5"/><rect x="-80" y="560" width="160" height="110" rx="12" fill="#C7D0FF"/><rect x="-60" y="580" width="120" height="70" rx="8" fill="#2433C4"/>
      <g transform="translate(0 600)"><circle cx="0" cy="-10" r="26" fill="#EEF1FF" stroke="#fff" stroke-width="5"/><rect x="-14" y="-18" width="28" height="14" rx="6" fill="#3EF0FF"/><path d="M-30,40 C-28,16 -18,10 0,10 C18,10 28,16 30,40Z" fill="#EEF1FF"/></g></g>` : '';
    wd.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><defs><linearGradient id="spk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#02052A"/><stop offset=".7" stop-color="#08105E"/><stop offset="1" stop-color="#14228E"/></linearGradient>
      <radialGradient id="sun"><stop offset="0" stop-color="#FFF4B3" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4B3" stop-opacity="0"/></radialGradient>
      <clipPath id="ecl"><circle cx="960" cy="${EY}" r="${ER}"/></clipPath><radialGradient id="eg" cx="50%" cy="20%" r="70%"><stop offset="0" stop-color="#3D72FF"/><stop offset="1" stop-color="#1630B8"/></radialGradient></defs>
      <rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#spk)"/><g class="stars">${stars}</g>
      <circle cx="250" cy="${globo ? 330 : 300}" r="230" fill="url(#sun)"/><circle cx="250" cy="${globo ? 330 : 300}" r="44" fill="#FFF4B3"/>
      <circle cx="960" cy="${EY}" r="${ER + 34}" fill="#3EF0FF" opacity=".12"/><circle cx="960" cy="${EY}" r="${ER + 12}" fill="none" stroke="#9FE8FF" stroke-width="18" opacity=".55"/>
      <circle cx="960" cy="${EY}" r="${ER}" fill="url(#eg)"/><g clip-path="url(#ecl)"><g class="eland">${land}${clouds}</g><path d="M${960 + ER * .3},${EY - ER - 40} C${960 + ER * .9},${EY - ER * .6} ${960 + ER * 1.1},${EY} ${960 + ER},${EY + 200} L${2400},${EY} L2400,${EY - ER - 100}Z" fill="#0A1270" opacity=".45"/></g>
      ${station}${balloon}</svg>`;
    const TW = cerca ? 640 : lejos ? 170 : 320, TL = cerca ? 440 : lejos ? 640 : 560, TT = cerca ? 150 : lejos ? 330 : 190;
    const tito = sc.vacio || globo ? null : titoBox(TW, LEGS + SUIT + PUFF + FROST + BUB);
    if (tito) { tito.style.left = TL + 'px'; tito.style.top = TT + 'px'; wd.appendChild(tito); }
    const ghost = tito && sc.borroso ? titoBox(TW, PUFF) : null; if (ghost) { ghost.style.left = TL + 'px'; ghost.style.top = TT + 'px'; ghost.style.opacity = .3; wd.insertBefore(ghost, tito); }
    const fx = E('div', 'position:absolute;inset:0;pointer-events:none'); el.appendChild(fx);
    fx.innerHTML = `${sc.borroso ? `<div class="vig" style="position:absolute;inset:0;background:radial-gradient(ellipse at 42% 50%,rgba(2,5,42,0) 35%,rgba(2,5,42,.85) 85%)"></div>` : ''}
      ${sc.nada ? `<svg width="${W}" height="${H}" style="position:absolute;inset:0">${[0, 1, 2, 3].map(k => `<path class="ml" d="M0,0 C20,-10 40,10 60,0" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity="0"/>`).join('')}</svg>` : ''}
      ${sc.silencio ? `<div class="mute" style="position:absolute;left:860px;top:270px;width:200px;height:200px;border-radius:50%;background:#0C1170;border:8px solid #D3DAFF;opacity:0"><svg width="200" height="200" viewBox="0 0 200 200"><path d="M50,82 H78 L112,52 V148 L78,118 H50Z" fill="#D3DAFF"/><path d="M130,74 L170,126 M170,74 L130,126" stroke="#FF3B6B" stroke-width="14" stroke-linecap="round"/></svg></div>` : ''}
      ${sc.cine ? `<div style="position:absolute;left:0;right:0;top:0;height:120px;background:#04062C"></div><div style="position:absolute;left:0;right:0;bottom:0;height:120px;background:#04062C"></div>
        <div style="position:absolute;left:220px;bottom:62px;color:#FFD60A;font-size:40px;font-weight:800;${FD}">● Cine</div>` : ''}`;
    if (sc.cine) wd.style.filter = 'sepia(.2) saturate(1.15)';
    if (sc.borroso) wd.querySelector('svg').style.filter = 'blur(3px)';
    const stk = sticker(el, sc, 1320, 640, 470, false);
    const tw = [...wd.querySelectorAll('.tw')], eland = wd.querySelector('.eland'), arm = wd.querySelector('.armP'), claw = wd.querySelector('.claw'), mute = fx.querySelector('.mute'), mls = [...fx.querySelectorAll('.ml')];
    return { el, render(lt, d) {
      tw.forEach((s, i) => s.setAttribute('opacity', (.35 + .6 * Math.abs(Math.sin(lt * 1.3 + i))).toFixed(2)));
      eland.setAttribute('transform', `translate(${px(-lt * 9)} 0)`);
      const zoom = lejos ? 1 + .04 * eio(prog(lt, 0, d)) : 1 + .03 * eio(prog(lt, 0, d)); wd.style.transform = `scale(${zoom.toFixed(3)})`; wd.style.transformOrigin = '50% 50%';
      if (mute) { mute.style.opacity = eo(prog(lt, 1.4, .5)); mute.style.transform = `scale(${(.7 + .3 * back(prog(lt, 1.4, .5))).toFixed(3)})`; }
      if (!tito) { stk(lt); return; }
      const inc = sc.inconsciente, h = sc.hinchado || 0;
      let rot = inc ? -8 + lt * 4 + Math.sin(lt * .5) * 6 : Math.sin(lt * .7) * 6 + (cerca ? 0 : -5), tx = Math.sin(lt * .45) * 14, ty = Math.sin(lt * .6) * 16, scl = 1 + .07 * h;
      if (sc.nada) { rot += Math.sin(lt * 7) * 7; tx += Math.sin(lt * 7) * 6; }
      if (sc.rescate) { const u = eio(prog(lt, .6, Math.max(1.4, d - 1.4))); const sx = SX, sy = SY, ks = SKL;
        const hx = TL + TW * .58, hy = TT + TW * 1.12; const cx = lerp(sx + -260 * ks, hx, eio(prog(lt, 0, .6))), cy = lerp(sy + 400 * ks, hy, eio(prog(lt, 0, .6)));
        const gx = lerp(cx, sx + -60 * ks, u), gy = lerp(cy, sy + 240 * ks, u); arm.setAttribute('d', `M-30,300 L${px((-30 + (gx - sx) / ks) / 2 - 60)},${px(380 + 60 * (1 - u))} L${px((gx - sx) / ks)},${px((gy - sy) / ks)}`); claw.setAttribute('cx', px((gx - sx) / ks)); claw.setAttribute('cy', px((gy - sy) / ks));
        tx = (gx - hx) * (lt > .6 ? 1 : 0); ty = (gy - hy) * (lt > .6 ? 1 : 0); scl *= 1 - .55 * u; rot = rot * (1 - u) - 30 * u; }
      tito.style.transform = `translate(${px(tx)}px,${px(ty)}px) rotate(${px(rot)}deg) scale(${px(scl)})`;
      if (ghost) ghost.style.transform = `translate(${px(tx + 26 + Math.sin(lt * 2) * 10)}px,${px(ty + 8)}px) rotate(${px(rot + 3)}deg) scale(${px(scl)})`;
      const mood = inc ? 'sleep' : (sc.mood || (sc.traje ? 'happy' : 'shock')), pose = sc.saluda || sc.nada ? 'wave' : undefined;
      tR(tito, lt, inc ? .3 : f, mood, { noZ: true, pose, sweat: h > .3 && !inc });
      if (ghost) tR(ghost, lt, f, mood, { noZ: true });
      titoFx(tito, lt, { traje: sc.traje, inflado: sc.inflado, hinchado: h, escarcha: sc.escarcha, burbujas: sc.burbujas, legs: !cerca }); if (ghost) titoFx(ghost, lt, { hinchado: h });
      mls.forEach((m, i) => { const u = ((lt * 1.6 + i * .25) % 1); m.setAttribute('transform', `translate(${px(TL + TW * (i % 2 ? .95 : .05) + tx)} ${px(TT + TW * .9 + ty - u * 40 + (i > 1 ? 60 : 0))})`); m.setAttribute('opacity', (Math.sin(u * Math.PI) * .8).toFixed(2)); });
      stk(lt);
    }, sfx(a, b) { const ev = []; if (!sc.silencio) ev.push({ t: a, d: b - a, k: 'space' });
      if (sc.burbujas) for (let x = a + .4; x < b - .3; x += .32) ev.push({ t: x, k: 'pop' });
      if (sc.inconsciente) ev.push({ t: a + .2, d: b - a - .4, k: 'heart', bpm: .85 });
      if (sc.rescate) ev.push({ t: a + .2, d: b - a - .6, k: 'servo' });
      return ev; } };
  };

  // ================= CAMBRA DE BUIT (laboratori dels anys 60): un voluntari amb vestit dins la cambra =================
  // sc.plano abierto | cerca (finestra: la visera amb bombolles) · recupera (torna la pressió)
  LUG.camara = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden'), wd = E('div', 'position:absolute;inset:0;transform-origin:800px 600px'); el.appendChild(wd);
    const PX0 = 800, PY0 = 600;
    let tiles = ''; for (let x = 0; x < W; x += 120) for (let y = 230; y < 940; y += 120) tiles += `<rect x="${x + 4}" y="${y + 4}" width="112" height="112" rx="6" fill="${(x / 120 + y / 120) % 2 ? '#1E2CB6' : '#1B28AC'}"/>`;
    wd.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><defs><clipPath id="cpw"><circle cx="${PX0}" cy="${PY0}" r="150"/></clipPath>
      <linearGradient id="cmet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EEF1FF"/><stop offset=".55" stop-color="#C7D0FF"/><stop offset="1" stop-color="#9FB0FF"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="#16219C"/>${tiles}<rect y="940" width="${W}" height="140" fill="#0E1678"/><rect y="936" width="${W}" height="10" fill="#4553C8"/>
      <rect x="250" y="330" width="1100" height="560" rx="280" fill="url(#cmet)"/><rect x="250" y="330" width="1100" height="560" rx="280" fill="none" stroke="#9FB0FF" stroke-width="10"/>
      ${[430, 1170].map(x => `<rect x="${x}" y="330" width="34" height="560" fill="#9FB0FF" opacity=".7"/>`).join('')}${[...Array(14)].map((_, i) => `<circle cx="${330 + i * 72}" cy="352" r="7" fill="#9FB0FF"/><circle cx="${330 + i * 72}" cy="868" r="7" fill="#9FB0FF"/>`).join('')}
      <rect x="1030" y="440" width="230" height="64" rx="12" fill="${INK}"/><text x="1145" y="484" text-anchor="middle" font-family="Brico" font-weight="800" font-size="36" fill="#FFD60A">VACÍO</text>
      <path d="M1350,560 C1460,560 1480,640 1560,640 L1700,640" stroke="#9FB0FF" stroke-width="34" fill="none"/><rect x="1690" y="600" width="80" height="80" rx="14" fill="#4553C8"/>
      <circle cx="${PX0}" cy="${PY0}" r="190" fill="#9FB0FF"/><circle cx="${PX0}" cy="${PY0}" r="172" fill="#C7D0FF"/>${[...Array(12)].map((_, i) => `<circle cx="${px(PX0 + 181 * Math.cos(i * Math.PI / 6))}" cy="${px(PY0 + 181 * Math.sin(i * Math.PI / 6))}" r="7" fill="#7F90E6"/>`).join('')}
      <g clip-path="url(#cpw)"><rect x="${PX0 - 160}" y="${PY0 - 160}" width="320" height="320" fill="#0A1060"/><rect x="${PX0 - 160}" y="${PY0 + 90}" width="320" height="80" fill="#121A86"/>
        <g class="suitguy"><path d="M${PX0 - 120},${PY0 + 170} C${PX0 - 110},${PY0 + 60} ${PX0 - 60},${PY0 + 30} ${PX0},${PY0 + 28} C${PX0 + 60},${PY0 + 30} ${PX0 + 110},${PY0 + 60} ${PX0 + 120},${PY0 + 170}Z" fill="#EEF1FF"/>
          <circle cx="${PX0}" cy="${PY0 - 40}" r="86" fill="#EEF1FF"/><path d="M${PX0 - 62},${PY0 - 60} C${PX0 - 50},${PY0 - 110} ${PX0 + 50},${PY0 - 110} ${PX0 + 62},${PY0 - 60} L${PX0 + 56},${PY0 + 2} C${PX0 + 30},${PY0 + 20} ${PX0 - 30},${PY0 + 20} ${PX0 - 56},${PY0 + 2}Z" fill="#1A2499"/>
          <ellipse cx="${PX0}" cy="${PY0 - 30}" rx="40" ry="46" fill="#EBAA80" opacity=".85"/><path d="M${PX0 - 18},${PY0 - 40} h10 M${PX0 + 8},${PY0 - 40} h10" stroke="${INK}" stroke-width="6" stroke-linecap="round" class="eyes"/><ellipse class="mo" cx="${PX0}" cy="${PY0 - 6}" rx="9" ry="9" fill="#6E1E2A"/>
          <path d="M${PX0 - 50},${PY0 - 80} Q${PX0 - 20},${PY0 - 104} ${PX0 + 20},${PY0 - 96}" stroke="#fff" stroke-width="8" fill="none" opacity=".5" stroke-linecap="round"/><g class="vb">${[...Array(7)].map(() => `<circle r="5" fill="#BFE9FF" fill-opacity=".5" stroke="#fff" stroke-width="2" opacity="0"/>`).join('')}</g>
          <path class="hose" d="M${PX0 + 80},${PY0 + 90} C${PX0 + 130},${PY0 + 110} ${PX0 + 150},${PY0 + 60} ${PX0 + 170},${PY0 + 40}" stroke="#FFD60A" stroke-width="16" fill="none" stroke-linecap="round"/></g>
        <rect class="fog" x="${PX0 - 160}" y="${PY0 - 160}" width="320" height="320" fill="#D3DAFF" opacity="0"/></g>
      <path d="M${PX0 - 90},${PY0 - 110} L${PX0 - 40},${PY0 - 150}" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".4"/>
      <g class="beacon"><rect x="${PX0 - 34}" y="300" width="68" height="24" rx="6" fill="#4553C8"/><path d="M${PX0 - 30},302 A30,30 0 0 1 ${PX0 + 30},302Z" class="bl" fill="#FF3B6B"/><path class="ray" d="M${PX0},292 L${PX0 - 240},400 L${PX0 - 200},430Z" fill="#FF3B6B" opacity="0"/></g>
      <g transform="translate(120 760)"><rect width="420" height="340" rx="30" fill="#0C1170"/><rect x="0" y="0" width="420" height="40" rx="20" fill="#2433C4"/>
        <circle cx="120" cy="150" r="78" fill="#EEF1FF"/><circle cx="120" cy="150" r="64" fill="#fff"/>${[...Array(9)].map((_, i) => `<path d="M120,${150 - 60} V${150 - 50}" stroke="${INK}" stroke-width="4" transform="rotate(${-120 + i * 30} 120 150)"/>`).join('')}<line class="ndl" x1="120" y1="150" x2="120" y2="98" stroke="#FF3B6B" stroke-width="7" stroke-linecap="round"/><circle cx="120" cy="150" r="9" fill="${INK}"/>
        ${[0, 1, 2, 3, 4].map(k => `<circle class="lamp" cx="${250 + (k % 3) * 52}" cy="${110 + Math.floor(k / 3) * 60}" r="18" fill="#2B3BC8"/>`).join('')}<rect x="250" y="210" width="130" height="34" rx="10" fill="#2B3BC8"/></g></svg>`;
    const q = c => wd.querySelector(c), lamps = [...wd.querySelectorAll('.lamp')], vb = [...wd.querySelectorAll('.vb circle')];
    const stk = sticker(el, sc, 1320, 640, 470, false), rec = !!sc.recupera;
    return { el, render(lt, d) {
      const cerca = sc.plano === 'cerca';
      wd.style.transform = cerca ? `scale(${(2.05 + .1 * eio(prog(lt, 0, d))).toFixed(3)})` : `scale(${(1 + .035 * eio(prog(lt, 0, d))).toFixed(3)})`;
      const p = rec ? .5 * eio(prog(lt, .5, 2.4)) : 1 - eio(prog(lt, .3, 1.4)); // pressió (1 = nivell del mar); recupera fins a la meitat
      q('.ndl').setAttribute('transform', `rotate(${(-120 + 240 * p).toFixed(1)} 120 150)`);
      const al = !rec || lt < 1.2; q('.ray').setAttribute('opacity', al ? .13 : 0); q('.ray').setAttribute('transform', `translate(${PX0} 312) rotate(${(lt * 220) % 360}) scale(.55) translate(${-PX0} -312)`); // feix curt i suau: no ha de creuar l'ull de bou q('.bl').setAttribute('fill', al ? '#FF3B6B' : '#3EF0FF');
      lamps.forEach((l, i) => l.setAttribute('fill', al ? (Math.floor(lt * 4 + i) % 2 ? '#FF3B6B' : '#2B3BC8') : '#3EF0FF'));
      q('.hose').setAttribute('transform', rec ? '' : `rotate(${(Math.sin(lt * 9) * 14 * prog(lt, .2, .3)).toFixed(1)} ${PX0 + 80} ${PY0 + 90})`);
      q('.hose').setAttribute('d', rec ? `M${PX0 + 80},${PY0 + 90} C${PX0 + 130},${PY0 + 110} ${PX0 + 150},${PY0 + 60} ${PX0 + 170},${PY0 + 40}` : `M${PX0 + 80},${PY0 + 90} C${PX0 + 140},${PY0 + 130} ${PX0 + 170},${PY0 + 140} ${PX0 + 200},${PY0 + 170}`);
      q('.fog').setAttribute('opacity', rec ? .05 : (.22 * prog(lt, .6, 1.5)).toFixed(2));
      const out = !rec && lt > 2.6; q('.suitguy').setAttribute('transform', out ? `translate(0 ${(Math.min(1, (lt - 2.6) / .8) * 26).toFixed(1)}) rotate(${(Math.min(1, (lt - 2.6) / .8) * 8).toFixed(1)} ${PX0} ${PY0 + 170})` : rec ? `translate(0 ${(26 * (1 - eio(prog(lt, .8, 1.5)))).toFixed(1)})` : '');
      q('.eyes').setAttribute('stroke-width', out || (rec && lt < 1.6) ? 3 : 6); q('.mo').setAttribute('ry', out ? 3 : 9);
      vb.forEach((c, i) => { const on = !rec && lt > .7; const u = ((lt * .9 + i / 7) % 1), sd = hash(i, 2) - .5; c.setAttribute('cx', px(PX0 + sd * 26 + Math.sign(sd || 1) * u * 16)); c.setAttribute('cy', px(PY0 - 4 - u * 8)); c.setAttribute('r', px(2 + 5 * u)); c.setAttribute('opacity', on ? (u < .85 ? .9 : 0) : 0); });
      stk(lt);
    }, sfx(a, b) { const ev = [{ t: a, d: b - a, k: 'hum' }]; if (!sc.recupera) ev.push({ t: a + .3, d: 1.6, k: 'hiss' }, { t: a + .2, d: Math.min(3.5, b - a - .3), k: 'klaxon' }); else ev.push({ t: a + .5, d: 2.2, k: 'refill' }); return ev; } };
  };

  // ================= BAR DEL LABORATORI: el Tito a la barra, copes en fila, prestatges i rellotge =================
  // sc.plano abierto | cerca | barra · copas (n) · mareo 0–1 · brindis · boton (botó vermell; si la línia diu «Botón rojo» es prem) · cafe · pregunta
  //   nariz (s'intenta tocar el nas amb els ulls tancats) · agua (got d'aigua) · manana (matí, ressaca, ulleres de sol) · baila
  LUG.bar = (sc, f) => {
    const el = E('div', 'position:absolute;inset:0;overflow:hidden'), wd = E('div', 'position:absolute;inset:0'); el.appendChild(wd);
    const R0 = rnd(19), man = !!sc.manana, n = sc.copas || 0, mar = sc.mareo || 0;
    let slats = ''; for (let x = 0; x < W; x += 80) slats += `<rect x="${x}" y="0" width="40" height="${H}" fill="#2232C4" opacity=".4"/>`;
    const bottle = (x, y, k) => { const c = ['#EEF1FF', '#FF6E8F', '#4A68FF', '#9FB0FF', '#FFE9A8', '#2B3FE6', '#FF3B6B'][k % 7], h = 90 + (k * 37) % 60, w = 34 + (k * 13) % 20;
      return `<g transform="translate(${x} ${y})"><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="10" fill="${c}"/><rect x="-7" y="${-h - 34}" width="14" height="40" rx="5" fill="${c}"/><rect x="${-w / 2}" y="${-h * .62}" width="${w}" height="${h * .3}" fill="${INK}" opacity=".25"/><rect x="${-w / 2 + 6}" y="${-h + 10}" width="6" height="${h - 24}" rx="3" fill="#fff" opacity=".35"/></g>`; };
    let shelves = ''; [330, 480, 630].forEach((y, r) => { shelves += `<g class="sr${r}"><rect x="1040" y="${y}" width="740" height="18" rx="6" fill="#EEF1FF"/>`; for (let k = 0; k < 9; k++) shelves += bottle(1080 + k * 80 + (r % 2) * 30, y, k + r * 3); shelves += '</g>'; });
    const win = man ? `<rect x="140" y="380" width="360" height="320" fill="#FFE07A"/><circle cx="420" cy="460" r="60" fill="#FFF4B3"/><path d="M140,620 C240,580 330,640 500,590 L500,700 L140,700Z" fill="#FFB86B" opacity=".6"/>`
      : `<rect x="140" y="380" width="360" height="320" fill="#070B45"/><circle cx="430" cy="440" r="30" fill="#FFF4B3"/>${[...Array(8)].map((_, i) => `<rect x="${160 + i * 42}" y="${560 - (i * 37) % 90}" width="34" height="${140 + (i * 37) % 90}" fill="#121B88"/><rect x="${168 + i * 42}" y="${580 - (i * 37) % 90}" width="8" height="10" fill="#FFE9A8" opacity="${i % 2 ? .9 : .3}"/>`).join('')}`;
    const glass = (x, y, full, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-30,-90 L30,-90 L24,-6 C23,0 19,2 14,2 L-14,2 C-19,2 -23,0 -24,-6Z" fill="#EEF1FF" opacity=".25"/>${full ? `<path d="M-27,-58 L27,-58 L24,-6 C23,0 19,2 14,2 L-14,2 C-19,2 -23,0 -24,-6Z" fill="#FF8A3D"/>` : `<path d="M-25,-14 L25,-14 L24,-6 C23,0 19,2 14,2 L-14,2 C-19,2 -23,0 -24,-6Z" fill="#FF8A3D" opacity=".6"/>`}<path d="M-30,-90 L30,-90 L24,-6 C23,0 19,2 14,2 L-14,2 C-19,2 -23,0 -24,-6Z" fill="none" stroke="#fff" stroke-width="5"/><path d="M-18,-80 L-15,-12" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>`;
    const empties = man ? '' : [...Array(Math.max(0, n - 1))].map((_, i) => glass(1000 + i * 92, 770, false)).join('');
    const water = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-34,-110 L34,-110 L28,-4 L-28,-4Z" fill="#EEF1FF" opacity=".3"/><path d="M-31,-70 L31,-70 L28,-4 L-28,-4Z" fill="#9EE7FF"/><path d="M-34,-110 L34,-110 L28,-4 L-28,-4Z" fill="none" stroke="#fff" stroke-width="5"/></g>`;
    const btn = `<g class="btnG" transform="translate(1300 770)"><rect x="-90" y="-26" width="180" height="40" rx="12" fill="#C7D0FF"/><g class="dome"><path d="M-62,-26 A62,52 0 0 1 62,-26Z" fill="#FF3B6B"/><path d="M-36,-50 Q-20,-66 6,-70" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity=".6"/></g></g>
      <g class="glove" opacity="0"><path d="M0,0 C-20,-30 -26,-80 -10,-120 L60,-140 C80,-100 76,-40 50,0Z" fill="#fff"/><rect x="-14" y="-200" width="84" height="80" rx="20" fill="#EEF1FF"/><path d="M8,-10 C2,-30 2,-50 8,-70 M30,-8 C26,-30 26,-56 30,-76" stroke="#C7D0FF" stroke-width="6" fill="none"/></g>`;
    const cup = `<g transform="translate(1110 772)"><path d="M-62,-110 L62,-110 L50,-4 C48,4 40,8 30,8 L-30,8 C-40,8 -48,4 -50,-4Z" fill="#fff"/><path d="M60,-86 C110,-86 110,-30 54,-30" stroke="#fff" stroke-width="16" fill="none"/><ellipse cx="0" cy="-110" rx="62" ry="14" fill="#7A3B1A"/><rect x="-62" y="-64" width="124" height="22" fill="#FF3B6B"/>
      ${[-26, 6, 34].map((x, k) => `<path class="stm" d="M${x},-130 C${x - 20},-160 ${x + 20},-180 ${x},-210" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round" opacity=".7"/>`).join('')}</g>`;
    const q3 = sc.pregunta ? `<g class="q3"><circle cx="1180" cy="560" r="86" fill="#fff"/><text x="1180" y="600" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="76%" font-size="120" fill="#2B3FE6">?</text><path d="M1150,640 L1176,700 L1196,640Z" fill="#fff"/></g>${glass(1180, 780, true, 1.3)}` : '';
    wd.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><rect x="-100" y="-100" width="${W + 200}" height="${H + 200}" fill="${man ? '#2433C4' : '#1D2AB8'}"/>${slats}
      <g class="shelf">${shelves}</g><g class="ghost" opacity="0">${shelves}</g>
      <rect x="120" y="360" width="400" height="360" fill="#EEF1FF"/>${win}<path d="M320,380 V700 M140,540 H500" stroke="#EEF1FF" stroke-width="12"/>
      ${man ? `<path d="M140,380 L-100,1080 L700,1080 L500,380Z" fill="#FFE07A" opacity=".1"/>` : ''}
 <g class="sign"><rect x="190" y="250" width="380" height="80" rx="16" fill="#fff"/><text x="380" y="304" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="78%" font-size="44" fill="${INK}">Bar del laboratorio</text></g>
      <g class="clk"><circle cx="930" cy="300" r="62" fill="#EEF1FF" stroke="#4553C8" stroke-width="10"/><line class="hh" x1="930" y1="300" x2="930" y2="268" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><line class="mh" x1="930" y1="300" x2="930" y2="252" stroke="#FF3B6B" stroke-width="5" stroke-linecap="round"/></g>
      ${sc.baila ? [...Array(4)].map((_, i) => `<path class="spot" d="M-26,-40 L26,-40 L170,820 L-170,820Z" fill="${['#FF3B6B', '#3EF0FF', '#B79CFF', '#FF6E8F'][i]}" opacity=".1"/>`).join('') : ''}</svg>`;
    const TW = 420, TL = 500, TT = 196, tito = titoBox(TW, `<g class="note"></g>`); tito.style.left = TL + 'px'; tito.style.top = TT + 'px'; wd.appendChild(tito);
    const fg = E('div', 'position:absolute;inset:0'); wd.appendChild(fg);
    fg.innerHTML = `<svg width="${W}" height="${H}" style="position:absolute;inset:0;overflow:visible"><rect x="-100" y="768" width="${W + 200}" height="40" rx="10" fill="#EEF1FF"/><rect x="-100" y="806" width="${W + 200}" height="400" fill="#2433C4"/><rect x="-100" y="806" width="${W + 200}" height="12" fill="#1A2499"/>
      ${[0, 1, 2, 3, 4].map(k => `<rect x="${60 + k * 380}" y="850" width="330" height="190" rx="18" fill="#2B3BC8"/>`).join('')}
      ${empties}${(sc.boton ? btn : '')}${sc.cafe ? cup : ''}${man || sc.agua ? water(1180, 772) : ''}${q3}
      <g class="notes">${sc.baila ? [0, 1, 2].map(k => `<text font-family="Brico" font-weight="800" font-size="72" fill="#FFD60A" opacity="0">♪</text>`).join('') : ''}</g>
      <rect class="flash" x="-100" y="-100" width="${W + 200}" height="${H + 200}" fill="#FF3B6B" opacity="0"/></svg>`;
    const stk = sticker(el, sc, 1320, 600, 470, false);
    const shelf = wd.querySelector('.shelf'), ghost = wd.querySelector('.ghost'), flash = fg.querySelector('.flash'), dome = fg.querySelector('.dome'), glove = fg.querySelector('.glove');
    const spots = [...wd.querySelectorAll('.spot')], notes = [...fg.querySelectorAll('.notes text')], stm = [...fg.querySelectorAll('.stm')];
    const pressT = sc.boton && sc.pulsa ? Math.max(.6, ((sc._beats || []).find(x => x > .4) || 1.1) - .1) : null; // el botó es prem a la 2a frase
    return { el, render(lt, d) {
      const pl = sc.plano || 'abierto'; wd.querySelector('.sign').style.display = pl === 'abierto' ? '' : 'none';
      // plans de prop: res del decorat sota el medidor de dalt (y < 220) ni darrere la bafarada
      wd.querySelector('.clk').style.display = pl === 'abierto' ? '' : 'none'; wd.querySelectorAll('.sr0').forEach(g => g.style.display = pl === 'abierto' ? '' : 'none'); wd.querySelectorAll('.sr1').forEach(g => g.style.display = pl === 'barra' ? 'none' : ''); // també a la còpia «fantasma» del mareig
      const z = pl === 'cerca' ? [1.42, '710px 420px'] : pl === 'barra' ? [1.5, '1150px 720px'] : [1, '50% 50%'];
      const sway = mar * Math.sin(lt * .9) * 2.2, drift = mar * Math.sin(lt * .6) * 18;
      wd.style.transformOrigin = z[1]; wd.style.transform = `translate(${px(drift)}px,${pl === 'cerca' ? 110 : pl === 'barra' ? 90 : 0}px) rotate(${px(sway)}deg) scale(${px(z[0] * (1 + .03 * eio(prog(lt, 0, d))))})`;
      ghost.setAttribute('opacity', (mar * .35).toFixed(2)); ghost.setAttribute('transform', `translate(${px(18 * mar + Math.sin(lt * 1.3) * 10 * mar)} ${px(6 * mar)})`);
      const mins = lt * (man ? 6 : 2); wd.querySelector('.mh').setAttribute('transform', `rotate(${px(mins * 6)} 930 300)`); wd.querySelector('.hh').setAttribute('transform', `rotate(${px(man ? 250 + mins * .5 : 330 + mins * .5)} 930 300)`);
      stm.forEach((p, i) => { const k = (lt * .7 + i * .33) % 1; p.setAttribute('transform', `translate(0 ${px(-k * 40)})`); p.setAttribute('opacity', (.7 * (1 - k)).toFixed(2)); });
      spots.forEach((s, i) => s.setAttribute('transform', `translate(${px(260 + i * 460)} 0) rotate(${px(Math.sin(lt * .9 + i * 1.7) * 24)})`)); // feixos de llum des del sostre
      let pose = 'none', mood = sc.mood || 'happy', cupK = 'copa', rot = 0, tx = 0, noZ = true;
      if (n > 0 && !man && !sc.nariz && !sc.boton && !sc.cafe && !sc.pregunta) pose = 'mug';
      if (sc.agua) { pose = 'mug'; cupK = 'agua'; }
      if (sc.nariz) { pose = 'nose'; mood = 'sleep'; }
      if (sc.baila) { pose = 'wave'; rot = Math.sin(lt * 4.2) * 7; tx = Math.sin(lt * 2.1) * 24; }
      tito.style.transform = `translate(${px(tx)}px,0) rotate(${px(rot)}deg)`;
      tR(tito, lt, man ? .55 : f, mood, { pose, cup: cupK, noZ, blush: man ? 0 : Math.min(1, n / 4), gafas: man && mood !== 'happy' });
      notes.forEach((t, i) => { const u = (lt * .6 + i / 3) % 1; t.setAttribute('x', px(TL + 380 + i * 50 + Math.sin(lt * 2 + i) * 20)); t.setAttribute('y', px(TT + 260 - u * 200)); t.setAttribute('opacity', (Math.sin(u * Math.PI)).toFixed(2)); });
      if (pressT != null) { const g = eio(prog(lt, pressT - .5, .5)), up = eio(prog(lt, pressT + .5, .5)), p = clamp(g - up);
        glove.setAttribute('opacity', g > 0 && up < 1 ? 1 : 0); glove.setAttribute('transform', `translate(1290 ${px(lerp(420, 720, p))})`);
        dome.setAttribute('transform', `translate(0 ${px(14 * clamp((lt - pressT) / .08) * (1 - up))}) scale(1 ${px(1 - .3 * clamp((lt - pressT) / .08) * (1 - up))})`);
        flash.setAttribute('opacity', lt > pressT ? (.22 * Math.max(0, Math.sin((lt - pressT) * 9)) * (1 - prog(lt, pressT, 1.6))).toFixed(3) : 0); }
      stk(lt);
    }, sfx(a, b) { const ev = [{ t: a, d: b - a, k: man ? 'birds' : 'bar' }];
      if (sc.brindis) ev.push({ t: a + 1.0, k: 'clink' });
      if (sc.boton && sc.pulsa) { const pt = Math.max(.6, ((sc._beats || []).find(x => x > .4) || 1.1) - .1); ev.push({ t: a + pt, k: 'press' }); }
      if (sc.baila) ev.push({ t: a + .2, d: b - a - .4, k: 'disco' });
      return ev; } };
  };
})();
