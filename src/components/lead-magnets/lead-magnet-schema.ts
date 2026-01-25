/**
 * @fileoverview Lead magnet form Zod validation schema
 * @module components/lead-magnets/lead-magnet-schema
 */

import { z } from "zod";

/**
 * Lead magnet email capture form schema.
 * Simpler than contact form - just captures email for PDF delivery.
 */
export const leadMagnetSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  company: z
    .string()
    .max(200, "Company name must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  // Which lead magnet they're downloading
  leadMagnetType: z.enum(["inspection-guide", "maintenance-guide", "quiz-results"]),
  // Quiz score if applicable
  quizScore: z
    .number()
    .min(0)
    .max(100)
    .optional(),
  quizUrgency: z
    .enum(["low", "medium", "high"])
    .optional(),
  // Source tracking
  source: z
    .string()
    .max(50)
    .optional(),
  // Bot protection: honeypot field (should be empty)
  website: z
    .string()
    .max(0, "Bot detected")
    .optional()
    .or(z.literal("")),
  // Bot protection: timestamp when form was loaded
  formLoadedAt: z
    .number()
    .optional(),
});

export type LeadMagnetFormData = z.infer<typeof leadMagnetSchema>;

export type LeadMagnetType = "inspection-guide" | "maintenance-guide" | "quiz-results";

export type QuizUrgency = "low" | "medium" | "high";
