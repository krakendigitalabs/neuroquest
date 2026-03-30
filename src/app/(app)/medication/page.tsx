'use client';

import { useMemo, useState } from 'react';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import { BookOpen, FileText, Pill, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { useTrackModuleActivity } from '@/hooks/use-track-module-activity';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { MedicationDisorderGroup, MedicationPrescription } from '@/models/medication-prescription';
import { persistMedicationPrescription } from '@/lib/medication-prescriptions';
import { getMedicationEducationCatalog } from '@/lib/medication-catalog';
import { PatientReportActions } from '@/components/patient-report-actions';
import { buildPatientReportText } from '@/lib/patient-report';
import { toDate } from '@/lib/thought-insights';

type FormState = {
  disorderGroup: MedicationDisorderGroup;
  medicationName: string;
  medicationClass: string;
  prescribedDose: string;
  frequency: string;
  durationDays: string;
  route: string;
  startDate: string;
  endDate: string;
  prescribedFor: string;
  expectedEffects: string;
  commonSideEffects: string;
  keyAlerts: string;
  notes: string;
  prescribingProfessionalName: string;
  prescribingProfessionalLicense: string;
  doctorSignature: string;
  patientSignature: string;
};

const INITIAL_FORM: FormState = {
  disorderGroup: 'depression',
  medicationName: '',
  medicationClass: '',
  prescribedDose: '',
  frequency: '',
  durationDays: '',
  route: 'oral',
  startDate: '',
  endDate: '',
  prescribedFor: '',
  expectedEffects: '',
  commonSideEffects: '',
  keyAlerts: '',
  notes: '',
  prescribingProfessionalName: '',
  prescribingProfessionalLicense: '',
  doctorSignature: '',
  patientSignature: '',
};

export default function MedicationPage() {
  const { t, locale } = useTranslation();
  const isSpanish = locale.startsWith('es');
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();
  useTrackModuleActivity({ firestore, userId: user?.uid, module: 'medication' });

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const catalog = useMemo(() => getMedicationEducationCatalog(isSpanish), [isSpanish]);
  const selectedEducation = useMemo(
    () => catalog.find((entry) => entry.disorderGroup === form.disorderGroup) ?? catalog[0],
    [catalog, form.disorderGroup]
  );

  const prescriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'medicationPrescriptions'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore, user]);
  const { data: prescriptions } = useCollection<MedicationPrescription>(prescriptionsQuery);

  const sortedPrescriptions = useMemo(
    () =>
      [...(prescriptions ?? [])].sort(
        (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)
      ),
    [prescriptions]
  );

  const reportPatient = userProfile?.displayName || user?.displayName || user?.email || t('sidebar.guestUser');
  const reportText = useMemo(() => buildPatientReportText({
    title: t('medicationModule.reportTitle'),
    patientLabel: t('medicationModule.reportPatientLabel'),
    patient: reportPatient,
    generatedAtLabel: t('medicationModule.reportGeneratedAtLabel'),
    generatedAt: new Date().toLocaleString(locale),
    summaryTitle: t('medicationModule.reportSummaryTitle'),
    summary: sortedPrescriptions.length
      ? t('medicationModule.reportSummaryWithCount', { count: sortedPrescriptions.length })
      : t('medicationModule.reportSummaryEmpty'),
    sections: sortedPrescriptions.length
      ? sortedPrescriptions.slice(0, 8).map((item) => ({
          title: `${item.medicationName} · ${item.prescribedDose}`,
          lines: [
            `${t('medicationModule.form.disorderGroup')}: ${t(`medicationModule.disorderGroups.${item.disorderGroup}`)}`,
            `${t('medicationModule.form.frequency')}: ${item.frequency}`,
            `${t('medicationModule.form.durationDays')}: ${item.durationDays}`,
            `${t('medicationModule.form.professionalName')}: ${item.prescribingProfessionalName}`,
            `${t('medicationModule.form.expectedEffects')}: ${item.expectedEffects}`,
            `${t('medicationModule.form.commonSideEffects')}: ${item.commonSideEffects}`,
            `${t('medicationModule.form.keyAlerts')}: ${item.keyAlerts}`,
          ],
        }))
      : [{ title: t('medicationModule.emptyTitle'), lines: [t('medicationModule.emptyDescription')] }],
    patientSignatureLabel: t('medicationModule.reportPatientSignature'),
    therapistSignatureLabel: t('medicationModule.reportProfessionalSignature'),
  }), [locale, reportPatient, sortedPrescriptions, t]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setError('');
    setSaved(false);

    if (!firestore || !user?.uid) {
      setError(t('medicationModule.errors.session'));
      return;
    }

    const requiredFields: Array<keyof FormState> = [
      'medicationName',
      'medicationClass',
      'prescribedDose',
      'frequency',
      'durationDays',
      'route',
      'startDate',
      'prescribedFor',
      'expectedEffects',
      'commonSideEffects',
      'keyAlerts',
      'prescribingProfessionalName',
      'prescribingProfessionalLicense',
      'doctorSignature',
      'patientSignature',
    ];

    if (requiredFields.some((field) => !String(form[field]).trim())) {
      setError(t('medicationModule.errors.required'));
      return;
    }

    const durationDays = Number(form.durationDays);
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      setError(t('medicationModule.errors.duration'));
      return;
    }

    try {
      setSaving(true);
      await persistMedicationPrescription({
        firestore,
        userId: user.uid,
        disorderGroup: form.disorderGroup,
        medicationName: form.medicationName,
        medicationClass: form.medicationClass,
        prescribedDose: form.prescribedDose,
        frequency: form.frequency,
        durationDays,
        route: form.route,
        startDate: form.startDate,
        endDate: form.endDate,
        prescribedFor: form.prescribedFor,
        expectedEffects: form.expectedEffects,
        commonSideEffects: form.commonSideEffects,
        keyAlerts: form.keyAlerts,
        notes: form.notes,
        prescribingProfessionalName: form.prescribingProfessionalName,
        prescribingProfessionalLicense: form.prescribingProfessionalLicense,
        doctorSignature: form.doctorSignature,
        patientSignature: form.patientSignature,
      });
      setSaved(true);
      setForm(INITIAL_FORM);
    } catch (saveError) {
      console.error('Error saving medication prescription', saveError);
      setError(t('medicationModule.errors.save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{t('medicationModule.title')}</h1>
          <p className="text-muted-foreground">{t('medicationModule.description')}</p>
        </div>
        <PatientReportActions reportTitle={t('medicationModule.reportTitle')} reportText={reportText} />
      </div>

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle>{t('medicationModule.disclaimerTitle')}</CardTitle>
          </div>
          <CardDescription>{t('medicationModule.disclaimerDescription')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle>{t('medicationModule.formTitle')}</CardTitle>
              </div>
              <CardDescription>{t('medicationModule.formDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.disorderGroup')}</span>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.disorderGroup}
                    onChange={(event) => handleChange('disorderGroup', event.target.value)}
                  >
                    {catalog.map((entry) => (
                      <option key={entry.disorderGroup} value={entry.disorderGroup}>
                        {entry.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.medicationName')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.medicationName} onChange={(event) => handleChange('medicationName', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.medicationClass')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.medicationClass} onChange={(event) => handleChange('medicationClass', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.prescribedDose')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.prescribedDose} onChange={(event) => handleChange('prescribedDose', event.target.value)} placeholder={t('medicationModule.placeholders.dose')} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.frequency')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.frequency} onChange={(event) => handleChange('frequency', event.target.value)} placeholder={t('medicationModule.placeholders.frequency')} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.durationDays')}</span>
                  <input type="number" min="1" className="w-full rounded-md border bg-background px-3 py-2" value={form.durationDays} onChange={(event) => handleChange('durationDays', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.route')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.route} onChange={(event) => handleChange('route', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.startDate')}</span>
                  <input type="date" className="w-full rounded-md border bg-background px-3 py-2" value={form.startDate} onChange={(event) => handleChange('startDate', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.endDate')}</span>
                  <input type="date" className="w-full rounded-md border bg-background px-3 py-2" value={form.endDate} onChange={(event) => handleChange('endDate', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">{t('medicationModule.form.prescribedFor')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.prescribedFor} onChange={(event) => handleChange('prescribedFor', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">{t('medicationModule.form.expectedEffects')}</span>
                  <textarea className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2" value={form.expectedEffects} onChange={(event) => handleChange('expectedEffects', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">{t('medicationModule.form.commonSideEffects')}</span>
                  <textarea className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2" value={form.commonSideEffects} onChange={(event) => handleChange('commonSideEffects', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">{t('medicationModule.form.keyAlerts')}</span>
                  <textarea className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2" value={form.keyAlerts} onChange={(event) => handleChange('keyAlerts', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-medium">{t('medicationModule.form.notes')}</span>
                  <textarea className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2" value={form.notes} onChange={(event) => handleChange('notes', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.professionalName')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.prescribingProfessionalName} onChange={(event) => handleChange('prescribingProfessionalName', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.professionalLicense')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.prescribingProfessionalLicense} onChange={(event) => handleChange('prescribingProfessionalLicense', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.doctorSignature')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.doctorSignature} onChange={(event) => handleChange('doctorSignature', event.target.value)} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-medium">{t('medicationModule.form.patientSignature')}</span>
                  <input className="w-full rounded-md border bg-background px-3 py-2" value={form.patientSignature} onChange={(event) => handleChange('patientSignature', event.target.value)} />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? t('medicationModule.saving') : t('medicationModule.save')}
                </Button>
              </div>

              {saved ? <p className="text-sm text-green-700">{t('medicationModule.saved')}</p> : null}
              {error ? <p className="text-sm text-red-700">{error}</p> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Pill className="h-5 w-5 text-primary" />
                <CardTitle>{t('medicationModule.historyTitle')}</CardTitle>
              </div>
              <CardDescription>{t('medicationModule.historyDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedPrescriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('medicationModule.emptyDescription')}</p>
              ) : (
                sortedPrescriptions.map((item) => (
                  <div key={item.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{item.medicationName}</p>
                      <Badge variant="secondary">{item.prescribedDose}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(`medicationModule.disorderGroups.${item.disorderGroup}`)} · {item.frequency} · {item.durationDays} {t('medicationModule.days')}
                    </p>
                    <p className="text-sm">{item.prescribedFor}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.prescribingProfessionalName} · {toDate(item.createdAt)?.toLocaleString(locale) ?? t('progress.unknownDate')}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <CardTitle>{t('medicationModule.educationTitle')}</CardTitle>
              </div>
              <CardDescription>{t('medicationModule.educationDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="font-semibold">{selectedEducation.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{selectedEducation.summary}</p>
                <p className="mt-2 text-sm text-amber-800">{selectedEducation.caution}</p>
              </div>
              {selectedEducation.classes.map((entry) => (
                <div key={`${selectedEducation.disorderGroup}-${entry.className}`} className="rounded-lg border p-4 space-y-2">
                  <p className="font-medium">{entry.className}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">{t('medicationModule.education.examples')}:</span> {entry.examples}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">{t('medicationModule.education.intendedUse')}:</span> {entry.intendedUse}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">{t('medicationModule.education.expectedEffects')}:</span> {entry.expectedEffects}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">{t('medicationModule.education.commonSideEffects')}:</span> {entry.commonSideEffects}</p>
                  <p className="text-sm text-muted-foreground"><span className="font-medium">{t('medicationModule.education.majorAlerts')}:</span> {entry.majorAlerts}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
