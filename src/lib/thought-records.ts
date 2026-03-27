import { collection, doc, serverTimestamp, writeBatch, type Firestore } from 'firebase/firestore';
import type { ThoughtAnalysisOutput } from '@/ai/flows/thought-analysis-and-coaching-flow';
import type { ThoughtRecord } from '@/models/thought-record';

function clamp(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

export function normalizeThoughtRecord(record: Partial<ThoughtRecord> & { id?: string }, index = 0): ThoughtRecord {
  const isThoughtNotFact =
    typeof record.isThoughtNotFact === 'boolean'
      ? record.isThoughtNotFact
      : typeof record.isFactNotThought === 'boolean'
        ? record.isFactNotThought
        : true;

  return {
    id: record.id ?? `thought-${index}`,
    userId: asString(record.userId),
    recordedAt: record.recordedAt ?? null,
    thoughtText: asString(record.thoughtText, 'No data'),
    situation: asString(record.situation),
    trigger: asString(record.trigger),
    cognitiveLabel: asString(record.cognitiveLabel, 'general_thought'),
    isFactNotThought: isThoughtNotFact,
    isThoughtNotFact,
    associatedEmotion: asString(record.associatedEmotion, 'unknown'),
    intensity: clamp(record.intensity, 0, 10, 0),
    compulsionUrge: clamp(record.compulsionUrge, 0, 10, 0),
    isIntrusive: typeof record.isIntrusive === 'boolean' ? record.isIntrusive : !!record.isTOCRelated,
    analysis: asString(record.analysis),
    reframingSuggestion: asString(record.reframingSuggestion),
    isTOCRelated: typeof record.isTOCRelated === 'boolean' ? record.isTOCRelated : undefined,
    source: record.source === 'therapist' ? 'therapist' : 'observer',
  };
}

export function normalizeThoughtRecords(records: Array<Partial<ThoughtRecord> & { id?: string }> | null | undefined) {
  return (records ?? []).map((record, index) => normalizeThoughtRecord(record, index));
}

type PersistThoughtRecordInput = {
  firestore: Firestore;
  userId: string;
  thought: string;
  situation: string;
  trigger: string;
  emotion: string;
  intensity: number;
  compulsionUrge: number;
  result: ThoughtAnalysisOutput;
};

export async function persistThoughtRecord({
  firestore,
  userId,
  thought,
  situation,
  trigger,
  emotion,
  intensity,
  compulsionUrge,
  result,
}: PersistThoughtRecordInput) {
  const thoughtsCollection = collection(firestore, 'users', userId, 'thoughtRecords');
  const thoughtDocRef = doc(thoughtsCollection);
  const userRef = doc(firestore, 'users', userId);
  const batch = writeBatch(firestore);

  const thoughtRecord = {
    userId,
    recordedAt: serverTimestamp(),
    thoughtText: thought,
    situation,
    trigger,
    cognitiveLabel: result.isTOCRelated ? 'toc_thought' : 'general_thought',
    // Legacy field kept for backward compatibility; semantics are "thought, not fact".
    isFactNotThought: true,
    isThoughtNotFact: true,
    associatedEmotion: emotion,
    intensity,
    compulsionUrge,
    isIntrusive: result.isTOCRelated,
    isTOCRelated: result.isTOCRelated,
    analysis: result.analysis,
    reframingSuggestion: result.reframingSuggestion,
    source: 'observer' as const,
  };

  batch.set(thoughtDocRef, thoughtRecord);
  batch.update(userRef, {
    latestThoughtAt: serverTimestamp(),
    latestThoughtEmotion: emotion,
    latestThoughtIntensity: intensity,
    latestThoughtLabel: thoughtRecord.cognitiveLabel,
    latestThoughtPreview: thought.trim().slice(0, 180),
    latestThoughtIsIntrusive: thoughtRecord.isIntrusive,
  });

  await batch.commit();
}
