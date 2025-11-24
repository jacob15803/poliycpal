'use server';

/**
 * @fileOverview This file contains the Genkit flow for intelligent policy area detection.
 *
 * It defines:
 * - `detectPolicyArea`: A function to detect the relevant policy area (IT, HR, general) from a user question.
 * - `DetectPolicyAreaInput`: The input type for the `detectPolicyArea` function.
 * - `DetectPolicyAreaOutput`: The output type for the `detectPolicyArea` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectPolicyAreaInputSchema = z.object({
  question: z.string().describe('The user question about company policies.'),
});
export type DetectPolicyAreaInput = z.infer<typeof DetectPolicyAreaInputSchema>;

const DetectPolicyAreaOutputSchema = z.object({
  policyArea:
    z.enum(['IT', 'HR', 'General'])
    .describe('The detected policy area for the question.'),
});
export type DetectPolicyAreaOutput = z.infer<typeof DetectPolicyAreaOutputSchema>;

export async function detectPolicyArea(
  input: DetectPolicyAreaInput
): Promise<DetectPolicyAreaOutput> {
  return detectPolicyAreaFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectPolicyAreaPrompt',
  input: {schema: DetectPolicyAreaInputSchema},
  output: {schema: DetectPolicyAreaOutputSchema},
  prompt: `You are an expert in understanding company policies.
  Determine whether the following question relates to IT, HR, or General company policies.

  Question: {{{question}}}

  Return the policy area.
  Example 1:
  Question: What is the dress code?
  Policy Area: General

  Example 2:
  Question: How do I reset my password?
  Policy Area: IT

  Example 3:
  Question: How much vacation time do I get?
  Policy Area: HR
  `,
});

const detectPolicyAreaFlow = ai.defineFlow(
  {
    name: 'detectPolicyAreaFlow',
    inputSchema: DetectPolicyAreaInputSchema,
    outputSchema: DetectPolicyAreaOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
