#!/usr/bin/env python3
"""
NTM - Next Trends Monitor
Professional PDF Report Generator
"""

import json
import sys
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib import colors
from reportlab.lib.units import inch

# Color palette - NTM Branding
NTM_PRIMARY = colors.HexColor('#10B981')  # Emerald green
NTM_DARK = colors.HexColor('#1F2937')
NTM_GRAY = colors.HexColor('#6B7280')
NTM_LIGHT_GRAY = colors.HexColor('#F3F4F6')
NTM_ACCENT = colors.HexColor('#8B5CF6')  # Purple

def create_styles():
    """Create all paragraph styles"""
    styles = getSampleStyleSheet()
    
    # Cover page styles
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontSize=48,
        alignment=TA_CENTER,
        spaceAfter=10,
        textColor=NTM_PRIMARY
    ))
    
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontSize=20,
        alignment=TA_CENTER,
        spaceAfter=40,
        textColor=NTM_GRAY
    ))
    
    styles.add(ParagraphStyle(
        name='ReportTitle',
        fontSize=24,
        alignment=TA_CENTER,
        textColor=NTM_DARK
    ))
    
    # Section styles
    styles.add(ParagraphStyle(
        name='SectionTitleNTM',
        fontSize=16,
        alignment=TA_LEFT,
        spaceAfter=12,
        spaceBefore=20,
        textColor=NTM_DARK
    ))
    
    # Body styles
    styles.add(ParagraphStyle(
        name='BodyTextNTM',
        fontSize=11,
        alignment=TA_LEFT,
        spaceAfter=8,
        leading=16
    ))
    
    styles.add(ParagraphStyle(
        name='HighlightNTM',
        fontSize=11,
        alignment=TA_LEFT,
        spaceAfter=6,
        leftIndent=20,
        bulletIndent=10,
        leading=14
    ))
    
    # Table styles
    styles.add(ParagraphStyle(
        name='TableHeaderNTM',
        fontSize=10,
        textColor=colors.white,
        alignment=TA_CENTER
    ))
    
    styles.add(ParagraphStyle(
        name='TableCellNTM',
        fontSize=9,
        alignment=TA_LEFT
    ))
    
    # Footer style
    styles.add(ParagraphStyle(
        name='FooterNTM',
        fontSize=10,
        alignment=TA_CENTER,
        textColor=NTM_GRAY
    ))
    
    styles.add(ParagraphStyle(
        name='FooterURLNTM',
        fontSize=9,
        alignment=TA_CENTER,
        textColor=NTM_PRIMARY
    ))
    
    return styles

def get_type_color(report_type):
    """Get color based on report type"""
    colors_map = {
        'business_scan': NTM_PRIMARY,
        'trend_analysis': colors.HexColor('#F59E0B'),
        'digital_audit': colors.HexColor('#3B82F6'),
        'competitor_analysis': NTM_ACCENT,
    }
    return colors_map.get(report_type, NTM_PRIMARY)

def get_type_label(report_type, lang='en'):
    """Get label for report type"""
    labels = {
        'business_scan': {
            'en': 'Business Opportunity Analysis',
            'es': 'Analisis de Oportunidades de Negocio',
            'pt': 'Analise de Oportunidades de Negocio'
        },
        'trend_analysis': {
            'en': 'Trend Analysis Report',
            'es': 'Reporte de Analisis de Tendencias',
            'pt': 'Relatorio de Analise de Tendencias'
        },
        'digital_audit': {
            'en': 'Digital Presence Audit',
            'es': 'Auditoria de Presencia Digital',
            'pt': 'Auditoria de Presenca Digital'
        },
        'competitor_analysis': {
            'en': 'Competitor Analysis Report',
            'es': 'Reporte de Analisis de Competencia',
            'pt': 'Relatorio de Analise de Concorrencia'
        }
    }
    return labels.get(report_type, {}).get(lang, report_type)

def build_cover_page(story, styles, title, report_type, location=None, date=None, lang='en'):
    """Build the cover page"""
    story.append(Spacer(1, 120))
    story.append(Paragraph("<b>NTM</b>", styles['CoverTitle']))
    story.append(Paragraph("Next Trends Monitor", styles['CoverSubtitle']))
    story.append(Spacer(1, 20))
    story.append(Paragraph(f"<b>{title}</b>", styles['ReportTitle']))
    story.append(Spacer(1, 15))
    story.append(Paragraph(get_type_label(report_type, lang), ParagraphStyle(
        name='TypeLabel',
        fontSize=14,
        alignment=TA_CENTER,
        textColor=get_type_color(report_type)
    )))
    
    if location:
        story.append(Spacer(1, 40))
        story.append(Paragraph(f"Location: {location}", ParagraphStyle(
            name='Location',
            fontSize=12,
            alignment=TA_CENTER,
            textColor=NTM_GRAY
        )))
    
    if date:
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Date: {date}", ParagraphStyle(
            name='Date',
            fontSize=11,
            alignment=TA_CENTER,
            textColor=NTM_GRAY
        )))

def build_table(styles, headers, data, col_widths=None):
    """Build a styled table"""
    # Build header row
    table_data = [[f"<b>{h}</b>" for h in headers]]
    
    # Build data rows
    for row in data:
        table_data.append([str(cell) for cell in row])
    
    # Calculate column widths if not provided
    if not col_widths:
        page_width = letter[0] - 100
        col_widths = [page_width / len(headers)] * len(headers)
    
    table = Table(table_data, colWidths=col_widths)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NTM_PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D1D5DB')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    # Alternate row colors
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            table.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), NTM_LIGHT_GRAY)]))
        else:
            table.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), colors.white)]))
    
    return table

def generate_report(output_path, report_data):
    """Generate a professional PDF report"""
    
    # Extract data
    title = report_data.get('title', 'Business Analysis Report')
    report_type = report_data.get('type', 'business_scan')
    location = report_data.get('location')
    date = report_data.get('date', datetime.now().strftime('%B %d, %Y'))
    lang = report_data.get('lang', 'en')
    
    executive_summary = report_data.get('executive_summary', '')
    key_findings = report_data.get('key_findings', [])
    recommendations = report_data.get('recommendations', [])
    data_tables = report_data.get('data_tables', [])
    
    # Create document
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        title=title.replace(' ', '_'),
        author='Z.ai',
        creator='Z.ai',
        subject=f'NTM {get_type_label(report_type, lang)}',
        leftMargin=50,
        rightMargin=50,
        topMargin=50,
        bottomMargin=50
    )
    
    styles = create_styles()
    story = []
    
    # Cover page
    build_cover_page(story, styles, title, report_type, location, date, lang)
    
    # Executive Summary
    if executive_summary:
        story.append(Spacer(1, 50))
        story.append(Paragraph("<b>EXECUTIVE SUMMARY</b>", styles['SectionTitleNTM']))
        story.append(Paragraph(executive_summary, styles['BodyTextNTM']))
    
    # Key Findings
    if key_findings:
        story.append(Spacer(1, 20))
        story.append(Paragraph("<b>KEY FINDINGS</b>", styles['SectionTitleNTM']))
        for finding in key_findings:
            story.append(Paragraph(f"* {finding}", styles['HighlightNTM']))
    
    # Data Tables
    for table_info in data_tables:
        story.append(Spacer(1, 20))
        story.append(Paragraph(f"<b>{table_info.get('title', 'DATA')}</b>", styles['SectionTitleNTM']))
        
        if table_info.get('headers') and table_info.get('data'):
            table = build_table(
                styles,
                table_info['headers'],
                table_info['data'],
                table_info.get('col_widths')
            )
            story.append(table)
    
    # Recommendations
    if recommendations:
        story.append(Spacer(1, 20))
        story.append(Paragraph("<b>RECOMMENDATIONS</b>", styles['SectionTitleNTM']))
        for i, rec in enumerate(recommendations, 1):
            story.append(Paragraph(f"{i}. {rec}", styles['BodyTextNTM']))
    
    # Footer
    story.append(Spacer(1, 50))
    story.append(Paragraph("Generated by NTM - Next Trends Monitor", styles['FooterNTM']))
    story.append(Paragraph("https://ntm-next-trends-monitor.vercel.app", styles['FooterURLNTM']))
    
    # Build PDF
    doc.build(story)
    
    return output_path

def main():
    """Main entry point"""
    if len(sys.argv) < 3:
        print("Usage: python generate_ntm_report.py <output_path> <json_data>")
        sys.exit(1)
    
    output_path = sys.argv[1]
    json_data = json.loads(sys.argv[2])
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Generate report
    result = generate_report(output_path, json_data)
    print(f"PDF generated successfully: {result}")

if __name__ == "__main__":
    main()
