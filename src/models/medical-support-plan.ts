import { FieldValue } from 'firebase/firestore';

export interface MedicalSupportPlan {
  id?: string;
  userId: string;
  createdAt: FieldValue | string | Date;
  updatedAt?: FieldValue | string | Date;
  disorder: 'depresión' | 'ansiedad' | 'trastorno_bipolar';
  severity: 'leve' | 'moderado' | 'grave';
  firstLine: string[];
  management: string[];
  note: string;
  alert?: string;
  savedByRole: 'user' | 'therapist';
  therapistId?: string;
  targetPatientName?: string;
}
