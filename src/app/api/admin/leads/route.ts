/**
 * @fileoverview Admin leads API
 * @module app/api/admin/leads/route
 *
 * CRUD operations for leads management.
 */

import { NextResponse } from "next/server";
import { getLeads, getLeadById, updateLeadStatus, type Lead } from "@/lib/db";

/**
 * GET /api/admin/leads - Get all leads with optional filtering
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const orderBy = (searchParams.get("orderBy") as "created_at" | "updated_at" | "name") || "created_at";
    const order = (searchParams.get("order") as "ASC" | "DESC") || "DESC";

    const result = await getLeads({ status, limit, offset, orderBy, order });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/leads - Update a lead
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { id, status } = body as { id?: number; status?: Lead["status"] };

    if (!id) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const validStatuses: Lead["status"][] = ["new", "contacted", "qualified", "closed", "lost"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    const lead = await getLeadById(id);
    if (!lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    const updatedLead = await updateLeadStatus(id, status);

    return NextResponse.json({
      success: true,
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update lead error:", error);
    return NextResponse.json(
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}
