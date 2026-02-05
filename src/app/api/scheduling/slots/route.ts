/**
 * @fileoverview API route for getting available time slots for a specific date
 * @module app/api/scheduling/slots
 */

import { NextResponse } from "next/server";
import { getAvailableSlots } from "@/lib/db/scheduling";
import type { SlotsResponse } from "@/features/scheduling/types/scheduling.types";

/**
 * GET /api/scheduling/slots?date=YYYY-MM-DD
 * Returns available time slots for the specified date
 */
export async function GET(request: Request): Promise<NextResponse<SlotsResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json(
        { success: false, slots: [], date: "", error: "Date parameter is required" },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { success: false, slots: [], date, error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Check if date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return NextResponse.json(
        { success: false, slots: [], date, error: "Cannot get slots for past dates" },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlots(date);

    return NextResponse.json({
      success: true,
      slots,
      date,
    });
  } catch (error) {
    console.error("Error getting slots:", error);
    return NextResponse.json(
      { success: false, slots: [], date: "", error: "Failed to get available slots" },
      { status: 500 }
    );
  }
}
