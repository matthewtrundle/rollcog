"use client";

/**
 * @fileoverview Animated stats card component for admin dashboard
 * @module components/admin/StatsCard
 */

import { useEffect, useState, type ReactElement } from "react";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  format?: "number" | "time" | "percentage";
  suffix?: string;
  status?: "good" | "warning" | "bad" | "neutral";
  icon?: ReactElement;
  delay?: number;
}

/**
 * Format a number based on the specified format type
 */
function formatValue(value: number, format: StatsCardProps["format"], suffix?: string): string {
  switch (format) {
    case "time":
      return `${value.toFixed(1)}${suffix || "s"}`;
    case "percentage":
      return `${value.toFixed(1)}%`;
    default:
      // Format large numbers with commas
      return value >= 1000 ? value.toLocaleString() : value.toString();
  }
}

/**
 * Custom hook for animating a counter
 */
function useAnimatedCounter(
  endValue: number,
  duration: number = 1000,
  delay: number = 0
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startTime = performance.now() + delay;
    const startValue = 0;
    const change = endValue - startValue;

    function animate(currentTime: number): void {
      const elapsed = currentTime - startTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      if (elapsed >= duration) {
        setCount(endValue);
        return;
      }

      // Ease out cubic
      const progress = 1 - Math.pow(1 - elapsed / duration, 3);
      const current = startValue + change * progress;
      setCount(current);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [endValue, duration, delay]);

  return count;
}

export default function StatsCard({
  title,
  value,
  change,
  changeLabel = "vs last week",
  format = "number",
  suffix,
  status = "neutral",
  icon,
  delay = 0,
}: StatsCardProps): ReactElement {
  const animatedValue = useAnimatedCounter(value, 1500, delay);

  const statusColors: Record<string, string> = {
    good: "text-green-400",
    warning: "text-yellow-400",
    bad: "text-red-400",
    neutral: "text-gray-400",
  };

  const statusBgColors: Record<string, string> = {
    good: "bg-green-500/10 border-green-500/20",
    warning: "bg-yellow-500/10 border-yellow-500/20",
    bad: "bg-red-500/10 border-red-500/20",
    neutral: "bg-gray-500/10 border-gray-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </span>
        {icon && (
          <div className={`p-2 rounded-lg ${statusBgColors[status]} border`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-3xl font-bold text-white">
          {formatValue(
            format === "number" ? Math.round(animatedValue) : animatedValue,
            format,
            suffix
          )}
        </p>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                change > 0
                  ? "text-green-400"
                  : change < 0
                  ? "text-red-400"
                  : "text-gray-400"
              }`}
            >
              {change > 0 ? "+" : ""}
              {change}
              {format === "percentage" ? "%" : ""}
            </span>
            <span className="text-xs text-gray-500">{changeLabel}</span>
          </div>
        )}

        {status !== "neutral" && (
          <span className={`text-xs font-medium ${statusColors[status]}`}>
            {status === "good" ? "Good" : status === "warning" ? "Needs attention" : "Poor"}
          </span>
        )}
      </div>
    </motion.div>
  );
}
