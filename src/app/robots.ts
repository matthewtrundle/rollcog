/**
 * @fileoverview Robots.txt generation for search engine crawlers
 * @module app/robots
 */

import type { MetadataRoute } from "next";

const BASE_URL = "https://rollcogroofing.com";

/**
 * Generate robots.txt for search engine crawlers.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
