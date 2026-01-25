/**
 * @fileoverview Next.js middleware for route protection
 * @module middleware
 *
 * Protects admin routes by checking for valid session cookie.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "admin_session";

/**
 * Simple hash function for Edge Runtime (no Node crypto)
 * Uses Web Crypto API compatible with Edge Runtime
 */
async function hashToken(token: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + secret);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Verify the session token (async for Web Crypto API)
 */
async function verifySession(cookieValue: string, secret: string): Promise<boolean> {
  const [token, hash] = cookieValue.split(":");
  if (!token || !hash) return false;

  const expectedHash = await hashToken(token, secret);

  // Simple comparison
  return hash === expectedHash;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get(COOKIE_NAME);
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If no password is configured, deny access
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD not configured");
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // If no session cookie, redirect to login
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Verify the session
    const isValid = await verifySession(sessionCookie.value, adminPassword);
    if (!isValid) {
      // Invalid session, clear cookie and redirect
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }
  }

  // If authenticated user visits login page, redirect to dashboard
  if (pathname === "/admin/login") {
    const sessionCookie = request.cookies.get(COOKIE_NAME);
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (sessionCookie?.value && adminPassword) {
      const isValid = await verifySession(sessionCookie.value, adminPassword);
      if (isValid) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
