"use client";

/**
 * @fileoverview Admin leads management page
 * @module app/admin/leads/page
 */

import { useEffect, useState, useCallback, type ReactElement } from "react";
import { motion } from "framer-motion";
import LeadsTable from "@/components/admin/LeadsTable";

type LeadStatus = "new" | "contacted" | "qualified" | "closed" | "lost";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  source: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All Leads" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
];

export default function AdminLeadsPage(): ReactElement {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [total, setTotal] = useState(0);

  const fetchLeads = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      params.set("limit", "100");

      const response = await fetch(`/api/admin/leads?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch leads");

      const data = await response.json();
      setLeads(data.leads);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  async function handleStatusChange(id: number, status: LeadStatus): Promise<void> {
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      // Update local state
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status, updated_at: new Date().toISOString() } : lead
        )
      );
    } catch (err) {
      console.error("Status update error:", err);
      throw err;
    }
  }

  function handleExportCSV(): void {
    // Create CSV content
    const headers = ["Name", "Email", "Phone", "Company", "Service", "Source", "Status", "Message", "Created"];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "",
      lead.company || "",
      lead.service || "",
      lead.source || "direct",
      lead.status,
      `"${lead.message.replace(/"/g, '""')}"`,
      new Date(lead.created_at).toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Download file
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rollcog-leads-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-gray-400 text-sm mt-1">
            {total} total lead{total !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === option.value
                    ? "bg-gray-700 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="animate-pulse">
          <div className="h-96 bg-gray-800 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => fetchLeads()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LeadsTable
            leads={leads}
            onStatusChange={handleStatusChange}
            onExportCSV={handleExportCSV}
          />
        </motion.div>
      )}
    </div>
  );
}
