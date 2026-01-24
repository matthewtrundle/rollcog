/**
 * @fileoverview Full-page loading screen with animated logo
 * @module components/common/loading-screen
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactElement } from "react";
import Image from "next/image";

interface LoadingScreenProps {
  /** Minimum display time in ms */
  minDisplayTime?: number;
}

/**
 * Full-page loading screen with animated logo and progress bar.
 */
export function LoadingScreen({
  minDisplayTime = 1500,
}: LoadingScreenProps): ReactElement | null {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 100);

    // Minimum display time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minDisplayTime);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [minDisplayTime]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--charcoal)]"
        >
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-8"
          >
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            >
              <Image
                src="/logo.png"
                alt="Rollcog"
                width={64}
                height={64}
                className="w-16 h-16"
              />
            </motion.div>
            <motion.span
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-4xl font-bold text-white tracking-tight"
            >
              ROLLCOG
            </motion.span>
          </motion.div>

          {/* Progress Bar */}
          <div className="w-48 h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-[var(--accent)] rounded-full"
            />
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 text-sm text-gray-400"
          >
            Loading excellence...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
