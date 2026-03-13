/**
 * @fileoverview Homepage — Server Component with client section islands
 * @module app/page
 */

import { type ReactElement } from "react";
import {
  HeroSection,
  StatementSection,
  ServicesSection,
  TestimonialSection,
} from "@/components/home";

/**
 * Homepage component. Renders as a Server Component so Google gets
 * pre-rendered HTML instead of a blank page waiting for JS hydration.
 * Interactive sections (Hero, Services) are client component islands.
 */
export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <StatementSection />
      <ServicesSection />
      <TestimonialSection />
    </>
  );
}
