import { type ReactElement } from "react";
import Link from "next/link";
import { Button, Section, LazyVideo } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";
import { AnimateOnScroll } from "./animate-on-scroll";

const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

export function StatementSection(): ReactElement {
  return (
    <Section variant="cream" padding="xl">
      <div className="grid gap-16 lg:grid-cols-12 items-center">
        <AnimateOnScroll variants={slideInLeft} className="lg:col-span-5">
          <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Who We Serve
          </p>
          <h2 className="heading-section text-[var(--foreground)]">
            Building owners and property managers who value quality over
            shortcuts
          </h2>
          <p className="mt-6 text-lg text-[var(--text-body)] leading-relaxed">
            For over {COMPANY.experience} years, we&apos;ve served Chicago and
            Chicagoland businesses—from general contractors to facility managers
            who need roofing partners they can trust. No surprises, no games—just
            honest work at fair prices.
          </p>
          <div className="mt-8">
            <Link href="/about">
              <Button variant="secondary" size="lg" showArrow trackingLabel="Statement">
                About Our Work
              </Button>
            </Link>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll variants={slideInRight} className="lg:col-span-7">
          <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden group">
            <LazyVideo
              src="/videos/aerial-scene.mp4"
              poster="/images/commercial-warehouse-roofing.webp"
              className="absolute inset-0 w-full h-full object-cover scale-110 origin-top-left transition-transform duration-700 group-hover:scale-[1.15]"
            />
          </div>
        </AnimateOnScroll>
      </div>
    </Section>
  );
}
