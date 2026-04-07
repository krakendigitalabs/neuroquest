import type { CheckupAnswer } from '@/models/mental-checkup';
import {
  CLINICAL_MENTAL_CHECK_IN_ANSWER_RANGE,
  CLINICAL_MENTAL_CHECK_IN_MAX_SCORE,
  CLINICAL_MENTAL_CHECK_IN_QUESTION_COUNT,
  CLINICAL_MENTAL_CHECK_IN_THRESHOLDS,
} from '@/config/clinical';

export type MentalCheckInLevel = 'healthy' | 'mild' | 'moderate' | 'severe';
export type MentalCheckInThreshold = {
  level: MentalCheckInLevel;
  maxScore: number;
};

export const CHECK_IN_MAX_SCORE = CLINICAL_MENTAL_CHECK_IN_MAX_SCORE;
export const MENTAL_CHECK_IN_THRESHOLDS: MentalCheckInThreshold[] = CLINICAL_MENTAL_CHECK_IN_THRESHOLDS;
export const CHECK_IN_QUESTION_COUNT = CLINICAL_MENTAL_CHECK_IN_QUESTION_COUNT;
export const CHECK_IN_ANSWER_MIN = CLINICAL_MENTAL_CHECK_IN_ANSWER_RANGE.min;
export const CHECK_IN_ANSWER_MAX = CLINICAL_MENTAL_CHECK_IN_ANSWER_RANGE.max;

export function calculateMentalCheckInScore(answers: CheckupAnswer[]) {
  return answers.reduce((sum, answer) => sum + answer.value, 0);
}

type CheckInValidationOptions = {
  expectedQuestionCount?: number;
  minValue?: number;
  maxValue?: number;
};

export function validateMentalCheckInAnswers(
  answers: CheckupAnswer[],
  options: CheckInValidationOptions = {},
) {
  const expectedQuestionCount = options.expectedQuestionCount ?? CHECK_IN_QUESTION_COUNT;
  const minValue = options.minValue ?? CHECK_IN_ANSWER_MIN;
  const maxValue = options.maxValue ?? CHECK_IN_ANSWER_MAX;

  if (answers.length !== expectedQuestionCount) {
    return false;
  }

  const seenQuestionIds = new Set<number>();

  for (const answer of answers) {
    if (!Number.isInteger(answer.questionId) || seenQuestionIds.has(answer.questionId)) {
      return false;
    }

    if (!Number.isInteger(answer.value) || answer.value < minValue || answer.value > maxValue) {
      return false;
    }

    seenQuestionIds.add(answer.questionId);
  }

  return true;
}

export function getMentalCheckInLevel(
  score: number,
  thresholds: MentalCheckInThreshold[] = MENTAL_CHECK_IN_THRESHOLDS,
): MentalCheckInLevel {
  const match = thresholds.find((threshold) => score <= threshold.maxScore);
  return match?.level ?? 'severe';
}

export function getCheckInTrendLabel(latestAverage: number, previousAverage: number) {
  if (previousAverage === 0 && latestAverage === 0) return 'stable';
  const delta = latestAverage - previousAverage;
  if (delta >= 1) return 'up';
  if (delta <= -1) return 'down';
  return 'stable';
}
