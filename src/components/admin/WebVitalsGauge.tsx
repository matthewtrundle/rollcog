"use client";

/**
 * @fileoverview Web Vitals gauge component with color-coded status
 * @module components/admin/WebVitalsGauge
 */

import { type ReactElement } from "react";
import { motion } from "framer-motion";

type MetricRating = "good" | "needs-improvement" | "poor";

interface WebVital {
  name: "LCP" | "FID" | "CLS" | "TTFB" | "INP" | "FCP";
  value: number;
  rating: MetricRating;
}

interface WebVitalsGaugeProps {
  vitals: WebVital[];
}

// Thresholds based on Google's Core Web Vitals recommendations
const THRESHOLDS: Record<string, { good: number; poor: number; unit: string; format: (v: number) => string }> = {
  LCP: { good: 2500, poor: 4000, unit: "ms", format: (v) => `${(v / 1000).toFixed(1)}s` },
  FID: { good: 100, poor: 300, unit: "ms", format: (v) => `${Math.round(v)}ms` },
  CLS: { good: 0.1, poor: 0.25, unit: "", format: (v) => v.toFixed(3) },
  TTFB: { good: 800, poor: 1800, unit: "ms", format: (v) => `${(v / 1000).toFixed(1)}s` },
  INP: { good: 200, poor: 500, unit: "ms", format: (v) => `${Math.round(v)}ms` },
  FCP: { good: 1800, poor: 3000, unit: "ms", format: (v) => `${(v / 1000).toFixed(1)}s` },
};

const FULL_NAMES: Record<string, string> = {
  LCP: "Largest Contentful Paint",
  FID: "First Input Delay",
  CLS: "Cumulative Layout Shift",
  TTFB: "Time to First Byte",
  INP: "Interaction to Next Paint",
  FCP: "First Contentful Paint",
};

function getRatingColor(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return "text-green-400";
    case "needs-improvement":
      return "text-yellow-400";
    case "poor":
      return "text-red-400";
  }
}

function getRatingBg(rating: MetricRating): string {
  switch (rating) {
    case "good":
      return "bg-green-500/20 border-green-500/30";
    case "needs-improvement":
      return "bg-yellow-500/20 border-yellow-500/30";
    case "poor":
      return "bg-red-500/20 border-red-500/30";
  }
}

function getRatingIcon(rating: MetricRating): ReactElement {
  switch (rating) {
    case "good":
      return (
        <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    case "needs-improvement":
      return (
        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    case "poor":
      return (
        <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
  }
}

function VitalCard({ vital, index }: { vital: WebVital; index: number }): ReactElement {
  const threshold = THRESHOLDS[vital.name];
  const formattedValue = threshold ? threshold.format(vital.value) : vital.value.toString();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className={`relative p-4 rounded-xl border ${getRatingBg(vital.rating)}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-lg font-bold text-white">{vital.name}</span>
          <p className="text-xs text-gray-400 mt-0.5">{FULL_NAMES[vital.name]}</p>
        </div>
        {getRatingIcon(vital.rating)}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold ${getRatingColor(vital.rating)}`}>
          {formattedValue}
        </span>
      </div>

      {/* Progress bar */}
      {threshold && vital.name !== "CLS" && (
        <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((vital.value / threshold.poor) * 100, 100)}%` }}
            transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
            className={`h-full rounded-full ${
              vital.rating === "good"
                ? "bg-green-500"
                : vital.rating === "needs-improvement"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function WebVitalsGauge({ vitals }: WebVitalsGaugeProps): ReactElement {
  // Sort vitals to show in consistent order
  const orderedNames = ["LCP", "FID", "CLS", "TTFB", "INP", "FCP"];
  const sortedVitals = [...vitals].sort(
    (a, b) => orderedNames.indexOf(a.name) - orderedNames.indexOf(b.name)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Core Web Vitals</h3>
        <a
          href="https://web.dev/vitals/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Learn more
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedVitals.map((vital, index) => (
          <VitalCard key={vital.name} vital={vital} index={index} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-400">Good</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-gray-400">Needs work</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-gray-400">Poor</span>
        </div>
      </div>
    </motion.div>
  );
}
