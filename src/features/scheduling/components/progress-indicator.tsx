/**
 * @fileoverview Progress indicator for the booking flow
 * @module features/scheduling/components/progress-indicator
 */

import { type ReactElement } from "react";

interface ProgressIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { number: 1, label: "Contact Info" },
  { number: 2, label: "Book Visit" },
  { number: 3, label: "Confirmed" },
];

export function ProgressIndicator({ currentStep }: ProgressIndicatorProps): ReactElement {
  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          {/* Step circle */}
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
              transition-colors duration-200
              ${
                step.number < currentStep
                  ? "bg-green-500 text-white"
                  : step.number === currentStep
                    ? "bg-[var(--accent)] text-white"
                    : "bg-gray-200 text-gray-500"
              }
            `}
          >
            {step.number < currentStep ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              step.number
            )}
          </div>

          {/* Step label */}
          <span
            className={`
              ml-2 text-xs hidden sm:inline
              ${step.number === currentStep ? "text-[var(--foreground)] font-medium" : "text-gray-400"}
            `}
          >
            {step.label}
          </span>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div
              className={`
                w-8 sm:w-12 h-0.5 mx-2
                ${step.number < currentStep ? "bg-green-500" : "bg-gray-200"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
