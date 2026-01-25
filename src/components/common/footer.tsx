/**
 * @fileoverview Footer with editorial minimal styling
 * @module components/common/footer
 */

import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import {
  COMPANY,
  NAV_LINKS,
  SERVICES,
  CERTIFICATIONS,
  SERVICE_AREAS,
} from "@/lib/utils/constants";

/**
 * Footer component with editorial minimal styling.
 * Text-focused, no geometric placeholders.
 */
export function Footer(): ReactElement {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--charcoal)] text-white">
      <Container>
        <div className="py-20 lg:py-24">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--charcoal)]"
              >
                <Image
                  src="/logo.png"
                  alt="Rollcog"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
                <span className="text-xl font-bold text-white">ROLLCOG</span>
              </Link>
              <p className="mt-6 text-sm text-white/70 leading-relaxed">
                GAF Certified commercial roofing contractors with{" "}
                {COMPANY.experience} years of experience serving Chicagoland and
                beyond.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/80 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--charcoal)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-6">
                Services
              </h3>
              <ul className="space-y-3">
                {SERVICES.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={service.href}
                      className="text-sm text-white/80 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--charcoal)]"
                    >
                      {service.shortName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-6">
                Contact
              </h3>
              <div className="space-y-4 text-sm">
                <address className="text-white/70 not-italic">
                  {COMPANY.address.street}
                  <br />
                  {COMPANY.address.city}, {COMPANY.address.state}{" "}
                  {COMPANY.address.zip}
                </address>
              </div>
            </div>
          </div>

          {/* Certifications & Service Areas - Text only */}
          <div className="mt-16 pt-12 border-t border-white/20">
            <div className="grid gap-8 md:grid-cols-2">
              {/* Certifications */}
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-4">
                  Certifications
                </h3>
                <p className="text-sm text-white/70">
                  {CERTIFICATIONS.map((cert) => cert.name).join(" · ")}
                </p>
              </div>

              {/* Service Areas */}
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-white/50 mb-4">
                  Service Areas
                </h3>
                <p className="text-sm text-white/70">
                  {[...SERVICE_AREAS.primary, ...SERVICE_AREAS.extended].join(
                    " · "
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-white/50">
              &copy; {currentYear} {COMPANY.name}
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-white/50 hover:text-white/80 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--charcoal)]"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-white/50 hover:text-white/80 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--charcoal)]"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
