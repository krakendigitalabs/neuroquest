import { collection, doc, serverTimestamp, writeBatch, type Firestore } from 'firebase/firestore';
import type { MentalCheckInLevel } from '@/lib/mental-check-in';
import type { CheckupAnswer, MentalCheckup, Recommendations, RiskFlags } from '@/models/mental-checkup';
import { addProgressEventToBatch } from '@/lib/progress-events';

type PersistMentalCheckInInput = {
  firestore: Firestore;
  userId: string;
  patientName: string;
  score: number;
  maxScore: number;
  level: MentalCheckInLevel;
  resultTitle: string;
  mission: string;
  summary: string;
  answers: CheckupAnswer[];
  recommendations: Recommendations;
  riskFlags: RiskFlags;
  professionalNote: string;
};

export async function persistMentalCheckIn({
  firestore,
  userId,
  patientName,
  score,
  maxScore,
  level,
  resultTitle,
  mission,
  summary,
  answers,
  recommendations,
  riskFlags,
  professionalNote,
}: PersistMentalCheckInInput) {
  const checkupsCollection = collection(firestore, 'users', userId, 'mental_checkups');
  const checkupDocRef = doc(checkupsCollection);
  const userRef = doc(firestore, 'users', userId);
  const batch = writeBatch(firestore);

  const payload: Omit<MentalCheckup, 'id'> = {
    userId,
    patientName,
    score,
    maxScore,
    level,
    resultTitle,
    mission,
    summary,
    answers,
    recommendations,
    activatedModules: ['check-in'],
    riskFlags,
    professionalNote,
    createdAt: serverTimestamp(),
  };

  batch.set(checkupDocRef, payload);
  addProgressEventToBatch(batch, firestore, {
    userId,
    module: 'check-in',
    type: 'saved',
    detail: `${resultTitle} · ${score}/${maxScore}`,
  });
  batch.set(
    userRef,
    {
      latestCheckInScore: score,
      latestCheckInLevel: level,
      latestCheckInAt: serverTimestamp(),
      latestCheckInNote: professionalNote,
    },
    { merge: true },
  );

  await batch.commit();
}
