# Registre de qualitat
Cada error trobat a les revisions: data · vídeo · error · solució · causa corregida (sí/no).

| Data | Vídeo | Error | Solució | Causa corregida |
|---|---|---|---|---|
| 2026-11-23 | 001 | Música només 8 dB per sota de la veu | Volum 0,24 + ducking més fort (≈16 dB) | Sí (render_video.py) |
| 2026-11-23 | 001 | Subtítols dels Shorts: paraula ressaltada enganxada a l'anterior | Marge entre paraules i sense escalat | Sí (lib.js) |
| 2026-11-23 | 001 | Vídeo de 5 min (sense anuncis a mig vídeo) | Guió allargat a 7.900 caràcters | Sí (CLAUDE.md: 7.900–8.300) |
| 2026-11-23 | 001 | Títol «YA ME ACOSTUMBRÉ» tocava les vores | Text més curt | Sí (lib.js: el títol s'encongeix sol si passa de 1.700 px) |
| 2026-11-23 | 001 | Esborranys de YouTube perdien l'hora en canviar el vídeo | Tornar a enviar publishAt | Sí (CLAUDE.md pas 9) |
| 2026-11-24 | 001 | Textos petits per al mòbil, MAJÚSCULES espaiades, títol sobre la línia de temps, tipografia genèrica, elements petits | Revisió de disseny: Anton per als números i titulars, mínims de mida, etiquetes en minúscula (`lab()`), escenes més grans, miniatura amb el text més gran | Sí (lib.js, thumbnail.html, motor/DISSENY.md) |
