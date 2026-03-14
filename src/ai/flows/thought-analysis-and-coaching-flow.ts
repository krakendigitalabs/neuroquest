'use server';
/**
 * @fileOverview An AI agent for analyzing distressing or intrusive thoughts and providing cognitive coaching.
 *
 * - analyzeThought - A function that handles the thought analysis and coaching process.
 * - ThoughtAnalysisInput - The input type for the analyzeThought function.
 * - ThoughtAnalysisOutput - The return type for the analyzeThought function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThoughtAnalysisInputSchema = z.object({
  thought: z
    .string()
    .describe(
      'A distressing or intrusive thought logged by the user for analysis.'
    ),
});
export type ThoughtAnalysisInput = z.infer<typeof ThoughtAnalysisInputSchema>;

const ThoughtAnalysisOutputSchema = z.object({
  isTOCRelated: z
    .boolean()
    .describe('True if the thought is likely related to OCD or anxiety.'),
  analysis: z
    .string()
    .describe('A brief analysis of the thought from a CBT/ERP perspective.'),
  reframingSuggestion: z
    .string()
    .describe(
      'A cognitive coaching or reframing suggestion to help the user separate from the thought.'
    ),
});
export type ThoughtAnalysisOutput = z.infer<typeof ThoughtAnalysisOutputSchema>;

export async function analyzeThought(
  input: ThoughtAnalysisInput
): Promise<ThoughtAnalysisOutput> {
  return thoughtAnalysisAndCoachingFlow(input);
}

const thoughtAnalysisPrompt = ai.definePrompt({
  name: 'thoughtAnalysisPrompt',
  input: {schema: ThoughtAnalysisInputSchema},
  output: {schema: ThoughtAnalysisOutputSchema},
  prompt: `You are an expert mental wellness coach specializing in Cognitive Behavioral Therapy (CBT) and Exposure and Response Prevention (ERP) for Obsessive-Compulsive Disorder (OCD) and anxiety.

Your task is to analyze a user's distressing or intrusive thought. Provide a clear and concise analysis, determine if it aligns with common OCD/anxiety thought patterns, and offer a practical cognitive reframing suggestion to help the user identify it as a 'TOC thought' and practice mental separation without reacting.

Thought to analyze: """{{{thought}}}"""

Focus on validating the user's experience while gently guiding them towards a healthier perspective. Your output should be structured as follows:

isTOCRelated: [true/false based on common OCD/anxiety patterns]
analysis: [Your concise analysis]
reframingSuggestion: [Your practical cognitive coaching or reframing suggestion]
`,
});

const thoughtAnalysisAndCoachingFlow = ai.defineFlow(
  {
    name: 'thoughtAnalysisAndCoachingFlow',
    inputSchema: ThoughtAnalysisInputSchema,
    outputSchema: ThoughtAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await thoughtAnalysisPrompt(input);
    if (!output) {
      throw new Error('Failed to get output from thought analysis prompt.');
    }
    return output;
  }
);
