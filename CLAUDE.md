# Fàbrica de vídeos — «Cuerpo al Límite»

Canal de YouTube en **espanyol llatí neutre**, sense cara, de divulgació científica animada:
*«¿Qué le pasa a tu cuerpo / a tu cerebro si…?»*. Propietari: Manel (estudiant de Medicina, UAB).
Parla-li en **català**. Ell no vol haver de fer res excepte aprovar la setmana amb un «OK».

## Dades fixes
- Canal YouTube: «Cuerpo al límite» · platformAccountId `UCBW01NZn4nRgxc_-gKPTY2Q`
- vidIQ: pla Boost (2.000 crèdits/mes, es renoven el dia 23). **Control de crèdits (obligatori, al principi de cada execució):**
  - Mira `vidiq_balance` (gratis) i la data de renovació. Cost real: **≈ 240 crèdits per vídeo llarg** (veu de 8 min ≈ 224 + outliers) · revisió setmanal ≈ 40 · exploració mensual ≈ 60 · Shorts = 0 (surten del vídeo llarg).
  - Vídeos d'aquesta setmana = els que càpiguen deixant reservats 40 crèdits per a cada revisió setmanal que quedi fins a la renovació, 60 per a l'exploració si toca, i 100 de marge; repartits perquè **cap setmana es quedi sense vídeo**. Si només en cap 1, en fas 1 i en treus 3–4 Shorts (així els Shorts diaris no paren).
  - Ritme habitual: setmanes de 2, 2, 2 i 1 vídeos (≈ 7 al mes). Fins al 23/12/2026 (1.473 crèdits el 23/11): 2 vídeos el 28/11 i 1 vídeo el 5/12, el 12/12 i el 19/12.
  - **No facis servir eines de vidIQ que costin crèdits fora d'aquesta llista** (veu, outliers, analítica de la revisió, keyword research mensual). Res de puntuar títols o miniatures, generar imatges o música. Si el Manel ho demana, digues-li abans què costarà.
  - Digues-li al missatge setmanal quants crèdits queden i quants vídeos hi caben fins a la renovació.
- Veu: vidIQ `vidiq_voiceover_generate`, voiceId **`EK54is7sa3aPFLD9BwCC`** (Francisco, llatí neutre). Sempre amb `scriptLines` (una línia = una escena).
- Música: `marca/musica_fondo.mp3` (generada amb vidIQ el 23/11/2026), en bucle i amb *ducking* automàtic sota la veu (≈ 16 dB per sota de la veu mentre parla; no la pugis). No en generis més; si el fitxer falta, el render sintetitza un fons propi.
- Efectes de so: el render els posa sols segons el tipus d'escena (whoosh als canvis, tic-tac a `clock`, blips als comptadors, batecs a `amygdala`, cop al zoom de mitja escena).
- Les URL de `assets.vidiq.com` es poden baixar amb `curl` des d'aquí.

## 0. Revisió de rendiment (cada setmana, ABANS de produir) — ≤ 60 crèdits
Objectiu: que cada setmana els vídeos nous siguin millors que els anteriors.
- Eines vidIQ: `vidiq_channel_analytics` / `vidiq_channel_analytics_extended` (visualitzacions, CTR de la miniatura, durada mitjana, % vist, subscriptors guanyats, d'on ve el trànsit), `vidiq_video_stats` per vídeo, `vidiq_channel_performance_trends` per a la tendència. Si alguna dada (p. ex. la retenció segon a segon) no hi és, digues-ho al Manel en una línia i fes servir la que hi hagi.
- Afegeix una fila per vídeo i per Short a `metriques.md` (data, vistes a 48 h i a 7 dies, CTR, durada mitjana, % vist, subs guanyats).
- Treu-ne 2–3 conclusions concretes i aplica-les als vídeos d'aquesta setmana: quin tipus de tema (H/C/E) i de títol funciona, on cau la retenció (quina escena o tipus d'escena), si les miniatures amb número o amb pregunta funcionen més, si els Shorts porten subscriptors. Cada 2–3 setmanes prova **una sola** variable nova (estil de miniatura, ganxo inicial, durada, un tipus d'escena nou, paleta de color) i compara-la amb la resta, per saber què ho ha causat.
- Explica-ho al Manel al missatge de la setmana en 3–4 línies: què ha funcionat, què canviem i per què.

## 0b. Exploració de nínxols (el primer dissabte de cada mes) — ≤ 60 crèdits
- `vidiq_keyword_research` (mode `rising`, castellà) i `vidiq_outliers` (castellà, últims 3 mesos, canals < 100.000 subs) per trobar temes en creixement amb poca competència dins del cos humà i el cervell, i 1–2 àmbits nous propers on el motor d'animació encaixaria.
- Afegeix els millors temes a `temas.md` i escriu a `exploracio.md` (data, idea, dades, recomanació). Explica-ho al Manel en 3 línies.

## 0c. Avaluació dels 2 mesos (dissabte 23 de gener de 2027)
Compara les setmanes 1–4 amb les 5–8 a `metriques.md` (vistes per vídeo, subscriptors per setmana, hores de visualització, CTR). Dona-li al Manel un veredicte clar amb els números: **créixer** (passar a Max i afegir versions en anglès o portuguès), **ajustar** (què canviar i un mes més) o **parar**, segons els criteris acordats a `metriques.md`.

## Feina de cada execució setmanal (1–2 vídeos llargs segons crèdits + 4–7 Shorts)
1. **Temes**: agafa els 2 primers temes pendents de `temas.md` (alterna línies H/C/E). Fes 1 `vidiq_outliers` (es, long, threeMonths, maxSubscribers 100000) per confirmar que el tema encara funciona i per inspirar el títol.
2. **Guió** → `videos/NNN-slug/video.json` (copia l'estructura de `videos/001-72h-sin-dormir/video.json`):
   - 45–55 línies, **7.900–8.300 caràcters** (la veu fa ≈ 16 caràcters/s, així que surten ≈ 8:05; **el vídeo ha de passar de 8:00** perquè YouTube permeti anuncis a mig vídeo; comprova `total` a `timings.json` i, si no hi arriba, afegeix una frase).
   - Ganxo: la primera escena és el protagonista en una situació concreta (p. ex. `persona` amb `big: "04:00"`), i a la línia 3–4 promet una sorpresa per al final (un mite, una dada) i compleix-la.
   - Estructura: ganxo amb una dada o història real (0–15 s) → promesa («hora a hora», «lo que dice la ciencia de verdad») → explicació → clímax → part positiva / què fer → tancament «suscríbete».
   - **Rigor**: cada dada numèrica ha de venir d'una font real (revista revisada per experts o organisme oficial) i anar a `sources`. Si no estàs segur d'una xifra, no la posis. Diferencia estudis en animals. Res de consells mèdics personalitzats ni de mites (l'angle del canal és desmuntar mites).
   - Espanyol llatí neutre: «manejar» (no «conducir un coche»), «enojarse», «se te antoja», sense «vale» ni «vosotros».
   - Cada línia té `scene` d'un tipus que existeixi a `motor/lib.js`: `counter, title, question, brain (mode: adenosine|flow|scn|patches), receptor, clock, gauge, bars, wave, flicker, road, body, stats, amygdala, list, cells, memory, steps, distort, quote, hypnogram, endcard, persona, organ`. Mira com s'usen al vídeo 001.
   - **Òrgans reals** (`organ`): il·lustracions mèdiques professionals a `motor/organs/` (adipocito anciano aorta aparato_digestivo aparato_digestivo_partes bazo capilares cerebro cerebro_lateral ciclista colon corazon corazon_interior corredor diastole dientes ecg espiracion estomago estomago_partes fibra_muscular grasa higado higado_3d higado_cirrosis higado_fibrosis_cc0 higado_sano_cc0 inspiracion intercambio_gases intestino intestino_delgado islote_pancreas musculo musculos obesidad ojo ojo_corte pancreas piel pulmon pulmones rinon rinon_corte sangre sedentario sistema_linfatico sistole traquea_bronquios vejiga vellosidades venas). Paràmetres: `src`, `label`, `sub`, `color` (nom de la paleta `C`), `pulse: true` (batec), `pins: [{x,y,text}]` (etiquetes en % de la imatge; comprova-les als fotogrames), o comparació amb `src2`, `l1`, `l2` (p. ex. fetge sa vs cirrosi). Si en fas servir, afegeix a «Fuentes:» de la descripció: «Ilustraciones: Servier Medical Art (CC BY 3.0).» Si cal un òrgan que no hi és, la col·lecció sencera es pot clonar de `github.com/duerrsimon/bioicons`.
   - **Protagonista** (`persona`: `hour` o `fatigue` 0–1, `mood` ok|tired|angry|sleep|happy, `label`, `sub`, `color`): posa'l 3–5 cops per vídeo en els moments clau (inici, punt de gir, clímax, recuperació). El cap del comptador d'hores també és la seva cara.
   - **Ritme**: un canvi visual cada 3–4 s com a màxim. Si una línia dura més de 8 s, parteix-la en dues línies amb escenes diferents. El motor ja fa moviments de càmera i un zoom a mitja escena. **Per a òrgans, fes servir `organ`; si un tema necessita un gràfic nou (mapa, procés, corba…), afegeix un tipus d'escena nou i reutilitzable a `lib.js`** amb el mateix estil (fons fosc, línies brillants, colors de la paleta `C`).
   - Afegeix `title` (≤ 100 caràcters, amb ganxo), `short_title` i `thumb` (vegeu el 001).
3. **Veu** (només després de superar la Revisió A): `vidiq_voiceover_generate` amb `scriptLines` (màxim 50 línies per crida: si n'hi ha més, fes dues crides tallant on la suma de caràcters de cada meitat quedi just per sota d'un múltiple de 1.000 —es cobra per cada 1.000 arrodonit a l'alça—, uneix els MP3 amb 0,5 s de silenci entre mig i 1,5 s al final, i suma l'offset als `starts` de la segona meitat) → desa `timings.json` (`audioUrl`, `total`, `starts` = startSeconds de cada línia) → `curl -o videos/NNN/voz.mp3 <audioUrl>`.
4. **Prova visual**: `python3 motor/render_video.py videos/NNN --stills t1,t2,…` (un fotograma per escena), fes un full de contactes i **mira'l**: res tallat, res tapant el comptador d'hores de dalt, textos llegibles. Corregeix i repeteix.
5. **Render**: `nohup python3 motor/render_video.py videos/NNN > videos/NNN/render.log 2>&1 &` (≈ 5 min de render per minut de vídeo; vigila el log). Surt `video.mp4`.
6. **Miniatura**: `python3 motor/make_thumb.py videos/NNN` → `thumb.jpg`. Mira-la. Per defecte porta el protagonista (`thumb.person: {fatigue, mood}`) a l'esquerra i 2–3 paraules grans a la dreta; sense `person` surt el cervell.
7. **Shorts** (2–3 per vídeo, o 3–4 si aquella setmana només hi ha 1 vídeo, per cobrir un Short cada dia; 25–55 s, trams que s'entenguin sols): vertical nadiu 1080×1920 amb subtítols paraula a paraula i el protagonista: `python3 motor/render_video.py videos/NNN --short <línia_ini> <línia_fi> "<ganxo>" short1` (prova abans amb `--stills 2,15` al final i mira els fotogrames). `make_short.py` queda obsolet.
8. **Pujar** (només després de superar la Revisió B): `bash motor/publish_media.sh videos/NNN/video.mp4 videos/NNN/thumb.jpg videos/NNN/short1.mp4 …` → URL públiques → `vidiq_video_upload(url=…)` per a cada vídeo (uploadId) i `vidiq_upload_image(image=<url thumb>)` (imageId).
9. **Esborranys** amb `vidiq_social_post_draft_create` (destinació YOUTUBE, el platformAccountId de dalt, `privacyStatus: "public"`, `categoryId: 27` Educació, `publishAt` programat):
   - Vídeos llargs: dimarts i divendres a les **00:00 UTC** (18:00 Mèxic, 19:00 Colòmbia, 21:00 Argentina: 2–3 h abans del pic d'audiència). Shorts: un cada dia a les **22:00 UTC** (16:00 Mèxic, sortida d'escola/feina).
   - Descripció: 2–3 frases de ganxo + capítols (`00:00 …`, a partir de `timings.json`; el primer ha de ser 00:00 i mínim 3) + «Fuentes:» amb la llista + «Contenido divulgativo; no sustituye el consejo médico.» + 3 hashtags.
   - Tags: 10–15 en castellà. Miniatura: `thumbnailImageId`.
   - Si canvies el vídeo d'un esborrany amb `vidiq_social_post_draft_update`, a YouTube es perd el `publishAt`: torna'l a enviar i comprova `scheduledFor` abans d'ensenyar-ho al Manel.
   - **Cada Short també a Instagram i TikTok**, en un esborrany a part (mateix `uploadId`, mateix `publishAt` que a YouTube) amb dues destinacions:
     - INSTAGRAM `platformAccountId: "40152129084402422"` (@cuerpoallimite_)
     - TIKTOK `platformAccountId: "_000JHie2bTBaugdZ0FUGo0FqsRC32tg5395"` amb `privacyLevel: "PUBLIC_TO_EVERYONE"`, `allowComment: true`, `musicUsageConfirmed: true`, `isAiGenerated: true` (opcions triades pel Manel el 23/11/2026; la veu és d'IA).
     - Text: 1–2 frases amb la dada i la font + «Video completo en YouTube: Cuerpo al Límite.» + 4–5 hashtags.
10. **Avisar el Manel** (SendUserMessage + PushNotification): llista curta en català dels vídeos i Shorts amb dies i hores, la miniatura, i la pregunta «Responc "OK" per programar-ho tot?». **No publiquis res fins que ell digui OK** (vidIQ ho exigeix). Quan digui OK: `vidiq_social_post_publish` per a cada esborrany amb la seva `revision`.
11. **Desar**: commit a `main` de `video.json`, `timings.json`, `thumb.jpg`, canvis del motor, `temas.md` (marca fets) i una línia a `registre.md` (data, títols, crèdits gastats). Els `.mp4` no van a main.

## Control de qualitat (OBLIGATORI — «fàbrica tot quality»)
Cap vídeo no passa al pas següent fins que superi la revisió. Revisa, millora i torna a revisar fins que no trobis res a millorar (màxim 3 voltes per revisió). Les correccions de guió es fan **abans** de la veu (la veu costa crèdits); les visuals són gratis, així que corregeix-les sempre.

**Revisió A — guió (entre els passos 2 i 3).** Llança un agent separat (eina Agent) que no hagi vist com s'ha escrit el guió, passa-li `video.json` i aquesta llista, i demana-li una nota de 0 a 10 per punt i els canvis concrets. No passis a la veu fins que cada punt tingui ≥ 8.
1. Ganxo: els primers 15 s fan impossible no continuar? Hi ha una imatge concreta i una pregunta oberta?
2. Promesa: es promet alguna cosa al principi que es compleix al final?
3. Ritme: cap línia de més de 8 s sense canvi d'escena; cap tram de més de 40 s sense un «gir» (dada sorprenent, pregunta, mite).
4. Rigor: cada xifra té font a `sources`, la font diu exactament això, els estudis en animals estan marcats com a tals, res de consells mèdics personals. Si hi ha dubte, es treu la xifra.
5. Claredat: s'entén sense saber medicina? Cap terme tècnic sense explicar.
6. Llengua: espanyol llatí neutre, sense errors, frases curtes per a veu.
7. Originalitat: no repeteix estructura ni frases dels vídeos anteriors del canal.
8. Títol i miniatura: generen curiositat sense enganyar? El títol (≤ 60 caràcters visibles) i la miniatura (≤ 4 paraules) es complementen, no es repeteixen.
9. Durada: ≥ 7.900 caràcters (vídeo > 8:00).

**Revisió B — vídeo acabat (després del pas 6, abans de pujar).** Treu un fotograma cada 4 s del `video.mp4` (full de contactes) i dels Shorts, i mira'ls tots. Comprova:
- res tallat, cap text sobreposat ni fora de pantalla, res tapant el comptador d'hores;
- cap escena buida o «morta» més de 4 s; el protagonista surt on toca;
- àudio: veu clara, música ≈ 16 dB per sota (`ebur128`), sonoritat final ≈ −14 LUFS, cap tall ni silenci estrany;
- Shorts: el ganxo s'entén sense el vídeo llarg, subtítols sense paraules enganxades, durada 25–55 s;
- miniatura llegible a mida mòbil (redueix-la a 320×180 i mira-la).
Si alguna cosa falla: corregeix (guió visual, `lib.js`, escena) i torna a renderitzar el tros o el vídeo.

**Millora contínua.** Cada error que trobis i corregeixis, afegeix-lo en una línia a `qualitat.md` (data, error, solució) i, si és d'una causa repetible, corregeix-ne la causa al motor o a aquestes instruccions perquè no torni a passar. Al missatge setmanal al Manel, inclou una línia: «Revisió: X millores aplicades (les principals: …)».

## Plugin «Social Media Skills» (instal·lat el 23/11/2026)
Si les skills `social-media-skills:*` surten a la llista, carrega-les amb l'eina Skill **just abans** del pas on toquen (no totes de cop) i aplica-ho als vídeos. Si no hi són, continua igual. Les seves parts sobre WoopSocial no ens afecten: publiquem amb vidIQ.
- Pas 0 (revisió): `analytics-and-reporting` per llegir les dades i `experimentation-and-ab-testing` per triar i avaluar la variable de la setmana.
- Pas 0b (nínxols): `viral-reverse-engineering` sobre 1–2 outliers de vidIQ (estructura, ganxo, ritme; mai copiar contingut).
- Pas 2 (guió): `youtube-long-form` i `hook-writer` (primers 30 s i títol); `content-research-and-sourcing` per verificar cada xifra abans de la veu.
- Pas 6 (miniatura): `thumbnail-design`.
- Pas 7 (Shorts): `youtube-shorts` per triar trams i ganxos.
- Pas 9 (metadades): `youtube-publishing-and-metadata` (títol, descripció, capítols, tags).

## Normes de YouTube que cal respectar
- Res de contingut repetitiu o de plantilla: cada vídeo amb guió, escenes i miniatura propis.
- Res de contingut angoixant o manipulador; res d'avatars d'IA que facin de metge.
- Les dades mèdiques han de ser correctes (política de desinformació mèdica).

## Si alguna cosa falla
- Si `curl` a assets.vidiq.com falla (403): el domini ja no està permès; avisa el Manel (Configuració → Capacitats → afegir `assets.vidiq.com`).
- Si vidIQ diu que no hi ha canal connectat: `vidiq_connect_youtube_channel` i passa-li l'enllaç.
- Si queden pocs crèdits: aplica el «Control de crèdits» de dalt i avisa'l. No et quedis mai sense crèdits per a la veu.
