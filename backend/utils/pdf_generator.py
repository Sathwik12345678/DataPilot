from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import base64
from io import BytesIO
from PIL import Image as PILImage
import os
import time
from datetime import datetime


def compress_image(image_data: bytes, max_width: int = 500, max_height: int = 350, quality: int = 85) -> BytesIO:
    """Compress and optimize image for PDF embedding."""
    try:
        img = PILImage.open(BytesIO(image_data))
        
        if img.mode == 'RGBA':
            img = img.convert('RGB')
        
        img.thumbnail((max_width, max_height), PILImage.Resampling.LANCZOS)
        
        compressed_io = BytesIO()
        img.save(compressed_io, format='JPEG', quality=quality, optimize=True)
        compressed_io.seek(0)
        
        return compressed_io
    except Exception as e:
        print(f"Image compression error: {e}")
        return BytesIO(image_data)


def generate_pdf(data):
    """Generate professional data science report PDF."""
    
    timestamp = int(time.time() * 1000)
    pdf_filename = f"report_{timestamp}.pdf"
    
    doc = SimpleDocTemplate(
        pdf_filename, 
        pagesize=letter,
        topMargin=0.75*inch, 
        bottomMargin=0.75*inch,
        leftMargin=0.75*inch,
        rightMargin=0.75*inch
    )
    
    styles = getSampleStyleSheet()
    
    # Professional color scheme
    PRIMARY_COLOR = '#0B5394'      # Deep Blue
    SECONDARY_COLOR = '#2E7D32'    # Forest Green
    ACCENT_COLOR = '#D32F2F'       # Red
    LIGHT_BG = '#F5F5F5'           # Light Gray
    TEXT_COLOR = '#212121'         # Dark Gray
    
    # Create custom styles
    styles.add(ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontSize=32,
        textColor=colors.HexColor(PRIMARY_COLOR),
        spaceAfter=12,
        fontName='Helvetica-Bold',
        alignment=1  # Center
    ))
    
    styles.add(ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor(SECONDARY_COLOR),
        spaceAfter=8,
        alignment=1,  # Center
        fontName='Helvetica-Oblique'
    ))
    
    styles.add(ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor(PRIMARY_COLOR),
        spaceAfter=12,
        spaceBefore=16,
        fontName='Helvetica-Bold',
        borderPadding=8,
        backColor=colors.HexColor(LIGHT_BG),
        leftIndent=10
    ))
    
    styles.add(ParagraphStyle(
        'SubsectionHeading',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor(ACCENT_COLOR),
        spaceAfter=8,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    ))
    
    styles.add(ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor(TEXT_COLOR),
        spaceAfter=8,
        alignment=4  # Justify
    ))
    
    styles.add(ParagraphStyle(
        'TableCaption',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#666666'),
        spaceAfter=6,
        fontName='Helvetica-Oblique'
    ))
    
    elements = []
    
    # ====================================
    # 📄 TITLE PAGE
    # ====================================
    elements.append(Spacer(1, 1.5*inch))
    elements.append(Paragraph("📊 DataPilot", styles['ReportTitle']))
    elements.append(Paragraph("Data Science Analytics Report", styles['Subtitle']))
    elements.append(Spacer(1, 0.5*inch))
    
    # Report metadata
    metadata_table_data = [
        ["Report Date:", datetime.now().strftime('%B %d, %Y')],
        ["Time Generated:", datetime.now().strftime('%I:%M %p')],
        ["Data Source:", data.get('filename', 'Unknown')],
        ["Dataset Size:", f"{data.get('original_rows', data['rows']):,} records"],
    ]
    
    metadata_table = Table(metadata_table_data, colWidths=[2*inch, 2*inch])
    metadata_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor(PRIMARY_COLOR)),
        ('LINEBELOW', (0, 0), (-1, -1), 1, colors.HexColor(LIGHT_BG)),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(metadata_table)
    
    elements.append(Spacer(1, 1*inch))
    elements.append(Paragraph("Professional Data Analysis & Insights", styles['Subtitle']))
    elements.append(PageBreak())
    
    # ====================================
    # 📋 EXECUTIVE SUMMARY
    # ====================================
    elements.append(Paragraph("📋 Executive Summary", styles['SectionHeading']))
    
    # Build summary text with conditional sampling info
    sampling_info = (
        f"Due to dataset size, a <b>{data.get('sample_percentage', 100)}% random sample</b> was analyzed for performance optimization."
        if data.get('is_sampled')
        else "The complete dataset was analyzed."
    )
    
    summary_text = (
        f"This comprehensive data science report analyzes a dataset containing "
        f"<b>{data.get('original_rows', data['rows']):,} records</b> across "
        f"<b>{len(data['columns'])}</b> attributes, with <b>{data.get('numeric_column_count', len([k for k in data.get('statistics', {})]))}</b> numeric features. "
        f"The analysis reveals key statistical patterns, anomalies, and correlations that provide "
        f"actionable insights for decision-making. "
        f"{sampling_info}"
    )
    elements.append(Paragraph(summary_text, styles['BodyText']))
    elements.append(Spacer(1, 0.3*inch))
    
    # ====================================
    # 📊 DATA OVERVIEW
    # ====================================
    elements.append(Paragraph("📊 Data Overview", styles['SectionHeading']))
    
    overview_data = [
        ["Metric", "Value", "Description"],
        ["Total Records", f"{data['rows']:,}", "Number of rows analyzed"],
        ["Total Attributes", f"{len(data['columns'])}", "Number of columns"],
        ["Numeric Features", f"{data.get('numeric_column_count', len(data.get('statistics', {})))}", "Quantitative columns"],
        ["Missing Values", f"{sum(data.get('missing_values', {}).values())}", "Total missing data points"],
        ["Sample Rate", f"{data.get('sample_percentage', 100)}%", "Data coverage"],
    ]
    
    overview_table = Table(overview_data, colWidths=[1.8*inch, 1.5*inch, 2.7*inch])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(PRIMARY_COLOR)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor(LIGHT_BG)),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#CCCCCC')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#F9F9F9')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(overview_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # Column list
    col_text = ", ".join(data["columns"][:20])
    if len(data["columns"]) > 20:
        col_text += f", ... and {len(data['columns']) - 20} more columns"
    
    elements.append(Paragraph("Columns:", styles['SubsectionHeading']))
    elements.append(Paragraph(col_text, styles['BodyText']))
    elements.append(Spacer(1, 0.1*inch))
    
    # ====================================
    # 🔢 STATISTICAL ANALYSIS
    # ====================================
    elements.append(PageBreak())
    elements.append(Paragraph("🔢 Statistical Analysis", styles['SectionHeading']))
    
    stats_items = list(data.get("statistics", {}).items())[:10]
    
    # Create detailed statistics table
    stats_data = [["Feature", "Mean", "Min", "Max", "Std Dev"]]
    
    for col, stats in stats_items:
        stats_data.append([
            col[:15],  # Truncate long names
            f"{stats.get('mean', 0):.2f}",
            f"{stats.get('min', 0):.2f}",
            f"{stats.get('max', 0):.2f}",
            f"{stats.get('std', 0):.2f}"
        ])
    
    if len(data.get("statistics", {})) > 10:
        stats_data.append(["... and more", "→", "→", "→", "→"])
    
    stats_table = Table(stats_data, colWidths=[1.4*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor(SECONDARY_COLOR)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor(LIGHT_BG)),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#DDD')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#FFFFFF'), colors.HexColor('#FAFAFA')]),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    elements.append(Paragraph("Summary Statistics Table", styles['TableCaption']))
    elements.append(stats_table)
    elements.append(Spacer(1, 0.15*inch))
    
    # ====================================
    # 📈 VISUAL ANALYTICS
    # ====================================
    if "chart_image" in data and data["chart_image"]:
        elements.append(PageBreak())
        elements.append(Paragraph("📈 Visual Analytics", styles['SectionHeading']))
        elements.append(Paragraph(
            "Comprehensive visualizations showing data distribution, trends, and relationships:",
            styles['BodyText']
        ))
        elements.append(Spacer(1, 0.15*inch))
        
        try:
            img_data = base64.b64decode(data["chart_image"].split(",")[1])
            img_io = compress_image(img_data, max_width=550, max_height=400, quality=85)
            
            chart_image = Image(img_io, width=5.5*inch, height=4*inch)
            elements.append(chart_image)
            
            elements.append(Spacer(1, 0.15*inch))
            
            chart_desc = (
                "<b>Chart Components:</b><br/>"
                "• <b>Bar Chart (Left):</b> Average values across features - identifies high-magnitude variables<br/>"
                "• <b>Line Chart (Center):</b> Min/Max range comparison - shows data spread and variability<br/>"
                "• <b>Pie Chart (Right):</b> Top value distribution - illustrates proportional relationships"
            )
            elements.append(Paragraph(chart_desc, styles['BodyText']))
            
        except Exception as e:
            elements.append(Paragraph(
                f"<i>Chart visualization unavailable: {str(e)}</i>",
                styles['BodyText']
            ))
    
    # ====================================
    # 🧠 KEY FINDINGS & INSIGHTS
    # ====================================
    elements.append(PageBreak())
    elements.append(Paragraph("🧠 Key Findings & Insights", styles['SectionHeading']))
    
    findings = []
    
    # Outlier detection
    outlier_cols = []
    for col, stats in list(data["statistics"].items())[:8]:
        if stats["max"] > stats["mean"] * 2.5:
            outlier_cols.append(col)
    
    if outlier_cols:
        findings.append(
            f"<b>⚠️  Outliers Detected:</b> Features {', '.join(outlier_cols[:3])} contain values "
            f"significantly exceeding normal ranges, suggesting either rare events or data quality issues."
        )
    
    # Variability analysis
    high_var_cols = []
    for col, stats in list(data["statistics"].items())[:8]:
        if stats["std"] > stats["mean"] * 0.5:
            high_var_cols.append(col)
    
    if high_var_cols:
        findings.append(
            f"<b>📊 High Variability:</b> {', '.join(high_var_cols[:2])} show significant variance, "
            f"indicating diverse data distribution patterns."
        )
    
    # Stability analysis
    stable_cols = []
    for col, stats in list(data["statistics"].items())[:8]:
        if stats["std"] < stats["mean"] * 0.2:
            stable_cols.append(col)
    
    if stable_cols:
        findings.append(
            f"<b>✓ Stable Features:</b> {', '.join(stable_cols[:2])} demonstrate consistent values "
            f"with minimal variance, suitable for baseline comparisons."
        )
    
    # Data quality
    missing_total = sum(data.get("missing_values", {}).values())
    if missing_total > 0:
        missing_pct = (missing_total / (data['rows'] * len(data['columns']))) * 100
        findings.append(
            f"<b>🔍 Data Quality:</b> {missing_total} missing values detected ({missing_pct:.1f}% of total data). "
            f"Consider imputation or removal strategies for analysis."
        )
    
    # Add findings with proper formatting
    for i, finding in enumerate(findings[:6], 1):
        elements.append(Paragraph(f"{i}. {finding}", styles['BodyText']))
        elements.append(Spacer(1, 0.1*inch))
    
    # ====================================
    # 📌 RECOMMENDATIONS
    # ====================================
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("📌 Recommendations", styles['SectionHeading']))
    
    recommendations = [
        "Investigate flagged outliers to determine if they represent valid anomalies or measurement errors",
        "Consider feature engineering for high-variance columns to improve model stability",
        "Apply appropriate data imputation techniques for missing values based on domain knowledge",
        "Perform correlation analysis to identify feature relationships and multicollinearity",
        "Use data scaling/normalization before applying machine learning algorithms",
        "Validate findings on holdout test data to ensure model generalization"
    ]
    
    for i, rec in enumerate(recommendations, 1):
        elements.append(Paragraph(f"• {rec}", styles['BodyText']))
        elements.append(Spacer(1, 0.08*inch))
    
    # ====================================
    # 📄 FOOTER & METADATA
    # ====================================
    elements.append(Spacer(1, 0.3*inch))
    elements.append(PageBreak())
    
    footer_text = (
        "<b>Report Information</b><br/>"
        f"Generated by: DataPilot AI Analytics Platform<br/>"
        f"Report Type: Comprehensive Data Science Analysis<br/>"
        f"Analysis Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}<br/>"
        f"Data File: {data.get('filename', 'Unknown')}<br/>"
        f"<br/><i>This report provides statistical analysis and visualizations for exploratory data analysis (EDA). "
        f"Recommendations should be validated with domain experts before implementation.</i>"
    )
    
    elements.append(Paragraph(footer_text, styles['BodyText']))
    
    # Build PDF
    doc.build(elements)
    
    return "report.pdf"


def generate_pdf(data):
    """Generate optimized PDF report with enhanced visual design."""
    
    # Use timestamp for unique filename
    timestamp = int(time.time() * 1000)
    pdf_filename = f"report_{timestamp}.pdf"
    
    doc = SimpleDocTemplate(pdf_filename, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    
    # Create custom styles for better visual appearance
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=colors.HexColor('#1f77b4'),
        spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2ca02c'),
        spaceAfter=6,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderPadding=4,
        backColor=colors.HexColor('#f0f0f0')
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubheading',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=colors.HexColor('#d62728'),
        spaceAfter=4,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        leading=12,
        textColor=colors.HexColor('#333333')
    )

    elements = []

    # ===============================
    # 📌 HEADER WITH DATE/TIME
    # ===============================
    header_text = f"DataPilot Analytics Report | Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
    elements.append(Paragraph(header_text, styles["Normal"]))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph("="*80, styles["Normal"]))
    elements.append(Spacer(1, 12))

    # ===============================
    # 📌 TITLE
    # ===============================
    elements.append(Paragraph("📊 DataPilot AI Analytics Report", title_style))
    elements.append(Spacer(1, 12))

    # ===============================
    # 📊 DATASET OVERVIEW
    # ===============================
    overview_text = (
        f"This report presents a comprehensive analysis of the uploaded dataset. "
        f"The dataset contains <b>{data['rows']}</b> records and "
        f"<b>{len(data['columns'])}</b> features. "
        "The objective is to explore statistical properties, detect anomalies, "
        "and derive meaningful insights for decision-making."
    )

    elements.append(Paragraph("Dataset Overview", heading_style))
    elements.append(Paragraph(overview_text, normal_style))
    elements.append(Spacer(1, 12))

    # ===============================
    # 📋 QUICK STATISTICS TABLE
    # ===============================
    elements.append(Paragraph("Quick Statistics", heading_style))
    elements.append(Spacer(1, 8))
    
    total_stats = data.get("statistics", {})
    numeric_cols = len(total_stats)
    
    stats_data = [
        ["Metric", "Value"],
        ["Total Rows", f"{data['rows']:,}"],
        ["Total Columns", f"{len(data['columns'])}"],
        ["Numeric Columns", f"{numeric_cols}"],
        ["Missing Values", f"{sum(data.get('missing_values', {}).values())}"],
    ]
    
    stats_table = Table(stats_data, colWidths=[2.5*inch, 2.5*inch])
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f77b4')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f9f9f9')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f5f5f5')]),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 12))

    # ===============================
    # 📋 COLUMN DETAILS
    # ===============================
    elements.append(Paragraph("Columns Included", heading_style))
    elements.append(Spacer(1, 8))

    # Group columns into rows to save space - show first 15
    col_text = ", ".join(data["columns"][:15])
    if len(data["columns"]) > 15:
        col_text += f", ... and {len(data['columns']) - 15} more"
    
    elements.append(Paragraph(col_text, normal_style))
    elements.append(Spacer(1, 12))

    # ===============================
    # 📈 STATISTICAL ANALYSIS
    # ===============================
    elements.append(Paragraph("Detailed Statistical Analysis", heading_style))
    elements.append(Spacer(1, 8))

    # Limit statistics to first 12 columns for performance
    stats_items = list(data.get("statistics", {}).items())[:12]
    
    for idx, (col, stats) in enumerate(stats_items):
        explanation = (
            f"<b>{col}</b>: Mean={round(stats['mean'], 2)}, "
            f"Min={stats['min']}, Max={stats['max']}, Std Dev={round(stats.get('std', 0), 2)}"
        )
        elements.append(Paragraph(explanation, normal_style))
        elements.append(Spacer(1, 4))
        
        # Add page break after every 6 columns to maintain readability
        if (idx + 1) % 6 == 0 and idx < len(stats_items) - 1:
            elements.append(PageBreak())
            elements.append(Paragraph("Detailed Statistical Analysis (Continued)", heading_style))
            elements.append(Spacer(1, 8))

    if len(data.get("statistics", {})) > 12:
        elements.append(Paragraph(
            f"<i>... and {len(data.get('statistics', {})) - 12} more statistics columns</i>",
            normal_style
        ))
    
    elements.append(Spacer(1, 20))

    # ===============================
    # 📊 VISUAL ANALYTICS (CHART IMAGE)
    # ===============================
    if "chart_image" in data and data["chart_image"]:

        elements.append(Paragraph("Visual Analytics Dashboard", heading_style))
        elements.append(Spacer(1, 10))

        try:
            img_data = base64.b64decode(data["chart_image"].split(",")[1])
            image = Image(BytesIO(img_data))
            image.drawHeight = 350
            image.drawWidth = 550

            elements.append(image)
            elements.append(Spacer(1, 15))

            # Graph Explanation
            elements.append(Paragraph(
                "Chart Interpretation Guide:",
                subheading_style
            ))

            elements.append(Spacer(1, 8))

            elements.append(Paragraph(
                "<b>Bar Chart:</b> Displays the mean (average) values across different features, "
                "helping identify which variables have higher magnitude values.",
                normal_style
            ))
            elements.append(Spacer(1, 4))

            elements.append(Paragraph(
                "<b>Line Chart:</b> Compares minimum and maximum values, highlighting the range and variability of data spread.",
                normal_style
            ))
            elements.append(Spacer(1, 4))

            elements.append(Paragraph(
                "<b>Pie Chart:</b> Represents proportional distribution of top values across columns, giving insight into data dominance.",
                normal_style
            ))

        except Exception as e:
            elements.append(Paragraph(f"Note: Chart visualization currently unavailable. ({str(e)})", normal_style))

        elements.append(Spacer(1, 20))

    # ===============================
    # 🧠 AI INSIGHTS & ANOMALIES
    # ===============================
    elements.append(Paragraph("Key Insights & Anomaly Detection", heading_style))
    elements.append(Spacer(1, 10))

    insight_count = 0
    for col, stats in list(data["statistics"].items())[:10]:  # Show insights for top 10 columns

        if stats["max"] > stats["mean"] * 2:
            elements.append(Paragraph(
                f"⚠️  <b>{col}</b> contains potential outliers as maximum values ({stats['max']}) "
                f"exceed average ({round(stats['mean'], 2)}) by 2x.",
                normal_style
            ))
            insight_count += 1

        if stats["max"] - stats["min"] < stats["mean"] * 0.5:
            elements.append(Paragraph(
                f"✓ <b>{col}</b> shows stable distribution with low variance (range: {stats['max'] - stats['min']}).",
                normal_style
            ))
            insight_count += 1

        if stats["max"] - stats["min"] > stats["mean"] * 1.5:
            elements.append(Paragraph(
                f"📊 <b>{col}</b> has high variability (coefficient: {round((stats['max'] - stats['min']) / stats['mean'], 2)}) "
                f"indicating diverse data points.",
                normal_style
            ))
            insight_count += 1

        elements.append(Spacer(1, 6))
        
        # Add page break if too many insights
        if insight_count > 12:
            elements.append(PageBreak())
            elements.append(Paragraph("Key Insights (Continued)", heading_style))
            elements.append(Spacer(1, 10))
            insight_count = 0

    elements.append(Spacer(1, 20))

    # ===============================
    # 📌 FINAL CONCLUSION
    # ===============================
    conclusion_text = (
        "Conclusion: The dataset reveals important statistical patterns and variability across features. "
        "Certain attributes demonstrate stability and consistency, while others indicate potential anomalies or wide dispersion. "
        "These insights can be leveraged for predictive modeling, trend analysis, feature engineering, and data-driven decision-making. "
        "Consider investigating flagged anomalies further for data quality assessment."
    )

    elements.append(Paragraph("Executive Summary & Conclusion", heading_style))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(conclusion_text, normal_style))
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("="*80, styles["Normal"]))
    elements.append(Spacer(1, 8))
    elements.append(Paragraph(
        "Report generated by DataPilot AI Analytics Platform | www.datapilot.ai",
        ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#999999'), alignment=1)
    ))

    # ===============================
    # BUILD PDF
    # ===============================
    doc.build(elements)

    return "report.pdf"