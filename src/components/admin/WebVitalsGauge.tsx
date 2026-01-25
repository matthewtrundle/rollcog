"use client";

/**
 * @fileoverview Web Vitals gauge component with color-coded status
 * @module components/admin/WebVitalsGauge
 */

import { type ReactElement, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

// Plain-language definitions for each metric
const DEFINITIONS: Record<string, string> = {
  LCP: "How long until the main content (largest image or text block) appears. Under 2.5s is good.",
  FID: "How long until the page responds to first user interaction (click, tap). Under 100ms is good.",
  CLS: "How much the page layout shifts while loading. Lower is better - under 0.1 is good.",
  TTFB: "How long until the server starts sending data. Under 800ms is good.",
  INP: "How responsive the page feels during interactions. Under 200ms is good.",
  FCP: "How long until any content first appears on screen. Under 1.8s is good.",
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

function InfoTooltip({ text }: { text: string }): ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="w-4 h-4 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center text-gray-300 hover:text-white transition-colors ml-1"
        aria-label="More info"
      >
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300 leading-relaxed"
          >
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
          <div className="flex items-center">
            <span className="text-lg font-bold text-white">{vital.name}</span>
            <InfoTooltip text={DEFINITIONS[vital.name]} />
          </div>
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
