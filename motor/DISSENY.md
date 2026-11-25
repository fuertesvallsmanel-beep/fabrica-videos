# Guia de disseny — «Cuerpo al Límite» (v2 «Cobalto pop», 25/11/2026)
Aprovada pel Manel el 25/11/2026 després de tres proves (descartats: verd fosc + taronja i atles anatòmic). Revisada per un director d'art extern (miniatura 9/10, color 8, tipografia 8). Tot el que no surti aquí, decideix-ho amb aquest criteri.

## Idea de marca
Cada vídeo és un **experimento** que viu el **Tito**, el voluntari que s'apunta a tot. El narrador (veu del Francisco) explica la ciència; el Tito ho pateix amb la cara. Nínxol: **situacions extremes per al cos i el cervell** («¿Qué le pasa a tu cuerpo si…?»), amb fonts. No fem nutrició ni «remeis».

### Elements fixos (tots els vídeos)
1. **Escena `experimento`** a la línia 2–3: fitxa del voluntari + segell «Experimento Nº 00X» (amb so de segell). Numeració correlativa (001 = 72 h sin dormir).
2. **Medidor «Límite»** a dalt (HUD automàtic): barra de cian → groc → rosa amb marques. Es configura amb `video.json → hud: {max, unit, marks, title}` (per defecte hores 0–72). Quan s'acaba la part de risc, passa sol a l'estat **«Recuperación»** (cian) i baixa a 0.
3. **Modo escáner (rayos X)**: `persona` amb `scan: "<òrgan>"` obre la finestra al lloc real del cos: el cap es torna transparent i es veu el cervell; el cor surt al pit a l'esquerra del Tito; els pulmons, al centre del pit; el fetge, l'estómac i el pàncrees, a la panxa.
4. **Escena `veredicto`**: frase popular + segell **Mito / Ciencia / A medias**. Una per vídeo, com a mínim.
5. **Escenes `situacion`**: el Tito al cotxe (amb microsomni), al llit o a l'escriptori, mentre el narrador ho explica. Moviment continu (carretera, fanals, vapor del cafè, rellotge, respiració). Afegeix llocs nous quan calgui.
6. **Final `endcard`**: el Tito content + «¿Qué le hacemos a Tito la próxima?» + «Escríbelo en los comentarios» + botó Suscríbete. (Si poses `text` propi, el subtítol passa a «Un experimento nuevo cada semana».)

## El Tito (`motor/tito.js`)
- Dibuix estilitzat ben fet (no ninot, no realista): cabell castany amb tupè, samarreta rosa, **cordó groc gruixut** i targeta «VOLUNTARIO / TITO» (el seu tret propi).
- `persona`: `hour` o `fatigue` (0–1), `mood`: ok | tired | angry | happy | shock | sleep, `label`, `sub`, `big` (xifra en groc), `scan`.
- Surt 4–6 cops per vídeo: inici, punt de gir, clímax, veredicte, recuperació i final. Respira, parpelleja, badalla si està cansat, sua a partir de f > 0,55.

## Ritme visual
- Sempre ha de passar alguna cosa: màxim 2 escenes seguides sense el Tito, sense situació o sense un número que es mogui.
- Una de cada tres escenes de dades porta el Tito petit reaccionant (`tito: "shock"`).

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
