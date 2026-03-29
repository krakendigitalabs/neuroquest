'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, HeartPulse, ShieldAlert, Stethoscope } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { PatientReportActions } from '@/components/patient-report-actions';
import { buildPatientReportText } from '@/lib/patient-report';
import { logProgressEventNonBlocking } from '@/lib/progress-events';

function toDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export default function MedicalSupportPage() {
  const { t, locale } = useTranslation();
  const { user, firestore } = useFirebase();
  const { userProfile, isLoading } = useUserProfile();
  const [lastReviewedLabel, setLastReviewedLabel] = useState<string | null>(null);

  const latestDate = toDate(userProfile?.latestCheckInAt);
  const hasLatestCheckIn = !!latestDate;
  const latestLevel = hasLatestCheckIn ? (userProfile?.latestCheckInLevel ?? null) : null;
  const latestScore = hasLatestCheckIn ? (userProfile?.latestCheckInScore ?? null) : null;

  const currentItems = latestLevel
    ? Array.from({ length: 3 }, (_, index) => t(`medical.dynamic.${latestLevel}.items.${index}`))
    : [];
  const generatedAt = toDate(new Date());
  const reportPatient = userProfile?.displayName || user?.displayName || user?.email || t('sidebar.guestUser');
  const reportClinicalSummary = latestLevel
    ? t('medical.reportClinicalSummaryWithLevel', {
        level: t(`checkIn.results.${latestLevel}.category`),
        guidance: t(`medical.dynamic.${latestLevel}.title`),
      })
    : t('medical.reportClinicalSummaryEmpty');

  const reportText = buildPatientReportText({
    title: t('medical.reportTitle'),
    patientLabel: t('medical.reportPatientLabel'),
    patient: reportPatient,
    generatedAtLabel: t('medical.reportGeneratedAtLabel'),
    generatedAt: generatedAt?.toLocaleString(locale) ?? t('progress.unknownDate'),
    summaryTitle: t('medical.reportClinicalSummaryTitle'),
    summary: reportClinicalSummary,
    sections: [
      {
        title: t('medical.guidanceTitle'),
        lines: latestLevel
          ? [t(`medical.dynamic.${latestLevel}.title`), ...currentItems]
          : [t('medical.completeCheckInFirst')],
      },
    ],
    patientSignatureLabel: t('medical.reportPatientSignature'),
    therapistSignatureLabel: t('medical.reportTherapistSignature'),
  });

  const handleReviewGuidance = () => {
    if (!latestLevel) return;

    const label = t(`medical.dynamic.${latestLevel}.title`);
    setLastReviewedLabel(label);

    if (!firestore || !user?.uid) return;

    logProgressEventNonBlocking(firestore, {
      userId: user.uid,
      module: 'medical-support',
      type: 'saved',
      detail: label,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('medical.title')}</h1>
        <PatientReportActions reportTitle={t('medical.reportTitle')} reportText={reportText} />
      </div>
      <p className="text-muted-foreground">{t('medical.description')}</p>
      {lastReviewedLabel ? (
        <p className="text-sm text-muted-foreground">
          {t('medical.lastReviewedGuidance', { title: lastReviewedLabel })}
        </p>
      ) : null}

      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <CardTitle>{t('medical.disclaimerTitle')}</CardTitle>
          </div>
          <CardDescription>{t('medical.disclaimerDescription')}</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-primary" />
              <CardTitle>{t('medical.latestCheckInTitle')}</CardTitle>
            </div>
            <CardDescription>{t('medical.latestCheckInDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : latestLevel ? (
              <>
                <Badge variant={latestLevel === 'severe' ? 'destructive' : 'secondary'}>
                  {t(`checkIn.results.${latestLevel}.category`)}
                </Badge>
                <p className="text-sm font-semibold">
                  {t('medical.latestCheckInScore', { score: latestScore ?? 0 })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {latestDate ? t('medical.latestCheckInDate', { date: latestDate.toLocaleString(locale) }) : t('progress.unknownDate')}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t('medical.noCheckInYet')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <CardTitle>{t('medical.guidanceTitle')}</CardTitle>
            </div>
            <CardDescription>{t('medical.guidanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!latestLevel ? (
              <p className="text-sm text-muted-foreground">{t('medical.completeCheckInFirst')}</p>
            ) : (
              <>
                <p className="text-sm font-medium">{t(`medical.dynamic.${latestLevel}.title`)}</p>
                <p className="text-sm text-muted-foreground">{t(`medical.dynamic.${latestLevel}.description`)}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {currentItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <Button type="button" variant="outline" onClick={handleReviewGuidance}>
                  {t('medical.reviewGuidanceAction')}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {latestLevel === 'severe' ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>{t('medical.severeAlertTitle')}</CardTitle>
            </div>
            <CardDescription>{t('medical.severeAlertDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="destructive">
              <Link href="/crisis">{t('sidebar.crisisSupport')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t('medical.reportTitle')}</CardTitle>
          <CardDescription>{t('medical.reportDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{t('medical.reportHeaderTitle')}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p><span className="font-medium">{t('medical.reportPatientLabel')}:</span> {reportPatient}</p>
              <p><span className="font-medium">{t('medical.reportGeneratedAtLabel')}:</span> {generatedAt?.toLocaleString(locale) ?? t('progress.unknownDate')}</p>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">{t('medical.reportClinicalSummaryTitle')}</p>
            <p className="mt-2">{reportClinicalSummary}</p>
          </div>
          <p>
            <span className="font-medium">{t('medical.latestCheckInTitle')}:</span>{' '}
            {latestLevel ? t(`checkIn.results.${latestLevel}.category`) : t('medical.noCheckInYet')}
          </p>
          {latestLevel ? (
            <p>
              <span className="font-medium">{t('medical.latestCheckInScore', { score: latestScore ?? 0 })}</span>
            </p>
          ) : null}
          <p>
            <span className="font-medium">{t('medical.guidanceTitle')}:</span>{' '}
            {latestLevel ? t(`medical.dynamic.${latestLevel}.title`) : t('medical.completeCheckInFirst')}
          </p>
          {latestLevel ? (
            <div className="rounded-lg border p-4">
              <p className="font-medium">{t('medical.reportRecommendationsTitle')}</p>
              <div className="mt-3 space-y-2">
                {currentItems.map((item) => (
                  <p key={`report-item-${item}`}>{item}</p>
                ))}
              </div>
            </div>
          ) : null}
          <div className="grid gap-6 pt-6 md:grid-cols-2">
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">{t('medical.reportPatientSignature')}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">{t('medical.reportTherapistSignature')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
