/**
 * @fileoverview Contact feature barrel export
 * @module features/contact
 */

export { ContactForm } from "./components/contact-form";
export { contactFormSchema, type ContactFormData } from "./schemas/contact-schema";
export {
  generateLeadEmail,
  generateLeadEmailText,
  generateCustomerConfirmationEmail,
  generateCustomerConfirmationEmailText,
} from "./email-template";
