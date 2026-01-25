/**
 * @fileoverview Admin authentication API
 * @module app/api/admin/auth/route
 *
 * Simple password-based authentication with secure httpOnly cookies.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Generate a secure session token
 */
function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Hash a session token for storage/comparison
 * Uses the same algorithm as middleware for Edge Runtime compatibility
 */
function hashToken(token: string, secret: string): string {
  return createHash("sha256").update(token + secret).digest("hex");
}

/**
 * POST /api/admin/auth - Login
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { password } = body as { password?: string };

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable not set");
      return NextResponse.json(
        { error: "Admin authentication not configured" },
        { status: 500 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // Constant-time comparison to prevent timing attacks
    const passwordBuffer = Buffer.from(password);
    const adminBuffer = Buffer.from(adminPassword);

    if (
      passwordBuffer.length !== adminBuffer.length ||
      !timingSafeEqual(passwordBuffer, adminBuffer)
    ) {
      // Add a small delay to prevent brute force
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();
    const hashedToken = hashToken(sessionToken, adminPassword);

    // Set the session cookie
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, `${sessionToken}:${hashedToken}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth - Logout
 */
export async function DELETE(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}

/**
 * GET /api/admin/auth - Check auth status
 */
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Verify the session
  const [token, hash] = sessionCookie.value.split(":");
  if (!token || !hash) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const expectedHash = hashToken(token, adminPassword);

  // Constant-time comparison
  try {
    const hashBuffer = Buffer.from(hash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (
      hashBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(hashBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
