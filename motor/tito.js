// Tito — protagonista de «Cuerpo al Límite». Bust (cap + tors) en SVG, viewBox 400x600.
// Tito.svg(w, {organ}) crea el dibuix; Tito.render(svg, t, f, mood, opts) l'anima (temps determinista).
// f = cansament 0..1 · mood: ok | tired | angry | happy | shock | sleep · opts.scan: 0..1 (finestra al pit)
(function () {
  const SK = '#EBAA80', SD = '#C98058', SL = '#F7C9A6', H = '#2A1A13', H2 = '#5B3B29';
  const TEE = '#FF3B6B', TEE2 = '#C81E4F', TEE3 = '#FF6E8F', INK = '#0B0F4A';
  let n = 0;
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, x) => a + (b - a) * x;

  // on es mira cada òrgan (coordenades del bust): cap per al cervell, pit per al cor i els pulmons, panxa per al fetge i l'estómac
  const SPOT = { corazon: [222, 470, 64], corazon_interior: [222, 470, 64], sistole: [222, 470, 64], diastole: [222, 470, 64], pulmones: [200, 476, 86], pulmon: [200, 476, 86], traquea_bronquios: [200, 470, 80],
    higado_3d: [168, 552, 60], higado: [168, 552, 60], higado_cirrosis: [168, 552, 60], estomago: [234, 552, 58], estomago_partes: [234, 552, 58], pancreas: [214, 566, 52], rinon: [160, 566, 50], intestino: [200, 560, 70], aparato_digestivo: [200, 540, 82] };
  function svg(w, o = {}) {
    const u = 'tt' + (n++);
    const organ = o.organ || 'corazon';
    const head = /cerebro|ojo/.test(organ), [sx, sy, sr] = SPOT[organ] || [200, 478, 74];
    return `<svg class="tito" width="${w}" height="${w * 1.5}" viewBox="0 0 400 600" style="overflow:visible">
<defs>
 <clipPath id="${u}w"><circle cx="${sx}" cy="${sy}" r="${sr}"/></clipPath>
 <clipPath id="${u}h"><path d="M126,178 C126,262 150,304 182,318 C190,322 212,322 220,318 C252,304 276,262 276,178 C276,110 246,80 201,80 C156,80 126,110 126,178Z"/></clipPath>
 <radialGradient id="${u}g" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#3EF0FF" stop-opacity=".35"/><stop offset="1" stop-color="#3EF0FF" stop-opacity="0"/></radialGradient>
</defs>
<g class="body" data-sx="${sx}" data-sy="${sy}" data-sr="${sr}">
 <path d="M176,290 L176,380 C188,394 212,394 226,380 L226,290Z" fill="${SK}"/>
 <path d="M176,316 C192,338 212,338 226,314 L226,352 C208,368 190,368 176,356Z" fill="${SD}" opacity=".75"/>
 <path d="M48,600 C52,452 108,384 200,376 C292,384 348,452 352,600Z" fill="${TEE}"/>
 <path d="M262,388 C318,410 346,476 352,600 L300,600 C298,520 284,446 250,398Z" fill="${TEE2}" opacity=".6"/>
 <path d="M96,452 C118,412 150,394 176,386" fill="none" stroke="${TEE3}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
 <path d="M160,380 C172,410 228,410 240,380 L228,372 C216,392 184,392 172,372Z" fill="${TEE2}"/>
 <path d="M150,392 L186,520 M250,392 L214,520" stroke="#FFD60A" stroke-width="13" stroke-linecap="round"/>
 <g class="badge" transform="translate(200 548) rotate(-4)"><rect x="-54" y="-30" width="108" height="64" rx="9" fill="#fff"/><rect x="-54" y="-30" width="108" height="20" rx="9" fill="#2B3FE6"/><rect x="-54" y="-18" width="108" height="8" fill="#2B3FE6"/>
  <text x="0" y="-15" text-anchor="middle" font-family="Brico" font-weight="800" font-size="13" fill="#fff" letter-spacing=".5">VOLUNTARIO</text>
  <text x="0" y="22" text-anchor="middle" font-family="Brico" font-weight="800" font-stretch="75%" font-size="34" fill="${INK}">TITO</text></g>

 <g class="props"><g class="wheel" opacity="0"><circle cx="200" cy="530" r="112" fill="none" stroke="#0B0F4A" stroke-width="24"/><path d="M200,530 L94,512 M200,530 L306,512 M200,530 L200,640" stroke="#0B0F4A" stroke-width="18"/><circle cx="200" cy="530" r="30" fill="#2433C4"/><circle cx="200" cy="530" r="10" fill="#FFD60A"/></g>
  </g>
 <g class="arms" opacity="0">
  <path class="aLs" fill="none" stroke="${SD}" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/><path class="aL" fill="none" stroke="${SK}" stroke-width="41" stroke-linecap="round" stroke-linejoin="round"/><path class="sL" fill="none" stroke="${TEE}" stroke-width="64" stroke-linecap="round"/>
  <path class="aRs" fill="none" stroke="${SD}" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/><path class="aR" fill="none" stroke="${SK}" stroke-width="41" stroke-linecap="round" stroke-linejoin="round"/><path class="sR" fill="none" stroke="${TEE}" stroke-width="64" stroke-linecap="round"/>
  <g class="hL"><circle r="26" fill="${SK}"/><ellipse cx="14" cy="-12" rx="9" ry="12" fill="${SK}"/><path d="M-12,8 Q0,16 12,8" stroke="${SD}" stroke-width="3" fill="none"/></g>
  <g class="hR"><circle r="26" fill="${SK}"/><ellipse cx="-14" cy="-12" rx="9" ry="12" fill="${SK}"/><path d="M-12,8 Q0,16 12,8" stroke="${SD}" stroke-width="3" fill="none"/></g>
  <g class="mug" opacity="0"><g class="cupM"><path d="M-30,-22 C-48,-22 -48,14 -30,14" stroke="#EEF1FF" stroke-width="10" fill="none"/><rect x="-30" y="-40" width="60" height="72" rx="10" fill="#EEF1FF"/><rect x="-30" y="-40" width="60" height="12" rx="5" fill="#C7D0FF"/><rect x="-22" y="-8" width="44" height="14" rx="4" fill="#FF3B6B"/></g>
   <g class="cupG" opacity="0"><path d="M-30,-46 L30,-46 L24,30 C23,36 19,38 14,38 L-14,38 C-19,38 -23,36 -24,30Z" fill="#EEF1FF" opacity=".35"/><path class="liq" d="M-27,-14 L27,-14 L24,30 C23,36 19,38 14,38 L-14,38 C-19,38 -23,36 -24,30Z" fill="#FF8A3D"/><path d="M-30,-46 L30,-46 L24,30 C23,36 19,38 14,38 L-14,38 C-19,38 -23,36 -24,30Z" fill="none" stroke="#fff" stroke-width="5"/><path d="M-18,-36 L-15,24" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></g>
   <circle cx="-34" cy="0" r="14" fill="${SK}"/></g>
 </g>
 <g class="scan" opacity="0" data-head="${head ? 1 : 0}">${head ? '' : `
  <circle cx="${sx}" cy="${sy}" r="${sr + 22}" fill="url(#${u}g)"/>
  <circle cx="${sx}" cy="${sy}" r="${sr}" fill="#0C1170"/>
  <g clip-path="url(#${u}w)"><g class="org">${window.OrganArt && OrganArt.has(organ) ? OrganArt.svg(organ, sr * 1.7, sr * 1.7, `x="${sx - sr * .85}" y="${sy - sr * .85}"`) : `<image href="organs/${organ}.svg" x="${sx - sr * .92}" y="${sy - sr * .92}" width="${sr * 1.84}" height="${sr * 1.84}" preserveAspectRatio="xMidYMid meet"/>`}</g></g>
  <circle class="ring" cx="${sx}" cy="${sy}" r="${sr}" fill="none" stroke="#3EF0FF" stroke-width="7"/>
  <circle class="pulse" cx="${sx}" cy="${sy}" r="${sr}" fill="none" stroke="#3EF0FF" stroke-width="4" opacity="0"/>`}
 </g>
</g>
<g class="head">
 <path d="M122,212 C110,206 106,232 112,248 C118,262 130,262 134,252Z" fill="${SK}"/><path d="M120,226 C118,236 122,246 128,248" fill="none" stroke="${SD}" stroke-width="4" stroke-linecap="round"/>
 <path d="M280,212 C292,206 296,232 290,248 C284,262 272,262 268,252Z" fill="${SD}"/><path d="M282,226 C284,236 280,246 274,248" fill="none" stroke="#A9653F" stroke-width="4" stroke-linecap="round"/>
 <path class="face" d="M126,178 C126,262 150,304 182,318 C190,322 212,322 220,318 C252,304 276,262 276,178 C276,110 246,80 201,80 C156,80 126,110 126,178Z" fill="${SK}"/>
 <g clip-path="url(#${u}h)">
  <path d="M236,88 C266,108 278,150 274,192 C272,250 258,292 230,310 C246,286 256,246 257,198 C258,150 252,114 236,88Z" fill="${SD}" opacity=".45"/><path d="M160,300 C180,314 222,314 242,300 C226,316 214,321 201,321 C188,321 176,316 160,300Z" fill="${SD}" opacity=".3"/>
  
  <path class="pale" d="M100,60 H300 V340 H100Z" fill="#9FB4C8" opacity="0"/>
 </g>
 <path d="M152,152 C152,124 166,106 184,98" fill="none" stroke="${SL}" stroke-width="9" stroke-linecap="round" opacity=".6"/>
 <path d="M124,196 C108,112 150,58 212,54 C272,52 304,98 284,190 C280,156 266,130 244,120 C228,140 190,150 156,142 C144,156 132,174 124,196Z" fill="${H}"/>
 <path d="M156,142 C170,98 214,76 262,86 C292,92 300,120 296,140 C286,112 260,100 236,104 C216,108 198,124 188,140Z" fill="${H}"/>
 <path d="M168,124 C186,96 222,84 256,92" fill="none" stroke="${H2}" stroke-width="8" stroke-linecap="round"/>
 <path d="M206,110 C224,100 248,100 266,110" fill="none" stroke="${H2}" stroke-width="5" stroke-linecap="round" opacity=".8"/>
 <path d="M262,86 C290,74 312,86 316,104 C300,94 284,96 274,104Z" fill="${H}"/>
 <path class="bl" fill="${H}"/><path class="br" fill="${H}"/>
 <g transform="translate(168 218)"><path d="M-27,2 C-17,-15 17,-15 27,2 C17,15 -17,15 -27,2Z" fill="#fff"/><g class="iris"><circle r="11.5" fill="#6B3F22"/><circle r="6" fill="#140B07"/><circle r="3.2" cx="4" cy="-4" fill="#fff"/></g><path class="lid" fill="${SK}"/><path class="lash" fill="none" stroke="#2E1A12" stroke-width="5" stroke-linecap="round"/></g>
 <g transform="translate(234 218)"><path d="M-27,2 C-17,-15 17,-15 27,2 C17,15 -17,15 -27,2Z" fill="#fff"/><g class="iris"><circle r="11.5" fill="#6B3F22"/><circle r="6" fill="#140B07"/><circle r="3.2" cx="4" cy="-4" fill="#fff"/></g><path class="lid" fill="${SK}"/><path class="lash" fill="none" stroke="#2E1A12" stroke-width="5" stroke-linecap="round"/></g>
 <path class="bag" d="M146,236 Q168,248 190,236 M212,236 Q234,248 256,236" fill="none" stroke="#9A5E8E" stroke-width="4" stroke-linecap="round" opacity="0"/>
 <path d="M206,220 C208,242 216,254 216,264 C214,272 202,274 194,270" fill="none" stroke="${SD}" stroke-width="5.5" stroke-linecap="round"/>
 <path d="M190,269 Q199,275 208,269" fill="none" stroke="#9E5B3E" stroke-width="3.5" stroke-linecap="round"/>
 <ellipse class="ck" cx="160" cy="262" rx="17" ry="9" fill="#F08A80" opacity=".3"/><ellipse class="ck" cx="244" cy="262" rx="15" ry="8" fill="#F08A80" opacity=".25"/>
 <path class="mouth" fill="none" stroke="#8E3B3B" stroke-width="6" stroke-linecap="round"/>
 <path class="lip" fill="none" stroke="#C9725E" stroke-width="3" stroke-linecap="round" opacity=".7"/>
 <ellipse class="open" cx="201" cy="290" rx="0" ry="0" fill="#6E1E2A"/>
 <g class="scanH" opacity="0">
  <path d="M126,178 C126,262 150,304 182,318 C190,322 212,322 220,318 C252,304 276,262 276,178 C276,110 246,80 201,80 C156,80 126,110 126,178Z" fill="#0C1170" fill-opacity=".82" stroke="#3EF0FF" stroke-width="7"/>
  <g clip-path="url(#${u}h)"><path d="M140,190 C140,120 170,94 201,94 C240,94 262,122 262,190 C262,232 250,262 236,276 L236,300 L166,300 L166,276 C152,262 140,232 140,190Z" fill="none" stroke="#D3DAFF" stroke-width="5" opacity=".45"/>
   <g class="orgH">${window.OrganArt ? OrganArt.svg('cerebro', 160, 130, 'x="121" y="100"') : `<image href="organs/cerebro_lateral.svg" x="124" y="88" width="154" height="154"/>`}</g></g>
  <path class="pulseH" d="M126,178 C126,262 150,304 182,318 C190,322 212,322 220,318 C252,304 276,262 276,178 C276,110 246,80 201,80 C156,80 126,110 126,178Z" fill="none" stroke="#3EF0FF" stroke-width="4" opacity="0"/>
 </g>
 <g class="blush" opacity="0"><ellipse cx="158" cy="258" rx="24" ry="13" fill="#FF6E8F"/><ellipse cx="246" cy="258" rx="22" ry="12" fill="#FF6E8F"/></g>
 <g class="gafas" opacity="0"><rect x="134" y="196" width="68" height="46" rx="16" fill="#0B0F4A"/><rect x="200" y="196" width="68" height="46" rx="16" fill="#0B0F4A"/><path d="M196,212 Q201,206 206,212" stroke="#0B0F4A" stroke-width="7" fill="none"/><path d="M146,206 L170,206" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/><path d="M212,206 L236,206" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/></g>
 <path class="sweat" d="M272,150 C278,168 288,178 276,190 C264,196 254,184 260,170Z" fill="#9EE7FF" stroke="#fff" stroke-width="2.5" opacity="0"/>
 <g class="zzz" opacity="0" font-family="Brico" font-weight="800" fill="#fff"><text x="300" y="120" font-size="40">z</text><text x="330" y="84" font-size="54">z</text><text x="364" y="40" font-size="70">Z</text></g>
</g>
</svg>`;
  }

  // ulls: obertura 0 (tancat) .. 1 (obert)
  function eyeLid(open) {
    const yb = lerp(13, -15, open); // vora inferior de la parpella
    return { lid: `M-30,-18 L30,-18 L30,2 C17,${yb} -17,${yb} -30,2Z`, lash: `M-27,2 C-17,${yb} 17,${yb} 27,2` };
  }
  function render(s, t, f, mood, o = {}) {
    if (!s) return; f = cl(f || 0); mood = mood || 'ok';
    const q = c => s.querySelector('.' + c), qa = c => s.querySelectorAll('.' + c);
    const sleep = mood === 'sleep', shock = mood === 'shock', angry = mood === 'angry', happy = mood === 'happy';
    // respiració i postura
    const br = Math.sin(t * 2.1) * 2.2, slump = sleep ? .6 : f * .8;
    q('body').setAttribute('transform', `translate(0 ${br * .5 + slump * 6})`);
    q('head').setAttribute('transform', `translate(${Math.sin(t * .7) * 1.5} ${14 + br * .6 + slump * 8}) rotate(${slump * 4 + Math.sin(t * .9) * 1} 201 300)`);
    // parpelles: cansament + parpelleig
    let open = sleep ? 0 : shock ? 1 : happy ? .8 : 1 - f * .62;
    const bp = (t * .85 + (o.seed || 0)) % 3.4; if (!sleep && bp < .16) open = Math.min(open, Math.abs(bp - .08) / .08 * open);
    if (f > .85 && !sleep) { const nod = t % 2.6; if (nod < .9) open = Math.min(open, 1 - Math.sin(nod / .9 * Math.PI) * .9); }
    const L = eyeLid(open); qa('lid').forEach(e => e.setAttribute('d', L.lid)); qa('lash').forEach(e => e.setAttribute('d', L.lash));
    const look = shock ? 0 : Math.sin(t * .6) * 3; qa('iris').forEach(e => e.setAttribute('transform', `translate(${look} ${f * 3})`));
    // celles
    const by = 186 + f * 5;
    const brow = (x, dir) => { // dir 1 = esquerra
      let a = by + (dir > 0 ? 0 : 0), inner = by - (angry ? -10 : shock ? 12 : happy ? 4 : -f * 6), outer = by + (angry ? -6 : shock ? -10 : 2);
      const xo = x - 28 * dir, xi = x + 26 * dir;
      return `M${xo},${outer} Q${x},${Math.min(outer, inner) - 10} ${xi},${inner} L${xi},${inner + 8} Q${x},${Math.min(outer, inner) - 1} ${xo},${outer + 8}Z`;
    };
    q('bl').setAttribute('d', brow(168, 1)); q('br').setAttribute('d', brow(234, -1));
    // boca
    const curve = happy ? 16 : angry ? -10 : sleep ? 4 : lerp(8, -12, f);
    q('mouth').setAttribute('d', shock ? '' : `M176,287 Q201,${287 + curve} 226,287`);
    q('lip').setAttribute('d', shock ? '' : `M188,${296 + Math.max(0, curve) * .45} Q201,${300 + Math.max(0, curve) * .55} 214,${296 + Math.max(0, curve) * .45}`);
    const ph = t % 7.5, yawn = (!shock && !angry && !sleep && f > .4 && ph < 1.7) ? Math.sin(ph / 1.7 * Math.PI) : 0;
    const oy = shock ? 1 : yawn; q('open').setAttribute('rx', 13 * oy); q('open').setAttribute('ry', 18 * oy); const mo = Math.max(0, 1 - oy * 2.5); q('mouth').setAttribute('opacity', mo); q('lip').setAttribute('opacity', .7 * mo);
    q('bag').setAttribute('opacity', cl(f * 1.3) * .9);
    qa('ck').forEach(e => e.setAttribute('opacity', (happy ? .45 : .28) * (1 - f)));
    q('pale').setAttribute('opacity', f * .22);
    q('sweat').setAttribute('opacity', (f > .55 || o.sweat) && !sleep ? .95 : 0); q('sweat').setAttribute('transform', `translate(0 ${(t * 14) % 20})`);
    const z = q('zzz'); z.setAttribute('opacity', sleep && !o.noZ ? .95 : 0);
    const bl = q('blush'); if (bl) bl.setAttribute('opacity', cl(o.blush || 0) * .55); const gf = q('gafas'); if (gf) gf.setAttribute('opacity', o.gafas ? 1 : 0); z.setAttribute('transform', `translate(0 ${-((t * 18) % 24)})`);

    // braços i objectes segons la postura (opts.pose: wheel | type | mug | wave | point)
    const pose = o.pose || 'none', A = q('arms');
    const P = {
      wheel: { L: [[110, 448], [58, 560], [118, 486]], R: [[290, 448], [342, 560], [282, 486]] },
      type: { L: [[110, 448], [62, 548], [148, 566]], R: [[290, 448], [338, 548], [252, 566]] },
      mug: { L: null, R: [[290, 448], [340, 580], [262, 500]] },
      wave: { L: null, R: [[290, 448], [372, 380], [356, 270]] },
      point: { L: null, R: [[290, 448], [360, 470], [420, 430]] },
      nose: { L: null, R: [[290, 448], [338, 392], [232, 270]] } }[pose];
    A.setAttribute('opacity', P ? 1 : 0); q('wheel').setAttribute('opacity', pose === 'wheel' ? 1 : 0); q('mug').setAttribute('opacity', pose === 'mug' ? 1 : 0);
    if (pose === 'mug') { const cup = o.cup || 'mug'; q('cupM').setAttribute('opacity', cup === 'mug' ? 1 : 0); q('cupG').setAttribute('opacity', cup === 'mug' ? 0 : 1); q('liq').setAttribute('fill', cup === 'agua' ? '#9EE7FF' : '#FF8A3D'); }
    if (P) ['L', 'R'].forEach(k => {
      const a = P[k], vis = !!a; ['a' + k + 's', 'a' + k, 's' + k, 'h' + k].forEach(c => q(c).setAttribute('opacity', vis ? 1 : 0)); if (!vis) return;
      let [S0, E0, W0] = a.map(p => p.slice());
      if (pose === 'type') { W0[1] += Math.sin(t * 6 + (k === 'L' ? 0 : 2)) * 2.5; }
      if (pose === 'wave') { const w = Math.sin(t * 7) * 26; W0[0] += w; }
      if (pose === 'wheel') { const st = Math.sin(t * .8) * 4; W0[1] += st * (k === 'L' ? 1 : -1); }
      if (pose === 'nose') { W0[0] += 26 + Math.sin(t * 2.1) * 30; W0[1] += Math.sin(t * 3.3) * 16 - 4; E0[0] += Math.sin(t * 2.1) * 8; } // intenta tocar-se el nas… i falla
      if (pose === 'mug') { const u = (t % 6.5) / 6.5, sip = u < .55 ? 0 : Math.sin((u - .55) / .45 * Math.PI) ** 2; E0 = [lerp(340, 352, sip), lerp(580, 470, sip)]; W0 = [lerp(262, 266, sip), lerp(500, 336, sip)]; q('mug').dataset.sip = sip; }
      const sl = [lerp(S0[0], E0[0], .38), lerp(S0[1], E0[1], .38)];
      const d1 = `M${S0[0]},${S0[1]} L${E0[0]},${E0[1]} L${W0[0]},${W0[1]}`;
      q('a' + k + 's').setAttribute('d', d1); q('a' + k).setAttribute('d', d1); q('s' + k).setAttribute('d', `M${S0[0]},${S0[1]} L${sl[0]},${sl[1]}`);
      q('h' + k).setAttribute('transform', `translate(${W0[0]} ${W0[1]})`);
      if (pose === 'mug' && k === 'R') q('mug').setAttribute('transform', `translate(${W0[0] - 26} ${W0[1] - 8}) rotate(${-28 * (+q('mug').dataset.sip || 0)})`);
    });
    if (P) q('badge').setAttribute('opacity', 0);
    // finestra del pit (modo escáner)
    const sc = cl(o.scan || 0), g = q('scan'), head = g.dataset.head === '1', bd = q('body');
    const sx = +bd.dataset.sx, sy = +bd.dataset.sy, sr = +bd.dataset.sr;
    const beat = Math.pow(Math.max(0, Math.sin(t * Math.PI * 2 * (o.bpm || 1.25))), 8), pp = (t * 1.1) % 1;
    if (head) {
      const h = q('scanH'); h.setAttribute('opacity', sc); g.setAttribute('opacity', 0);
      q('orgH').setAttribute('transform', `translate(201 167) scale(${1 + .03 * Math.sin(t * 3)}) translate(-201 -167)`);
      q('pulseH').setAttribute('opacity', sc * (1 - pp) * .7); q('pulseH').setAttribute('transform', `translate(201 200) scale(${1 + pp * .15}) translate(-201 -200)`);
      q('badge').setAttribute('opacity', P ? 0 : 1);
    } else {
      g.setAttribute('opacity', sc); q('scanH').setAttribute('opacity', 0);
      g.setAttribute('transform', `translate(${sx} ${sy}) scale(${.6 + .4 * sc}) translate(${-sx} ${-sy})`);
      const og = q('org'); if (og) og.setAttribute('transform', `translate(${sx} ${sy}) scale(${1 + .06 * beat}) translate(${-sx} ${-sy})`);
      const pl = q('pulse'); if (pl) { pl.setAttribute('r', sr + pp * 40); pl.setAttribute('opacity', sc * (1 - pp) * .8); }
      q('badge').setAttribute('opacity', P ? 0 : 1 - sc);
    }
  }
  window.Tito = { svg, render, spot: o => /cerebro|ojo/.test(o || '') ? [201, 175, 92] : (SPOT[o] || [200, 478, 74]) };
})();
