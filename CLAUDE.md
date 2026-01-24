# CLAUDE.md - Rollcog Commercial Roofing Website

## Project Overview

Lead generation website for Rollcog commercial roofing company. Built with Next.js 15, React 19, TypeScript (strict mode), and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom design tokens
- **Forms**: React Hook Form + Zod validation
- **Email**: Resend for contact form submissions
- **Deployment**: Vercel

## Design Philosophy

### CRITICAL: Organic Design (NO AI Patterns)

**AVOID these anti-patterns:**
- Geometric AI-generated shapes/patterns
- Corporate gradient blobs
- Generic stock photo compositions
- Symmetrical grid repetitions
- "Tech startup" aesthetic
- Overly clean/sterile feeling

**EMBRACE these patterns:**
- Authentic photography (real-feeling imagery)
- Textured backgrounds (concrete, metal, roofing materials)
- Asymmetric layouts with visual hierarchy
- Natural color palettes (industrial: charcoal, steel, rust, sky blue)
- Human-centered imagery (workers, equipment, finished projects)
- Organic negative space

### Color Palette

```css
--primary: #1e3a5f;      /* Navy - trust, professionalism */
--accent: #f97316;       /* Orange - CTAs, energy */
--background-dark: #0f172a;  /* Dark sections */
--background-light: #f8fafc; /* Content backgrounds */
--text-body: #374151;    /* Body text */
--text-heading: #111827; /* Headings */
```

## Project Structure (Vertical Slice)

```
src/
├── features/
│   ├── contact/          # Contact form feature
│   │   ├── components/
│   │   ├── schemas/      # Zod validation
│   │   └── api/          # Resend integration
│   ├── services/         # Service sections
│   └── testimonials/     # Customer reviews
├── components/
│   ├── ui/               # Base components (Button, Card, etc.)
│   └── common/           # Shared components (Nav, Footer)
└── lib/
    ├── seo/              # SEO utilities (metadata, JSON-LD)
    └── utils/            # Helper functions (cn, constants)

app/
├── page.tsx              # Homepage
├── services/
│   ├── page.tsx          # Services overview
│   ├── tpo-roofing/
│   ├── mod-bit/
│   ├── flat-roof-repair/
│   └── commercial-industrial/
├── about/page.tsx
├── contact/page.tsx
└── faq/page.tsx
```

## Company Information

- **Name**: Rollcog Roofs
- **Phone**: 630-655-8256
- **Email**: office@rollcog.com
- **Address**: 19W010 Avenue Normandy E, Oak Brook, IL 60523
- **Experience**: 27+ years
- **Certifications**: GAF Master, GAF Authorized, Goldman Sachs 10K Small Businesses, OSHA Training Institute

### Service Areas
- Chicagoland metropolitan area
- Indiana, Ohio, West Virginia
- Kentucky, Tennessee
- North Carolina, South Carolina, Georgia, Atlanta

### Services
1. TPO Commercial Flat Roofing
2. Modified Bitumen (Mod-Bit) Systems
3. Commercial Flat Roof Repair/Replacement
4. Commercial & Industrial Contracting

### Key Differentiators
- 24-hour price estimate delivery
- Emergency roof repair within 5 days
- GAF Certified Installers
- Multi-state service coverage

## Coding Standards

### TypeScript Requirements
- NEVER use `any` - use `unknown` if truly unknown
- MUST have explicit return types for all functions
- Use `ReactElement` instead of `JSX.Element`
- Validate ALL external data with Zod

### Component Guidelines
- Maximum 200 lines per component file
- Co-locate tests in `__tests__` folders
- Handle ALL states: loading, error, empty, success
- Include ARIA labels for accessibility

### SEO Requirements
- Every page must have unique metadata
- Implement JSON-LD structured data (LocalBusiness, Service, FAQ)
- Use semantic HTML (h1, h2, h3 hierarchy)
- Optimize images with next/image

### Conversion Optimization
- Trust signals above the fold
- Clear CTAs (Get Free Estimate)
- Phone click-to-call on mobile
- Contact form with validation feedback

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript validation (add to package.json)
```

## Important Notes

- NO database - Resend handles all lead submissions
- Use placeholder images initially (Phase 6 will generate with AI)
- Focus on Core Web Vitals (< 2.5s load time)
- Google Ads integration ready (conversion tracking)
