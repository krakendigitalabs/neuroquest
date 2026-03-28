import type { FieldValue } from 'firebase/firestore';

export type ProgressModuleKey =
  | 'check-in'
  | 'observer'
  | 'exposure'
  | 'medical-support'
  | 'grounding'
  | 'regulation'
  | 'reprogram'
  | 'wellness';

export type ProgressEventType =
  | 'saved'
  | 'created'
  | 'completed'
  | 'opened';

export interface ProgressEvent {
  id?: string;
  userId: string;
  module: ProgressModuleKey;
  type: ProgressEventType;
  detail?: string;
  createdAt: FieldValue | string | Date | null;
}
