import csv, sys, zipfile
sys.path.insert(0, '.')
from tarjetas import T, F
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import CondPageBreak, SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import mm

D = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('DV', D + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DVB', D + 'DejaVuSans-Bold.ttf'))
TIT = 'Ciencia del sueño'
SUB = f'{len(T)} tarjetas de estudio con fuentes científicas'
ETQ = {'bases': 'Cómo funciona el sueño', 'privacion': 'Privación extrema', 'cerebro': 'El cerebro sin dormir',
       'rendimiento': 'Rendimiento y accidentes', 'cuerpo': 'Hambre, metabolismo e inmunidad',
       'recomendaciones': 'Cuánto dormir y la cafeína'}

# 1) CSV para Anki (separado por tabulaciones, con etiquetas)
with open('ciencia_del_sueno_anki.txt', 'w', encoding='utf-8', newline='') as f:
    f.write('#separator:tab\n#html:true\n#tags column:3\n')
    w = csv.writer(f, delimiter='\t', quoting=csv.QUOTE_MINIMAL)
    for q, a, s, t in T:
        w.writerow([q, f'{a}<br><br><small>Fuente: {F[s]}</small>', f'ciencia_del_sueno::{t}'])

# 2) PDF
ink, accent, mute = colors.HexColor('#1E1B4B'), colors.HexColor('#6D28D9'), colors.HexColor('#64748B')
st = lambda n, **k: ParagraphStyle(n, fontName=k.pop('f', 'DV'), **k)
H1 = st('h1', f='DVB', fontSize=30, leading=36, textColor=ink, spaceAfter=6)
H2 = st('h2', f='DVB', fontSize=16, leading=20, textColor=accent, spaceBefore=10, spaceAfter=8)
P = st('p', fontSize=10.5, leading=15, textColor=ink, spaceAfter=6)
Q = st('q', f='DVB', fontSize=10.5, leading=14, textColor=ink)
A = st('a', fontSize=10, leading=14, textColor=ink)
S = st('s', fontSize=8, leading=10, textColor=mute)

def foot(c, d):
    c.setFont('DV', 8); c.setFillColor(mute)
    c.drawString(18*mm, 10*mm, 'Notable · Ciencia del sueño · Contenido divulgativo; no sustituye el consejo médico.')
    c.drawRightString(192*mm, 10*mm, str(d.page))

doc = SimpleDocTemplate('ciencia_del_sueno_guia.pdf', pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                        topMargin=18*mm, bottomMargin=18*mm, title=TIT, author='Notable')
E = [Spacer(1, 40*mm), Paragraph(TIT, H1), Paragraph(SUB, st('sub', fontSize=14, leading=18, textColor=mute)),
     Spacer(1, 10*mm),
     Paragraph('Qué incluye', H2),
     Paragraph(f'• {len(T)} tarjetas pregunta-respuesta en 6 bloques, cada una con su fuente.', P),
     Paragraph('• Archivo listo para importar en Anki (ciencia_del_sueno_anki.txt).', P),
     Paragraph('• Esta guía en PDF para repasar o imprimir.', P),
     Paragraph('Cómo importarlo en Anki', H2),
     Paragraph('1. Abre Anki en el ordenador → Archivo → Importar.', P),
     Paragraph('2. Elige <b>ciencia_del_sueno_anki.txt</b>. Anki detecta solo el separador y las etiquetas.', P),
     Paragraph('3. Tipo de nota: «Básico». Mazo: crea uno llamado «Ciencia del sueño» → Importar.', P),
     Paragraph('Funciona también en AnkiDroid y AnkiMobile tras sincronizar.', P),
     Paragraph('Sobre el contenido', H2),
     Paragraph('Las tarjetas se redactaron con ayuda de IA y se revisaron una a una contra las fuentes citadas. '
               'Los estudios hechos en animales están señalados. Es material divulgativo y de estudio: '
               'no es consejo médico.', P),
     PageBreak()]
for k, nombre in ETQ.items():
    E += [CondPageBreak(60*mm), Paragraph(nombre, H2)]
    rows = []
    for q, a, s, t in T:
        if t == k:
            rows.append([Paragraph(q, Q), Paragraph(a, A)])
            rows.append([Paragraph('', S), Paragraph('Fuente: ' + F[s], S)])
    tb = Table(rows, colWidths=[72*mm, 102*mm])
    tb.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'),
                            ('LINEBELOW', (0, 1), (-1, -1), 0.3, colors.HexColor('#E2E8F0')),
                            ('BOTTOMPADDING', (0, 0), (-1, -1), 4), ('TOPPADDING', (0, 0), (-1, -1), 3)]))
    # solo línea bajo la fila de fuente (filas impares)
    tb.setStyle(TableStyle([('LINEBELOW', (0, i), (-1, i), 0, colors.white) for i in range(0, len(rows), 2)]))
    E += [tb, Spacer(1, 4*mm)]
E += [PageBreak(), Paragraph('Fuentes', H2)]
for v in sorted(set(F[s] for _, _, s, _ in T)):
    E.append(Paragraph('• ' + v, st('src', fontSize=9, leading=12, textColor=ink, spaceAfter=3)))
doc.build(E, onFirstPage=foot, onLaterPages=foot)

with zipfile.ZipFile('ciencia_del_sueno_notable.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    z.write('ciencia_del_sueno_anki.txt'); z.write('ciencia_del_sueno_guia.pdf')
print('ok', len(T))
