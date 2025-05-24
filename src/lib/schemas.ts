
import { z } from 'zod';

export const QrContentSchema = z.object({
  content: z.string().min(1, { message: "Content cannot be empty" }),
});
export type QrContentInput = z.infer<typeof QrContentSchema>;

export const AiSuggestionSchema = z.object({
  prompt: z.string().min(3, { message: "Prompt must be at least 3 characters long" }),
});
export type AiSuggestionInput = z.infer<typeof AiSuggestionSchema>;

// Schemas for different QR Code Types
export const UrlQrSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL" }),
});
export type UrlQrInput = z.infer<typeof UrlQrSchema>;

export const TextQrSchema = z.object({
  text: z.string().min(1, { message: "Text cannot be empty" }),
});
export type TextQrInput = z.infer<typeof TextQrSchema>;

export const WifiQrSchema = z.object({
  ssid: z.string().min(1, { message: "Network SSID cannot be empty" }),
  password: z.string().optional(),
  encryption: z.enum(["WPA", "WPA2", "WEP", "nopass"]), // WPA/WPA2, WEP, or None (nopass)
  hidden: z.boolean().optional().default(false),
});
export type WifiQrInput = z.infer<typeof WifiQrSchema>;

export const EmailQrSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  subject: z.string().optional(),
  body: z.string().optional(),
});
export type EmailQrInput = z.infer<typeof EmailQrSchema>;

export const SmsQrSchema = z.object({
  phoneNumber: z.string().min(1, { message: "Phone number cannot be empty" })
    .regex(/^\+?[1-9]\d{1,14}$/, { message: "Please enter a valid phone number (e.g., +1234567890)" }),
  message: z.string().optional(),
});
export type SmsQrInput = z.infer<typeof SmsQrSchema>;

export const VCardQrSchema = z.object({
  firstName: z.string().min(1, {message: "First name is required"}),
  lastName: z.string().min(1, {message: "Last name is required"}),
  phoneNumber: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }).optional().or(z.literal('')),
  organization: z.string().optional(),
  title: z.string().optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().optional(),
});
export type VCardQrInput = z.infer<typeof VCardQrSchema>;

export const QrTypeEnum = z.enum(["url", "text", "wifi", "email", "sms", "vcard"]);
export type QrType = z.infer<typeof QrTypeEnum>;

export const CustomizationOptionsSchema = z.object({
  fgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color" }),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color" }),
  level: z.enum(['L', 'M', 'Q', 'H']),
  size: z.number().min(64).max(1024),
  margin: z.boolean(),
  imageSrc: z.string().optional().default(''), 
  imageDisplaySize: z.number().min(5).max(50).optional(),
  imageExcavate: z.boolean().optional(),
});
export type CustomizationOptionsInput = z.infer<typeof CustomizationOptionsSchema>;


// Schema for a single saved QR configuration
export const SavedQrConfigSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name cannot be empty"),
  qrValue: z.string(),
  customization: CustomizationOptionsSchema,
  createdAt: z.string().datetime(),
});
export type SavedQrConfig = z.infer<typeof SavedQrConfigSchema>;

// Schema for an array of saved QR configurations
export const SavedQrConfigArraySchema = z.array(SavedQrConfigSchema);
export type SavedQrConfigArray = z.infer<typeof SavedQrConfigArraySchema>;
