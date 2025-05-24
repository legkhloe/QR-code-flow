'use server';

/**
 * @fileOverview AI-powered suggestions for QR code content based on user input.
 *
 * This file exports:
 * - `suggestQrCodeContent`: A function that suggests relevant content for a QR code based on initial user input.
 * - `SuggestQrCodeContentInput`: The input type for the `suggestQrCodeContent` function.
 * - `SuggestQrCodeContentOutput`: The output type for the `suggestQrCodeContent` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestQrCodeContentInputSchema = z.object({
  userInput: z.string().describe('The user input to generate QR code content suggestions for.'),
});
export type SuggestQrCodeContentInput = z.infer<typeof SuggestQrCodeContentInputSchema>;

const SuggestQrCodeContentOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of suggested content for the QR code based on the user input.'),
});
export type SuggestQrCodeContentOutput = z.infer<typeof SuggestQrCodeContentOutputSchema>;

export async function suggestQrCodeContent(input: SuggestQrCodeContentInput): Promise<SuggestQrCodeContentOutput> {
  return suggestQrCodeContentFlow(input);
}

const suggestQrCodeContentPrompt = ai.definePrompt({
  name: 'suggestQrCodeContentPrompt',
  input: {schema: SuggestQrCodeContentInputSchema},
  output: {schema: SuggestQrCodeContentOutputSchema},
  prompt: `You are an AI assistant that suggests relevant content for QR codes based on user input.

  Given the following user input, suggest content that would be appropriate for a QR code. Provide 3 suggestions.

  User Input: {{{userInput}}}

  Suggestions:`,
});

const suggestQrCodeContentFlow = ai.defineFlow(
  {
    name: 'suggestQrCodeContentFlow',
    inputSchema: SuggestQrCodeContentInputSchema,
    outputSchema: SuggestQrCodeContentOutputSchema,
  },
  async input => {
    const {output} = await suggestQrCodeContentPrompt(input);
    return output!;
  }
);
