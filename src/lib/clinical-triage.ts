import type { CheckupAnswer, RiskFlags } from '@/models/mental-checkup';
import type { MentalCheckInLevel } from '@/lib/mental-check-in';

export const SELF_HARM_QUESTION_ID = 10;

export function getAnswerValue(answers: CheckupAnswer[], questionId: number) {
  const answer = answers.find((item) => item.questionId === questionId);
  return typeof answer?.value === 'number' ? answer.value : 0;
}

export function deriveRiskFlags(answers: CheckupAnswer[], level: MentalCheckInLevel): RiskFlags {
  const selfHarmAnswer = getAnswerValue(answers, SELF_HARM_QUESTION_ID);

  return {
    selfHarmRisk: selfHarmAnswer >= 2,
    needsProfessionalSupport: level === 'moderate' || level === 'severe' || selfHarmAnswer >= 2,
    urgentSupportRecommended: selfHarmAnswer >= 3,
  };
}
