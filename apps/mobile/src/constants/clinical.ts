import type { CheckInQuestion, MentalCheckInLevel } from '../types';

// TODO(clinical-approval): Confirm these threshold ranges with licensed clinical leadership.
export const CLINICAL_THRESHOLDS: Array<{ level: MentalCheckInLevel; maxScore: number }> = [
  { level: 'healthy', maxScore: 7 },
  { level: 'mild', maxScore: 15 },
  { level: 'moderate', maxScore: 27 },
  { level: 'severe', maxScore: 40 },
];

export const CHECK_IN_MAX_SCORE = 40;
export const CHECK_IN_ANSWER_MIN = 0;
export const CHECK_IN_ANSWER_MAX = 4;

export const CHECK_IN_QUESTIONS: CheckInQuestion[] = [
  { id: 1, text: 'Hoy me sentí en calma durante el día.' },
  { id: 2, text: 'Pude concentrarme en tareas importantes.' },
  { id: 3, text: 'Mi nivel de ansiedad fue manejable.' },
  { id: 4, text: 'Dormí y descansé de forma suficiente.' },
  { id: 5, text: 'Me sentí motivado/a para continuar.' },
  { id: 6, text: 'Sentí apoyo de personas cercanas.' },
  { id: 7, text: 'Logré regular pensamientos difíciles.' },
  { id: 8, text: 'Mantuve rutinas saludables hoy.' },
  { id: 9, text: 'Pude pedir ayuda cuando lo necesité.' },
  { id: 10, text: 'Me siento seguro/a para continuar el plan.' },
];

export function resolveCheckInLevel(score: number): MentalCheckInLevel {
  const normalized = Math.max(0, Math.min(CHECK_IN_MAX_SCORE, score));
  for (const threshold of CLINICAL_THRESHOLDS) {
    if (normalized <= threshold.maxScore) return threshold.level;
  }
  return 'severe';
}
