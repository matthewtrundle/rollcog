#!/usr/bin/env python3
"""
Create Commercial Roof Inspection Guide PDF for Rollcog Roofs
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak,
    Table, TableStyle, ListFlowable, ListItem
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Brand colors
CHARCOAL = HexColor("#0f172a")
ORANGE = HexColor("#f97316")
LIGHT_GRAY = HexColor("#f8fafc")
DARK_GRAY = HexColor("#374151")
WHITE = HexColor("#ffffff")

# Company info
COMPANY_NAME = "Rollcog Roofs"
PHONE = "630-655-8256"
EMAIL = "sarah@atjcorp.net"
WEBSITE = "rollcogroofing.com"

class PDFGenerator:
    def __init__(self, filename):
        self.filename = filename
        self.width, self.height = letter
        self.margin = 0.75 * inch

    def create_pdf(self):
        c = canvas.Canvas(self.filename, pagesize=letter)

        # Page 1 - Cover
        self._draw_cover(c)
        c.showPage()

        # Page 2 - Introduction
        self._draw_introduction(c)
        c.showPage()

        # Page 3 - Visual Inspection Checklist
        self._draw_checklist(c)
        c.showPage()

        # Page 4 - Warning Signs
        self._draw_warning_signs(c)
        c.showPage()

        # Page 5 - DIY vs Professional
        self._draw_diy_vs_pro(c)
        c.showPage()

        # Page 6 - CTA
        self._draw_cta(c)

        c.save()
        print(f"PDF created: {self.filename}")

    def _draw_header(self, c, page_num):
        """Draw header with logo area"""
        # Top accent line
        c.setFillColor(ORANGE)
        c.rect(0, self.height - 8, self.width, 8, fill=1, stroke=0)

        # Company name in header
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(self.margin, self.height - 35, COMPANY_NAME.upper())

        # Page number
        c.setFont("Helvetica", 9)
        c.setFillColor(DARK_GRAY)
        c.drawRightString(self.width - self.margin, self.height - 35, f"Page {page_num}")

    def _draw_footer(self, c):
        """Draw footer"""
        c.setFillColor(CHARCOAL)
        c.rect(0, 0, self.width, 30, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 8)
        c.drawCentredString(self.width/2, 12, f"{PHONE}  |  {EMAIL}  |  {WEBSITE}")

    def _draw_cover(self, c):
        """Page 1 - Cover page"""
        # Full page dark background
        c.setFillColor(CHARCOAL)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)

        # Orange accent bar at top
        c.setFillColor(ORANGE)
        c.rect(0, self.height - 100, self.width, 100, fill=1, stroke=0)

        # Company name
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(self.width/2, self.height - 60, COMPANY_NAME.upper())

        # Main title
        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(self.width/2, self.height - 220, "Commercial Roof")
        c.drawCentredString(self.width/2, self.height - 265, "Inspection Guide")

        # Orange accent line
        c.setFillColor(ORANGE)
        c.rect(self.width/2 - 50, self.height - 295, 100, 4, fill=1, stroke=0)

        # Subtitle
        c.setFillColor(HexColor("#94a3b8"))
        c.setFont("Helvetica", 14)
        c.drawCentredString(self.width/2, self.height - 340, "The Complete Checklist for")
        c.drawCentredString(self.width/2, self.height - 360, "Property Managers & Facility Directors")

        # Decorative element - roof shape outline
        c.setStrokeColor(HexColor("#1e3a5f"))
        c.setLineWidth(2)
        # Simple roof line
        c.line(self.width/2 - 120, self.height - 440, self.width/2, self.height - 480)
        c.line(self.width/2, self.height - 480, self.width/2 + 120, self.height - 440)
        c.line(self.width/2 - 120, self.height - 440, self.width/2 + 120, self.height - 440)

        # Bottom tagline
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(self.width/2, 120, "27+ Years of Commercial Roofing Excellence")

        # Contact info at bottom
        c.setFillColor(WHITE)
        c.setFont("Helvetica", 10)
        c.drawCentredString(self.width/2, 80, f"{PHONE}  •  {EMAIL}")
        c.drawCentredString(self.width/2, 60, WEBSITE)

    def _draw_introduction(self, c):
        """Page 2 - Introduction"""
        self._draw_header(c, 2)
        self._draw_footer(c)

        y = self.height - 100

        # Section title
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(self.margin, y, "Why Regular Roof")
        y -= 30
        c.drawString(self.margin, y, "Inspections Matter")

        # Orange underline
        c.setFillColor(ORANGE)
        c.rect(self.margin, y - 10, 80, 3, fill=1, stroke=0)

        y -= 50

        # Intro paragraph
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        intro_text = [
            "Your commercial roof is one of your building's most critical assets.",
            "Regular inspections help identify small issues before they become",
            "costly repairs, protecting your investment and ensuring the safety",
            "of everyone inside."
        ]
        for line in intro_text:
            c.drawString(self.margin, y, line)
            y -= 18

        y -= 30

        # Benefits section
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(self.margin, y, "Key Benefits of Regular Inspections:")
        y -= 35

        benefits = [
            ("Prevent Costly Repairs", "Catch small problems before they escalate into expensive emergency repairs."),
            ("Extend Roof Lifespan", "Proper maintenance can add 10-15 years to your roof's service life."),
            ("Maintain Warranty", "Many manufacturers require documented inspections to honor warranties."),
            ("Improve Energy Efficiency", "Identify and fix issues that cause energy loss and increased utility bills."),
            ("Peace of Mind", "Know your building and occupants are protected from the elements.")
        ]

        for title, desc in benefits:
            # Orange bullet
            c.setFillColor(ORANGE)
            c.circle(self.margin + 8, y + 4, 4, fill=1, stroke=0)

            # Benefit title
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(self.margin + 25, y, title)

            # Description
            y -= 18
            c.setFillColor(DARK_GRAY)
            c.setFont("Helvetica", 10)
            c.drawString(self.margin + 25, y, desc)
            y -= 35

        # Recommendation box
        y -= 20
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(self.margin, y - 60, self.width - 2*self.margin, 70, 8, fill=1, stroke=0)

        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(self.margin + 15, y - 20, "RECOMMENDATION")

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 10)
        c.drawString(self.margin + 15, y - 40, "Schedule professional inspections twice yearly (spring and fall) and after")
        c.drawString(self.margin + 15, y - 55, "any severe weather events.")

    def _draw_checklist(self, c):
        """Page 3 - Visual Inspection Checklist"""
        self._draw_header(c, 3)
        self._draw_footer(c)

        y = self.height - 100

        # Section title
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(self.margin, y, "Monthly Visual")
        y -= 30
        c.drawString(self.margin, y, "Inspection Checklist")

        # Orange underline
        c.setFillColor(ORANGE)
        c.rect(self.margin, y - 10, 80, 3, fill=1, stroke=0)

        y -= 50

        # Intro text
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, "Use this checklist during your monthly roof walks. Check each item and")
        y -= 16
        c.drawString(self.margin, y, "note any concerns for follow-up with a professional.")

        y -= 40

        checklist_items = [
            "Check for ponding water or debris buildup on roof surface",
            "Inspect membrane for cracks, blisters, or splits",
            "Examine flashing around HVAC units, vents, and penetrations",
            "Look for signs of pest activity or damage (nests, droppings)",
            "Check drains and scuppers for blockages or slow drainage",
            "Inspect roof edge and parapet wall condition",
            "Note any unusual staining, discoloration, or soft spots",
            "Verify all access hatches and skylights are properly sealed",
            "Check for loose or missing fasteners and cap sheets",
            "Document any changes since last inspection with photos"
        ]

        for item in checklist_items:
            # Checkbox
            c.setStrokeColor(CHARCOAL)
            c.setLineWidth(1.5)
            c.rect(self.margin, y - 3, 14, 14, fill=0, stroke=1)

            # Item text
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 11)
            c.drawString(self.margin + 25, y, item)
            y -= 35

        # Notes section
        y -= 20
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin, y, "Notes:")

        # Lines for notes
        c.setStrokeColor(HexColor("#e2e8f0"))
        c.setLineWidth(0.5)
        for i in range(4):
            y -= 25
            c.line(self.margin, y, self.width - self.margin, y)

    def _draw_warning_signs(self, c):
        """Page 4 - Warning Signs"""
        self._draw_header(c, 4)
        self._draw_footer(c)

        y = self.height - 100

        # Section title with warning icon
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(self.margin, y, "⚠")
        c.setFillColor(CHARCOAL)
        c.drawString(self.margin + 30, y, "Warning Signs You")
        y -= 30
        c.drawString(self.margin, y, "Need Professional Help")

        # Orange underline
        c.setFillColor(ORANGE)
        c.rect(self.margin, y - 10, 80, 3, fill=1, stroke=0)

        y -= 50

        # Intro
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, "If you notice any of these issues, contact a professional roofer immediately:")

        y -= 40

        warning_signs = [
            ("Visible Membrane Damage", "Tears, punctures, or exposed underlayment require immediate attention to prevent water infiltration."),
            ("Ponding Water (48+ Hours)", "Water that doesn't drain within 48 hours indicates drainage problems that can lead to roof failure."),
            ("Interior Water Staining", "Brown spots or moisture on ceilings/walls mean water is already penetrating your building."),
            ("Unexpected Energy Bill Increases", "Sudden spikes may indicate insulation failure or air leaks through the roof system."),
            ("Roof Over 15 Years Old", "Commercial roofs have finite lifespans. Regular professional assessment is critical."),
            ("After Severe Weather", "Hail, high winds, or heavy snow loads can cause hidden damage that worsens over time.")
        ]

        for title, desc in warning_signs:
            # Warning icon circle
            c.setFillColor(ORANGE)
            c.circle(self.margin + 12, y + 8, 12, fill=1, stroke=0)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 14)
            c.drawCentredString(self.margin + 12, y + 4, "!")

            # Title
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(self.margin + 35, y + 8, title)

            # Description - wrap text
            c.setFillColor(DARK_GRAY)
            c.setFont("Helvetica", 10)
            # Simple text wrapping
            words = desc.split()
            line = ""
            line_y = y - 10
            for word in words:
                test_line = line + " " + word if line else word
                if c.stringWidth(test_line, "Helvetica", 10) < self.width - 2*self.margin - 35:
                    line = test_line
                else:
                    c.drawString(self.margin + 35, line_y, line)
                    line_y -= 14
                    line = word
            if line:
                c.drawString(self.margin + 35, line_y, line)

            y -= 75

        # Emergency box
        y -= 10
        c.setFillColor(ORANGE)
        c.roundRect(self.margin, y - 50, self.width - 2*self.margin, 60, 8, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(self.width/2, y - 15, "EMERGENCY? Call Us Now!")
        c.setFont("Helvetica-Bold", 18)
        c.drawCentredString(self.width/2, y - 40, PHONE)

    def _draw_diy_vs_pro(self, c):
        """Page 5 - DIY vs Professional"""
        self._draw_header(c, 5)
        self._draw_footer(c)

        y = self.height - 100

        # Section title
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 24)
        c.drawString(self.margin, y, "When to DIY vs")
        y -= 30
        c.drawString(self.margin, y, "Call a Professional")

        # Orange underline
        c.setFillColor(ORANGE)
        c.rect(self.margin, y - 10, 80, 3, fill=1, stroke=0)

        y -= 50

        # Intro
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, "Know your limits. Some tasks are safe for in-house maintenance teams,")
        y -= 16
        c.drawString(self.margin, y, "while others require licensed, insured roofing professionals.")

        y -= 50

        # Two columns
        col_width = (self.width - 2*self.margin - 30) / 2
        left_x = self.margin
        right_x = self.margin + col_width + 30

        # DIY Column Header
        c.setFillColor(HexColor("#22c55e"))
        c.roundRect(left_x, y - 25, col_width, 35, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(left_x + col_width/2, y - 12, "DIY / In-House Tasks")

        # Professional Column Header
        c.setFillColor(ORANGE)
        c.roundRect(right_x, y - 25, col_width, 35, 5, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(right_x + col_width/2, y - 12, "Call a Professional")

        y -= 60

        diy_tasks = [
            "Monthly visual inspections",
            "Clearing debris and leaves",
            "Cleaning gutters and drains",
            "Documenting conditions",
            "Snow removal (soft tools)",
            "Reporting issues promptly"
        ]

        pro_tasks = [
            "Membrane repairs/patches",
            "Flashing replacement",
            "Warranty inspections",
            "Penetration sealing",
            "Full roof assessments",
            "Emergency leak repairs"
        ]

        item_y = y
        for task in diy_tasks:
            c.setFillColor(HexColor("#22c55e"))
            c.setFont("Helvetica-Bold", 12)
            c.drawString(left_x, item_y, "✓")
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 11)
            c.drawString(left_x + 20, item_y, task)
            item_y -= 30

        item_y = y
        for task in pro_tasks:
            c.setFillColor(ORANGE)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(right_x, item_y, "★")
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 11)
            c.drawString(right_x + 20, item_y, task)
            item_y -= 30

        # Safety reminder box
        y = item_y - 40
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(self.margin, y - 80, self.width - 2*self.margin, 90, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin + 15, y - 20, "SAFETY FIRST")

        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 10)
        safety_text = [
            "• Always use proper fall protection when accessing the roof",
            "• Never walk on a wet or icy roof surface",
            "• Avoid walking on single-ply membranes in extreme temperatures",
            "• If in doubt about safety or scope, call a professional"
        ]
        text_y = y - 40
        for line in safety_text:
            c.drawString(self.margin + 15, text_y, line)
            text_y -= 15

    def _draw_cta(self, c):
        """Page 6 - CTA"""
        # Full page with dark top section
        c.setFillColor(CHARCOAL)
        c.rect(0, self.height/2, self.width, self.height/2, fill=1, stroke=0)

        # Light bottom section
        c.setFillColor(LIGHT_GRAY)
        c.rect(0, 0, self.width, self.height/2, fill=1, stroke=0)

        # Orange accent bar
        c.setFillColor(ORANGE)
        c.rect(0, self.height/2 - 4, self.width, 8, fill=1, stroke=0)

        y = self.height - 100

        # Company name
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(self.width/2, y, COMPANY_NAME.upper())

        y -= 60

        # Main CTA
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 32)
        c.drawCentredString(self.width/2, y, "Ready for a Professional")
        y -= 40
        c.drawCentredString(self.width/2, y, "Inspection?")

        y -= 50

        # Subtext
        c.setFillColor(HexColor("#94a3b8"))
        c.setFont("Helvetica", 14)
        c.drawCentredString(self.width/2, y, "Our team of GAF-certified experts is ready to help")
        y -= 20
        c.drawCentredString(self.width/2, y, "protect your commercial property.")

        # CTA Button
        y = self.height/2 - 60
        button_width = 280
        button_height = 50
        button_x = (self.width - button_width) / 2

        c.setFillColor(ORANGE)
        c.roundRect(button_x, y, button_width, button_height, 8, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(self.width/2, y + 18, "Schedule Your FREE Inspection")

        # Contact info
        y -= 60
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(self.width/2, y, PHONE)

        y -= 30
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 14)
        c.drawCentredString(self.width/2, y, EMAIL)

        y -= 25
        c.setFont("Helvetica", 14)
        c.drawCentredString(self.width/2, y, WEBSITE)

        # Trust badges
        y -= 70
        badges = ["GAF Certified", "27+ Years Experience", "9+ States Served"]
        badge_width = 140
        total_width = len(badges) * badge_width + (len(badges) - 1) * 20
        start_x = (self.width - total_width) / 2

        for i, badge in enumerate(badges):
            x = start_x + i * (badge_width + 20)

            # Badge background
            c.setFillColor(WHITE)
            c.roundRect(x, y - 5, badge_width, 40, 5, fill=1, stroke=0)

            # Badge border
            c.setStrokeColor(HexColor("#e2e8f0"))
            c.setLineWidth(1)
            c.roundRect(x, y - 5, badge_width, 40, 5, fill=0, stroke=1)

            # Badge text
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 10)
            c.drawCentredString(x + badge_width/2, y + 12, badge)

        # Footer
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 9)
        c.drawCentredString(self.width/2, 40, f"© {2024} {COMPANY_NAME}. All rights reserved.")

# Create the PDF
output_path = "/Users/matthewrundle/Documents/Rollcog/rollcog-website/public/downloads/roof-inspection-guide.pdf"
generator = PDFGenerator(output_path)
generator.create_pdf()
