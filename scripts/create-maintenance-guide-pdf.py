#!/usr/bin/env python3
"""
Create Commercial Roof Maintenance Guide PDF for Rollcog Roofs
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

# Brand colors
CHARCOAL = HexColor("#0f172a")
ORANGE = HexColor("#f97316")
LIGHT_GRAY = HexColor("#f8fafc")
DARK_GRAY = HexColor("#374151")
WHITE = HexColor("#ffffff")
LIGHT_BLUE = HexColor("#dbeafe")
LIGHT_GREEN = HexColor("#dcfce7")
LIGHT_ORANGE = HexColor("#ffedd5")
LIGHT_PURPLE = HexColor("#f3e8ff")

# Company info
COMPANY_NAME = "Rollcog Roofs"
PHONE = "630-655-8256"
EMAIL = "sarah@atjcorp.net"
WEBSITE = "rollcogroofing.com"

class MaintenancePDFGenerator:
    def __init__(self, filename):
        self.filename = filename
        self.width, self.height = letter
        self.margin = 0.75 * inch

    def create_pdf(self):
        c = canvas.Canvas(self.filename, pagesize=letter)

        # Page 1 - Cover
        self._draw_cover(c)
        c.showPage()

        # Page 2 - Monthly Checklist
        self._draw_monthly_checklist(c)
        c.showPage()

        # Page 3 - Quarterly Tasks
        self._draw_quarterly_tasks(c)
        c.showPage()

        # Page 4 - Seasonal Preparation
        self._draw_seasonal_prep(c)
        c.showPage()

        # Page 5 - Annual Inspection
        self._draw_annual_inspection(c)
        c.showPage()

        # Page 6 - Emergency Response
        self._draw_emergency_response(c)
        c.showPage()

        # Page 7 - Maintenance Log Template
        self._draw_maintenance_log(c)
        c.showPage()

        # Page 8 - CTA
        self._draw_cta(c)

        c.save()
        print(f"PDF created: {self.filename}")

    def _draw_header(self, c, page_num):
        """Draw header with logo area"""
        c.setFillColor(ORANGE)
        c.rect(0, self.height - 8, self.width, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(self.margin, self.height - 35, COMPANY_NAME.upper())

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
        c.setFillColor(CHARCOAL)
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)

        c.setFillColor(ORANGE)
        c.rect(0, self.height - 100, self.width, 100, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(self.width/2, self.height - 60, COMPANY_NAME.upper())

        c.setFont("Helvetica-Bold", 36)
        c.drawCentredString(self.width/2, self.height - 220, "Commercial Roof")
        c.drawCentredString(self.width/2, self.height - 265, "Maintenance Guide")

        c.setFillColor(ORANGE)
        c.rect(self.width/2 - 50, self.height - 295, 100, 4, fill=1, stroke=0)

        c.setFillColor(HexColor("#94a3b8"))
        c.setFont("Helvetica", 14)
        c.drawCentredString(self.width/2, self.height - 340, "Your Complete Year-Round Maintenance")
        c.drawCentredString(self.width/2, self.height - 360, "Schedule & Documentation System")

        # Calendar icons suggestion
        c.setStrokeColor(HexColor("#1e3a5f"))
        c.setLineWidth(2)
        c.rect(self.width/2 - 100, self.height - 480, 60, 60, fill=0, stroke=1)
        c.rect(self.width/2 - 30, self.height - 480, 60, 60, fill=0, stroke=1)
        c.rect(self.width/2 + 40, self.height - 480, 60, 60, fill=0, stroke=1)

        c.setFillColor(HexColor("#1e3a5f"))
        c.setFont("Helvetica", 10)
        c.drawCentredString(self.width/2 - 70, self.height - 500, "Monthly")
        c.drawCentredString(self.width/2, self.height - 500, "Quarterly")
        c.drawCentredString(self.width/2 + 70, self.height - 500, "Annual")

        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(self.width/2, 120, "Protect Your Investment • Extend Roof Life")

        c.setFillColor(WHITE)
        c.setFont("Helvetica", 10)
        c.drawCentredString(self.width/2, 80, f"{PHONE}  •  {EMAIL}")
        c.drawCentredString(self.width/2, 60, WEBSITE)

    def _draw_monthly_checklist(self, c):
        """Page 2 - Monthly Visual Inspection"""
        self._draw_header(c, 2)
        self._draw_footer(c)

        y = self.height - 100

        # Title with icon
        c.setFillColor(LIGHT_BLUE)
        c.roundRect(self.margin - 5, y - 35, self.width - 2*self.margin + 10, 50, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(self.margin + 10, y - 15, "📅 Monthly Visual Inspection")

        y -= 70

        # Intro
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, "Complete these tasks each month to catch issues early. Time required: 30-45 minutes.")

        y -= 40

        monthly_items = [
            ("Walk the Roof Surface", "Check for ponding water, debris, displaced materials"),
            ("Inspect Membrane Condition", "Look for cracks, blisters, wrinkles, or discoloration"),
            ("Check All Penetrations", "Examine seals around HVAC, vents, pipes, skylights"),
            ("Clear Drains & Scuppers", "Remove leaves, debris; ensure water flows freely"),
            ("Examine Edge Details", "Check parapet walls, coping, edge metal condition"),
        ]

        for title, desc in monthly_items:
            # Checkbox
            c.setStrokeColor(CHARCOAL)
            c.setLineWidth(1.5)
            c.rect(self.margin, y - 3, 16, 16, fill=0, stroke=1)

            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 12)
            c.drawString(self.margin + 28, y + 2, title)

            c.setFillColor(DARK_GRAY)
            c.setFont("Helvetica", 10)
            c.drawString(self.margin + 28, y - 14, desc)

            y -= 50

        # Tips box
        y -= 20
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(self.margin, y - 100, self.width - 2*self.margin, 110, 8, fill=1, stroke=0)

        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 11)
        c.drawString(self.margin + 15, y - 20, "💡 PRO TIPS")

        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 10)
        tips = [
            "• Inspect after every major storm, even if it's not your scheduled month",
            "• Take photos each month for comparison—helps identify gradual changes",
            "• Use a consistent route so you don't miss any areas",
            "• Keep a dedicated pair of soft-soled shoes for roof access"
        ]
        tip_y = y - 40
        for tip in tips:
            c.drawString(self.margin + 15, tip_y, tip)
            tip_y -= 16

    def _draw_quarterly_tasks(self, c):
        """Page 3 - Quarterly Maintenance Tasks"""
        self._draw_header(c, 3)
        self._draw_footer(c)

        y = self.height - 100

        # Title
        c.setFillColor(LIGHT_GREEN)
        c.roundRect(self.margin - 5, y - 35, self.width - 2*self.margin + 10, 50, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(self.margin + 10, y - 15, "📆 Quarterly Maintenance Tasks")

        y -= 70

        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, "Perform these deeper maintenance tasks every 3 months (Jan, Apr, Jul, Oct recommended).")

        y -= 40

        quarterly_items = [
            ("Deep Clean Gutters & Downspouts", "Remove all debris, flush with water, check for proper flow and no leaks"),
            ("Inspect & Clean Drains", "Remove drain covers, clear any buildup, ensure strainers are intact"),
            ("Check HVAC Equipment Stands", "Verify stands are level, secure, and not causing membrane damage"),
            ("Test Emergency Overflow Drains", "Ensure secondary drainage systems function properly"),
            ("Trim Overhanging Vegetation", "Cut back any branches within 6 feet of the roof surface"),
            ("Inspect Caulk & Sealants", "Check all exposed sealants for cracking, peeling, or separation"),
            ("Review Roof Access Points", "Ensure hatches, ladders, and safety equipment are in good condition")
        ]

        for title, desc in quarterly_items:
            c.setStrokeColor(CHARCOAL)
            c.setLineWidth(1.5)
            c.rect(self.margin, y - 3, 16, 16, fill=0, stroke=1)

            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(self.margin + 28, y + 2, title)

            # Wrap description
            c.setFillColor(DARK_GRAY)
            c.setFont("Helvetica", 9)
            words = desc.split()
            line = ""
            line_y = y - 14
            max_width = self.width - 2*self.margin - 28
            for word in words:
                test = line + " " + word if line else word
                if c.stringWidth(test, "Helvetica", 9) < max_width:
                    line = test
                else:
                    c.drawString(self.margin + 28, line_y, line)
                    line_y -= 12
                    line = word
            if line:
                c.drawString(self.margin + 28, line_y, line)

            y -= 55

    def _draw_seasonal_prep(self, c):
        """Page 4 - Seasonal Preparation Guides"""
        self._draw_header(c, 4)
        self._draw_footer(c)

        y = self.height - 100

        # Title
        c.setFillColor(LIGHT_ORANGE)
        c.roundRect(self.margin - 5, y - 35, self.width - 2*self.margin + 10, 50, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(self.margin + 10, y - 15, "🌡️ Seasonal Preparation")

        y -= 75

        # Two columns
        col_width = (self.width - 2*self.margin - 20) / 2
        left_x = self.margin
        right_x = self.margin + col_width + 20

        # Winter Prep - Left column
        c.setFillColor(LIGHT_BLUE)
        c.roundRect(left_x, y - 200, col_width, 210, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(left_x + 15, y - 20, "❄️ Winter Preparation")

        c.setFont("Helvetica", 9)
        winter_items = [
            "□ Clear all debris before freeze",
            "□ Check/repair drainage systems",
            "□ Inspect flashing/seals for gaps",
            "□ Verify emergency equipment",
            "□ Stock snow removal tools",
            "□ Review ice dam risk areas",
            "□ Document pre-winter condition"
        ]
        item_y = y - 45
        for item in winter_items:
            c.drawString(left_x + 15, item_y, item)
            item_y -= 20

        # Summer Prep - Right column
        c.setFillColor(LIGHT_ORANGE)
        c.roundRect(right_x, y - 200, col_width, 210, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(right_x + 15, y - 20, "☀️ Summer Preparation")

        c.setFont("Helvetica", 9)
        summer_items = [
            "□ Check UV damage on membrane",
            "□ Inspect expansion joints",
            "□ Clean HVAC condensate lines",
            "□ Verify reflective coatings",
            "□ Check thermal movement",
            "□ Inspect for heat blistering",
            "□ Ensure ventilation is clear"
        ]
        item_y = y - 45
        for item in summer_items:
            c.drawString(right_x + 15, item_y, item)
            item_y -= 20

        y -= 230

        # Spring and Fall boxes
        c.setFillColor(LIGHT_GREEN)
        c.roundRect(left_x, y - 140, col_width, 150, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(left_x + 15, y - 20, "🌸 Spring Recovery")

        c.setFont("Helvetica", 9)
        spring_items = [
            "□ Assess winter damage",
            "□ Clear accumulated debris",
            "□ Deep clean all drains",
            "□ Schedule professional inspection",
            "□ Address any leak reports"
        ]
        item_y = y - 45
        for item in spring_items:
            c.drawString(left_x + 15, item_y, item)
            item_y -= 18

        c.setFillColor(LIGHT_PURPLE)
        c.roundRect(right_x, y - 140, col_width, 150, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(right_x + 15, y - 20, "🍂 Fall Prep")

        c.setFont("Helvetica", 9)
        fall_items = [
            "□ Full system inspection",
            "□ Gutter cleaning (heavy)",
            "□ Seal any minor cracks",
            "□ Check heating systems",
            "□ Stock emergency supplies"
        ]
        item_y = y - 45
        for item in fall_items:
            c.drawString(right_x + 15, item_y, item)
            item_y -= 18

    def _draw_annual_inspection(self, c):
        """Page 5 - Annual Professional Inspection"""
        self._draw_header(c, 5)
        self._draw_footer(c)

        y = self.height - 100

        # Title
        c.setFillColor(LIGHT_PURPLE)
        c.roundRect(self.margin - 5, y - 35, self.width - 2*self.margin + 10, 50, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(self.margin + 10, y - 15, "📋 Annual Professional Inspection")

        y -= 75

        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 11)
        c.drawString(self.margin, y, "Schedule a professional inspection annually. Here's what should be covered:")

        y -= 35

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin, y, "Professional Inspection Should Include:")

        y -= 25

        inspection_items = [
            "Complete membrane assessment (core cuts if needed)",
            "Infrared moisture scanning",
            "Detailed flashing inspection",
            "Structural drainage evaluation",
            "HVAC curb and equipment pad inspection",
            "Warranty compliance verification",
            "Roof life expectancy assessment",
            "Written report with photos and recommendations"
        ]

        for item in inspection_items:
            c.setFillColor(ORANGE)
            c.circle(self.margin + 8, y + 4, 5, fill=1, stroke=0)
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica", 10)
            c.drawString(self.margin + 22, y, item)
            y -= 22

        # What to expect box
        y -= 25
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(self.margin, y - 120, self.width - 2*self.margin, 130, 8, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(self.margin + 15, y - 20, "What to Expect From Your Inspector")

        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 10)
        expect_items = [
            "• Arrive with proper safety equipment and insurance documentation",
            "• Spend 1-3 hours depending on roof size and complexity",
            "• Provide detailed written report within 7 days",
            "• Include prioritized recommendations (immediate, near-term, long-term)",
            "• Offer to review findings and answer questions"
        ]
        item_y = y - 45
        for item in expect_items:
            c.drawString(self.margin + 15, item_y, item)
            item_y -= 16

    def _draw_emergency_response(self, c):
        """Page 6 - Emergency Response Guide"""
        self._draw_header(c, 6)
        self._draw_footer(c)

        y = self.height - 100

        # Title with warning
        c.setFillColor(ORANGE)
        c.roundRect(self.margin - 5, y - 35, self.width - 2*self.margin + 10, 50, 8, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(self.margin + 10, y - 15, "🚨 Emergency Response Guide")

        y -= 75

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(self.margin, y, "If You Discover Roof Damage:")

        y -= 30

        emergency_steps = [
            ("1. Assess Immediate Safety", "Do NOT access the roof if there's active weather or visible structural damage. Evacuate affected areas if needed."),
            ("2. Document Everything", "Take photos/video of damage from safe vantage points. Note date, time, and weather conditions."),
            ("3. Protect Interior", "Move valuable equipment, cover items with plastic. Place containers under active leaks."),
            ("4. Contact Your Roofer", f"Call {PHONE} immediately. We offer emergency response within 24-48 hours."),
            ("5. Notify Insurance", "Report potential claims early. Your documentation will be critical."),
            ("6. Secure the Area", "Prevent unauthorized roof access until professional assessment is complete.")
        ]

        for title, desc in emergency_steps:
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 11)
            c.drawString(self.margin, y, title)

            c.setFillColor(DARK_GRAY)
            c.setFont("Helvetica", 9)
            # Wrap text
            words = desc.split()
            line = ""
            line_y = y - 16
            for word in words:
                test = line + " " + word if line else word
                if c.stringWidth(test, "Helvetica", 9) < self.width - 2*self.margin:
                    line = test
                else:
                    c.drawString(self.margin, line_y, line)
                    line_y -= 12
                    line = word
            if line:
                c.drawString(self.margin, line_y, line)

            y -= 55

        # Emergency contact box
        y -= 20
        c.setFillColor(CHARCOAL)
        c.roundRect(self.margin, y - 70, self.width - 2*self.margin, 80, 8, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(self.width/2, y - 25, "24/7 EMERGENCY LINE")

        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 24)
        c.drawCentredString(self.width/2, y - 55, PHONE)

    def _draw_maintenance_log(self, c):
        """Page 7 - Maintenance Log Template"""
        self._draw_header(c, 7)
        self._draw_footer(c)

        y = self.height - 100

        # Title
        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 22)
        c.drawString(self.margin, y, "📝 Maintenance Log")

        y -= 25

        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 10)
        c.drawString(self.margin, y, "Use this log to track all roof maintenance activities. Keep copies for warranty compliance.")

        y -= 35

        # Building info section
        c.setFillColor(LIGHT_GRAY)
        c.roundRect(self.margin, y - 60, self.width - 2*self.margin, 70, 5, fill=1, stroke=0)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(self.margin + 10, y - 15, "Building Information")

        c.setFont("Helvetica", 9)
        c.drawString(self.margin + 10, y - 32, "Address: _________________________________")
        c.drawString(self.margin + 280, y - 32, "Roof Type: _______________")
        c.drawString(self.margin + 10, y - 50, "Install Date: _______________")
        c.drawString(self.margin + 180, y - 50, "Warranty Exp: _______________")
        c.drawString(self.margin + 370, y - 50, "Sq Ft: _________")

        y -= 90

        # Log table header
        c.setFillColor(CHARCOAL)
        c.rect(self.margin, y - 25, self.width - 2*self.margin, 28, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(self.margin + 8, y - 15, "Date")
        c.drawString(self.margin + 60, y - 15, "Type")
        c.drawString(self.margin + 130, y - 15, "Description / Findings")
        c.drawString(self.margin + 350, y - 15, "Performed By")
        c.drawString(self.margin + 440, y - 15, "Next Due")

        # Empty rows
        c.setStrokeColor(HexColor("#e2e8f0"))
        c.setLineWidth(0.5)
        row_y = y - 25
        for _ in range(12):
            row_y -= 30
            c.rect(self.margin, row_y, self.width - 2*self.margin, 30, fill=0, stroke=1)
            # Column lines
            c.line(self.margin + 55, row_y, self.margin + 55, row_y + 30)
            c.line(self.margin + 125, row_y, self.margin + 125, row_y + 30)
            c.line(self.margin + 345, row_y, self.margin + 345, row_y + 30)
            c.line(self.margin + 435, row_y, self.margin + 435, row_y + 30)

    def _draw_cta(self, c):
        """Page 8 - CTA & When to Call"""
        c.setFillColor(CHARCOAL)
        c.rect(0, self.height/2, self.width, self.height/2, fill=1, stroke=0)

        c.setFillColor(LIGHT_GRAY)
        c.rect(0, 0, self.width, self.height/2, fill=1, stroke=0)

        c.setFillColor(ORANGE)
        c.rect(0, self.height/2 - 4, self.width, 8, fill=1, stroke=0)

        y = self.height - 80

        # Title
        c.setFillColor(ORANGE)
        c.setFont("Helvetica-Bold", 12)
        c.drawCentredString(self.width/2, y, "WHEN TO CALL ROLLCOG")

        y -= 45

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 28)
        c.drawCentredString(self.width/2, y, "Signs You Need")
        y -= 35
        c.drawCentredString(self.width/2, y, "Professional Help")

        y -= 50

        # Warning signs list
        c.setFillColor(HexColor("#94a3b8"))
        c.setFont("Helvetica", 12)
        signs = [
            "• Ponding water lasting 48+ hours",
            "• Visible membrane damage or exposed layers",
            "• Interior leaks or ceiling staining",
            "• Energy bills suddenly increasing",
            "• Roof over 15 years without inspection"
        ]
        for sign in signs:
            c.drawCentredString(self.width/2, y, sign)
            y -= 22

        # CTA area
        y = self.height/2 - 50

        c.setFillColor(ORANGE)
        button_width = 280
        button_height = 50
        button_x = (self.width - button_width) / 2
        c.roundRect(button_x, y - 20, button_width, button_height, 8, fill=1, stroke=0)

        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(self.width/2, y, "Schedule FREE Inspection")

        y -= 70

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(self.width/2, y, PHONE)

        y -= 30
        c.setFillColor(DARK_GRAY)
        c.setFont("Helvetica", 14)
        c.drawCentredString(self.width/2, y, EMAIL)
        y -= 22
        c.drawCentredString(self.width/2, y, WEBSITE)

        # Trust badges
        y -= 60
        badges = ["GAF Certified", "27+ Years", "9+ States", "Free Estimates"]
        badge_width = 100
        total_width = len(badges) * badge_width + (len(badges) - 1) * 15
        start_x = (self.width - total_width) / 2

        for i, badge in enumerate(badges):
            x = start_x + i * (badge_width + 15)
            c.setFillColor(WHITE)
            c.roundRect(x, y - 5, badge_width, 35, 5, fill=1, stroke=0)
            c.setFillColor(CHARCOAL)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + badge_width/2, y + 8, badge)

        c.setFillColor(CHARCOAL)
        c.setFont("Helvetica", 9)
        c.drawCentredString(self.width/2, 40, f"© 2024 {COMPANY_NAME}. All rights reserved.")


# Create the PDF
output_path = "/Users/matthewrundle/Documents/Rollcog/rollcog-website/public/downloads/maintenance-guide.pdf"
generator = MaintenancePDFGenerator(output_path)
generator.create_pdf()
