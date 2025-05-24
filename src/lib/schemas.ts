import { z } from 'zod';

export const AuthSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

export type AuthInput = z.infer<typeof AuthSchema>;

export const QrContentSchema = z.object({
  content: z.string().min(1, { message: "Content cannot be empty" }),
});

export type QrContentInput = z.infer<typeof QrContentSchema>;

export const AiSuggestionSchema = z.object({
  prompt: z.string().min(3, { message: "Prompt must be at least 3 characters long" }),
});

export type AiSuggestionInput = z.infer<typeof AiSuggestionSchema>;
