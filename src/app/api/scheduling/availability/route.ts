/**
 * @fileoverview API route for getting weekly availability overview
 * @module app/api/scheduling/availability
 */

import { NextResponse } from "next/server";
import { getWeeklyAvailability } from "@/lib/db/scheduling";
import type { AvailabilityResponse } from "@/features/scheduling/types/scheduling.types";

/**
 * GET /api/scheduling/availability?days=7
 * Returns availability for the next N days (default 7)
 */
export async function GET(request: Request): Promise<NextResponse<AvailabilityResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get("days");
    const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10), 1), 14) : 7;

    const availability = await getWeeklyAvailability(days);

    return NextResponse.json({
      success: true,
      days: availability,
    });
  } catch (error) {
    console.error("Error getting availability:", error);
    return NextResponse.json(
      { success: false, days: [], error: "Failed to get availability" },
      { status: 500 }
    );
  }
}
