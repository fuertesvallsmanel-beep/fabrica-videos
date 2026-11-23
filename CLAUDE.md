# Fàbrica de vídeos — «Cuerpo al Límite»

Canal de YouTube en **espanyol llatí neutre**, sense cara, de divulgació científica animada:
*«¿Qué le pasa a tu cuerpo / a tu cerebro si…?»*. Propietari: Manel (estudiant de Medicina, UAB).
Parla-li en **català**. Ell no vol haver de fer res excepte aprovar la setmana amb un «OK».

## Dades fixes
- Canal YouTube: «Cuerpo al límite» · platformAccountId `UCBW01NZn4nRgxc_-gKPTY2Q`
- vidIQ: pla Boost (2.000 crèdits/mes, es renoven el dia 23). **Pressupost: ≤ 900 crèdits per setmana.**
- Veu: vidIQ `vidiq_voiceover_generate`, voiceId **`EK54is7sa3aPFLD9BwCC`** (Francisco, llatí neutre). Sempre amb `scriptLines` (una línia = una escena).
- Música: el render sintetitza un fons ambiental propi (no gastis crèdits en música).
- Les URL de `assets.vidiq.com` es poden baixar amb `curl` des d'aquí.

## Feina de cada execució setmanal (2 vídeos llargs + 4–6 Shorts)
1. **Temes**: agafa els 2 primers temes pendents de `temas.md` (alterna línies H/C/E). Fes 1 `vidiq_outliers` (es, long, threeMonths, maxSubscribers 100000) per confirmar que el tema encara funciona i per inspirar el títol.
2. **Guió** → `videos/NNN-slug/video.json` (copia l'estructura de `videos/001-72h-sin-dormir/video.json`):
   - 35–45 línies, **6.000–7.000 caràcters** (≈ 8 minuts; a partir de 8 min YouTube permet anuncis a mig vídeo).
   - Estructura: ganxo amb una dada o història real (0–15 s) → promesa («hora a hora», «lo que dice la ciencia de verdad») → explicació → clímax → part positiva / què fer → tancament «suscríbete».
   - **Rigor**: cada dada numèrica ha de venir d'una font real (revista revisada per experts o organisme oficial) i anar a `sources`. Si no estàs segur d'una xifra, no la posis. Diferencia estudis en animals. Res de consells mèdics personalitzats ni de mites (l'angle del canal és desmuntar mites).
   - Espanyol llatí neutre: «manejar» (no «conducir un coche»), «enojarse», «se te antoja», sense «vale» ni «vosotros».
   - Cada línia té `scene` d'un tipus que existeixi a `motor/lib.js`: `counter, title, question, brain (mode: adenosine|flow|scn|patches), receptor, clock, gauge, bars, wave, flicker, road, body, stats, amygdala, list, cells, memory, steps, distort, quote, hypnogram, endcard`. Mira com s'usen al vídeo 001. **Si un tema necessita un òrgan o gràfic nou (cor, fetge, pulmons, ronyó, estómac, mapa…), afegeix un tipus d'escena nou i reutilitzable a `lib.js`** amb el mateix estil (fons fosc, línies brillants, colors de la paleta `C`).
   - Afegeix `title` (≤ 100 caràcters, amb ganxo), `short_title` i `thumb` (vegeu el 001).
3. **Veu**: `vidiq_voiceover_generate` amb `scriptLines` → desa `timings.json` (`audioUrl`, `total`, `starts` = startSeconds de cada línia) → `curl -o videos/NNN/voz.mp3 <audioUrl>`.
4. **Prova visual**: `python3 motor/render_video.py videos/NNN --stills t1,t2,…` (un fotograma per escena), fes un full de contactes i **mira'l**: res tallat, res tapant el comptador d'hores de dalt, textos llegibles. Corregeix i repeteix.
5. **Render**: `nohup python3 motor/render_video.py videos/NNN > videos/NNN/render.log 2>&1 &` (≈ 5 min de render per minut de vídeo; vigila el log). Surt `video.mp4`.
6. **Miniatura**: `python3 motor/make_thumb.py videos/NNN` → `thumb.jpg`. Mira-la.
7. **Shorts** (2–3 per vídeo, 25–55 s, trams que s'entenguin sols): `python3 motor/make_short.py videos/NNN <línia_ini> <línia_fi> "<ganxo>" short1`.
8. **Pujar**: `bash motor/publish_media.sh videos/NNN/video.mp4 videos/NNN/thumb.jpg videos/NNN/short1.mp4 …` → URL públiques → `vidiq_video_upload(url=…)` per a cada vídeo (uploadId) i `vidiq_upload_image(image=<url thumb>)` (imageId).
9. **Esborranys** amb `vidiq_social_post_draft_create` (destinació YOUTUBE, el platformAccountId de dalt, `privacyStatus: "public"`, `categoryId: 27` Educació, `publishAt` programat):
   - Vídeos llargs: dimarts i divendres a les **00:00 UTC** (18:00 Mèxic, 19:00 Colòmbia, 21:00 Argentina: 2–3 h abans del pic d'audiència). Shorts: un cada dia a les **22:00 UTC** (16:00 Mèxic, sortida d'escola/feina).
   - Descripció: 2–3 frases de ganxo + capítols (`00:00 …`, a partir de `timings.json`; el primer ha de ser 00:00 i mínim 3) + «Fuentes:» amb la llista + «Contenido divulgativo; no sustituye el consejo médico.» + 3 hashtags.
   - Tags: 10–15 en castellà. Miniatura: `thumbnailImageId`.
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
