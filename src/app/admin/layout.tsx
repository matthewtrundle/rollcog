/**
 * @fileoverview Admin layout with noindex metadata for SEO
 * @module app/admin/layout
 */

import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import AdminLayoutClient from "./AdminLayoutClient";

/**
 * Prevent admin pages from being indexed by search engines.
 * Combined with robots.txt disallow rule for defense in depth.
 */
export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): ReactElement {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
