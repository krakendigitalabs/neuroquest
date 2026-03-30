import type { FieldValue } from 'firebase/firestore';

export type MedicationDisorderGroup =
  | 'depression'
  | 'anxiety'
  | 'bipolar'
  | 'adhd'
  | 'psychosis'
  | 'insomnia'
  | 'eating-disorders';

export interface MedicationPrescription {
  id?: string;
  userId: string;
  disorderGroup: MedicationDisorderGroup;
  medicationName: string;
  medicationClass: string;
  prescribedDose: string;
  frequency: string;
  durationDays: number;
  route: string;
  startDate: string;
  endDate?: string;
  prescribedFor: string;
  expectedEffects: string;
  commonSideEffects: string;
  keyAlerts: string;
  notes: string;
  prescribingProfessionalName: string;
  prescribingProfessionalLicense: string;
  doctorSignature: string;
  patientSignature: string;
  createdAt: FieldValue | string | Date;
  updatedAt?: FieldValue | string | Date;
}
