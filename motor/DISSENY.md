# Guia de disseny — «Cuerpo al Límite» (v1, 24/11/2026)
Revisada amb les guies `frontend-design`, `video-making` i `dataviz`. Tot el que no surti aquí, decideix-ho amb aquest criteri.

## Idea
Canal de ciència del cos «al límit», per a un públic jove llatinoamericà que mira **al mòbil**. Fons de nit (el cos de nit, sense dormir), dades grosses i un protagonista que pateix el que expliquem. El segell reconeixible: **la línia de temps amb la cara del protagonista** i **els números enormes en Anton**. Tota la resta, discret.

## Color (cada color vol dir una cosa; no els barregis per decorar)
| Token | Hex | Significat |
|---|---|---|
| Nit (fons) | #060914 → #1A1446 | fons de totes les escenes |
| Dany | #FB7185 (red) | el que empitjora, risc, alarma |
| Recuperació | #67E8F9 (cyan) | el que millora, normalitat, què fer |
| Dada clau | #FDE047 (yellow) | la xifra o el límit que cal recordar |
| Protagonista / interfície | #A78BFA (violet) | el personatge, la línia de temps |
| Text | #FFFFFF / #E2E8F0 / #CBD5E1 | títol / text / secundari |

## Tipografia
- **Anton** (estreta i contundent): números, titulars i paraules-xoc. Un sol element en Anton per escena és el protagonista visual.
- **Inter Display**: tot el text. Etiquetes en **minúscula normal** (la funció `lab()` ho fa sola); res de MAJÚSCULES espaiades.
- Mides mínimes a 1080p (pensant en el mòbil): text llegible ≥ 40 px, subtítol d'escena 52 px, etiquetes ≥ 36 px. Només les fonts de la cantonada poden ser petites.

## Composició
- Una idea per escena. L'element principal ocupa **≥ 50 % de l'alçada**; res de coses petites flotant al mig del buit.
- Res a menys de 120 px de les vores (la càmera es mou i retalla) i res a la franja de dalt (0–170 px), que és de la línia de temps.
- Il·lustració a l'esquerra + text a la dreta (alineat a l'esquerra), o bé tot centrat si l'escena és un número o un titular.
- Moviment: un sol gest per escena (l'entrada de l'element principal); no animis cada cosa.

## Miniatura
- Protagonista a l'esquerra amb l'emoció del tema, 2–4 paraules en Anton a la dreta (número en el color del significat), una etiqueta curta a sota.
- Prova obligatòria: reduïda a 320×180 s'ha de llegir el número i entendre de què va en 1 segon.
