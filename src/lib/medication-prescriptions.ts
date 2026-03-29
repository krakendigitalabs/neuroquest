import { collection, doc, serverTimestamp, writeBatch, type Firestore } from 'firebase/firestore';
import type { MedicationPrescription } from '@/models/medication-prescription';
import { addProgressEventToBatch } from '@/lib/progress-events';

type PersistMedicationPrescriptionInput = Omit<MedicationPrescription, 'id' | 'createdAt' | 'updatedAt'> & {
  firestore: Firestore;
};

export async function persistMedicationPrescription({
  firestore,
  userId,
  disorderGroup,
  medicationName,
  medicationClass,
  prescribedDose,
  frequency,
  durationDays,
  route,
  startDate,
  endDate,
  prescribedFor,
  expectedEffects,
  commonSideEffects,
  keyAlerts,
  notes,
  prescribingProfessionalName,
  prescribingProfessionalLicense,
  doctorSignature,
  patientSignature,
}: PersistMedicationPrescriptionInput) {
  const prescriptionsCollection = collection(firestore, 'users', userId, 'medicationPrescriptions');
  const prescriptionRef = doc(prescriptionsCollection);
  const batch = writeBatch(firestore);

  const payload: Omit<MedicationPrescription, 'id'> = {
    userId,
    disorderGroup,
    medicationName: medicationName.trim(),
    medicationClass: medicationClass.trim(),
    prescribedDose: prescribedDose.trim(),
    frequency: frequency.trim(),
    durationDays,
    route: route.trim(),
    startDate,
    endDate: endDate?.trim() || '',
    prescribedFor: prescribedFor.trim(),
    expectedEffects: expectedEffects.trim(),
    commonSideEffects: commonSideEffects.trim(),
    keyAlerts: keyAlerts.trim(),
    notes: notes.trim(),
    prescribingProfessionalName: prescribingProfessionalName.trim(),
    prescribingProfessionalLicense: prescribingProfessionalLicense.trim(),
    doctorSignature: doctorSignature.trim(),
    patientSignature: patientSignature.trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  batch.set(prescriptionRef, payload);
  addProgressEventToBatch(batch, firestore, {
    userId,
    module: 'medication',
    type: 'saved',
    detail: `${medicationName.trim()} · ${prescribedDose.trim()} · ${frequency.trim()}`,
  });

  await batch.commit();
}
