// Òrgans dibuixats en l'estil del Tito (color pla, ombra suau, brillantor). OrganArt.svg(nom, w, h) -> <svg> o null.
// Noms acceptats: cerebro*, corazon*/sistole/diastole, pulmon*, higado* (higado_cirrosis = malalt), estomago*, rinon*
(function () {
  const BR = {
    cer: 'M84,252 C66,170 118,96 210,70 C290,44 392,46 460,86 C540,132 572,212 548,280 C534,318 500,334 458,330 C430,352 396,358 368,348 C344,372 300,380 270,366 C236,380 190,376 162,350 C120,340 92,300 84,252 Z',
    cb: 'M418,318 C468,318 512,344 506,384 C500,420 452,436 408,424 C376,416 362,392 372,366 C380,342 396,320 418,318 Z',
    bs: 'M332,350 C340,392 344,424 338,466 L372,466 C378,430 382,398 384,360 Z',
    g: 'M168,286 C220,270 262,262 300,246 C330,234 360,226 392,224 M318,58 C306,96 322,126 304,160 C292,186 304,212 296,240 M120,200 C150,170 140,140 176,124 C206,112 200,90 236,84 M150,236 C186,222 190,196 222,186 C252,178 252,150 280,140 M200,250 C226,236 248,236 262,210 C276,186 276,170 290,150 M352,80 C344,118 366,140 356,176 C350,200 364,214 360,234 M396,90 C388,130 414,150 406,184 C400,208 420,220 430,232 M450,116 C440,150 470,170 466,204 C462,234 488,248 510,250 M486,190 C506,214 526,222 540,214 M214,312 C246,300 276,304 304,292 C330,282 352,286 376,276 M240,340 C268,330 300,336 330,324'
  };
  const art = {
    cerebro: () => ({ vb: '40 30 560 450', s: `
      <path d="${BR.bs}" fill="#F2A7BB"/><path d="${BR.cb}" fill="#F27A9A"/>
      <path d="M392,360 C430,350 470,356 496,372 M384,384 C420,374 462,380 492,398 M392,406 C420,400 452,404 476,414" stroke="#C94F73" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="${BR.cer}" fill="#FF8FAB"/>
      <path d="M460,86 C540,132 572,212 548,280 C534,318 500,334 458,330 C430,352 396,358 368,348 C420,330 470,300 500,250 C520,200 500,130 460,86Z" fill="#E46A8C" opacity=".55"/>
      <path d="${BR.g}" stroke="#C94F73" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M150,170 C170,120 220,92 270,84" stroke="#fff" stroke-width="14" fill="none" stroke-linecap="round" opacity=".35"/>` }),
    corazon: () => ({ vb: '40 0 330 380', s: `
      <path d="M118,74 L122,190" stroke="#3F6CE0" stroke-width="30" stroke-linecap="round"/>
      <path d="M176,150 C170,110 160,80 140,58" stroke="#5B8CFF" stroke-width="30" stroke-linecap="round" fill="none"/>
      <path d="M206,140 C200,90 210,52 252,48 C290,46 300,80 296,112" stroke="#FF6B85" stroke-width="36" stroke-linecap="round" fill="none"/>
      <path d="M226,52 L222,26 M256,46 L262,22 M282,58 L296,36" stroke="#FF6B85" stroke-width="14" stroke-linecap="round"/>
      <path d="M200,350 C120,316 76,252 86,190 C96,132 146,112 186,132 C198,104 232,94 262,104 C320,124 330,204 302,262 C282,302 242,334 200,350Z" fill="#FF4D6D"/>
      <path d="M262,104 C320,124 330,204 302,262 C282,302 242,334 200,350 C246,300 278,240 276,180 C274,140 266,118 262,104Z" fill="#D6334F" opacity=".7"/>
      <path d="M196,160 C210,210 200,270 170,320" stroke="#C02642" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M150,170 C170,200 176,230 168,260" stroke="#C02642" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M112,196 C116,160 140,140 170,140" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity=".35"/>` }),
    pulmones: () => ({ vb: '10 10 380 380', s: `
      <rect x="182" y="24" width="36" height="110" rx="16" fill="#F3D3DC"/><path d="M184,46 H216 M184,66 H216 M184,86 H216 M184,106 H216" stroke="#D9A9B6" stroke-width="5"/>
      <path d="M176,140 C120,120 70,170 60,240 C50,310 70,360 120,366 C160,370 182,340 184,300 L186,170Z" fill="#FF9FB5"/>
      <path d="M224,140 C280,120 330,170 340,240 C350,310 330,360 280,366 C240,370 218,340 216,300 L214,170Z" fill="#FF9FB5"/>
      <path d="M224,140 C280,120 330,170 340,240 C350,310 330,360 280,366 C300,330 312,280 300,230 C290,190 260,160 224,140Z" fill="#E87C97" opacity=".6"/>
      <path d="M200,130 L170,170 L140,210 M170,170 L160,240 M200,130 L230,170 L262,212 M230,170 L242,246 M140,210 L110,250 M262,212 L292,256" stroke="#F7D9E2" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M90,220 C96,186 116,164 140,152" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".35"/>` }),
    higado: (sick) => ({ vb: '30 70 340 250', s: `
      <path d="M60,170 C70,110 170,90 280,100 C340,105 360,140 340,180 C300,250 200,300 120,290 C80,285 55,230 60,170Z" fill="${sick ? '#C9963E' : '#B23A48'}"/>
      <path d="M340,180 C300,250 200,300 120,290 C190,270 270,232 310,170 C322,150 330,140 340,180Z" fill="${sick ? '#9E6F22' : '#8E2A38'}" opacity=".75"/>
      <path d="M200,110 C196,170 180,230 150,280" stroke="${sick ? '#9E6F22' : '#8E2A38'}" stroke-width="7" fill="none"/>
      ${sick ? [[110, 170], [150, 200], [200, 160], [240, 190], [130, 240], [270, 140], [300, 175], [180, 240]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16" fill="#B5832E"/><circle cx="${x - 4}" cy="${y - 4}" r="6" fill="#E2B35E"/>`).join('') : ''}
      <ellipse cx="168" cy="282" rx="22" ry="14" fill="#7BD389"/>
      <path d="M90,160 C110,125 160,110 210,108" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round" opacity="${sick ? .2 : .3}"/>` }),
    estomago: () => ({ vb: '40 0 330 380', s: `
      <path d="M150,30 C150,60 156,90 170,110" stroke="#F7B3C4" stroke-width="34" stroke-linecap="round" fill="none"/>
      <path d="M170,108 C240,90 320,130 320,210 C320,290 250,340 180,330 C130,324 110,290 128,262 C140,244 170,246 190,250 C230,256 250,230 236,200 C222,170 180,170 168,140Z" fill="#FF8FAB"/>
      <path d="M320,210 C320,290 250,340 180,330 C250,310 296,262 296,200 C296,160 280,132 262,118 C298,134 320,166 320,210Z" fill="#E46A8C" opacity=".6"/>
      <path d="M200,140 C250,140 290,180 290,220 M190,290 C230,300 270,280 286,250" stroke="#D85A7C" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M136,268 C112,290 96,300 72,300" stroke="#F7B3C4" stroke-width="26" stroke-linecap="round" fill="none"/>
      <path d="M214,120 C250,116 284,134 300,164" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".35"/>` }),
    rinon: () => ({ vb: '60 40 280 320', s: `
      <path d="M200,60 C280,60 320,140 300,220 C284,290 230,330 180,312 C150,300 160,260 180,240 C196,222 196,180 180,164 C160,144 150,110 160,90 C168,72 184,60 200,60Z" fill="#C0394B"/>
      <path d="M300,220 C284,290 230,330 180,312 C240,300 280,260 290,200 C296,150 280,100 250,74 C290,92 312,150 300,220Z" fill="#952636" opacity=".7"/>
      <path d="M186,180 C210,170 226,190 220,212 C214,232 192,236 182,222Z" fill="#F3B0BC"/>
      <path d="M186,220 C170,260 160,300 150,350" stroke="#F3B0BC" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M206,82 C240,80 270,104 282,140" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" opacity=".3"/>` })
  };
  function key(n) {
    n = (n || '').toLowerCase();
    if (/cerebro/.test(n)) return ['cerebro'];
    if (/corazon|sistole|diastole/.test(n)) return ['corazon'];
    if (/pulmon|traquea/.test(n)) return ['pulmones'];
    if (/higado/.test(n)) return ['higado', /cirrosis|fibrosis/.test(n)];
    if (/estomago/.test(n)) return ['estomago'];
    if (/rinon/.test(n)) return ['rinon'];
    return null;
  }
  function svg(name, w, h, extra) {
    const k = key(name); if (!k) return null;
    const a = art[k[0]](k[1]);
    return `<svg ${extra || ''} width="${w}" height="${h || w}" viewBox="${a.vb}" preserveAspectRatio="xMidYMid meet" style="overflow:visible">${a.s}</svg>`;
  }
  window.OrganArt = { svg, has: n => !!key(n) };
})();
