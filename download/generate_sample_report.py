from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Create document
doc = SimpleDocTemplate(
    "/home/z/my-project/download/NTM_Sample_Report.pdf",
    pagesize=letter,
    title="NTM_Business_Analysis_Report",
    author='Z.ai',
    creator='Z.ai'
)

# Styles
styles = getSampleStyleSheet()

cover_title = ParagraphStyle(
    name='CoverTitle',
    fontName='Times New Roman',
    fontSize=36,
    alignment=TA_CENTER,
    spaceAfter=20,
    textColor=colors.HexColor('#10B981')
)

cover_subtitle = ParagraphStyle(
    name='CoverSubtitle',
    fontName='Times New Roman',
    fontSize=18,
    alignment=TA_CENTER,
    spaceAfter=40,
    textColor=colors.HexColor('#6B7280')
)

section_title = ParagraphStyle(
    name='SectionTitle',
    fontName='Times New Roman',
    fontSize=18,
    alignment=TA_LEFT,
    spaceAfter=12,
    spaceBefore=20,
    textColor=colors.HexColor('#1F2937')
)

body_style = ParagraphStyle(
    name='BodyStyle',
    fontName='Times New Roman',
    fontSize=11,
    alignment=TA_LEFT,
    spaceAfter=8,
    leading=16
)

highlight_style = ParagraphStyle(
    name='Highlight',
    fontName='Times New Roman',
    fontSize=11,
    alignment=TA_LEFT,
    spaceAfter=6,
    leftIndent=20,
    bulletIndent=10,
    leading=14
)

# Build story
story = []

# Cover page
story.append(Spacer(1, 150))
story.append(Paragraph("NTM", cover_title))
story.append(Paragraph("Next Trends Monitor", cover_subtitle))
story.append(Spacer(1, 20))
story.append(Paragraph("Business Opportunity Analysis Report", ParagraphStyle(
    name='ReportTitle',
    fontName='Times New Roman',
    fontSize=24,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#374151')
)))
story.append(Spacer(1, 40))
story.append(Paragraph("Location: Palermo, Buenos Aires", ParagraphStyle(
    name='Location',
    fontName='Times New Roman',
    fontSize=14,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#6B7280')
)))
story.append(Paragraph("Date: March 19, 2024", ParagraphStyle(
    name='Date',
    fontName='Times New Roman',
    fontSize=12,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#9CA3AF')
)))

# Executive Summary
story.append(Spacer(1, 60))
story.append(Paragraph("EXECUTIVE SUMMARY", section_title))
story.append(Paragraph(
    "This report identifies 5 high-potential business opportunities in the Palermo area of Buenos Aires. "
    "These businesses have been selected based on their lack of digital presence, creating immediate "
    "opportunities for digital marketing services, website development, and online reputation management.",
    body_style
))

# Key Findings
story.append(Spacer(1, 20))
story.append(Paragraph("KEY FINDINGS", section_title))
story.append(Paragraph("• 4 out of 5 businesses have NO website", highlight_style))
story.append(Paragraph("• 3 businesses have unclaimed Google My Business profiles", highlight_style))
story.append(Paragraph("• Average rating: 4.0 stars (opportunity for review management)", highlight_style))
story.append(Paragraph("• Total potential revenue: $2,500 - $5,000 USD/month", highlight_style))

# Opportunities Table
story.append(Spacer(1, 20))
story.append(Paragraph("IDENTIFIED OPPORTUNITIES", section_title))

header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Times New Roman',
    fontSize=10,
    textColor=colors.white,
    alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    name='TableCell',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_LEFT
)

data = [
    [Paragraph('<b>Business</b>', header_style), 
     Paragraph('<b>Issues</b>', header_style), 
     Paragraph('<b>Rating</b>', header_style),
     Paragraph('<b>Opportunity</b>', header_style)],
    [Paragraph('Pizzeria Don Luigi', cell_style), 
     Paragraph('No website, Unclaimed GMB', cell_style), 
     Paragraph('4.2', cell_style),
     Paragraph('HIGH', cell_style)],
    [Paragraph('Ferreteria El Tornillo', cell_style), 
     Paragraph('No website, Low reviews', cell_style), 
     Paragraph('3.8', cell_style),
     Paragraph('MEDIUM', cell_style)],
    [Paragraph('Veterinaria Patitas', cell_style), 
     Paragraph('No website, No phone', cell_style), 
     Paragraph('4.7', cell_style),
     Paragraph('HIGH', cell_style)],
    [Paragraph('Boutique Rosa', cell_style), 
     Paragraph('Only Facebook, No own site', cell_style), 
     Paragraph('4.0', cell_style),
     Paragraph('MEDIUM', cell_style)],
    [Paragraph('Gimnasio Power Fit', cell_style), 
     Paragraph('No website, Low rating', cell_style), 
     Paragraph('3.5', cell_style),
     Paragraph('HIGH', cell_style)],
]

table = Table(data, colWidths=[1.8*inch, 2.2*inch, 0.8*inch, 1*inch])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#10B981')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F3F4F6')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F3F4F6')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))
story.append(table)

# Recommendations
story.append(Spacer(1, 30))
story.append(Paragraph("RECOMMENDATIONS", section_title))
story.append(Paragraph("1. Priority Contact: Pizzeria Don Luigi and Veterinaria Patitas (highest ratings, no digital presence)", body_style))
story.append(Paragraph("2. Services to offer: Website development ($500-1000), GMB optimization ($200-300/mo), Social media management ($300-500/mo)", body_style))
story.append(Paragraph("3. Email outreach template included in appendix", body_style))

# Footer
story.append(Spacer(1, 50))
story.append(Paragraph("Generated by NTM - Next Trends Monitor", ParagraphStyle(
    name='Footer',
    fontName='Times New Roman',
    fontSize=10,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#9CA3AF')
)))
story.append(Paragraph("https://ntm-next-trends-monitor.vercel.app", ParagraphStyle(
    name='FooterURL',
    fontName='Times New Roman',
    fontSize=9,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#10B981')
)))

# Build PDF
doc.build(story)
print("PDF generated successfully!")
