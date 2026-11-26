# Guia de disseny — «Cuerpo al Límite» (v2 «Cobalto pop», 25/11/2026)
Aprovada pel Manel el 25/11/2026 després de tres proves (descartats: verd fosc + taronja i atles anatòmic). Revisada per un director d'art extern (miniatura 9/10, color 8, tipografia 8). Tot el que no surti aquí, decideix-ho amb aquest criteri.

## Idea de marca
Cada vídeo és un **experimento** que viu el **Tito**, el voluntari que s'apunta a tot. El narrador (veu del Francisco) explica la ciència; el Tito ho pateix amb la cara. Nínxol: **situacions extremes per al cos i el cervell** («¿Qué le pasa a tu cuerpo si…?»), amb fonts. No fem nutrició ni «remeis».

### Elements fixos (tots els vídeos)
1. **Escena `experimento`** a la línia 2–3: fitxa del voluntari + segell «Experimento Nº 00X» (amb so de segell). Numeració correlativa (001 = 72 h sin dormir).
2. **Medidor «Límite»** a dalt (HUD automàtic): barra de cian → groc → rosa amb marques. Es configura amb `video.json → hud: {max, unit, marks, title}` (per defecte hores 0–72). Quan s'acaba la part de risc, passa sol a l'estat **«Recuperación»** (cian) i baixa a 0.
3. **Modo escáner**: escena **`escaner`** (`organ`, `label`, `sub`, `pins`, `bpm`, `mood`): el Tito entra a la cabina, un raig cian el recorre de dalt a baix amb el percentatge, la finestra s'obre al lloc real del cos (cervell al cap, cor i pulmons al pit, fetge/estómac/ronyó a la panxa), la càmera hi entra i acaba en un disc gran amb l'òrgan bategant o respirant, etiquetes (`pins` en % del disc) i adhesiu. Fes-la servir 1–2 cops per vídeo. Per a una mirada ràpida sense zoom, `persona` amb `scan: "<òrgan>"`.
4. **Escena `veredicto`**: frase popular + segell **Mito / Ciencia / A medias**. Una per vídeo, com a mínim.
5. **Escenes `situacion`** (`motor/escenas.js`): el Tito fent el que diu el narrador, sempre amb el cos i les mans coherents amb el pla.
   - `coche`: vista frontal, el Tito al volant darrere el parabrisa (no de perfil), carretera en perspectiva amb arbres, cases, fanals, lluna i ciutat; so de motor i carretera. `microsueno: true` = cap que cau, el cotxe es desvia, banda sonora del voral i ensurt. `plano`: per defecte obert → s'apropa al parabrisa; `"cerca"` = ja a prop (per a un segon pla seguit); `"abierto"` = sense zoom.
   - `cama`: vista zenital, el Tito estirat amb coixí, mans sobre la manta, despertador amb l'hora (`time`). De nit, mòbil a la mà i llum blava a la cara (`movil: false` per treure'l), grills; `mood: "sleep"` = dorm i el mòbil vibra a la tauleta. De dia (`time` 06–18 o `dia: true`) llum càlida i ocells; `alarma: true` = el despertador sona i tremola.
   - `escritorio`: finestra amb ciutat i finestres que s'encenen, cortines, prestatge, rellotge que avança des de `time`, llum, llaunes (`latas` 0–6, per defecte segons el cansament), tassa amb vapor; `pose`: `type` (tecleja, so de teclat) o `mug` (beu).
   - L'adhesiu blanc (hora + `label` + `sub`) entra a cop amb rebot. Lloc nou: afegeix `LUG.<nom>` a `escenas.js` amb el mateix esquema (`el`, `render`, `sfx`).
6. **Plans i transicions**: pensa en plans, no en diapositives.
   - Una línia llarga es pot partir en dos plans sense tocar la veu: `scene.then = {…escena, at: segons}` (p. ex. situació 4 s → gràfic). Fes-ho només si una línia passa de 10 s: els plans han de durar 5–7 s perquè el vídeo respiri.
   - Transicions tranquil·les i sense so: **cortineta lenta** (banda inclinada cobalt/groc/rosa que creua en 0,9 s i destapa el pla nou) només quan canvia el lloc o el tipus de pla; si no, **tall net** amb un acostament suau (1,04 → 1 en 0,9 s). Res de cops ràpids ni whooshes (el Manel els troba agobiants). Es pot forçar amb `tr`.
   - **Adhesius** (hora + etiqueta + frase) fixos a pantalla, fora del moviment de càmera, dins la caixa x 1290–1790 / y 600–940; entren opacs amb un cop d'escala (0,55 → 1,08 → 1).
   - **Cap pla mort**: si un pla passa de 4 s sense res nou, li cal un segon temps (`then`, o el que porta l'escena: `stats` amb % passa sol a una graella de 100; `wave` porta el cap del Tito que recorre la corba; les barres tenen reflex). El render avisa dels plans de més de 8 s.
7. **Òrgans dibuixats** (`motor/organs.js`): cervell, cor, pulmons, fetge sa i amb cirrosi, estómac i ronyó, en l'estil pla del Tito (sense contorns realistes). `organ`, `escaner` i el `scan` del Tito els fan servir sols; les il·lustracions de Servier queden només per als òrgans que no hi són (llavors cal el crèdit a la descripció).
8. **Final `endcard`**: el Tito content + «¿Qué le hacemos a Tito la próxima?» + «Escríbelo en los comentarios» + botó Suscríbete. (Si poses `text` propi, el subtítol passa a «Un experimento nuevo cada semana».)

## El Tito (`motor/tito.js`)
- Dibuix estilitzat ben fet (no ninot, no realista): cabell castany amb tupè, samarreta rosa, **cordó groc gruixut** i targeta «VOLUNTARIO / TITO» (el seu tret propi).
- `persona`: `hour` o `fatigue` (0–1), `mood`: ok | tired | angry | happy | shock | sleep, `label`, `sub`, `big` (xifra en groc), `scan`.
- Té braços i mans quan cal (`Tito.render(…, {pose})`: `wheel` volant, `type` teclat, `mug` tassa, `wave` saluda, `point` assenyala). Les escenes de situació ja els fan servir.
- Surt 4–6 cops per vídeo: inici, punt de gir, clímax, veredicte, recuperació i final. Respira, parpelleja, badalla si està cansat, sua a partir de f > 0,55.

## Ritme visual
- Sempre ha de passar alguna cosa: màxim 2 escenes seguides sense el Tito, sense situació o sense un número que es mogui.
- Una de cada tres escenes de dades porta el Tito petit reaccionant (`tito: "shock"`).

## La bíblia del Tito (perquè la gent digui «el vídeo del ninot aquell a qui li fan coses»)
- **Qui és**: un voluntari valent i una mica ingenu que diu que sí a tots els experiments perquè vol saber «què passa». Mai és un metge ni dona consells: li passen coses i el narrador les explica.
- **Parla en bafarades** (`dice`): frases curtes, optimistes al principi i cada cop més desesperades («¡Listo! ¿Qué puede salir mal?» → «Solo cierro los ojos un segundo…»). El narrador és el científic que el fa patir amb humor: aquest duo és el que la gent recorda.
- **Sempre se'n surt**: pot patir (cansament, fred, mareig), però mai es veu ferit de manera gràfica, i al final sempre es recupera i somriu. Això fa que el canal sigui còmode de mirar i que la gent hi torni.
- **Ritual de cada vídeo** (igual sempre): obertura en acció → fitxa «Experimento número N. Voluntario: Tito.» amb la sintonia de 3 notes → … → «Experimento número N… <resultat real: superado, abortado, por los pelos…>» → final amb «Experimentos: N» i «¿Qué le hacemos a Tito la próxima?».
- **Coses que repeteix**: la tarjeta «VOLUNTARIO / TITO» penjada al coll, la samarreta rosa i el cordó groc; la cara de sorpresa quan arriba el gir; el polze amunt quan se'n recupera.
- **La comunitat tria**: el tema que més es demani als comentaris passa al davant a `temas.md` (i al vídeo es diu: «Lo pidieron ustedes»).

## Cada vídeo, escenes noves
Cada vídeo es fa pràcticament de zero: ≥ 6 escenes pròpies del seu tema (GSAP a `fx.js` o lloc nou a `escenas.js`) que ocupin ≥ 60 % del temps; les reutilitzades canvien ≥ 2 coses (decorat, colors, càmera, gràfic, acció del Tito). Només la marca (experimento, medidor, escàner, veredicto, endcard, Tito) es repeteix igual. Un protagonista per pla: no apilar gràfic + adhesiu + Tito petit + font.

## Escenes de dades (mateix món que les il·lustrades)
- Graella de plànol de fons (60 px), contingut centrat entre y 240 i 980, res enganxat a dalt.
- La xifra protagonista sempre en groc des del primer fotograma (comptador, % del rellotge, estadística, la barra més alta). Barres de dany en rosa, neutres en blanc suau (#D3DAFF 70 %), cian només per a recuperació (`calm`). El rellotge de rendiment va de rosa (malament) a cian (bé), sense verd.
- Línia de límit blanca discontínua de 4 px dins les barres, amb etiqueta en fitxa blanca a sobre; mai creua text.
- El Tito petit reaccionant (`tito`) surt a baix a la dreta (250 px); la font, a baix a l'esquerra en una pastilla fosca.
- Decorat de les il·lustracions en tons tranquils (finestres i llums crema #FFE9A8, teulades rosa/cobalt, arbres cobalt): el groc queda per a la dada clau.
- El medidor de dalt porta una pastilla fosca al darrere perquè es llegeixi sobre qualsevol pla.

## Color (cada color vol dir una cosa)
| Token | Hex | Significat |
|---|---|---|
| Fons | #2B3FE6 → #1724B0 → #0C1170 | cobalt elèctric amb taques suaus i gra |
| Perill / marca | #FF3B6B (pink, red) | dany, risc, segell «Mito», samarreta del Tito |
| Dada clau | #FFD60A (yellow) | **només** la xifra protagonista de l'escena i la paraula «Límite» |
| Recuperació | #3EF0FF (cyan) | el que millora, «Ciencia», «Recuperación» |
| Text | #FFFFFF / #D3DAFF | títol / secundari |
| Ombra | #0A1A8C, 8 px sense desenfocament | xifres i titulars (efecte adhesiu) |
Res de resplendors de neó ni xarxes de punts: és el que fa que sembli plantilla d'IA.

## Tipografia
- **Bricolage Grotesque** (`motor/fonts/`, OFL): titulars i xifres en 800 condensada (`${FD}` a lib.js), text en 600–800 normal.
- Títols en **minúscula normal** (sentence case), mai TOT MAJÚSCULES als guions nous.
- Mides mínimes a 1080p: etiquetes ≥ 36 px, text ≥ 44 px, titular d'escena ≥ 64 px. Només les fonts de la cantonada poden ser de 22 px.

## Composició
- Una idea per escena; l'element principal ocupa ≥ 50 % de l'alçada.
- Zona segura: res entre y = 0 i 220 px (és del medidor) i res a menys de 120 px de les vores.
- Diagrames (cervell, cos, receptors, cèl·lules…): il·lustració gran a l'esquerra (≈ 55–60 % de l'amplada) + text a la dreta a x ≈ 1100. Quan facis escenes noves, dissenya-les ja grans (l'escalat automàtic queda desactivat perquè xocava amb el medidor).
- Moviment: un sol gest per escena.

## Miniatura (`make_thumb.py`, camps `thumb`)
- `{num:"002", l1:"72 H", l2:"SIN DORMIR", s1:270, s2:150, acc:"#FF3B6B", person:{fatigue, mood, scan}}`.
- Cara del Tito gran a l'esquerra amb contorn blanc, sense disc; pastilla «Experimento 00X»; màxim 2–3 paraules; sense etiqueta extra.
- Prova obligatòria a 320×180: s'ha de llegir el número i entendre l'emoció en 1 segon.

## Shorts (vertical 1080×1920)
- Ganxo a dalt (s'amaga als 2,5 s), escena ampliada al centre, subtítols de 82 px paraula a paraula amb la paraula actual en groc, el Tito sencer a baix.
- Pendent (proper pas de millora): disseny vertical natiu per a cada tipus d'escena.
