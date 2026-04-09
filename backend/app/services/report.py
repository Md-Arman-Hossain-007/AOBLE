from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.units import inch
from io import BytesIO
from datetime import datetime
from typing import Dict, Any, List
import os
import html
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

class ReportService:
    def __init__(self):
        # Register TrueType font for UTF-8 support
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
                except: continue
        
        if not font_registered: self.font_name = "Helvetica"

        # Client-Specific Cyan/Teal Palette
        self.primary_color = colors.HexColor("#0d9488") # Teal 600
        self.secondary_color = colors.HexColor("#1e293b") # Slate 800
        self.accent_color = colors.HexColor("#0f766e") # Teal 700
        self.text_muted = colors.HexColor("#64748b") # Slate 500
        self.border_color = colors.HexColor("#cbd5e1") # Slate 300
        self.background_light = colors.HexColor("#f1f5f9") # Slate 100
        self.danger_color = colors.HexColor("#ef4444") # Red 500
        self.warning_color = colors.HexColor("#f59e0b") # Amber 500
        self.success_color = colors.HexColor("#10b981") # Emerald 500
        
        self.logo_path = os.path.join(os.path.dirname(__file__), "..", "assets", "logo.png")
        self.silhouette_path = os.path.join(os.path.dirname(__file__), "..", "assets", "silhouette.png")

    def format_camel_case(self, text: str) -> str:
        import re
        result = re.sub(r'([A-Z])', r' \1', text)
        return result.capitalize()

    def _escape(self, text: Any) -> str:
        if text is None: return ""
        return html.escape(str(text))

    def _get_first_val(self, props: Dict[str, Any], key: str, default: str = "") -> str:
        vals = props.get(key)
        if isinstance(vals, list) and len(vals) > 0: return self._format_value(vals[0])
        return self._escape(default)

    def _format_value(self, val: Any) -> str:
        if val is None: return ""
        if isinstance(val, str): return self._escape(val)
        if isinstance(val, list):
            if not val: return ""
            # Compact Horizontal "Tag" Array for multiple values
            if len(val) > 1:
                items = []
                for v in val:
                    f_v = self._format_value(v)
                    if f_v: 
                        items.append(f_v)
                # Join with comma and standard spacing to make it horizontal
                return ", ".join(items)
            return self._format_value(val[0]) if val else ""
            
        if isinstance(val, dict):
            caption = val.get("caption") or val.get("name") or val.get("label")
            if caption: return self._escape(caption)
            # Modern Badge-style KV breakdown
            parts = []
            for k, v in val.items():
                if k not in ['id', 'schema', 'caption'] and v:
                    parts.append(f"<b><font color='#0d9488'>{self._escape(self.format_camel_case(k))}:</font></b> {self._format_value(v)}")
            return " | ".join(parts) if parts else self._escape(str(val))
        return self._escape(str(val))

    def generate_entity_report(self, entity_data: Dict[str, Any]) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4, 
            rightMargin=40, leftMargin=40, topMargin=110, bottomMargin=50
        )
        
        styles = getSampleStyleSheet()
        
        # --- REPLICATE CLIENT THEME STYLES ---
        h1_style = ParagraphStyle('H1', fontSize=22, textColor=self.secondary_color, fontName=self.font_name, leading=26)
        h2_style = ParagraphStyle('H2', fontSize=13, textColor=self.secondary_color, fontName=self.font_name, spaceBefore=15, spaceAfter=8)
        h3_style = ParagraphStyle('H3', fontSize=10, textColor=self.primary_color, fontName=self.font_name, textTransform='uppercase', letterSpacing=1)
        body_style = ParagraphStyle('Body', fontSize=10, textColor=self.secondary_color, fontName=self.font_name, leading=12)
        label_style = ParagraphStyle('Label', fontSize=8, textColor=self.text_muted, fontName=self.font_name, textTransform='uppercase', letterSpacing=1)
        value_style = ParagraphStyle('Value', fontSize=10, textColor=self.secondary_color, fontName=self.font_name, fontWeight='BOLD')

        elements = []
        is_clear = entity_data.get("is_clear", False)
        caption = self._escape(entity_data.get("caption", "Unknown Entity"))

        # --- BACKGROUND LOGO WATERMARK ---
        def draw_watermark_grid(canvas, doc):
            canvas.saveState()
            if os.path.exists(self.logo_path):
                canvas.setFillAlpha(0.04)
                # Draw a large, transparent logo centered on the page
                w, h = 4 * inch, 4 * inch
                canvas.drawImage(self.logo_path, (A4[0]-w)/2, (A4[1]-h)/2, width=w, height=h, mask='auto', preserveAspectRatio=True, anchor='c')
            canvas.restoreState()

        # --- REPLICATE THE SCREENSHOT HEADER ---
        def draw_header(canvas, doc):
            canvas.saveState()
            draw_watermark_grid(canvas, doc)
            
            top_y = A4[1] - 40
            
            # Left Title - Perfectly aligned to margin 40
            canvas.setFont(self.font_name, 20)
            canvas.setFillColor(self.secondary_color)
            if is_clear:
                canvas.drawString(40, top_y, "Compliance Screening Clearance")
            else:
                canvas.drawString(40, top_y, "Individual Scan Details")
            
            # Print report generation time
            canvas.setFont(self.font_name, 8)
            canvas.setFillColor(self.text_muted)
            canvas.drawString(40, top_y - 15, f"Report generated on: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')} UTC")
            
            # Right Brand Area
            canvas.setFont(self.font_name, 11)
            canvas.drawRightString(A4[0]-115, top_y, "AMLTAB")
            if os.path.exists(self.logo_path):
                canvas.drawImage(self.logo_path, A4[0]-105, top_y-8, width=0.8*inch, height=0.4*inch, mask='auto', preserveAspectRatio=True, anchor='w')
            
            # Metadata Grid - Aligned to margin 40
            meta_y = top_y - 65
            canvas.setStrokeColor(self.primary_color)
            canvas.setLineWidth(0.6)
            
            # Grid dimensions
            grid_w = A4[0] - 80 
            canvas.rect(40, meta_y, grid_w, 35)
            
            # Dividers
            canvas.line(40 + grid_w*0.3, meta_y, 40 + grid_w*0.3, meta_y+35) # Org/User
            canvas.line(40 + grid_w*0.7, meta_y, 40 + grid_w*0.7, meta_y+35) # User/Date
            
            canvas.setFont(self.font_name, 7)
            canvas.setFillColor(self.text_muted)
            canvas.drawString(45, meta_y + 22, "ORGANISATION:")
            canvas.drawString(40 + grid_w*0.3 + 5, meta_y + 22, "USER:")
            canvas.drawString(40 + grid_w*0.7 + 5, meta_y + 22, "SCANDATE:")
            
            canvas.setFont(self.font_name, 9)
            canvas.setFillColor(self.secondary_color)
            canvas.drawString(45, meta_y + 8, "Cellbunq (BC681123)")
            canvas.drawString(40 + grid_w*0.3 + 5, meta_y + 8, "admin")
            canvas.drawString(40 + grid_w*0.7 + 5, meta_y + 8, datetime.now().strftime('%d/%m/%Y %H:%M:%S'))
            
            canvas.restoreState()

        def draw_footer(canvas, doc):
            canvas.saveState()
            canvas.setFont(self.font_name, 8)
            canvas.setFillColor(self.text_muted)
            footer_text = f"© {datetime.now().year} AMLtab Compliance. Record ID: {entity_data.get('id', 'N/A')} | Confidential"
            canvas.drawString(40, 25, footer_text)
            canvas.drawRightString(A4[0]-40, 25, f"Page {doc.page} OF SECURE REPORT")
            canvas.restoreState()

        props = entity_data.get("properties", {})
        entity_properties = props 
        
        if is_clear:
            def add_header_footer_clear(canvas, doc):
                draw_header(canvas, doc)
                draw_footer(canvas, doc)
                
            elements.append(Spacer(1, 0.1 * inch))
            
            # 1. RISK LEVEL & STATUS
            risk_status_data = [[
                Paragraph("<b>RISK LEVEL: LOW</b>", ParagraphStyle('RL', textColor=colors.HexColor("#10b981"), fontSize=10)),
                Paragraph("<b>STATUS: CLEAR</b>", ParagraphStyle('ST', textColor=colors.HexColor("#10b981"), fontSize=10, alignment=2))
            ]]
            rs_table = Table(risk_status_data, colWidths=[(A4[0]-80)/2, (A4[0]-80)/2])
            rs_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(rs_table)
            elements.append(Spacer(1, 0.1 * inch))

            # 2. GREEN BANNER
            banner_data = [[Paragraph("<b>COMPLIANCE CLEARANCE CERTIFICATE</b>", ParagraphStyle('GB', textColor=colors.white, fontSize=12, alignment=1))]]
            gb_table = Table(banner_data, colWidths=[A4[0]-80])
            gb_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#10b981")),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ]))
            elements.append(gb_table)
            elements.append(Spacer(1, 0.25 * inch))

            # 3. Compliance Determination
            elements.append(Paragraph("Compliance Determination", h2_style))
            elements.append(Paragraph(f"The subject {caption} was rigorously screened against 400+ global sanctions lists, PEP databases, and regulatory watchlists.", body_style))
            elements.append(Spacer(1, 0.1 * inch))
            elements.append(Paragraph("Result: No direct matches were identified. The subject is considered Low Risk from an AML/CTF perspective based on the current screening configuration.", body_style))
            elements.append(Spacer(1, 0.25 * inch))

            # 4. Global Watchlist Coverage
            elements.append(Paragraph("Global Watchlist Coverage", h2_style))
            elements.append(Paragraph("The following primary regulatory bodies and watchlists were audited during this scan:", body_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            coverage_data = [
                [Paragraph("United Nations Security Council (UNSC)", body_style), Paragraph("Office of Foreign Assets Control (US OFAC)", body_style)],
                [Paragraph("EU Financial Sanctions Files (FSF)", body_style), Paragraph("UK HM Treasury Sanctions List", body_style)],
                [Paragraph("Interpol Red & Blue Notices", body_style), Paragraph("World Bank Debarred Providers", body_style)],
                [Paragraph("Global PEP Databases (40,000+ Profiles)", body_style), Paragraph("Adverse Media & Criminal Watchlists", body_style)],
            ]
            cv_table = Table(coverage_data, colWidths=[(A4[0]-80)/2+0.5*inch, (A4[0]-80)/2-0.5*inch])
            cv_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                ('TOPPADDING', (0,0), (-1,-1), 6),
                ('LINEBELOW', (0,0), (-1,-1), 0.3, self.border_color),
            ]))
            elements.append(cv_table)
            elements.append(Spacer(1, 0.25 * inch))

            # 5. Search Parameters
            elements.append(Paragraph("Search Parameters (Audit Details)", h2_style))
            schema_label = self._escape(entity_data.get("schema", "Person"))
            query = entity_data.get("query", {})
            safe_query = {k: self._escape(v) for k, v in query.items() if v}
            
            param_data = [
                [Paragraph("TYPE", label_style), Paragraph(schema_label, body_style)],
                [Paragraph("FORMAT", label_style), Paragraph("Complex Object", body_style)],
            ]
            
            is_person = schema_label.lower() in ["person", "individual"]
            if is_person:
                fname = safe_query.get("first_name", "")
                lname = safe_query.get("last_name", "")
                if fname or lname:
                    param_data.append([Paragraph("NAME", label_style), Paragraph(f"{fname} {lname}".strip(), body_style)])
                else:
                    param_data.append([Paragraph("NAME", label_style), Paragraph(caption, body_style)])
                    
                if safe_query.get("date_of_birth"):
                    param_data.append([Paragraph("DATE OF BIRTH", label_style), Paragraph(safe_query.get("date_of_birth"), body_style)])
                if safe_query.get("country"):
                    param_data.append([Paragraph("COUNTRY", label_style), Paragraph(safe_query.get("country"), body_style)])
            else:
                ename = safe_query.get("company_name", caption)
                param_data.append([Paragraph("ENTITY NAME", label_style), Paragraph(ename, body_style)])
                if safe_query.get("country"):
                    param_data.append([Paragraph("COUNTRY", label_style), Paragraph(safe_query.get("country"), body_style)])
            
            pm_table = Table(param_data, colWidths=[1.5*inch, A4[0]-80-1.5*inch])
            pm_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(pm_table)
            
            # Page Break
            elements.append(PageBreak())
            
            elements.append(Paragraph("Evidence & Source Heritage", h2_style))
            elements.append(Paragraph("This record is maintained by cross-referencing the following global datasets. AMLtab ensures high fidelity data by syncing with these sources daily.", body_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            ev_data = [[Paragraph("Source Identifier", label_style), Paragraph("Dataset Title", label_style)]]
            
            ev_table = Table(ev_data, colWidths=[2*inch, A4[0]-80-2*inch])
            ev_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), self.background_light),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 8),
            ]))
            elements.append(ev_table)
            
            doc.build(elements, onLaterPages=add_header_footer_clear, onFirstPage=add_header_footer_clear)
            return buffer.getvalue()
        
        # --- 1. SEARCH INPUT ANALYSIS ---
        elements.append(Spacer(1, 0.1 * inch))
        elements.append(Paragraph("Scan Data", h2_style))
        query = entity_data.get("query", {})
        safe_query = {k: self._escape(v) for k, v in query.items() if v}
        
        input_data = [
            [Paragraph("FIRST NAME:", label_style), Paragraph(safe_query.get("first_name", "---") or "---", value_style),
             Paragraph("MIDDLE NAME:", label_style), Paragraph(safe_query.get("middle_name", ""), value_style)],
            [Paragraph("LAST NAME:", label_style), Paragraph(safe_query.get("last_name", "") or "---", value_style),
             Paragraph("DATE OF BIRTH:", label_style), Paragraph(safe_query.get("date_of_birth", ""), value_style)],
            [Paragraph("GENDER:", label_style), Paragraph(safe_query.get("gender", ""), value_style),
             Paragraph("NATIONALITY:", label_style), Paragraph(safe_query.get("nationality", ""), value_style)],
        ]
        it = Table(input_data, colWidths=[1.1*inch, 2.5*inch, 1.1*inch, 2.4*inch])
        it.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LINEBELOW', (0,0), (-3,-1), 0.5, self.border_color),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(it)
        elements.append(Spacer(1, 0.2 * inch))

        # --- 2. POLICY & MATCH PARAMETERS ---
        elements.append(Paragraph("Scan Settings", h2_style))
        policy_data = [
            [Paragraph("WHITELIST POLICY:", label_style), Paragraph("Applied", body_style),
             Paragraph("NAME MATCH TYPE:", label_style), Paragraph(f"Exact (1.00%)", body_style)],
            [Paragraph("DEFAULT COUNTRY:", label_style), Paragraph(query.get("country", "United Kingdom"), body_style),
             Paragraph("RESIDENCY POLICY:", label_style), Paragraph("Applied (All categories)", body_style)],
        ]
        pt = Table(policy_data, colWidths=[1.5*inch, 2.1*inch, 1.5*inch, 2.1*inch])
        pt.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
        ]))
        elements.append(pt)
        elements.append(Spacer(1, 0.2 * inch))
        
        # --- 3. INVESTIGATIVE DECISION & AUDIT METADATA ---
        sm = entity_data.get("screening_metadata")
        if sm:
            elements.append(Paragraph("INVESTIGATIVE DECISION & AUDIT METADATA", h2_style))
            audit_data = [
                [Paragraph("SCREENING ID:", label_style), Paragraph(sm.get("id", "N/A"), value_style),
                 Paragraph("STATUS / RISK:", label_style), Paragraph(f"{sm.get('status', 'N/A')} / {sm.get('risk_level', 'N/A')}", value_style)],
                [Paragraph("AUTO DECISION:", label_style), Paragraph(sm.get("auto_decision", "N/A"), value_style),
                 Paragraph("FINAL DECISION:", label_style), Paragraph(sm.get("final_decision") or "Pending Review", value_style)],
                [Paragraph("REVIEWED BY:", label_style), Paragraph(sm.get("reviewed_by") or "System", value_style),
                 Paragraph("REVIEW DATE:", label_style), Paragraph(str(sm.get("reviewed_at") or "-")[:10], value_style)],
            ]
            if sm.get("notes"):
                audit_data.append([Paragraph("AUDIT NOTES:", label_style), Paragraph(sm.get("notes", ""), body_style), "", ""])
                
            at = Table(audit_data, colWidths=[1.5*inch, 2.1*inch, 1.5*inch, 2.1*inch])
            
            base_style = [
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                ('TOPPADDING', (0,0), (-1,-1), 8),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
            ]
            if sm.get("notes"):
                base_style.append(('SPAN', (1,3), (3,3)))
                
            at.setStyle(TableStyle(base_style))
            elements.append(at)
            elements.append(Spacer(1, 0.2 * inch))

        # --- 4. MATCH SUMMARY BANNER ---
        match_count = sm.get("match_count", 1) if sm else 1
        elements.append(Paragraph(f"Matches Found: {match_count}", h2_style))
        
        match_banner_data = [[
            Paragraph(f"<font color='white'><b>Match 1 of {match_count}</b></font>", body_style),
            Paragraph(f"<font color='white'><b>Name: {caption.upper()}</b></font>", body_style),
            Paragraph(f"<font color='white'><b>Category: {entity_data.get('schema', 'Person').upper()}</b></font>", body_style),
        ]]
        mbt = Table(match_banner_data, colWidths=[1.3*inch, 3.6*inch, 2.3*inch])
        mbt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), self.primary_color),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(mbt)
        

        # --- 4. OVERVIEW ---
        elements.append(Paragraph("OVERVIEW", h2_style))
        elements.append(Paragraph("Technical Summary & Identity Demographics", body_style))
        elements.append(Spacer(1, 0.1 * inch))
        
        overview_data = [
            [Paragraph("PRIMARY SYSTEM ID:", label_style), Paragraph(entity_data.get("id", "N/A"), value_style)],
            [Paragraph("CAPTION:", label_style), Paragraph(caption, value_style)],
            [Paragraph("SCHEMA TYPE:", label_style), Paragraph(entity_data.get("schema", "Person").upper(), value_style)],
            [Paragraph("CLASSIFICATION:", label_style), Paragraph(self._get_first_val(props, "classification", "Official Inquiry"), value_style)],
            [Paragraph("GENDER:", label_style), Paragraph(self._get_first_val(props, "gender", query.get("gender", "Undisclosed")), value_style)],
            [Paragraph("NATIONALITY:", label_style), Paragraph(self._get_first_val(props, "nationality", query.get("nationality", "N/A")), value_style)],
            [Paragraph("DATE OF BIRTH:", label_style), Paragraph(str(self._get_first_val(props, "birthDate") or self._get_first_val(props, "birth_date") or query.get("date_of_birth") or "N/A"), value_style)],
        ]
        if self._get_first_val(props, "idNumber"):
             overview_data.append([Paragraph("ID NUMBER(S):", label_style), Paragraph(self._get_first_val(props, "idNumber", "N/A"), value_style)])
        if self._get_first_val(props, "passportNumber"):
             overview_data.append([Paragraph("PASSPORT(S):", label_style), Paragraph(self._get_first_val(props, "passportNumber", "N/A"), value_style)])
        if self._get_first_val(props, "address"):
             overview_data.append([Paragraph("RESIDENCE/ADDRESS:", label_style), Paragraph(self._get_first_val(props, "address", "N/A"), value_style)])
             
        ov_table = Table(overview_data, colWidths=[2.0*inch, 5.1*inch])
        ov_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LINEBELOW', (0,0), (-1,-1), 0.3, self.background_light),
        ]))
        elements.append(ov_table)
        elements.append(Spacer(1, 0.2 * inch))

        # --- 5. DETAILS ---
        if not is_clear:
            elements.append(Paragraph("DETAILS", h2_style))
            elements.append(Paragraph("Exhaustive Technical Attribute Matrix", body_style))
            elements.append(Spacer(1, 0.1 * inch))
            
            audit_row_style = ParagraphStyle(
                'AuditRow', parent=body_style, leftIndent=1.8*inch, firstLineIndent=-1.8*inch,
                leading=14, spaceBefore=6, spaceAfter=6
            )

            for key, vals in sorted(props.items()):
                # Exclude simple string mappings that aren't OpenSanctions style payload when clear
                if isinstance(vals, (dict, list)) or not is_clear:
                    label = self.format_camel_case(key).upper()
                    formatted_val = self._format_value(vals)
                    if formatted_val:
                        elements.append(Paragraph(f"<font name='{self.font_name}'><b>{label}:</b></font> {formatted_val}", audit_row_style))
                        line_table = Table([[""]], colWidths=[A4[0]-80])
                        line_table.setStyle(TableStyle([('LINEBELOW', (0,0), (-1,-1), 0.2, self.border_color)]))
                        elements.append(line_table)
            
            elements.append(Spacer(1, 0.2 * inch))
            
            # --- 6. OCCUPANCY ---
            occupancy_keys = [k for k in props.keys() if 'occupancy' in k.lower() or 'position' in k.lower() or 'role' in k.lower()]
            if occupancy_keys:
                elements.append(Paragraph("OCCUPANCY", h2_style))
                elements.append(Paragraph("Institutional Professional Lineage", body_style))
                elements.append(Spacer(1, 0.1 * inch))
                for k in occupancy_keys:
                    elements.append(Paragraph(f"<font name='{self.font_name}'><b>{self.format_camel_case(k).upper()}</b></font>", h3_style))
                    elements.append(Paragraph(self._format_value(props[k]), body_style))
                    elements.append(Spacer(1, 0.1 * inch))
                elements.append(Spacer(1, 0.2 * inch))

            # --- 7. SANCTIONS ---
            sanctions = props.get("sanctions", []) + props.get("sanction", [])
            if sanctions:
                elements.append(Paragraph("SANCTIONS", h2_style))
                elements.append(Paragraph("Regulatory Sanction Portfolio", body_style))
                elements.append(Spacer(1, 0.1 * inch))
                elements.append(Paragraph(self._format_value(sanctions), body_style))
                elements.append(Spacer(1, 0.2 * inch))

            # --- 8. RELATIONSHIPS ---
            refs = entity_data.get("referencing", []) + entity_data.get("referencedBy", [])
            if refs:
                elements.append(Paragraph("RELATIONSHIPS", h2_style))
                elements.append(Paragraph("Relational Intelligence & Network Analysis", body_style))
                elements.append(Spacer(1, 0.1 * inch))
                rel_data = [[Paragraph("TYPE & RELATIONSHIP", label_style), Paragraph("ASSOCIATED ENTITY / IDENTIFIER", label_style)]]
                for r in refs:
                    target_caption = r.get("caption") or r.get("id") or "Unknown Entity"
                    rel_type = r.get("schema") or "Association"
                    rel_data.append([
                        Paragraph(f"<b>{rel_type.upper()}</b>", body_style),
                        Paragraph(target_caption, body_style)
                    ])
                
                rt = Table(rel_data, colWidths=[2.5*inch, 4.6*inch])
                rt.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), self.background_light),
                    ('VALIGN', (0,0), (-1,-1), 'TOP'),
                    ('LINEBELOW', (0,0), (-1,-1), 0.3, self.border_color),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
                    ('TOPPADDING', (0,0), (-1,-1), 8),
                ]))
                elements.append(rt)
                elements.append(Spacer(1, 0.2 * inch))
                
            # --- 9. SOURCES ---
            datasets = entity_data.get("datasets", []) + props.get("datasets", [])
            # Deduplicate
            unique_datasets = list(set(datasets)) if datasets else []
            if unique_datasets:
                elements.append(Paragraph("SOURCES", h2_style))
                elements.append(Paragraph("Verified Intelligence Datasets & Schemas", body_style))
                elements.append(Spacer(1, 0.1 * inch))
                elements.append(Paragraph(self._format_value(unique_datasets), body_style))
                elements.append(Spacer(1, 0.2 * inch))
        
        # Build document
        def add_header_footer(canvas, doc):
            draw_header(canvas, doc)
            draw_footer(canvas, doc)

        doc.build(elements, onLaterPages=add_header_footer, onFirstPage=add_header_footer)
        return buffer.getvalue()

    def generate_screening_summary_report(self, screening_data: Dict[str, Any]) -> bytes:
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, pagesize=A4, 
            rightMargin=45, leftMargin=45, topMargin=110, bottomMargin=60
        )
        
        styles = getSampleStyleSheet()
        h1_style = ParagraphStyle('H1', fontSize=24, textColor=self.secondary_color, fontName=self.font_name, leading=30)
        h3_style = ParagraphStyle('H3', fontSize=10, textColor=self.primary_color, fontName=self.font_name, textTransform='uppercase', letterSpacing=1)
        body_style = ParagraphStyle('Body', fontSize=10, textColor=self.secondary_color, fontName=self.font_name, leading=14)
        label_style = ParagraphStyle('Label', fontSize=8, textColor=self.text_muted, fontName=self.font_name, textTransform='uppercase', letterSpacing=1)
        value_style = ParagraphStyle('Value', fontSize=10, textColor=self.secondary_color, fontName=self.font_name, fontWeight='BOLD')
        
        elements = []

        # --- BACKGROUND LOGO WATERMARK ---
        def draw_watermark_grid(canvas, doc):
            canvas.saveState()
            if os.path.exists(self.logo_path):
                canvas.setFillAlpha(0.04)
                w, h = 4 * inch, 4 * inch
                canvas.drawImage(self.logo_path, (A4[0]-w)/2, (A4[1]-h)/2, width=w, height=h, mask='auto', preserveAspectRatio=True, anchor='c')
            canvas.restoreState()

        # --- EXECUTIVE HEADER ---
        def draw_header(canvas, doc):
            canvas.saveState()
            draw_watermark_grid(canvas, doc)
            canvas.setStrokeColor(self.primary_color)
            canvas.setLineWidth(3)
            canvas.line(45, A4[1]-95, A4[0]-45, A4[1]-95)
            
            if os.path.exists(self.logo_path):
                canvas.drawImage(self.logo_path, 45, A4[1]-68, width=1.5*inch, height=0.5*inch, mask='auto', preserveAspectRatio=True, anchor='w')
            
            canvas.setFont(self.font_name, 10)
            canvas.setFillColor(self.secondary_color)
            canvas.drawRightString(A4[0]-45, A4[1]-45, "EXECUTIVE MATCH SUMMARY")
            canvas.setFont(self.font_name, 8)
            canvas.setFillColor(self.text_muted)
            canvas.drawRightString(A4[0]-45, A4[1]-58, f"SESSION ID: {screening_data.get('screening_id', 'N/A')}")
            
            canvas.setFont(self.font_name, 8)
            canvas.drawString(45, A4[1]-85, f"STATUS: MULTI-LEVEL JURISDICTIONAL AUDIT")
            canvas.drawRightString(A4[0]-45, A4[1]-85, f"SYNTESIZED: {datetime.now().strftime('%d/%m/%Y %H:%M:%S UTC')}")
            canvas.restoreState()

        def draw_footer(canvas, doc):
            canvas.saveState()
            canvas.setStrokeColor(self.border_color)
            canvas.line(45, 50, A4[0]-45, 50)
            canvas.setFont(self.font_name, 8)
            canvas.setFillColor(self.text_muted)
            canvas.drawString(45, 35, f"© {datetime.now().year} AMLtab Intel Engine | Secure Session Data")
            canvas.drawCentredString(A4[0]/2, 35, "INTERNAL COMPLIANCE USE ONLY")
            canvas.drawRightString(A4[0]-45, 35, f"PAGE {doc.page} OF SECURE SUMMARY")
            canvas.restoreState()

        # --- 2. AUDIT PARAMETER MATRIX ---
        elements.append(Paragraph("SEARCH AUDIT PARAMETERS", h3_style))
        query = screening_data.get("query", {})
        subject_name = query.get("company_name") or f"{query.get('first_name', '')} {query.get('last_name', '')}".strip()
        
        audit_data = [
            [Paragraph("TARGET SUBJECT", label_style), Paragraph(f"<b>{subject_name.upper()}</b>", value_style)],
            [Paragraph("SUBJECT TYPE", label_style), Paragraph("ENTITY" if query.get("company_name") else "INDIVIDUAL", body_style)],
            [Paragraph("DATE OF BIRTH", label_style), Paragraph(query.get("date_of_birth") or "-", body_style)],
            [Paragraph("SCREEN DATE", label_style), Paragraph(str(screening_data.get("timestamp", "-"))[:19], body_style)],
        ]
        at = Table(audit_data, colWidths=[1.8*inch, 5.5*inch])
        at.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,0), (-1,-1), self.background_light),
            ('PADDING', (0,1), (-1,-1), 10),
            ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
        ]))
        elements.append(at)
        elements.append(Spacer(1, 0.3 * inch))

        # --- 3. RISK ANALYSIS DASHBOARD ---
        summary = screening_data.get("summary", {})
        total_matches = summary.get("total_matches", 0)
        max_score = summary.get("max_score", 0)
        
        risk_text = "HIGH" if total_matches > 2 else "MEDIUM" if total_matches > 0 else "LOW"
        risk_color = self.danger_color if risk_text == "HIGH" else self.warning_color if risk_text == "MEDIUM" else self.success_color

        elements.append(Paragraph("OVERALL SYSTEM ANALYSIS", h3_style))
        
        risk_dash = [[
            Paragraph(f"<b>SYSTEM RISK RATING: {risk_text}</b>", ParagraphStyle('RiskTag', fontSize=14, textColor=risk_color)),
            Paragraph(f"<b>MAX MATCH CONFIDENCE: {max_score}%</b>", ParagraphStyle('ScoreTag', fontSize=14, textColor=self.primary_color, alignment=2))
        ]]
        rd_table = Table(risk_dash, colWidths=[doc.width/2, doc.width/2])
        rd_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEBELOW', (0,0), (-1,-1), 2, risk_color),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
        ]))
        elements.append(rd_table)
        elements.append(Spacer(1, 0.25 * inch))
        
        summary_desc = (
            f"The AMLtab engine identified <b>{total_matches} jurisdictional match(es)</b> for the screened subject. "
            f"The highest confidence candidate yielded a <b>{max_score}% similarity rating</b>. "
            f"Based on the match density and jurisdictional severity, the overall risk is synthesized as <b>{risk_text}</b>."
        )
        elements.append(Paragraph(summary_desc, body_style))
        elements.append(Spacer(1, 0.4 * inch))

        if total_matches > 0:
            elements.append(Paragraph("POTENTIAL MATCH CATALOGUE", h3_style))
            
            catalog_data = [[
                Paragraph("CANDIDATE DEMOGRAPHICS", label_style), 
                Paragraph("RISK & INTEL PROFILE", label_style)
            ]]
            
            for m in screening_data.get("matches", []):
                score = f"{int(m.get('match_score', 0))}%"
                name = m.get("name", "Unknown Identification")
                category = m.get("match_type", "N/A")
                source = m.get("details", {}).get("source") or m.get("source_name") or "Global Watchlist"
                
                countries = ", ".join(m.get("countries", [])) if m.get("countries") else "-"
                dob = ", ".join(m.get("birth_dates", [])) if m.get("birth_dates") else "-"
                
                details_dict = m.get("details", {})
                topics = details_dict.get("topics", []) or m.get("topics", [])
                topics_str = ", ".join(topics) if topics else "Standard Profiling"
                
                ids = m.get("id_numbers", [])
                passports = m.get("passports", [])
                identifiers = ", ".join(ids) if ids else (", ".join([str(p.get("number")) for p in passports if isinstance(p, dict)]) if passports else "-")

                left_para = f"""
                <font size=11><b>{self._escape(name.upper())}</b></font><br/>
                <font size=8 color='#64748b'><b>DOB:</b></font> <font size=9>{self._escape(dob)}</font><br/>
                <font size=8 color='#64748b'><b>LOCATIONS:</b></font> <font size=9>{self._escape(countries)}</font><br/>
                <font size=8 color='#64748b'><b>IDENTIFIERS:</b></font> <font size=9>{self._escape(identifiers)}</font>
                """
                
                right_para = f"""
                <font size=11 color='#0d9488'><b>{score} MATCH CONFIDENCE</b></font><br/>
                <font size=8 color='#64748b'><b>RISK CLASS:</b></font> <font size=9>{self._escape(category)}</font><br/>
                <font size=8 color='#64748b'><b>TOPICS:</b></font> <font size=9>{self._escape(topics_str)}</font><br/>
                <font size=8 color='#64748b'><b>DATASETS:</b></font> <font size=8>{self._escape(source)}</font>
                """
                
                catalog_data.append([
                    Paragraph(left_para, ParagraphStyle('LeftCol', parent=body_style, leading=14)),
                    Paragraph(right_para, ParagraphStyle('RightCol', parent=body_style, leading=14))
                ])
            
            ct = Table(catalog_data, colWidths=[4.0*inch, 3.0*inch])
            ct.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('LINEBELOW', (0,0), (-1,-1), 0.5, self.border_color),
                ('BACKGROUND', (0,0), (-1,0), self.background_light),
            ]))
            elements.append(ct)
            elements.append(Spacer(1, 0.4 * inch))
            
            elements.append(Paragraph("COMPLIANCE ADVISORY", h3_style))
            advisory = (
                f"<b>Recommendation:</b> Multi-Level matches identified. Subject requires manual analyst review. "
                f"Please conduct an exhaustive deep-dive into the top matches to verify identification against "
                f"official jurisdictional documentation."
            )
            elements.append(Paragraph(advisory, body_style))
        else:
            elements.append(Paragraph("<b>CLEARANCE DETERMINATION:</b> No matches found across monitored watchlists.", body_style))

        doc.build(elements, onLaterPages=draw_footer, onFirstPage=draw_header)
        return buffer.getvalue()

report_service = ReportService()
