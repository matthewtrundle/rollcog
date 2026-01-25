/**
 * @fileoverview Interactive roof inspection quiz component
 * @module components/lead-magnets/InspectionQuiz
 */

"use client";

import { type ReactElement, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import { trackEvent } from "@/lib/utils";
import { leadMagnetSchema, type LeadMagnetFormData, type QuizUrgency } from "./lead-magnet-schema";

// Quiz questions
const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Is your commercial roof more than 15 years old?",
    description: "Most commercial roofs have a lifespan of 15-30 years depending on materials and maintenance.",
  },
  {
    id: 2,
    question: "Do you see ponding water 48+ hours after rain?",
    description: "Water that doesn't drain within 48 hours indicates drainage problems that can lead to leaks.",
  },
  {
    id: 3,
    question: "Are there visible cracks, blisters, or splits in the membrane?",
    description: "Surface damage exposes underlying materials to weather and accelerates deterioration.",
  },
  {
    id: 4,
    question: "Have you noticed unexplained increases in energy bills?",
    description: "Roof insulation problems can cause significant heating and cooling losses.",
  },
  {
    id: 5,
    question: "Is there any interior water staining or moisture?",
    description: "Ceiling stains or dampness often indicate active roof leaks requiring immediate attention.",
  },
  {
    id: 6,
    question: "Has it been more than 2 years since your last professional inspection?",
    description: "Regular professional inspections catch problems early and maintain warranty coverage.",
  },
  {
    id: 7,
    question: "Do you have rooftop HVAC units or heavy equipment?",
    description: "Roof-mounted equipment creates additional penetrations and stress points that need monitoring.",
  },
  {
    id: 8,
    question: "Has your area experienced severe weather recently (hail, high winds)?",
    description: "Storm damage isn't always visible but can compromise roof integrity.",
  },
];

interface QuizProps {
  onComplete?: () => void;
  source?: string;
}

/**
 * Interactive quiz to help users assess if they need a roof inspection.
 * Calculates urgency score and captures email for PDF delivery.
 */
export function InspectionQuiz({ onComplete, source = "quiz" }: QuizProps): ReactElement {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(QUIZ_QUESTIONS.length).fill(null));
  const [quizComplete, setQuizComplete] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());

  useEffect(() => {
    formLoadedAt.current = Date.now();
    trackEvent("quiz_started", "Lead Magnet", source);
  }, [source]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetFormData>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: {
      leadMagnetType: "quiz-results",
      source,
    },
  });

  // Calculate score and urgency
  const calculateResults = (): { score: number; urgency: QuizUrgency; yesCount: number } => {
    const yesCount = answers.filter((a) => a === true).length;
    const score = Math.round((yesCount / QUIZ_QUESTIONS.length) * 100);

    let urgency: QuizUrgency;
    if (yesCount <= 2) {
      urgency = "low";
    } else if (yesCount <= 5) {
      urgency = "medium";
    } else {
      urgency = "high";
    }

    return { score, urgency, yesCount };
  };

  const handleAnswer = (answer: boolean): void => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);

    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizComplete(true);
      trackEvent("quiz_completed", "Lead Magnet", source);
    }
  };

  const handleBack = (): void => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleShowEmailForm = (): void => {
    setShowEmailForm(true);
    trackEvent("lead_magnet_form_view", "Lead Magnet", "quiz-results");
  };

  const onSubmit = async (data: LeadMagnetFormData): Promise<void> => {
    try {
      const results = calculateResults();

      const response = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          quizScore: results.score,
          quizUrgency: results.urgency,
          formLoadedAt: formLoadedAt.current,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      trackEvent("lead_magnet_download", "Lead Magnet", "quiz-results");
      setSubmitStatus("success");
      onComplete?.();
    } catch {
      setSubmitStatus("error");
    }
  };

  const progress = ((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100;
  const results = calculateResults();

  // Success state
  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Check Your Email!</h3>
        <p className="text-[var(--text-body)]">
          We&apos;ve sent your personalized inspection guide with detailed recommendations.
        </p>
      </div>
    );
  }

  // Quiz results with email form
  if (quizComplete) {
    return (
      <div className="space-y-6">
        {/* Results Summary */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              results.urgency === "high"
                ? "bg-red-100 text-red-600"
                : results.urgency === "medium"
                ? "bg-orange-100 text-orange-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            <span className="text-3xl font-bold">{results.yesCount}/{QUIZ_QUESTIONS.length}</span>
          </motion.div>

          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            {results.urgency === "high" && "High Priority - Inspection Recommended"}
            {results.urgency === "medium" && "Moderate Concern - Schedule Soon"}
            {results.urgency === "low" && "Looking Good - Routine Check Advised"}
          </h3>

          <p className="text-[var(--text-body)] max-w-md mx-auto">
            {results.urgency === "high" &&
              "Based on your answers, your roof may have issues that need professional attention. We recommend scheduling an inspection soon."}
            {results.urgency === "medium" &&
              "You've identified some potential concerns. A professional inspection would help assess the situation and prevent future problems."}
            {results.urgency === "low" &&
              "Your roof appears to be in good condition! Regular inspections will help keep it that way."}
          </p>
        </div>

        {/* Email capture */}
        {!showEmailForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Button onClick={handleShowEmailForm} variant="primary" size="lg" className="w-full sm:w-auto">
              Get Your Free Inspection Guide
            </Button>
            <p className="text-sm text-[var(--text-muted)] mt-3">
              Plus personalized recommendations based on your results
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 max-w-sm mx-auto"
          >
            {submitStatus === "error" && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
                Something went wrong. Please try again.
              </div>
            )}

            <div>
              <input
                type="text"
                {...register("name")}
                placeholder="Your Name *"
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all"
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                {...register("email")}
                placeholder="Email Address *"
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <input
                type="text"
                {...register("company")}
                placeholder="Company (Optional)"
                className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3 text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all"
              />
            </div>

            {/* Hidden fields */}
            <input type="hidden" {...register("leadMagnetType")} value="quiz-results" />
            <input type="hidden" {...register("source")} value={source} />

            {/* Honeypot */}
            <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
              <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send My Free Guide"}
            </Button>

            <p className="text-xs text-center text-[var(--text-muted)]">
              We respect your privacy. Unsubscribe anytime.
            </p>
          </motion.form>
        )}
      </div>
    );
  }

  // Quiz questions
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--text-muted)]">Question {currentQuestion + 1} of {QUIZ_QUESTIONS.length}</span>
          <span className="text-[var(--accent)] font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[var(--accent)] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            {QUIZ_QUESTIONS[currentQuestion].question}
          </h3>
          <p className="text-sm text-[var(--text-body)]">
            {QUIZ_QUESTIONS[currentQuestion].description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Answer buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 py-4 px-6 rounded-xl border-2 border-[var(--accent)] text-[var(--accent)] font-semibold hover:bg-[var(--accent)] hover:text-white transition-all"
        >
          Yes
        </button>
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 py-4 px-6 rounded-xl border-2 border-gray-200 text-[var(--text-body)] font-semibold hover:bg-gray-100 transition-all"
        >
          No
        </button>
      </div>

      {/* Back button */}
      {currentQuestion > 0 && (
        <button
          onClick={handleBack}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          &larr; Previous question
        </button>
      )}
    </div>
  );
}

export default InspectionQuiz;
