'use server';
/**
 * @fileOverview Analyzes a food image using Gemini to provide nutritional information and
 * recommends whether it aligns with the user's diet and fitness goals.
 *
 * - analyzeFoodImage - A function that handles the food image analysis process.
 * - AnalyzeFoodImageInput - The input type for the analyzeFoodImage function.
 * - AnalyzeFoodImageOutput - The return type for the analyzeFoodImage function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
// Removed placeholder service import: import {recognizeFood} from '@/services/food-recognition';

const AnalyzeFoodImageInputSchema = z.object({
  photoDataUri: z // Renamed from imageBase64
    .string()
    .describe(
      'A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  diet: z.string().describe('The user\'s diet chart (macros, restrictions).'),
  fitnessGoal: z.string().describe('The user\'s fitness goals (lose weight, gain muscle, maintain).'),
});
export type AnalyzeFoodImageInput = z.infer<typeof AnalyzeFoodImageInputSchema>;

// Output schema remains the same, Gemini will populate all fields
const AnalyzeFoodImageOutputSchema = z.object({
  foodName: z.string().describe('The name of the food item identified in the image.'),
  description: z.string().describe('A description of the food item identified.'),
  nutrition: z.string().describe('Estimated nutritional information (calories, protein, carbs, fat) for the food item.'),
  recommendation: z
    .string()
    .describe(
      'Whether the food item aligns with the user\'s diet and fitness goals, with a justification.'
    ),
});
export type AnalyzeFoodImageOutput = z.infer<typeof AnalyzeFoodImageOutputSchema>;

export async function analyzeFoodImage(input: AnalyzeFoodImageInput): Promise<AnalyzeFoodImageOutput> {
  return analyzeFoodImageFlow(input);
}

const analyzeFoodImagePrompt = ai.definePrompt({
  name: 'analyzeFoodImagePrompt',
  // Input schema now includes the image URI directly
  input: {
    schema: z.object({
       photoDataUri: z
         .string()
         .describe(
           'A photo of a food item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
         ),
       diet: z.string().describe('The user\'s diet chart (macros, restrictions).'),
       fitnessGoal: z.string().describe('The user\'s fitness goals (lose weight, gain muscle, maintain).'),
    }),
  },
  // Output schema asks Gemini to generate all necessary fields
  output: {
    schema: AnalyzeFoodImageOutputSchema,
  },
  // Updated prompt to instruct Gemini on the full task
  prompt: `You are a fitness and nutrition expert. Analyze the provided food image.

  Image: {{media url=photoDataUri}}

  1. Identify the primary food item(s) in the image.
  2. Provide a brief description of the food.
  3. Estimate the nutritional information (calories, protein, carbohydrates, fat). Be concise.
  4. Based on the estimated nutrition and the user's profile below, determine if the food aligns with their goals. Provide a clear recommendation ('Aligns' or 'Does Not Align') and a brief justification.

  User Profile:
  Diet: {{{diet}}}
  Fitness Goal: {{{fitnessGoal}}}

  Respond with a JSON object matching the AnalyzeFoodImageOutputSchema.`,
});

const analyzeFoodImageFlow = ai.defineFlow<typeof AnalyzeFoodImageInputSchema, typeof AnalyzeFoodImageOutputSchema>(
  {
    name: 'analyzeFoodImageFlow',
    inputSchema: AnalyzeFoodImageInputSchema,
    outputSchema: AnalyzeFoodImageOutputSchema,
  },
  async input => {
    // Directly call the prompt with the flow input
    const {output} = await analyzeFoodImagePrompt(input);

    if (!output) {
        throw new Error("Failed to get analysis from AI.");
    }

    // Return the structured output from Gemini
    return output;
  }
);
