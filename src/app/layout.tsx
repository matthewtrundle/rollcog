/**
 * @fileoverview Root layout with navigation and footer
 * @module app/layout
 */

import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Navigation } from "@/components/common/navigation";
import { Footer } from "@/components/common/footer";
import { ChatWidget } from "@/components/common/chat-widget";
import { QuizFloatingWidget } from "@/components/lead-magnets";
import { AnalyticsProvider } from "@/components/analytics";
import { generateLocalBusinessSchema } from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/utils/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

/**
 * Google Analytics / Google Ads Measurement IDs
 * Set these in environment variables for production
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.title,
    template: `%s | Rollcog Roofs`,
  },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  metadataBase: new URL(SITE_CONFIG.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_CONFIG.url,
    siteName: "Rollcog Roofs",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  const jsonLd = generateLocalBusinessSchema();

  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <head>
        {/* Google Analytics / Google Ads */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
                ${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <AnalyticsProvider>
          {/* Skip to main content link for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[var(--accent-dark)] focus:text-white focus:px-6 focus:py-3 focus:rounded-xl focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            Skip to main content
          </a>
          <Navigation />
          <main id="main-content" className="flex-1 pt-16 lg:pt-20">{children}</main>
          <Footer />
          <ChatWidget />
          <QuizFloatingWidget delay={8000} source="global" />
          <Analytics />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
