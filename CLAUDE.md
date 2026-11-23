# Fàbrica de vídeos — «Cuerpo al Límite»

Canal de YouTube en **espanyol llatí neutre**, sense cara, de divulgació científica animada:
*«¿Qué le pasa a tu cuerpo / a tu cerebro si…?»*. Propietari: Manel (estudiant de Medicina, UAB).
Parla-li en **català**. Ell no vol haver de fer res excepte aprovar la setmana amb un «OK».

## Dades fixes
- Canal YouTube: «Cuerpo al límite» · platformAccountId `UCBW01NZn4nRgxc_-gKPTY2Q`
- vidIQ: pla Boost (2.000 crèdits/mes, es renoven el dia 23). **Pressupost: ≤ 900 crèdits per setmana.**
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

## Feina de cada execució setmanal (2 vídeos llargs + 4–6 Shorts)
1. **Temes**: agafa els 2 primers temes pendents de `temas.md` (alterna línies H/C/E). Fes 1 `vidiq_outliers` (es, long, threeMonths, maxSubscribers 100000) per confirmar que el tema encara funciona i per inspirar el títol.
2. **Guió** → `videos/NNN-slug/video.json` (copia l'estructura de `videos/001-72h-sin-dormir/video.json`):
   - 45–55 línies, **7.900–8.300 caràcters** (la veu fa ≈ 16 caràcters/s, així que surten ≈ 8:05; **el vídeo ha de passar de 8:00** perquè YouTube permeti anuncis a mig vídeo; comprova `total` a `timings.json` i, si no hi arriba, afegeix una frase).
   - Ganxo: la primera escena és el protagonista en una situació concreta (p. ex. `persona` amb `big: "04:00"`), i a la línia 3–4 promet una sorpresa per al final (un mite, una dada) i compleix-la.
   - Estructura: ganxo amb una dada o història real (0–15 s) → promesa («hora a hora», «lo que dice la ciencia de verdad») → explicació → clímax → part positiva / què fer → tancament «suscríbete».
   - **Rigor**: cada dada numèrica ha de venir d'una font real (revista revisada per experts o organisme oficial) i anar a `sources`. Si no estàs segur d'una xifra, no la posis. Diferencia estudis en animals. Res de consells mèdics personalitzats ni de mites (l'angle del canal és desmuntar mites).
   - Espanyol llatí neutre: «manejar» (no «conducir un coche»), «enojarse», «se te antoja», sense «vale» ni «vosotros».
   - Cada línia té `scene` d'un tipus que existeixi a `motor/lib.js`: `counter, title, question, brain (mode: adenosine|flow|scn|patches), receptor, clock, gauge, bars, wave, flicker, road, body, stats, amygdala, list, cells, memory, steps, distort, quote, hypnogram, endcard, persona`. Mira com s'usen al vídeo 001.
   - **Protagonista** (`persona`: `hour` o `fatigue` 0–1, `mood` ok|tired|angry|sleep|happy, `label`, `sub`, `color`): posa'l 3–5 cops per vídeo en els moments clau (inici, punt de gir, clímax, recuperació). El cap del comptador d'hores també és la seva cara.
   - **Ritme**: un canvi visual cada 3–4 s com a màxim. Si una línia dura més de 8 s, parteix-la en dues línies amb escenes diferents. El motor ja fa moviments de càmera i un zoom a mitja escena. **Si un tema necessita un òrgan o gràfic nou (cor, fetge, pulmons, ronyó, estómac, mapa…), afegeix un tipus d'escena nou i reutilitzable a `lib.js`** amb el mateix estil (fons fosc, línies brillants, colors de la paleta `C`).
   - Afegeix `title` (≤ 100 caràcters, amb ganxo), `short_title` i `thumb` (vegeu el 001).
3. **Veu**: `vidiq_voiceover_generate` amb `scriptLines` (màxim 50 línies per crida: si n'hi ha més, fes dues crides tallant on la suma de caràcters de cada meitat quedi just per sota d'un múltiple de 1.000 —es cobra per cada 1.000 arrodonit a l'alça—, uneix els MP3 amb 0,5 s de silenci entre mig i 1,5 s al final, i suma l'offset als `starts` de la segona meitat) → desa `timings.json` (`audioUrl`, `total`, `starts` = startSeconds de cada línia) → `curl -o videos/NNN/voz.mp3 <audioUrl>`.
4. **Prova visual**: `python3 motor/render_video.py videos/NNN --stills t1,t2,…` (un fotograma per escena), fes un full de contactes i **mira'l**: res tallat, res tapant el comptador d'hores de dalt, textos llegibles. Corregeix i repeteix.
5. **Render**: `nohup python3 motor/render_video.py videos/NNN > videos/NNN/render.log 2>&1 &` (≈ 5 min de render per minut de vídeo; vigila el log). Surt `video.mp4`.
6. **Miniatura**: `python3 motor/make_thumb.py videos/NNN` → `thumb.jpg`. Mira-la. Per defecte porta el protagonista (`thumb.person: {fatigue, mood}`) a l'esquerra i 2–3 paraules grans a la dreta; sense `person` surt el cervell.
7. **Shorts** (2–3 per vídeo, 25–55 s, trams que s'entenguin sols): vertical nadiu 1080×1920 amb subtítols paraula a paraula i el protagonista: `python3 motor/render_video.py videos/NNN --short <línia_ini> <línia_fi> "<ganxo>" short1` (prova abans amb `--stills 2,15` al final i mira els fotogrames). `make_short.py` queda obsolet.
8. **Pujar**: `bash motor/publish_media.sh videos/NNN/video.mp4 videos/NNN/thumb.jpg videos/NNN/short1.mp4 …` → URL públiques → `vidiq_video_upload(url=…)` per a cada vídeo (uploadId) i `vidiq_upload_image(image=<url thumb>)` (imageId).
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

## Normes de YouTube que cal respectar
- Res de contingut repetitiu o de plantilla: cada vídeo amb guió, escenes i miniatura propis.
- Res de contingut angoixant o manipulador; res d'avatars d'IA que facin de metge.
- Les dades mèdiques han de ser correctes (política de desinformació mèdica).

## Si alguna cosa falla
- Si `curl` a assets.vidiq.com falla (403): el domini ja no està permès; avisa el Manel (Configuració → Capacitats → afegir `assets.vidiq.com`).
- Si vidIQ diu que no hi ha canal connectat: `vidiq_connect_youtube_channel` i passa-li l'enllaç.
- Si queden pocs crèdits: fes només 1 vídeo llarg aquella setmana i avisa'l.
