import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { CHECK_IN_MAX_SCORE, resolveCheckInLevel } from '../constants/clinical';
import { firestore } from './firebase';
import type { MentalCheckInLevel } from '../types';

type SaveCheckInInput = {
  userId: string;
  patientName: string;
  answers: Array<{ questionId: number; question: string; value: number }>;
  professionalNote?: string;
};

function getRiskFlags(level: MentalCheckInLevel) {
  const severe = level === 'severe';
  return {
    selfHarmRisk: false,
    needsProfessionalSupport: level === 'moderate' || severe,
    urgentSupportRecommended: severe,
  };
}

export async function saveMentalCheckIn(input: SaveCheckInInput) {
  const score = input.answers.reduce((sum, answer) => sum + answer.value, 0);
  const level = resolveCheckInLevel(score);
  const riskFlags = getRiskFlags(level);

  const checkupsRef = collection(firestore, 'users', input.userId, 'mental_checkups');
  const checkupDoc = doc(checkupsRef);
  const userRef = doc(firestore, 'users', input.userId);
  const batch = writeBatch(firestore);

  batch.set(checkupDoc, {
    userId: input.userId,
    patientName: input.patientName,
    score,
    maxScore: CHECK_IN_MAX_SCORE,
    level,
    resultTitle: `Resultado ${level}`,
    mission: 'Mantener seguimiento diario',
    summary: 'Registro generado desde app móvil.',
    answers: input.answers,
    recommendations: {
      daily: ['Respiración guiada 3 minutos'],
      family: [],
      partner: [],
      work: [],
      study: [],
      exercise: ['Caminata 15 minutos'],
      readings: [],
    },
    activatedModules: ['check-in'],
    riskFlags,
    professionalNote: input.professionalNote ?? '',
    createdAt: serverTimestamp(),
  });

  batch.set(
    userRef,
    {
      latestCheckInScore: score,
      latestCheckInLevel: level,
      latestCheckInAt: serverTimestamp(),
      latestCheckInNote: input.professionalNote ?? '',
      latestCheckInSelfHarmRisk: riskFlags.selfHarmRisk,
      latestCheckInNeedsProfessionalSupport: riskFlags.needsProfessionalSupport,
      latestCheckInUrgentSupport: riskFlags.urgentSupportRecommended,
    },
    { merge: true },
  );

  await batch.commit();

  return { score, level };
}
