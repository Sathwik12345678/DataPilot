from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
import base64
from io import BytesIO


def generate_pdf(data):

    doc = SimpleDocTemplate("report.pdf", pagesize=letter)
    styles = getSampleStyleSheet()

    elements = []

    # ===============================
    # 📌 TITLE
    # ===============================
    elements.append(Paragraph("DataPilot AI Analytics Report", styles["Title"]))
    elements.append(Spacer(1, 20))

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

    elements.append(Paragraph("Dataset Overview", styles["Heading2"]))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(overview_text, styles["Normal"]))
    elements.append(Spacer(1, 20))

    # ===============================
    # 📋 COLUMN DETAILS
    # ===============================
    elements.append(Paragraph("Columns Included", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    for col in data["columns"]:
        elements.append(Paragraph(f"• {col}", styles["Normal"]))

    elements.append(Spacer(1, 20))

    # ===============================
    # 📈 STATISTICAL ANALYSIS
    # ===============================
    elements.append(Paragraph("Statistical Analysis", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    for col, stats in data["statistics"].items():

        explanation = (
            f"<b>{col}</b>: The mean value is {round(stats['mean'],2)}, "
            f"with a minimum of {stats['min']} and a maximum of {stats['max']}. "
            "This reflects the central tendency and spread of the dataset."
        )

        elements.append(Paragraph(explanation, styles["Normal"]))
        elements.append(Spacer(1, 10))

    elements.append(Spacer(1, 20))

    # ===============================
    # 📊 VISUAL ANALYTICS (CHART IMAGE)
    # ===============================
    if "chart_image" in data and data["chart_image"]:

        elements.append(Paragraph("Visual Analytics", styles["Heading2"]))
        elements.append(Spacer(1, 10))

        try:
            img_data = base64.b64decode(data["chart_image"].split(",")[1])
            image = Image(BytesIO(img_data))
            image.drawHeight = 300
            image.drawWidth = 500

            elements.append(image)
            elements.append(Spacer(1, 15))

            # Graph Explanation
            elements.append(Paragraph(
                "Graph Interpretation:",
                styles["Heading3"]
            ))

            elements.append(Spacer(1, 8))

            elements.append(Paragraph(
                "• The <b>Bar Chart</b> illustrates the average (mean) values across different features, "
                "helping identify which variables have higher magnitude.",
                styles["Normal"]
            ))

            elements.append(Paragraph(
                "• The <b>Line Chart</b> compares minimum and maximum values, highlighting variability and spread.",
                styles["Normal"]
            ))

            elements.append(Paragraph(
                "• The <b>Pie Chart</b> represents proportional distribution of top values, giving insight into dominance.",
                styles["Normal"]
            ))

        except Exception:
            elements.append(Paragraph("Error rendering chart image.", styles["Normal"]))

    elements.append(Spacer(1, 20))

    # ===============================
    # 🧠 AI INSIGHTS
    # ===============================
    elements.append(Paragraph("Key Insights", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    for col, stats in data["statistics"].items():

        if stats["max"] > stats["mean"] * 2:
            elements.append(Paragraph(
                f"⚠️ {col} contains potential outliers as maximum values exceed expected range.",
                styles["Normal"]
            ))

        if stats["max"] - stats["min"] < stats["mean"] * 0.5:
            elements.append(Paragraph(
                f"📊 {col} shows stable distribution with low variance.",
                styles["Normal"]
            ))

        if stats["max"] - stats["min"] > stats["mean"]:
            elements.append(Paragraph(
                f"📉 {col} has high variability indicating diverse data points.",
                styles["Normal"]
            ))

        elements.append(Spacer(1, 8))

    elements.append(Spacer(1, 20))

    # ===============================
    # 📌 FINAL CONCLUSION
    # ===============================
    conclusion_text = (
        "Conclusion: The dataset reveals important statistical patterns and variability across features. "
        "Certain attributes demonstrate stability, while others indicate potential anomalies or wide dispersion. "
        "These insights can be leveraged for predictive modeling, trend analysis, and data-driven decision-making."
    )

    elements.append(Paragraph("Conclusion", styles["Heading2"]))
    elements.append(Spacer(1, 10))
    elements.append(Paragraph(conclusion_text, styles["Normal"]))

    # ===============================
    # BUILD PDF
    # ===============================
    doc.build(elements)

    return "report.pdf"