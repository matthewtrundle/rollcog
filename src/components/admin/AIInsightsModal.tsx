"use client";

/**
 * @fileoverview AI Insights modal with streaming response
 * @module components/admin/AIInsightsModal
 */

import { useState, useEffect, useRef, type ReactElement } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simple markdown to HTML converter for our use case
function parseMarkdown(text: string): string {
  return text
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-white mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-white mt-6 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    // Bullet points
    .replace(/^- (.*$)/gm, '<li class="text-gray-300 ml-4 mb-1">$1</li>')
    .replace(/^• (.*$)/gm, '<li class="text-gray-300 ml-4 mb-1">$1</li>')
    // Numbered lists
    .replace(/^\d+\. (.*$)/gm, '<li class="text-gray-300 ml-4 mb-1 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

export default function AIInsightsModal({ isOpen, onClose }: AIInsightsModalProps): ReactElement | null {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && !hasGenerated) {
      setContent("");
      setError(null);
    }
  }, [isOpen, hasGenerated]);

  // Auto-scroll to bottom as content streams
  useEffect(() => {
    if (contentRef.current && content) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  async function generateInsights(): Promise<void> {
    setIsLoading(true);
    setError(null);
    setContent("");

    try {
      const response = await fetch("/api/admin/ai-insights", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to generate insights");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setContent(result);
      }

      setHasGenerated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  function handleRegenerate(): void {
    setHasGenerated(false);
    generateInsights();
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          className="w-full max-w-3xl bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">AI Insights</h2>
                <p className="text-sm text-gray-400">Powered by Claude</p>
              </div>
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

          {/* Content */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto p-6"
          >
            {!content && !isLoading && !error && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-gray-700/50 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Ready to Analyze</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Generate AI-powered insights from your dashboard data, including leads, traffic, and web vitals.
                </p>
                <button
                  onClick={generateInsights}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20"
                >
                  Generate Insights
                </button>
              </div>
            )}

            {isLoading && !content && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 border-2 border-purple-500/30 rounded-full" />
                    <div className="absolute inset-0 w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                  <span className="text-gray-300">Analyzing your data...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <div className="inline-flex p-4 rounded-full bg-red-500/10 mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analysis Failed</h3>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                  onClick={handleRegenerate}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {content && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose prose-invert max-w-none"
              >
                <div
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
                />
                {isLoading && (
                  <span className="inline-block w-2 h-5 bg-purple-400 ml-1 animate-pulse" />
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          {content && !isLoading && (
            <div className="p-4 border-t border-gray-700 flex items-center justify-between shrink-0">
              <p className="text-xs text-gray-500">
                Generated from your dashboard data
              </p>
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
