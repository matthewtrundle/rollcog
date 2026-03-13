import { type ReactElement } from "react";
import Link from "next/link";
import { Button, Section } from "@/components/ui";
import { AnimateOnScroll } from "./animate-on-scroll";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const TESTIMONIALS = [
  {
    quote: "Rollcog Roofs transformed our old, worn-out roof into a modern marvel. Their expertise and professionalism were evident from the start.",
    name: "Jamie T.",
    location: "Illinois",
  },
  {
    quote: "The team at Rollcog Roofs provided a fast and cost-effective solution when our business was in a bind. Truly the best in the region!",
    name: "Raj S.",
    location: "Ohio",
  },
  {
    quote: "From consultation to completion, the experience was seamless. I'd recommend Rollcog Roofs to anyone in need of top-tier roofing services.",
    name: "Alicia D.",
    location: "Georgia",
  },
];

export function TestimonialSection(): ReactElement {
  return (
    <Section variant="cream" padding="xl">
      <AnimateOnScroll variants={staggerContainer}>
        {/* Section header */}
        <AnimateOnScroll variants={fadeInUp} className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Testimonials
          </p>
          <h2 className="heading-section text-[var(--foreground)]">
            Hear From Our Corporate Clients
          </h2>
        </AnimateOnScroll>

        {/* Testimonials grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <AnimateOnScroll
              key={testimonial.name}
              variants={fadeInUp}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--border)]"
            >
              {/* 5 stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[var(--accent)]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-[var(--text-body)] leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="pt-6 border-t border-[var(--border)]">
                <p className="font-medium text-[var(--foreground)]">
                  {testimonial.name}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {testimonial.location}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {/* CTA */}
        <AnimateOnScroll variants={fadeInUp} className="mt-16 text-center">
          <Link href="/contact">
            <Button variant="primary" size="xl" showArrow trackingLabel="Testimonials">
              Start Your Project
            </Button>
          </Link>
        </AnimateOnScroll>
      </AnimateOnScroll>
    </Section>
  );
}
