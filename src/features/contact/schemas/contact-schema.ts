/**
 * @fileoverview Contact form Zod validation schema
 * @module features/contact/schemas/contact-schema
 */

import { z } from "zod";

/**
 * Contact form validation schema.
 *
 * Validates name, email, phone, company, and message fields.
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(
      /^[\d\s\-\(\)\.+]+$/,
      "Please enter a valid phone number"
    )
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .max(200, "Company name must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  service: z
    .enum(["tpo-roofing", "mod-bit", "flat-roof-repair", "commercial-industrial", "other"])
    .optional(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be less than 2000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
