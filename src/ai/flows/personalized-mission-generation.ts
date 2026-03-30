'use server';
/**
 * @fileOverview A Genkit flow for generating personalized therapeutic missions and cognitive exercises for users.
 *
 * - generatePersonalizedMission - A function that handles the personalized mission generation process.
 * - PersonalizedMissionGenerationInput - The input type for the generatePersonalizedMission function.
 * - PersonalizedMissionGenerationOutput - The return type for the generatePersonalizedMission function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ThoughtRecordSchema = z.object({
  thought: z.string().describe('The content of the intrusive thought.'),
  label: z
    .string()
    .describe('The label assigned to the thought (e.g., TOC, Anxiety).'),
  timestamp: z
    .string()
    .describe('ISO 8601 timestamp when the thought was recorded.'),
});

const AnxietyLogSchema = z.object({
  level: z.number().int().min(1).max(10).describe('Anxiety level from 1 to 10.'),
  trigger: z.string().describe('What triggered the anxiety.'),
  timestamp: z
    .string()
    .describe('ISO 8601 timestamp when the anxiety was logged.'),
});

const CompulsionRecordSchema = z.object({
  behavior: z
    .string()
    .describe('The compulsive behavior performed or resisted.'),
  resisted: z
    .boolean()
    .describe('True if the compulsion was resisted, false otherwise.'),
  timestamp: z
    .string()
    .describe('ISO 8601 timestamp when the compulsion was recorded.'),
});

const PersonalizedMissionGenerationInputSchema = z.object({
  thoughtRecords: z
    .array(ThoughtRecordSchema)
    .describe("A history of the user's logged thoughts."),
  anxietyLogs: z
    .array(AnxietyLogSchema)
    .describe("A history of the user's anxiety logs."),
  compulsionRecords: z
    .array(CompulsionRecordSchema)
    .describe("A history of the user's compulsion records."),
  userLevel: z
    .string()
    .describe(
      "The user's current gamified level (e.g., Novato Mental, Explorador Mental)."
    ),
  locale: z
    .enum(['es', 'en'])
    .describe('The active UI language to use in generated content.'),
});

export type PersonalizedMissionGenerationInput = z.infer<
  typeof PersonalizedMissionGenerationInputSchema
>;

const PersonalizedMissionGenerationPromptInputSchema = z.object({
  thoughtRecords: z.string().describe('JSON string of the user thought records.'),
  anxietyLogs: z.string().describe('JSON string of the user anxiety logs.'),
  compulsionRecords: z
    .string()
    .describe('JSON string of the user compulsion records.'),
  userLevel: z
    .string()
    .describe(
      "The user's current gamified level (e.g., Novato Mental, Explorador Mental)."
    ),
  locale: z
    .enum(['es', 'en'])
    .describe('The active UI language to use in generated content.'),
});

const PersonalizedMissionGenerationOutputSchema = z.object({
  personalizedMission: z.object({
    title: z
      .string()
      .describe('The title of the personalized therapeutic mission.'),
    description: z
      .string()
      .describe('A detailed description of the mission and how to complete it.'),
    type: z
      .enum([
        'observer',
        'exposure',
        'regulation',
        'reprogram',
      ])
      .describe('A stable mission-type code for the therapeutic module this mission belongs to.'),
    difficulty: z
      .enum(['easy', 'medium', 'hard'])
      .describe('A stable difficulty code for the mission.'),
    xpReward: z
      .number()
      .int()
      .min(10)
      .describe('Experience points awarded upon completion.'),
  }),
  cognitiveCoachingSuggestion: z.object({
    title: z
      .string()
      .describe('The title of the cognitive coaching suggestion.'),
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
  input: { schema: PersonalizedMissionGenerationPromptInputSchema },
  output: { schema: PersonalizedMissionGenerationOutputSchema },
  prompt: `You are NeuroQuest AI, an intelligent assistant designed to help users with OCD and anxiety by generating personalized therapeutic missions and cognitive coaching.

Analyze the user's mental records and current progress to provide tailored guidance.

User Data:
Thoughts: {{{thoughtRecords}}}
Anxiety Logs: {{{anxietyLogs}}}
Compulsion Records: {{{compulsionRecords}}}
Current User Level: {{{userLevel}}}
Active Locale: {{{locale}}}

Based on this data, identify patterns in their intrusive thoughts, anxiety triggers, and compulsion behaviors.
Then, generate ONE highly personalized therapeutic mission and ONE cognitive coaching suggestion.
Write all user-facing text fields in the language indicated by locale (es = Spanish, en = English).

The mission should align with one of the four therapeutic modules:
1. observer: Focus on identifying thoughts without reacting.
2. exposure: Focus on progressive exposure to feared situations.
3. regulation: Focus on techniques like breathing, grounding, or relaxation.
4. reprogram: Focus on challenging cognitive distortions like catastrophization.

Consider the user's current level and recent struggles/successes when determining the difficulty and type of the mission. The XP reward should be appropriate for the difficulty.
For difficulty, only return one of these stable codes: easy, medium, hard.

Ensure the output strictly adheres to the JSON schema provided.`,
});

const personalizedMissionGenerationFlow = ai.defineFlow(
  {
    name: 'personalizedMissionGenerationFlow',
    inputSchema: PersonalizedMissionGenerationInputSchema,
    outputSchema: PersonalizedMissionGenerationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({
      thoughtRecords: JSON.stringify(input.thoughtRecords ?? [], null, 2),
      anxietyLogs: JSON.stringify(input.anxietyLogs ?? [], null, 2),
      compulsionRecords: JSON.stringify(input.compulsionRecords ?? [], null, 2),
      userLevel: input.userLevel,
      locale: input.locale,
    });

    if (!output) {
      throw new Error('Failed to generate personalized mission output.');
    }

    return output;
  }
);
