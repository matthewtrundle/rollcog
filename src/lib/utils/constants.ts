/**
 * @fileoverview Company constants and configuration
 * @module lib/utils/constants
 */

export const COMPANY = {
  name: "Rollcog Roofs",
  legalName: "Rollcog Roofing LLC",
  phone: "630-655-8256",
  email: "office@rollcog.com",
  address: {
    street: "19W010 Avenue Normandy E",
    city: "Oak Brook",
    state: "IL",
    zip: "60523",
    country: "US",
  },
  experience: "27+",
  founded: 1997,
} as const;

export const CERTIFICATIONS = [
  {
    name: "GAF Master Commercial",
    description: "Certified GAF Master Commercial Roofing Contractor",
    icon: "gaf-master",
  },
  {
    name: "GAF Authorized",
    description: "GAF Authorized Commercial Roofing Contractor",
    icon: "gaf-authorized",
  },
  {
    name: "Goldman Sachs 10,000 Small Businesses",
    description: "Graduate of Goldman Sachs 10,000 Small Businesses program",
    icon: "goldman",
  },
  {
    name: "OSHA Training Institute",
    description: "OSHA safety certified",
    icon: "osha",
  },
] as const;

export const SERVICE_AREAS = {
  primary: ["Chicago", "Oak Brook", "Chicagoland Metropolitan Area"],
  extended: [
    "Indiana",
    "Ohio",
    "West Virginia",
    "Kentucky",
    "Tennessee",
    "North Carolina",
    "South Carolina",
    "Georgia",
    "Atlanta",
  ],
} as const;

export const SERVICES = [
  {
    id: "tpo-roofing",
    name: "TPO Commercial Roofing",
    shortName: "TPO Roofing",
    description:
      "Energy-efficient TPO single-ply roofing systems for commercial buildings",
    href: "/services/tpo-roofing",
  },
  {
    id: "mod-bit",
    name: "Modified Bitumen Systems",
    shortName: "Mod-Bit",
    description:
      "Durable modified bitumen roofing for long-lasting protection",
    href: "/services/mod-bit",
  },
  {
    id: "flat-roof-repair",
    name: "Flat Roof Repair & Replacement",
    shortName: "Flat Roof Repair",
    description:
      "Expert repair and replacement services for commercial flat roofs",
    href: "/services/flat-roof-repair",
  },
  {
    id: "commercial-industrial",
    name: "Commercial & Industrial Contractors",
    shortName: "Commercial/Industrial",
    description:
      "Full-service roofing solutions for commercial and industrial facilities",
    href: "/services/commercial-industrial",
  },
] as const;

export const KEY_DIFFERENTIATORS = [
  {
    title: "24-Hour Estimates",
    description: "Get your price estimate delivered within 24 hours",
    icon: "clock",
  },
  {
    title: "Emergency Repairs",
    description: "Emergency roof repairs completed within 5 days",
    icon: "alert",
  },
  {
    title: "GAF Certified",
    description: "Factory-trained and certified GAF installers",
    icon: "certificate",
  },
  {
    title: "Multi-State Coverage",
    description: "Serving clients across multiple states",
    icon: "map",
  },
] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
] as const;

export const SOCIAL_LINKS = {
  facebook: "https://facebook.com/rollcogroofs",
  linkedin: "https://linkedin.com/company/rollcog",
} as const;

export const SITE_CONFIG = {
  url: "https://rollcog.com",
  title: "Rollcog Roofs | Commercial Roofing Contractors Chicago",
  description:
    "GAF Certified commercial roofing contractors serving Chicagoland and beyond. 27+ years experience in TPO, modified bitumen, and flat roof systems. Get a free estimate.",
  keywords: [
    "commercial roofing",
    "Chicago roofing contractors",
    "TPO roofing",
    "flat roof repair",
    "commercial roof replacement",
    "GAF certified roofer",
    "Oak Brook roofing",
    "industrial roofing",
  ],
} as const;
