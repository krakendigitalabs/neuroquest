import { describe, expect, it } from 'vitest';
import { deriveRiskFlags } from '@/lib/clinical-triage';

describe('clinical triage', () => {
  it('marks prompt professional support when self-harm thoughts are present even without severe total score', () => {
    const answers = Array.from({ length: 10 }, (_, index) => ({
      questionId: index + 1,
      question: `Question ${index + 1}`,
      value: index === 9 ? 2 : 0,
    }));

    expect(deriveRiskFlags(answers, 'mild')).toEqual({
      selfHarmRisk: true,
      needsProfessionalSupport: true,
      urgentSupportRecommended: false,
    });
  });

  it('marks urgent support when self-harm thoughts are frequent or near constant', () => {
    const answers = Array.from({ length: 10 }, (_, index) => ({
      questionId: index + 1,
      question: `Question ${index + 1}`,
      value: index === 9 ? 4 : 0,
    }));

    expect(deriveRiskFlags(answers, 'moderate')).toEqual({
      selfHarmRisk: true,
      needsProfessionalSupport: true,
      urgentSupportRecommended: true,
    });
  });

  it('marks professional support for moderate or severe total burden even without a self-harm signal', () => {
    const answers = Array.from({ length: 10 }, (_, index) => ({
      questionId: index + 1,
      question: `Question ${index + 1}`,
      value: 0,
    }));

    expect(deriveRiskFlags(answers, 'moderate')).toEqual({
      selfHarmRisk: false,
      needsProfessionalSupport: true,
      urgentSupportRecommended: false,
    });
  });
});
