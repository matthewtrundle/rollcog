"use client";

/**
 * @fileoverview Admin email templates preview page
 * @module app/admin/emails/page
 */

import { useState, type ReactElement } from "react";
import { motion } from "framer-motion";
import {
  generateLeadEmail,
  generateCustomerConfirmationEmail,
} from "@/features/contact/email-template";

// Sample data for preview
const SAMPLE_LEAD = {
  name: "John Smith",
  email: "john.smith@acmecorp.com",
  phone: "(555) 123-4567",
  company: "ACME Corporation",
  service: "tpo-roofing",
  message:
    "We have a 50,000 sq ft warehouse that needs a new roof. The current roof is about 25 years old and showing signs of wear. We're interested in TPO roofing for its energy efficiency. Can you provide an estimate?",
  source: "general",
};

const SAMPLE_CUSTOMER = {
  name: "John Smith",
  service: "tpo-roofing",
};

type EmailType = "lead" | "confirmation";

export default function AdminEmailsPage(): ReactElement {
  const [selectedEmail, setSelectedEmail] = useState<EmailType>("lead");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const emailContent = selectedEmail === "lead"
    ? generateLeadEmail(SAMPLE_LEAD)
    : generateCustomerConfirmationEmail(SAMPLE_CUSTOMER);

  async function handleSendTest(): Promise<void> {
    const testEmail = prompt("Enter email address to send test:");
    if (!testEmail) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await fetch("/api/admin/emails/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedEmail,
          to: testEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send test email");
      }

      setSendStatus({ type: "success", message: `Test email sent to ${testEmail}` });
    } catch (err) {
      setSendStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to send email",
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Email Templates</h1>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "preview"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setViewMode("code")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                viewMode === "code"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              HTML Code
            </button>
          </div>

          {/* Send Test Button */}
          <button
            onClick={handleSendTest}
            disabled={isSending}
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send Test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {sendStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl ${
            sendStatus.type === "success"
              ? "bg-green-500/10 border border-green-500/30 text-green-400"
              : "bg-red-500/10 border border-red-500/30 text-red-400"
          }`}
        >
          {sendStatus.message}
        </motion.div>
      )}

      {/* Email Type Selector */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => setSelectedEmail("lead")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 p-6 rounded-2xl border transition-all ${
            selectedEmail === "lead"
              ? "bg-gray-800 border-orange-500"
              : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${selectedEmail === "lead" ? "bg-orange-500/20" : "bg-gray-700"}`}>
              <svg className={`w-6 h-6 ${selectedEmail === "lead" ? "text-orange-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Lead Notification</h3>
              <p className="text-gray-400 text-sm">Email sent to admin when a new lead is received</p>
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={() => setSelectedEmail("confirmation")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`flex-1 p-6 rounded-2xl border transition-all ${
            selectedEmail === "confirmation"
              ? "bg-gray-800 border-orange-500"
              : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${selectedEmail === "confirmation" ? "bg-orange-500/20" : "bg-gray-700"}`}>
              <svg className={`w-6 h-6 ${selectedEmail === "confirmation" ? "text-orange-400" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-white font-semibold">Customer Confirmation</h3>
              <p className="text-gray-400 text-sm">Email sent to customer after form submission</p>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Email Preview/Code */}
      <motion.div
        key={`${selectedEmail}-${viewMode}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
      >
        {/* Preview Header */}
        <div className="p-4 border-b border-gray-700 bg-gray-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 text-center">
              <span className="text-gray-400 text-sm">
                {selectedEmail === "lead" ? "Lead Notification Email" : "Customer Confirmation Email"}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === "preview" ? (
          <div className="bg-white">
            <iframe
              srcDoc={emailContent}
              title="Email Preview"
              className="w-full h-[800px] border-0"
              sandbox="allow-same-origin"
            />
          </div>
        ) : (
          <div className="p-6 overflow-x-auto">
            <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap break-all">
              {emailContent}
            </pre>
          </div>
        )}
      </motion.div>

      {/* Sample Data Info */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        <p className="text-gray-400 text-sm">
          <strong className="text-gray-300">Note:</strong> This preview uses sample data.
          The actual emails will contain real lead information from form submissions.
        </p>
      </div>
    </div>
  );
}
