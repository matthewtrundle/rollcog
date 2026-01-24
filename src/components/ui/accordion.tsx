"use client";

/**
 * @fileoverview Accordion with European premium styling
 * @module components/ui/accordion
 */

import { type ReactElement, useState } from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

/**
 * Single accordion item component with European premium styling.
 */
export function AccordionItem({
  question,
  answer,
  isOpen = false,
  onToggle,
}: AccordionItemProps): ReactElement {
  return (
    <div className="border-b border-[var(--border-warm)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-[var(--foreground)] pr-4 group-hover:text-[var(--accent)] transition-colors">
          {question}
        </span>
        <div className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-200",
          isOpen
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--background-muted)] text-[var(--text-muted)] group-hover:bg-[var(--accent)]/10 group-hover:text-[var(--accent)]"
        )}>
          <svg
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96 pb-6" : "max-h-0"
        )}
      >
        <p className="text-[var(--text-body)] leading-relaxed text-base">{answer}</p>
      </div>
    </div>
  );
}

interface AccordionProps {
  items: Array<{ question: string; answer: string }>;
  allowMultiple?: boolean;
}

/**
 * Accordion component with European premium styling.
 *
 * Features warm border colors and red accent on active state.
 *
 * @component
 * @example
 * ```tsx
 * <Accordion
 *   items={[
 *     { question: "What is...", answer: "..." },
 *   ]}
 * />
 * ```
 */
export function Accordion({
  items,
  allowMultiple = false,
}: AccordionProps): ReactElement {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const handleToggle = (index: number): void => {
    setOpenIndexes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="divide-y divide-[var(--border-warm)] border-t border-[var(--border-warm)]">
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          question={item.question}
          answer={item.answer}
          isOpen={openIndexes.has(index)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
