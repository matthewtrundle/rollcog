/**
 * @fileoverview Floating quiz widget that appears in corner of screen
 * @module components/lead-magnets/QuizFloatingWidget
 */

"use client";

import { type ReactElement, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LeadMagnetCard } from "./LeadMagnetCard";

interface QuizFloatingWidgetProps {
  /** Delay before showing widget (ms) */
  delay?: number;
  /** Page source for tracking */
  source?: string;
}

/**
 * Floating corner widget that promotes the roof inspection quiz.
 * Appears after a delay and can be dismissed or expanded.
 */
export function QuizFloatingWidget({
  delay = 5000,
  source = "floating-widget",
}: QuizFloatingWidgetProps): ReactElement | null {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has already dismissed this session
    const dismissed = sessionStorage.getItem("quiz-widget-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleDismiss = (): void => {
    setIsDismissed(true);
    sessionStorage.setItem("quiz-widget-dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed bottom-4 right-4 z-50">
          {/* Expanded quiz card */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="mb-4 w-[340px] max-w-[calc(100vw-2rem)]"
              >
                <div className="relative">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="absolute -top-2 -right-2 z-10 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close quiz"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <LeadMagnetCard variant="quiz" source={source} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsed button */}
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="relative"
            >
              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-gray-700 transition-colors z-10"
                aria-label="Dismiss"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Main button */}
              <button
                onClick={() => setIsExpanded(true)}
                className="group flex items-center gap-3 bg-gradient-to-r from-[var(--accent)] to-orange-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <span className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </span>
                <div className="text-left pr-2">
                  <p className="text-xs font-medium opacity-90">Free 2-Min Quiz</p>
                  <p className="text-sm font-bold">Need a Roof Inspection?</p>
                </div>
              </button>

              {/* Pulse animation */}
              <span className="absolute -inset-1 rounded-full bg-[var(--accent)] animate-ping opacity-20" />
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

export default QuizFloatingWidget;
