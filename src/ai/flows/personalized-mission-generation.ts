'use server';
/**
 * @fileOverview A Genkit flow for generating personalized therapeutic missions and cognitive exercises for users.
 *
 * - generatePersonalizedMission - A function that handles the personalized mission generation process.
 * - PersonalizedMissionGenerationInput - The input type for the generatePersonalizedMission function.
 * - PersonalizedMissionGenerationOutput - The return type for the generatePersonalizedMission function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMissionGenerationInputSchema = z.object({
  thoughtRecords: z
    .array(
      z.object({
        thought: z.string().describe('The content of the intrusive thought.'),
        label: z
          .string()
          .describe('The label assigned to the thought (e.g., TOC, Anxiety).'),
        timestamp: z
          .string()
          .describe('ISO 8601 timestamp when the thought was recorded.'),
      })
    )
    .describe('A history of the user\u0027s logged thoughts.'),
  anxietyLogs: z
    .array(
      z.object({
        level: z.number().int().min(1).max(10).describe('Anxiety level from 1 to 10.'),
        trigger: z.string().describe('What triggered the anxiety.'),
        timestamp: z
          .string()
          .describe('ISO 8601 timestamp when the anxiety was logged.'),
      })
    )
    .describe('A history of the user\u0027s anxiety logs.'),
  compulsionRecords: z
    .array(
      z.object({
        behavior: z.string().describe('The compulsive behavior performed or resisted.'),
        resisted: z.boolean().describe('True if the compulsion was resisted, false otherwise.'),
        timestamp: z
          .string()
          .describe('ISO 8601 timestamp when the compulsion was recorded.'),
      })
    )
    .describe('A history of the user\u0027s compulsion records.'),
  userLevel: z
    .string()
    .describe(
      'The user\u0027s current gamified level (e.g., Novato Mental, Explorador Mental).'
    ),
});
export type PersonalizedMissionGenerationInput = z.infer<
  typeof PersonalizedMissionGenerationInputSchema
>;

const PersonalizedMissionGenerationOutputSchema = z.object({
  personalizedMission: z.object({
    title: z.string().describe('The title of the personalized therapeutic mission.'),
    description: z
      .string()
      .describe('A detailed description of the mission and how to complete it.'),
    type: z
      .enum([
        'Observador Mental',
        'Exposición',
        'Regulación Emocional',
        'Reprogramación Cognitiva',
      ])
      .describe('The therapeutic module this mission belongs to.'),
    difficulty: z.enum(['Fácil', 'Media', 'Difícil']).describe('The difficulty level of the mission.'),
    xpReward: z.number().int().min(10).describe('Experience points awarded upon completion.'),
  }),
  cognitiveCoachingSuggestion: z.object({
    title: z.string().describe('The title of the cognitive coaching suggestion.'),
    suggestion: z
      .string()
      .describe('A practical cognitive coaching tip or exercise.'),
    example: z
      .string()
      .optional()
      .describe('An optional example demonstrating the suggestion.'),
  }),
});
export type PersonalizedMissionGenerationOutput = z.infer<
  typeof PersonalizedMissionGenerationOutputSchema
>;

export async function generatePersonalizedMission(
  input: PersonalizedMissionGenerationInput
): Promise<PersonalizedMissionGenerationOutput> {
  return personalizedMissionGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedMissionGenerationPrompt',
  input: {schema: PersonalizedMissionGenerationInputSchema},
  output: {schema: PersonalizedMissionGenerationOutputSchema},
  prompt: `You are NeuroQuest AI, an intelligent assistant designed to help users with OCD and anxiety by generating personalized therapeutic missions and cognitive coaching. \
\
Analyze the user's mental records and current progress to provide tailored guidance. \
\
User Data:\
Thoughts: {{{JSON.stringify thoughtRecords}}}}\
Anxiety Logs: {{{JSON.stringify anxietyLogs}}}}\
Compulsion Records: {{{JSON.stringify compulsionRecords}}}}\
Current User Level: {{{userLevel}}}\
\
Based on this data, identify patterns in their intrusive thoughts, anxiety triggers, and compulsion behaviors.\
Then, generate ONE highly personalized therapeutic mission and ONE cognitive coaching suggestion.\
\
The mission should align with one of the four therapeutic modules:\
1. Observador Mental: Focus on identifying thoughts without reacting.\
2. Modo Exposición (ERP): Focus on progressive exposure to feared situations.\
3. Regulación Emocional: Focus on techniques like breathing, grounding, or relaxation.\
4. Reprogramación Cognitiva: Focus on challenging cognitive distortions like catastrophization.\
\
Consider the user's current level and recent struggles/successes when determining the difficulty and type of the mission. The XP reward should be appropriate for the difficulty.\
\
Ensure the output strictly adheres to the JSON schema provided.`,
});

const personalizedMissionGenerationFlow = ai.defineFlow(
  {
    name: 'personalizedMissionGenerationFlow',
    inputSchema: PersonalizedMissionGenerationInputSchema,
    outputSchema: PersonalizedMissionGenerationOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
