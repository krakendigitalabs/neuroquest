import { describe, expect, it } from 'vitest';
import { getNestedTranslation } from './language-provider';

describe('getNestedTranslation', () => {
  it('resolves nested values inside arrays', () => {
    const source = {
      checkIn: {
        questions: [
          { id: 1, text: 'Question one' },
          { id: 2, text: 'Question two' },
        ],
        options: [
          { value: 0, label: 'Never' },
          { value: 1, label: 'Rarely' },
        ],
      },
    };

    expect(getNestedTranslation(source, 'checkIn.questions.0.text')).toBe('Question one');
    expect(getNestedTranslation(source, 'checkIn.questions.1.id')).toBe(2);
    expect(getNestedTranslation(source, 'checkIn.options.1.label')).toBe('Rarely');
  });
});
