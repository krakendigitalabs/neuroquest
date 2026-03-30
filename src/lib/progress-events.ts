import { collection, doc, serverTimestamp, type Firestore, type WriteBatch } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase';
import type { ProgressEvent, ProgressEventType, ProgressModuleKey } from '@/models/progress-event';

type ProgressEventInput = {
  userId: string;
  module: ProgressModuleKey;
  type: ProgressEventType;
  detail?: string;
};

export function createProgressEventPayload({
  userId,
  module,
  type,
  detail,
}: ProgressEventInput): Omit<ProgressEvent, 'id'> {
  return {
    userId,
    module,
    type,
    detail: detail?.trim() || '',
    createdAt: serverTimestamp(),
  };
}

export function addProgressEventToBatch(
  batch: WriteBatch,
  firestore: Firestore,
  input: ProgressEventInput,
) {
  const eventsCollection = collection(firestore, 'users', input.userId, 'progressEvents');
  const eventDocRef = doc(eventsCollection);
  batch.set(eventDocRef, createProgressEventPayload(input));
}

export function logProgressEventNonBlocking(
  firestore: Firestore,
  input: ProgressEventInput,
) {
  const eventsCollection = collection(firestore, 'users', input.userId, 'progressEvents');
  return addDocumentNonBlocking(eventsCollection, createProgressEventPayload(input));
}
