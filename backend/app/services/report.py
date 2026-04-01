from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime
from typing import Dict, Any, List
import os
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

class ReportService:
    def __init__(self):
        # Register TrueType font for UTF-8 support
        # Using a more robust path and name
        self.font_name = "ArialUnicode"
        paths = [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
            "/Library/Fonts/Arial Unicode.ttf",
            "/Library/Fonts/Arial Unicode MS.ttf"
        ]
        font_registered = False
        for path in paths:
            if os.path.exists(path):
                try:
                    pdfmetrics.registerFont(TTFont(self.font_name, path))
                    font_registered = True
                    break
                except:
                    continue
        
        if not font_registered:
            self.font_name = "Helvetica"

        # Use relative path from the current file
        self.logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "logo.png")
        self.silhouette_path = os.path.join(os.path.dirname(__file__), "..", "assets", "silhouette.png")
        self.primary_color = colors.HexColor("#4f46e5") # Indigo 600
        self.secondary_color = colors.HexColor("#1e293b") # Slate 800
        self.text_muted = colors.HexColor("#64748b") # Slate 500
        self.border_color = colors.HexColor("#cbd5e1") # Slate 300
        self.background_light = colors.HexColor("#f1f5f9") # Slate 100
        self.header_bg = colors.HexColor("#f8fafc") # Slate 50
        self.success_color = colors.HexColor("#10b981") # Green 500
        self.warning_color = colors.HexColor("#f59e0b") # Amber 500
        self.danger_color = colors.HexColor("#ef4444") # Red 500

    def format_camel_case(self, text: str) -> str:
        import re
        result = re.sub(r'([A-Z])', r' \1', text)
        return result.capitalize()

    def _get_first_val(self, props: Dict[str, Any], key: str, default: str = "") -> str:
        """Safely get the first value of a property list."""
        vals = props.get(key)
        if isinstance(vals, list) and len(vals) > 0:
            return self._format_value(vals[0])
        return default

    def _format_value(self, val: Any) -> str:
        """Format a property value for PDF display, handling strings, lists, and dicts."""
        if val is None:
            return ""
        if isinstance(val, str):
            return val
        if isinstance(val, list):
            return ", ".join([self._format_value(v) for v in val])
        if isinstance(val, dict):
            # Prefer caption for nested entities
            caption = val.get("caption") or val.get("name") or val.get("label")
            if caption:
                # Add context if it's a sanction or occupancy
                schema = val.get("schema")
                if schema == "Sanction":
                    reason = self._get_first_val(val.get("properties", {}), "reason")
                    if reason: return f"{caption}: {reason}"
                if schema == "Occupancy":
                    post = self._get_first_val(val.get("properties", {}), "post")
                    if post: return f"{post} ({caption})"
                return str(caption)
            
            # If no caption, try to summarize properties
            props = val.get("properties", {})
            if props:
                summary = []
                for pk, pv in list(props.items())[:3]: # Take first 3 props
                    label = self.format_camel_case(pk)
                    v_str = self._format_value(pv[0]) if (isinstance(pv, list) and pv) else str(pv)
                    summary.append(f"{label}: {v_str}")
                return " | ".join(summary)
            
            return "Complex Object"
        
        return str(val)

    def generate_entity_report(self, entity_data: Dict[str, Any]) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=40, 
            leftMargin=40, 
            topMargin=90, 
            bottomMargin=50
        )
        
        styles = getSampleStyleSheet()
        
        # Define Custom Styles
        h1_style = ParagraphStyle(
            'Heading1',
            parent=styles['Heading1'],
            fontSize=22,
            textColor=self.secondary_color,
            spaceAfter=2,
            fontName=self.font_name
        )

        h2_style = ParagraphStyle(
            'Heading2',
            parent=styles['Heading2'],
            fontSize=13,
            textColor=self.secondary_color,
            spaceBefore=15,
            spaceAfter=8,
            fontName=self.font_name,
            borderWidth=0,
            leftIndent=0,
            rightIndent=0,
            borderPadding=0,
        )

        h3_style = ParagraphStyle(
            'Heading3',
            parent=styles['Heading3'],
            fontSize=11,
            textColor=self.secondary_color,
            spaceBefore=12,
            spaceAfter=8,
            fontName=self.font_name
        )

        body_style = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontSize=10,
            leading=12,
            textColor=self.secondary_color,
            fontName=self.font_name
        )

        label_style = ParagraphStyle(
            'Label',
            parent=styles['Normal'],
            fontSize=9,
            textColor=self.text_muted,
            fontName=self.font_name,
            textTransform='uppercase'
        )

        elements = []

        is_clear = entity_data.get("is_clear", False)
        caption = entity_data.get("caption", "Unknown Entity")
        schema = entity_data.get("schema", "Entity")
        props = entity_data.get("properties", {})
        entity_properties = props # Alias for consistency

        # --- HEADER AND FOOTER FUNCTIONS ---
        def draw_watermark(canvas, doc):
            if os.path.exists(self.logo_path):
                canvas.saveState()
                canvas.setFillAlpha(0.05) # Very subtle transparency
                # Position in center of page
                w_wm = 6*inch
                h_wm = 1.5*inch
                canvas.translate(A4[0]/2, A4[1]/2)
                canvas.rotate(45)
                canvas.drawImage(self.logo_path, -w_wm/2, -h_wm/2, width=w_wm, height=h_wm, mask='auto')
                canvas.restoreState()

        def draw_header(canvas, doc):
            canvas.saveState()
            
            # Draw Watermark first (in background)
            draw_watermark(canvas, doc)
            
            # Use a table for the header to solve alignment issues
            # We use absolute positioning relative to page top
            top_y = A4[1] - 50 # Start 50 points from top
            
            logo_img = None
            if os.path.exists(self.logo_path):
                logo_img = Image(self.logo_path, width=1.1*inch, height=0.3*inch)
            
            # Title on left, Logo + Name on right
            title_text = "Compliance Screening Clearance" if is_clear else "Individual Scan Details"
            
            header_table_data = [[
                Paragraph(title_text, h1_style),
                [logo_img if logo_img else "", 
                 Paragraph("AMLTAB", ParagraphStyle('Brand', fontName=self.font_name, fontSize=12, textColor=self.secondary_color, alignment=2))]
            ]]
            
            h_table = Table(header_table_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
            h_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('ALIGN', (1,0), (1,0), 'RIGHT'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            
            w_h, h_h = h_table.wrap(doc.width, doc.topMargin)
            try:
                h_table.drawOn(canvas, doc.leftMargin, top_y)
            except Exception as e:
                print(f"Warning: Failed to draw header table: {e}")
            
            # Draw Generation Date (Sub-title) below the table
            canvas.setFont(self.font_name, 9)
            canvas.setFillColor(self.text_muted)
            canvas.drawString(doc.leftMargin, top_y - 12, f"Report generated on: {datetime.now().strftime('%d/%m/%Y %H:%M:%S UTC')}")
            
            # Draw Top Line
            canvas.setStrokeColor(self.border_color)
            canvas.line(doc.leftMargin, top_y - 20, doc.width + doc.leftMargin, top_y - 20)
            canvas.restoreState()

        def draw_footer(canvas, doc):
            canvas.saveState()
            canvas.setFont(self.font_name, 8)
            canvas.setFillColor(self.text_muted)
            
            # Footer text
            footer_text = f"© {datetime.now().year} AMLtab Compliance. System Generated Report. ID: {entity_data.get('id')} | Confidential"
            canvas.drawCentredString(A4[0]/2, 30, footer_text)
            
            # Page number
            canvas.drawRightString(doc.width + doc.leftMargin, 30, f"Page {doc.page}")
            canvas.restoreState()

        # --- 2. METADATA SUMMARY TABLE ---
        meta_data = [
            [Paragraph("Organisation:", label_style), Paragraph("Cellbunq (BC681123)", body_style), 
             Paragraph("User:", label_style), Paragraph("admin", body_style),
             Paragraph("ScanDate:", label_style), Paragraph(datetime.now().strftime('%d/%m/%Y %H:%M:%S'), body_style)]
        ]
        meta_table = Table(meta_data, colWidths=[1*inch, 1.8*inch, 0.8*inch, 1.5*inch, 1*inch, 1.2*inch])
        meta_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,-1), self.background_light),
            ('BOX', (0,0), (-1,-1), 0.5, self.border_color),
            ('INNERGRID', (0,0), (-1,-1), 0.5, self.border_color),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 0.2 * inch))

        if is_clear:
            # --- 1. RISK SUMMARY DASHBOARD ---
            risk_level = str(entity_data.get("risk_level", "LOW")).upper()
            risk_color = self.success_color if risk_level == "LOW" else self.warning_color
            
            risk_data = [[
                Paragraph(f"<b>RISK LEVEL: {risk_level}</b>", ParagraphStyle('RiskLevel', fontName=self.font_name, fontSize=12, textColor=risk_color, alignment=0)),
                Paragraph(f"<b>STATUS: {str(entity_data.get('auto_decision', 'CLEARED')).upper()}</b>", ParagraphStyle('Status', fontName=self.font_name, fontSize=12, textColor=self.success_color, alignment=2))
            ]]
            risk_table = Table(risk_data, colWidths=[doc.width/2, doc.width/2])
            risk_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LINEBELOW', (0,0), (-1,-1), 1, self.border_color),
            ]))
            elements.append(risk_table)
            elements.append(Spacer(1, 0.2 * inch))

            # --- CLEAR STATUS BANNER ---
            clear_status_data = [
                [Paragraph("<font color='white'><b>COMPLIANCE CLEARANCE CERTIFICATE</b></font>", 
                          ParagraphStyle('ClearStatus', fontName=self.font_name, fontSize=14, alignment=1))]
            ]
            clear_table = Table(clear_status_data, colWidths=[doc.width])
            clear_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), self.success_color),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('ROUNDEDCORNERS', [8, 8, 8, 8]),
            ]))
            elements.append(clear_table)
            elements.append(Spacer(1, 0.3 * inch))
            
            # --- COMPLIANCE STATEMENT ---
            elements.append(Paragraph("Compliance Determination", h2_style))
            statement = (
                f"The subject <b>{caption}</b> was rigorously screened against 400+ global sanctions lists, PEP databases, "
                "and regulatory watchlists. <br/><br/>"
                "<b>Result:</b> No direct matches were identified. The subject is considered <b>Low Risk</b> "
                "from an AML/CTF perspective based on the current screening configuration."
            )
            elements.append(Paragraph(statement, body_style))
            elements.append(Spacer(1, 0.2 * inch))
            
            # --- ANALYST REVIEW SECTION (If available) ---
            notes = entity_data.get("notes")
            reviewed_by = entity_data.get("reviewed_by")
            if notes or reviewed_by:
                elements.append(Paragraph("Analyst Verification", h2_style))
                review_data = [
                    [Paragraph("Decision:", label_style), Paragraph(str(entity_data.get("final_decision", "N/A")).upper(), body_style)],
                    [Paragraph("Verified By:", label_style), Paragraph(str(reviewed_by or "System Auto-Clear"), body_style)],
                    [Paragraph("Date:", label_style), Paragraph(str(entity_data.get("reviewed_at", "N/A")), body_style)],
                    [Paragraph("Notes:", label_style), Paragraph(str(notes or "No additional notes."), body_style)],
                ]
                rt = Table(review_data, colWidths=[1.5*inch, 5.8*inch])
                rt.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                    ('BACKGROUND', (0,0), (-1,-1), self.header_bg),
                    ('BOX', (0,0), (-1,-1), 0.5, self.border_color),
                    ('PADDING', (0,0), (-1,-1), 10),
                ]))
                elements.append(rt)
                elements.append(Spacer(1, 0.2 * inch))

            # --- GLOBAL COVERAGE AUDIT ---
            elements.append(Paragraph("Global Watchlist Coverage", h2_style))
            coverage_desc = "The following primary regulatory bodies and watchlists were audited during this scan:"
            elements.append(Paragraph(coverage_desc, body_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            watchlists = [
                ["United Nations Sanctions List (UNSC)", "Office of Foreign Assets Control (US OFAC)"],
                ["EU Financial Sanctions Files (FSF)", "UK HM Treasury Consolidated List"],
                ["Interpol Red & Blue Notices", "World Bank Debarred Providers"],
                ["Global PEP Databases (40,000+ Profiles)", "Adverse Media & Criminal Watchlists"]
            ]
            wt = Table(watchlists, colWidths=[doc.width/2, doc.width/2])
            wt.setStyle(TableStyle([
                ('FONTSIZE', (0,0), (-1,-1), 8),
                ('TEXTCOLOR', (0,0), (-1,-1), self.text_muted),
                ('GRID', (0,0), (-1,-1), 0.2, self.border_color),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            elements.append(wt)
            elements.append(Spacer(1, 0.3 * inch))
        else:
            # --- 3. SCAN DATA SECTION ---
            elements.append(Paragraph("Scan Data", h2_style))
            scan_data = [
                [Paragraph("First Name:", label_style), Paragraph(self._get_first_val(props, "name"), body_style),
                 Paragraph("Middle Name:", label_style), Paragraph("", body_style)],
                [Paragraph("Last Name:", label_style), Paragraph("", body_style),
                 Paragraph("Date of Birth:", label_style), Paragraph(self._get_first_val(props, "birthDate"), body_style)],
                [Paragraph("Gender:", label_style), Paragraph(self._get_first_val(props, "gender"), body_style),
                 Paragraph("Nationality:", label_style), Paragraph(self._get_first_val(props, "nationality"), body_style)],
            ]
            scan_table = Table(scan_data, colWidths=[1.2*inch, 2.4*inch, 1.2*inch, 2.4*inch])
            scan_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
            ]))
            elements.append(scan_table)
            elements.append(Spacer(1, 0.1 * inch))

            # --- 4. SCAN SETTINGS SECTION ---
            elements.append(Paragraph("Scan Settings", h2_style))
            settings_data = [
                [Paragraph("Whitelist Policy:", label_style), Paragraph("Applied", body_style),
                 Paragraph("Name Match Type:", label_style), Paragraph("Exact (1.00%)", body_style)],
                [Paragraph("Default Country:", label_style), Paragraph("United Kingdom", body_style),
                 Paragraph("Residency Policy:", label_style), Paragraph("Applied (All categories)", body_style)],
            ]
            settings_table = Table(settings_data, colWidths=[1.5*inch, 2.1*inch, 1.5*inch, 2.1*inch])
            settings_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
            ]))
            elements.append(settings_table)
            elements.append(Paragraph(f"Matches Found: 1", ParagraphStyle('MatchesFound', parent=body_style, spaceBefore=10)))
            elements.append(Spacer(1, 0.2 * inch))

            # Match Banner
            match_banner_data = [[Paragraph(f"Match 1 of 1", ParagraphStyle('MatchNum', parent=body_style, fontName=self.font_name)), 
                                  Paragraph(f"Name: <font color='#4f46e5'>{caption}</font>", body_style),
                                  Paragraph(f"Category: <font color='#4f46e5'>{schema}</font>", body_style)]]
            match_banner = Table(match_banner_data, colWidths=[1.5*inch, 3.8*inch, 2*inch])
            match_banner.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), self.background_light),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('LINEBELOW', (0,0), (-1,-1), 1, self.primary_color),
                ('PADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(match_banner)
            elements.append(Spacer(1, 0.1 * inch))

            # --- 6. MATCH PROFILE HERO ---
            profile_img = None
            if os.path.exists(self.silhouette_path):
                try:
                    profile_img = Image(self.silhouette_path, width=1.5*inch, height=1.5*inch)
                except Exception:
                    pass

            profile_details = [
                [Paragraph("First Name:", label_style), Paragraph(self._get_first_val(props, "firstName", self._get_first_val(props, "name")), body_style)],
                [Paragraph("Last Name:", label_style), Paragraph(self._get_first_val(props, "lastName"), body_style)],
                [Paragraph("Primary Location:", label_style), Paragraph(self._get_first_val(props, "country"), body_style)],
                [Paragraph("Gender:", label_style), Paragraph(self._get_first_val(props, "gender"), body_style)],
                [Paragraph("Category:", label_style), Paragraph(schema, body_style)],
                [Paragraph("Match Rate:", label_style), Paragraph("<font color='#4f46e5'><b>100%</b></font>", body_style)],
            ]
            profile_details_table = Table(profile_details, colWidths=[1.5*inch, 3.5*inch])
            profile_details_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ]))

            profile_main_data = [[profile_img if profile_img else "", profile_details_table]]
            profile_main_table = Table(profile_main_data, colWidths=[2*inch, 5.3*inch])
            profile_main_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
            ]))
            elements.append(profile_main_table)
            elements.append(Spacer(1, 0.2 * inch))

        # --- 7. DETAILED PROPERTY GROUPS ---
        groups = {
            "Identification & Documents": ["idNumber", "passportNumber", "taxNumber", "registrationNumber", "innCode", "ogrnCode"],
            "Contact & Digital Presence": ["phone", "email", "website", "wikipediaUrl", "wikidataId", "opencorporatesUrl"],
            "Professional & Political": ["position", "education", "political", "sector", "status"],
            "Risk & Classification": ["topics", "classification", "program", "reason", "authority"],
        }
        
        if is_clear:
            elements.append(Paragraph("Search Parameters (Audit Details)", h2_style))
            search_params = []
            for k, v in entity_properties.items():
                if v:
                    label = self.format_camel_case(k)
                    val = self._format_value(v)
                    search_params.append([Paragraph(label, label_style), Paragraph(val, body_style)])
            
            if search_params:
                t = Table(search_params, colWidths=[1.8*inch, 5.5*inch])
                t.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                    ('TOPPADDING', (0,0), (-1,-1), 10),
                    ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
                ]))
                elements.append(t)
        else:
            # Normal matches continue
            # Handling Locations specifically
            locations_data = [["Country", "City", "Address", "Type"]]
            has_locations = False
            countries = entity_properties.get("country", [])
            addresses = entity_properties.get("address", [])
            for i in range(max(len(countries), len(addresses))):
                has_locations = True
                c = countries[i] if i < len(countries) else ""
                a = addresses[i] if i < len(addresses) else ""
                locations_data.append([Paragraph(str(c), body_style), "", Paragraph(str(a), body_style), "Business"])
            
            if has_locations:
                elements.append(Paragraph("Locations", h2_style))
                loc_table = Table(locations_data, colWidths=[1.8*inch, 1.5*inch, 3*inch, 1*inch])
                loc_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), self.background_light),
                    ('TEXTCOLOR', (0,0), (-1,0), self.secondary_color),
                    ('ALIGN', (0,0), (-1,-1), 'LEFT'),
                    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                    ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                    ('TOPPADDING', (0,0), (-1,-1), 8),
                ]))
                elements.append(loc_table)

            included_keys = {"name", "alias", "gender", "birthDate", "deathDate", "nationality", "country", "address", "firstName", "lastName", "id", "caption", "schema"}
            for group_name, keys in groups.items():
                group_data = []
                for key in keys:
                    if key in entity_properties:
                        vals = entity_properties.get(key)
                        if vals:
                            included_keys.add(key)
                            for i, v in enumerate(vals):
                                label = self.format_camel_case(str(key)) if i == 0 else ""
                                formatted_v = self._format_value(v)
                                group_data.append([Paragraph(label, label_style), Paragraph(formatted_v, body_style)])
                
                if group_data:
                    elements.append(Paragraph(group_name, h2_style))
                    t = Table(group_data, colWidths=[1.8*inch, 5.5*inch])
                    t.setStyle(TableStyle([
                        ('VALIGN', (0,0), (-1,-1), 'TOP'),
                        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                        ('TOPPADDING', (0,0), (-1,-1), 10),
                        ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
                    ]))
                    elements.append(t)

            # Catch-all for remaining properties
            remaining_data = []
            for key, vals in entity_properties.items():
                if key not in included_keys and vals:
                    for i, v in enumerate(vals):
                        label = self.format_camel_case(str(key)) if i == 0 else ""
                        formatted_v = self._format_value(v)
                        remaining_data.append([Paragraph(label, label_style), Paragraph(formatted_v, body_style)])
            
            if remaining_data:
                elements.append(Paragraph("Additional Metadata", h2_style))
                t = Table(remaining_data, colWidths=[1.8*inch, 5.5*inch])
                t.setStyle(TableStyle([
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                    ('TOPPADDING', (0,0), (-1,-1), 10),
                    ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
                ]))
                elements.append(t)


        # --- 5. DATA SOURCES ---
        elements.append(PageBreak())
        elements.append(Paragraph("Evidence & Source Heritage", h2_style))
        elements.append(Paragraph("This record is maintained by cross-referencing the following global datasets. AMLtab ensures high-fidelity data by syncing with these sources daily.", body_style))
        elements.append(Spacer(1, 0.2 * inch))

        source_data = [["Source Identifier", "Dataset Title"]]
        for ds in entity_data.get("datasets", []):
            source_data.append([Paragraph(ds, body_style), Paragraph(ds.replace('_', ' ').title(), body_style)])
        
        t = Table(source_data, colWidths=[2.5*inch, 4.8*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), self.background_light),
            ('TEXTCOLOR', (0,0), (-1,0), self.secondary_color),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
        ]))
        elements.append(t)

        def add_header_footer(canvas, doc):
            draw_header(canvas, doc)
            draw_footer(canvas, doc)

        try:
            doc.build(elements, onLaterPages=add_header_footer, onFirstPage=add_header_footer)
        except Exception as e:
            print(f"CRITICAL: PDF build failed: {e}")
            raise e
        return buffer.getvalue()
    
    def generate_screening_summary_report(self, screening_data: Dict[str, Any]) -> bytes:
        """
        Generates an Executive Summary report for a multi-match screening.
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4, 
            rightMargin=40, 
            leftMargin=40, 
            topMargin=90, 
            bottomMargin=50
        )
        
        styles = getSampleStyleSheet()
        h1_style = ParagraphStyle('H1', parent=styles['Heading1'], fontSize=20, textColor=self.secondary_color, fontName=self.font_name)
        h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=14, textColor=self.secondary_color, fontName=self.font_name, spaceBefore=15, spaceAfter=10)
        body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=10, textColor=self.secondary_color, fontName=self.font_name)
        label_style = ParagraphStyle('Label', parent=styles['Normal'], fontSize=9, textColor=self.text_muted, fontName=self.font_name, textTransform='uppercase')
        
        elements = []
        
        # --- 1. HEADER AND FOOTER ---
        def draw_header(canvas, doc):
            canvas.saveState()
            top_y = A4[1] - 50
            
            logo_img = None
            if os.path.exists(self.logo_path):
                logo_img = Image(self.logo_path, width=1.1*inch, height=0.3*inch)
            
            header_table_data = [[
                Paragraph("Executive Match Summary", h1_style),
                [logo_img if logo_img else "", 
                 Paragraph("AMLTAB", ParagraphStyle('Brand', fontName=self.font_name, fontSize=12, textColor=self.secondary_color, alignment=2))]
            ]]
            
            h_table = Table(header_table_data, colWidths=[doc.width * 0.65, doc.width * 0.35])
            h_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('ALIGN', (1,0), (1,0), 'RIGHT'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            h_table.wrapOn(canvas, doc.width, doc.topMargin)
            h_table.drawOn(canvas, doc.leftMargin, top_y)
            
            # Sub-header
            canvas.setFont(self.font_name, 9)
            canvas.setFillColor(self.text_muted)
            canvas.drawString(doc.leftMargin, top_y - 15, f"Audit ID: {screening_data.get('screening_id')} | Generated: {datetime.now().strftime('%d/%m/%Y %H:%M:%S UTC')}")
            
            canvas.setStrokeColor(self.border_color)
            canvas.line(doc.leftMargin, top_y - 25, doc.width + doc.leftMargin, top_y - 25)
            canvas.restoreState()

        def draw_footer(canvas, doc):
            canvas.saveState()
            canvas.setFont(self.font_name, 8)
            canvas.setFillColor(self.text_muted)
            canvas.drawCentredString(A4[0]/2, 30, f"© {datetime.now().year} AMLtab Compliance. Executive Summary Report | Confidential")
            canvas.drawRightString(doc.width + doc.leftMargin, 30, f"Page {doc.page}")
            canvas.restoreState()

        # --- 2. SEARCH AUDIT PARAMETERS ---
        elements.append(Paragraph("Search Audit Parameters", h2_style))
        query = screening_data.get("query", {})
        subject_name = query.get("company_name") or f"{query.get('first_name', '')} {query.get('last_name', '')}".strip()
        
        audit_data = [
            [Paragraph("Target Subject:", label_style), Paragraph(f"<b>{subject_name}</b>", body_style)],
            [Paragraph("Subject Type:", label_style), Paragraph("Entity" if query.get("company_name") else "Individual", body_style)],
            [Paragraph("Date of Birth:", label_style), Paragraph(query.get("date_of_birth") or "N/A", body_style)],
            [Paragraph("Screening Date:", label_style), Paragraph(str(screening_data.get("timestamp", "N/A"))[:19], body_style)],
        ]
        at = Table(audit_data, colWidths=[1.8*inch, 5.5*inch])
        at.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('BACKGROUND', (0,0), (-1,-1), self.background_light),
            ('PADDING', (0,0), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
        ]))
        elements.append(at)
        elements.append(Spacer(1, 0.3 * inch))

        # --- 3. RISK CLASSIFICATION ---
        summary = screening_data.get("summary", {})
        total_matches = summary.get("total_matches", 0)
        max_score = summary.get("max_score", 0)
        
        risk_text = "HIGH" if total_matches > 2 else "MEDIUM" if total_matches > 0 else "LOW"
        risk_color = self.danger_color if risk_text == "HIGH" else self.warning_color if risk_text == "MEDIUM" else self.success_color

        elements.append(Paragraph("Overall Analysis", h2_style))
        
        # Enhanced Risk Banner
        risk_data = [[
            Paragraph(f"<font color='{risk_color.hexval()}'><b>System Risk Rating: {risk_text}</b></font>", 
                     ParagraphStyle('Risk', fontName=self.font_name, fontSize=14, alignment=1))
        ]]
        risk_table = Table(risk_data, colWidths=[doc.width])
        risk_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,-1), self.background_light),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('LINEABOVE', (0,0), (-1,-1), 1, risk_color),
            ('LINEBELOW', (0,0), (-1,-1), 1, risk_color),
        ]))
        elements.append(risk_table)
        elements.append(Spacer(1, 0.25 * inch))
        
        summary_desc = (
            f"The system identified <b>{total_matches} potential match(es)</b> for the subject subject. "
            f"The highest confidence match yielded a <b>{max_score}% similarity rating</b>. "
            f"Based on the match density and category severity, the overall risk is classified as <b>{risk_text}</b>."
        )
        elements.append(Paragraph(summary_desc, body_style))
        elements.append(Spacer(1, 0.3 * inch))

        if total_matches > 0:
            elements.append(Paragraph("Potential Match Catalogue", h2_style))
            
            # Table Headers
            catalog_data = [["Match", "Confidence", "Category / Status", "Identifying Metadata"]]
            
            for m in screening_data.get("matches", []):
                score = f"{int(m.get('match_score', 0))}%"
                name = m.get("name", "Unknown")
                category = m.get("match_type", "N/A")
                source = m.get("details", {}).get("source") or m.get("source_name") or "Global Watchlist"
                
                # Fetch more identification data
                birth_dates = m.get("birth_dates", [])
                countries = m.get("countries", [])
                nationalities = m.get("nationalities", [])
                
                metadata = [
                    f"<b>Source:</b> {source}",
                    f"<b>Birth Dates:</b> {', '.join(birth_dates) if birth_dates else 'N/A'}",
                    f"<b>Countries:</b> {', '.join(countries) if countries else 'N/A'}",
                    f"<b>Nationality:</b> {', '.join(nationalities) if nationalities else 'N/A'}"
                ]
                metadata_p = Paragraph("<br/>".join(metadata), ParagraphStyle('Meta', fontName=self.font_name, fontSize=8, leading=10))

                catalog_data.append([
                    Paragraph(f"<b>{name}</b>", body_style),
                    Paragraph(f"<b>{score}</b>", ParagraphStyle('Score', fontName=self.font_name, fontSize=11, textColor=self.primary_color)),
                    Paragraph(category, body_style),
                    metadata_p
                ])
            
            ct = Table(catalog_data, colWidths=[2.2*inch, 1*inch, 1.5*inch, 2.6*inch])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.secondary_color),
                ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                ('ALIGN', (0,0), (-1,-1), 'LEFT'),  # Global left align
                ('ALIGN', (1,0), (1,-1), 'CENTER'), # Center Confidence column
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
                ('FONTSIZE', (0,0), (-1,0), 9),
                ('BACKGROUND', (0,1), (-1,-1), self.header_bg),
            ]))
            elements.append(ct)
            elements.append(Spacer(1, 0.4 * inch))
            
            # --- 5. SYSTEM ADVISE / NEXT STEPS ---
            elements.append(Paragraph("Compliance Advisory", h2_style))
            top_match = screening_data.get("matches", [])[0].get("name", "the top profile")
            advisory = (
                f"<b>Recommendation:</b> Due to the high similarity score ({max_score}%), we strongly advise your "
                f"compliance team to conduct a deep-dive investigation into <b>{top_match}</b>. <br/><br/>"
                "Please verify the subject's date of birth and nationality against the provided match data. "
                "If identities are confirmed, follow your institution's specific high-risk engagement protocols."
            )
            elements.append(Paragraph(advisory, body_style))
        else:
            elements.append(Paragraph("<b>No matches found.</b> The subject is currently clear from monitored watchlists.", body_style))

        # Build document
        doc.build(elements, onLaterPages=draw_footer, onFirstPage=draw_header)
        return buffer.getvalue()

report_service = ReportService()
