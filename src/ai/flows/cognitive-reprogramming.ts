'use server';
/**
 * @fileOverview An AI assistant for cognitive restructuring to challenge catastrophic or magical thinking patterns.
 *
 * - cognitiveReprogramming - A function that handles the cognitive restructuring process.
 * - CognitiveReprogrammingInput - The input type for the cognitiveReprogramming function.
 * - CognitiveReprogrammingOutput - The return type for the cognitiveReprogramming function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CognitiveReprogrammingInputSchema = z.object({
  thought: z
    .string()
    .describe('The catastrophic or magical thought the user wants to challenge.'),
  locale: z
    .enum(['es', 'en'])
    .describe('The active UI language to use in the response.'),
});
export type CognitiveReprogrammingInput = z.infer<
  typeof CognitiveReprogrammingInputSchema
>;

const CognitiveReprogrammingOutputSchema = z.object({
  initialThought: z.string().describe('The original thought provided by the user.'),
  probabilityAssessment: z
    .string()
    .describe(
      "An AI-assisted assessment of the real probability of the thought occurring, based on available information or common knowledge. For example: 'The probability of your stove exploding if not checked is extremely low, especially if it's a modern appliance with safety features.'"
    ),
  cognitiveDistortion: z
    .string()
    .describe('The identified cognitive distortion (e.g., catastrophizing, magical thinking, overestimation of risk).'),
  challengeQuestions: z
    .array(z.string())
    .describe(
      'A list of questions designed to help the user challenge the validity and rationality of their thought. For example: ["What is the actual evidence that this will happen?", "Has this ever happened before, or to anyone I know?", "Am I overestimating the danger or underestimating my ability to cope?"]'
    ),
  reprogrammedThought: z
    .string()
    .describe(
      'A rephrased, more balanced, and realistic version of the original thought after cognitive restructuring. For example: "It is highly improbable that the stove will explode, and I can trust the safety mechanisms in place."'
    ),
  conclusion: z
    .string()
    .describe('A concluding statement summarizing the restructuring process and reinforcing a healthier perspective.'),
});
export type CognitiveReprogrammingOutput = z.infer<
  typeof CognitiveReprogrammingOutputSchema
>;

export async function cognitiveReprogramming(
  input: CognitiveReprogrammingInput
): Promise<CognitiveReprogrammingOutput> {
  return cognitiveReprogrammingFlow(input);
}

const cognitiveReprogrammingPrompt = ai.definePrompt({
  name: 'cognitiveReprogrammingPrompt',
  input: {schema: CognitiveReprogrammingInputSchema},
  output: {schema: CognitiveReprogrammingOutputSchema},
  prompt: `You are an AI assistant specializing in Cognitive Behavioral Therapy (CBT) and Exposure and Response Prevention (ERP), focused on helping users challenge cognitive distortions, particularly catastrophizing and magical thinking related to OCD and anxiety.

The user has identified the following intrusive thought: "{{{thought}}}".
Use the same language indicated by locale (es = Spanish, en = English) for every output field.

Your task is to guide them through a cognitive restructuring process. Analyze the thought and provide the following:

1.  **Probability Assessment**: Evaluate the real-world probability of this thought occurring. Consider common sense, historical data (if applicable), and logical reasoning.
2.  **Cognitive Distortion**: Identify the primary cognitive distortion present in this thought (e.g., catastrophizing, magical thinking, overestimation of risk).
3.  **Challenge Questions**: Formulate 3-5 specific questions that the user can ask themselves to challenge the validity, evidence, and rationality of this thought. These questions should encourage a balanced perspective.
4.  **Reprogrammed Thought**: Based on the assessment and challenging questions, rephrase the original thought into a more balanced, realistic, and less distressing statement.
5.  **Conclusion**: Provide a concise concluding statement that reinforces the learning from this exercise and encourages a healthier cognitive pattern.

Provide the output in a structured JSON format according to the output schema.`,
});

const cognitiveReprogrammingFlow = ai.defineFlow(
  {
    name: 'cognitiveReprogrammingFlow',
    inputSchema: CognitiveReprogrammingInputSchema,
    outputSchema: CognitiveReprogrammingOutputSchema,
  },
  async (input) => {
    const {output} = await cognitiveReprogrammingPrompt(input);
    return output!;
  }
);
