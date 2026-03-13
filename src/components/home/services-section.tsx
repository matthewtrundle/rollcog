"use client";

import { type ReactElement, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Section } from "@/components/ui";
import { trackServiceView } from "@/lib/utils/analytics";
import { SERVICES } from "@/lib/utils/constants";

const SERVICE_IMAGES: Record<string, string> = {
  "tpo-roofing": "/images/tpo-roofing-installation.webp",
  "mod-bit": "/images/mod-bit-torch-applied.webp",
  "flat-roof-repair": "/images/flat-roof-repair.webp",
  "commercial-industrial": "/images/commercial-warehouse-roofing.webp",
};

const SERVICE_DETAILS: Record<string, { description: string; features: string[] }> = {
  "tpo-roofing": {
    description: "The industry's leading single-ply membrane for commercial flat roofs. TPO delivers exceptional energy savings with its reflective white surface, reducing cooling costs by up to 30%. Heat-welded seams create watertight bonds that outlast traditional roofing adhesives.",
    features: ["Energy Star rated", "20-30 year lifespan", "Low maintenance"]
  },
  "mod-bit": {
    description: "Multi-layer modified bitumen systems provide superior waterproofing through redundant protection. Ideal for buildings with heavy foot traffic or rooftop equipment. Torch-applied or cold-applied options available for any installation environment.",
    features: ["Multi-layer protection", "High puncture resistance", "Proven 40+ year track record"]
  },
  "flat-roof-repair": {
    description: "From minor leaks to complete tear-offs, we diagnose and resolve flat roof issues quickly. Emergency repairs within 5 days protect your building, inventory, and operations. Free inspections help identify problems before they become expensive disasters.",
    features: ["Emergency response within 5 days", "Free inspections", "All flat roof types serviced"]
  },
  "commercial-industrial": {
    description: "Full-service roofing for warehouses, factories, retail centers, office buildings, and industrial complexes. We work around your business hours to minimize disruption and deliver quotes within 24 hours so you can plan accordingly.",
    features: ["Minimal business disruption", "Multi-state coverage", "All building types"]
  }
};

const SERVICE_ALT_TEXT: Record<string, string> = {
  "tpo-roofing": "Commercial building with white TPO roofing membrane installation in progress",
  "mod-bit": "Roofing crew applying modified bitumen with torch-down method",
  "flat-roof-repair": "Close-up of flat roof repair work showing damaged section being replaced",
  "commercial-industrial": "Large commercial warehouse with completed industrial roofing system",
};

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export function ServicesSection(): ReactElement {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  return (
    <Section variant="charcoal" padding="xl">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="lg:col-span-7"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4"
          >
            Services
          </motion.p>
          <motion.h2 variants={fadeInUp} className="heading-section mb-14">
            What We Do
          </motion.h2>

          <div className="space-y-0">
            {SERVICES.map((service, index) => {
              const details = SERVICE_DETAILS[service.id];
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  custom={index}
                  className={index > 0 ? "border-t border-white/10 mt-10 pt-10 lg:mt-12 lg:pt-12" : ""}
                >
                  <Link
                    href={service.href}
                    className="group block"
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                    onClick={() => trackServiceView(service.name, "homepage")}
                  >
                    <div className="flex items-start justify-between gap-8">
                      <div className="space-y-5">
                        <h3 className="text-2xl lg:text-3xl font-medium text-white group-hover:text-[var(--accent)] transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-white/70 leading-relaxed text-base lg:text-lg max-w-2xl">
                          {details?.description || service.description}
                        </p>
                        {details?.features && (
                          <div className="pt-3 flex flex-wrap gap-3">
                            {details.features.map((feature) => (
                              <span
                                key={feature}
                                className="text-xs text-white/50 border border-white/15 px-4 py-2 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: hoveredService === service.id ? 1 : 0,
                          x: hoveredService === service.id ? 0 : -10,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 mt-2"
                      >
                        <svg
                          className="w-6 h-6 text-[var(--accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={fadeInUp}
            className="mt-14 pt-8 border-t border-white/15"
          >
            <p className="text-white/60 text-base">
              Need something specific?{" "}
              <Link
                href="/contact"
                className="text-[var(--accent)] hover:underline"
              >
                Get in touch
              </Link>
            </p>
          </motion.div>
        </motion.div>

        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden bg-gray-800">
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: hoveredService ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src="/images/roofing-inspection.webp"
                  alt="Professional roof inspection"
                  fill
                  loading="lazy"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm text-white/70">
                    Hover over a service to see more
                  </p>
                </div>
              </motion.div>

              {SERVICES.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{
                    opacity: hoveredService === service.id ? 1 : 0,
                    scale: hoveredService === service.id ? 1 : 1.1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={SERVICE_IMAGES[service.id] || "/images/roofing-inspection.webp"}
                    alt={SERVICE_ALT_TEXT[service.id] || `${service.name} - professional roofing service`}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-lg font-medium text-white">
                      {service.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
