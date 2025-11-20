'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating consolidated answers to policy questions.
 *
 * The flow takes a user's policy question and relevant information from different sources,
 * then uses an LLM to generate a clear and concise answer.
 *
 * @exports generateConsolidatedAnswer - The main function to generate a consolidated answer.
 * @exports ConsolidatedAnswerInput - The input type for the generateConsolidatedAnswer function.
 * @exports ConsolidatedAnswerOutput - The output type for the generateConsolidatedAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const ConsolidatedAnswerInputSchema = z.object({
  question: z.string().describe('The user\\'s policy question.'),
  informationSources: z.string().describe('Relevant information from different policy documents.'),
});
export type ConsolidatedAnswerInput = z.infer<typeof ConsolidatedAnswerInputSchema>;

// Define the output schema
const ConsolidatedAnswerOutputSchema = z.object({
  answer: z.string().describe('A clear and concise answer to the policy question.'),
});
export type ConsolidatedAnswerOutput = z.infer<typeof ConsolidatedAnswerOutputSchema>;

// Define the main function
export async function generateConsolidatedAnswer(input: ConsolidatedAnswerInput): Promise<ConsolidatedAnswerOutput> {
  return consolidatedAnswerFlow(input);
}

// Define the prompt
const consolidatedAnswerPrompt = ai.definePrompt({
  name: 'consolidatedAnswerPrompt',
  input: {schema: ConsolidatedAnswerInputSchema},
  output: {schema: ConsolidatedAnswerOutputSchema},
  prompt: `You are an AI assistant designed to provide clear and concise answers to company policy questions.

  Based on the user's question and the relevant information provided, generate a comprehensive answer.

  Question: {{{question}}}

  Relevant Information:
  {{{informationSources}}}

  Answer:`, 
});

// Define the flow
const consolidatedAnswerFlow = ai.defineFlow(
  {
    name: 'consolidatedAnswerFlow',
    inputSchema: ConsolidatedAnswerInputSchema,
    outputSchema: ConsolidatedAnswerOutputSchema,
  },
  async input => {
    const {output} = await consolidatedAnswerPrompt(input);
    return output!;
  }
);
