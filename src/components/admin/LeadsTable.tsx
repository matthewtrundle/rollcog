"use client";

/**
 * @fileoverview Sortable leads table component
 * @module components/admin/LeadsTable
 */

import { useState, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange: (id: number, status: LeadStatus) => Promise<void>;
  onExportCSV: () => void;
}

const STATUS_OPTIONS: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  contacted: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  qualified: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  closed: "bg-green-500/20 text-green-400 border-green-500/30",
  lost: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (status: LeadStatus) => Promise<void>;
}

function LeadDetailModal({ lead, onClose, onStatusChange }: LeadDetailModalProps): ReactElement {
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(status: LeadStatus): Promise<void> {
    setIsUpdating(true);
    try {
      await onStatusChange(status);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-700 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">{lead.name}</h2>
            <p className="text-gray-400 text-sm mt-1">{lead.email}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={isUpdating || lead.status === status}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-all ${
                    lead.status === status
                      ? STATUS_COLORS[status]
                      : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  } disabled:opacity-50 disabled:cursor-not-allowed capitalize`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone</label>
              <p className="text-white">
                {lead.phone ? (
                  <a href={`tel:${lead.phone}`} className="hover:text-orange-400 transition-colors">
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-gray-500">Not provided</span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Company</label>
              <p className="text-white">{lead.company || <span className="text-gray-500">Not provided</span>}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Service Interest</label>
              <p className="text-white capitalize">
                {lead.service?.replace(/-/g, " ") || <span className="text-gray-500">Not specified</span>}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Source</label>
              <p className="text-white capitalize">
                {lead.source?.replace(/-/g, " ") || <span className="text-gray-500">Direct</span>}
              </p>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
            <div className="p-4 bg-gray-700/50 rounded-xl">
              <p className="text-white whitespace-pre-wrap">{lead.message}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-700">
            <span>Created: {formatDate(lead.created_at)} at {formatTime(lead.created_at)}</span>
            <span>Updated: {formatDate(lead.updated_at)} at {formatTime(lead.updated_at)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LeadsTable({ leads, onStatusChange, onExportCSV }: LeadsTableProps): ReactElement {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortColumn, setSortColumn] = useState<"created_at" | "name" | "status">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Sort leads
  const sortedLeads = [...leads].sort((a, b) => {
    let comparison = 0;
    if (sortColumn === "created_at") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortColumn === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortColumn === "status") {
      comparison = STATUS_OPTIONS.indexOf(a.status) - STATUS_OPTIONS.indexOf(b.status);
    }
    return sortDirection === "asc" ? comparison : -comparison;
  });

  function handleSort(column: typeof sortColumn): void {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  async function handleStatusChangeFromModal(id: number, status: LeadStatus): Promise<void> {
    await onStatusChange(id, status);
    if (selectedLead?.id === id) {
      setSelectedLead({ ...selectedLead, status });
    }
  }

  const SortIcon = ({ column }: { column: typeof sortColumn }): ReactElement | null => {
    if (sortColumn !== column) return null;
    return (
      <svg className={`w-4 h-4 ml-1 ${sortDirection === "desc" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    );
  };

  return (
    <>
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">{leads.length} leads</span>
          </div>
          <button
            onClick={onExportCSV}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    <SortIcon column="name" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Service</th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    <SortIcon column="status" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-400 cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Date
                    <SortIcon column="created_at" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {sortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                sortedLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-white font-medium">{lead.name}</p>
                        {lead.company && (
                          <p className="text-gray-400 text-sm">{lead.company}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white text-sm">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-gray-400 text-sm">{lead.phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-300 text-sm capitalize">
                        {lead.service?.replace(/-/g, " ") || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-lg border capitalize ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-300 text-sm">{formatDate(lead.created_at)}</p>
                      <p className="text-gray-500 text-xs">{formatTime(lead.created_at)}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLead(lead);
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
            onStatusChange={(status) => handleStatusChangeFromModal(selectedLead.id, status)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
