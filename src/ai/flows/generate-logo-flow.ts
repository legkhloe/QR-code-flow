
'use server';
/**
 * @fileOverview AI-powered logo generation for QR codes.
 *
 * This file exports:
 * - `generateLogoForQrCode`: A function that generates a simple logo image based on a text prompt.
 * - `GenerateLogoInput`: The input type for the `generateLogoForQrCode` function.
 * - `GenerateLogoOutput`: The output type for the `generateLogoForQrCode` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLogoInputSchema = z.object({
  textPrompt: z.string().min(3, {message: 'Prompt must be at least 3 characters long.'}).describe('A text description for the logo to be generated.'),
});
export type GenerateLogoInput = z.infer<typeof GenerateLogoInputSchema>;

const GenerateLogoOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated logo image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateLogoOutput = z.infer<typeof GenerateLogoOutputSchema>;

export async function generateLogoForQrCode(input: GenerateLogoInput): Promise<GenerateLogoOutput> {
  return generateLogoFlow(input);
}

const generateLogoFlow = ai.defineFlow(
  {
    name: 'generateLogoFlow',
    inputSchema: GenerateLogoInputSchema,
    outputSchema: GenerateLogoOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: `Generate a simple, iconic logo suitable for embedding in a QR code. The logo should be based on the following description: "${input.textPrompt}". It should be clear and recognizable even when small. Prefer a design with a transparent or simple background if possible.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must include IMAGE
         // Looser safety settings might be needed for creative generation
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
       // Explicitly ask for PNG to favor transparency support
      output: { format: 'png' } 
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed or returned no media.');
    }
    
    // The model should ideally return a PNG with transparency if prompted correctly.
    // If it returns JPEG, transparency won't be there.
    return { imageDataUri: media.url }; 
  }
);
