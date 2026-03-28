'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc } from 'firebase/firestore';
import { AlertTriangle, ArrowLeft, BrainCircuit, ClipboardList, ShieldAlert, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { PatientReportActions } from '@/components/patient-report-actions';
import { useTranslation } from '@/context/language-provider';
import { useTherapistAccess } from '@/hooks/use-therapist-access';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import type { ExposureMission } from '@/models/exposure-mission';
import type { MentalCheckup } from '@/models/mental-checkup';
import type { ThoughtRecord } from '@/models/thought-record';
import type { UserProfile } from '@/models/user';
import { CHECK_IN_MAX_SCORE } from '@/lib/mental-check-in';
import { getLatestPatientActivityDate, getPatientStatus } from '@/app/therapist/_lib/therapist-utils';
import { buildThoughtInsights, buildThoughtTimeline, getThoughtRiskLevel, toDate } from '@/lib/thought-insights';
import { buildPatientReportText } from '@/lib/patient-report';
import { normalizeThoughtRecords } from '@/lib/thought-records';
import { isAssignedTherapist } from '@/lib/therapist-access';

function translateEmotion(t: (key: string) => string, emotion?: string) {
  if (!emotion) return '';
  const key = `observer.emotions.${emotion.toLowerCase()}`;
  const translation = t(key);
  return translation === key ? emotion : translation;
}

export default function TherapistPatientDetailPage() {
  const { t, locale } = useTranslation();
  const { hasTherapistAccess, isAdmin, isLoading } = useTherapistAccess();
  const { firestore, user } = useFirebase();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const patientId = params?.id;

  const patientDocRef = useMemoFirebase(() => {
    if (!firestore || !patientId || !hasTherapistAccess) return null;
    return doc(firestore, 'users', patientId);
  }, [firestore, hasTherapistAccess, patientId]);
  const { data: patient, isLoading: isPatientLoading } = useDoc<UserProfile>(patientDocRef);

  const canViewPatient = isAdmin || isAssignedTherapist(patient, user?.uid);

  const checkupsQuery = useMemoFirebase(() => {
    if (!firestore || !patientId || !canViewPatient) return null;
    return collection(firestore, 'users', patientId, 'mental_checkups');
  }, [canViewPatient, firestore, patientId]);
  const { data: checkups, isLoading: areCheckupsLoading } = useCollection<MentalCheckup>(checkupsQuery);

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !patientId || !canViewPatient) return null;
    return collection(firestore, 'users', patientId, 'thoughtRecords');
  }, [canViewPatient, firestore, patientId]);
  const { data: thoughts, isLoading: areThoughtsLoading } = useCollection<ThoughtRecord>(thoughtsQuery);
  const normalizedThoughts = useMemo(() => normalizeThoughtRecords(thoughts), [thoughts]);

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !patientId || !canViewPatient) return null;
    return collection(firestore, 'users', patientId, 'exposureMissions');
  }, [canViewPatient, firestore, patientId]);
  const { data: missions, isLoading: areMissionsLoading } = useCollection<ExposureMission>(missionsQuery);

  useEffect(() => {
    if (!isLoading && !hasTherapistAccess) {
      router.push('/dashboard');
    }
  }, [hasTherapistAccess, isLoading, router]);

  useEffect(() => {
    if (!isLoading && !isPatientLoading && patient && user && !canViewPatient) {
      router.push('/therapist');
    }
  }, [canViewPatient, isLoading, isPatientLoading, patient, router, user]);

  const sortedCheckups = [...(checkups ?? [])].sort(
    (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)
  );
  const sortedThoughts = [...normalizedThoughts].sort(
    (a, b) => (toDate(b.recordedAt)?.getTime() ?? 0) - (toDate(a.recordedAt)?.getTime() ?? 0)
  );
  const sortedMissions = [...(missions ?? [])]
    .sort((a, b) => (toDate(b.completionDate ?? b.createdAt)?.getTime() ?? 0) - (toDate(a.completionDate ?? a.createdAt)?.getTime() ?? 0))
    .slice(0, 6);

  const thoughtInsights = useMemo(() => buildThoughtInsights(sortedThoughts), [sortedThoughts]);
  const thoughtTimeline = useMemo(() => buildThoughtTimeline(sortedThoughts, 7), [sortedThoughts]);

  const completedMissions = (missions ?? []).filter((mission) => mission.status === 'completed').length;
  const activeMissions = (missions ?? []).filter((mission) => mission.status === 'active').length;
  const hasLatestCheckIn = !!patient?.latestCheckInAt;
  const patientStatus = getPatientStatus(patient?.latestCheckInLevel);
  const lastActivityDate = patient ? getLatestPatientActivityDate(patient) : null;
  const lastActivity = lastActivityDate ? lastActivityDate.toLocaleDateString(locale) : t('therapist.noRecentActivity');
  const generatedAt = useMemo(() => new Date(), []);
  const patientLabel = patient.displayName || patient.email || t('therapist.patientDetail');
  const currentRisk = sortedThoughts[0]
    ? t(`observer.riskLevels.${getThoughtRiskLevel(sortedThoughts[0])}`)
    : hasLatestCheckIn
      ? patient.latestCheckInLevel ?? t('therapist.noCheckInYet')
      : t('therapist.noCheckInYet');
  const therapistReportSummary = t('therapist.reportClinicalSummary', {
    level: patient.latestCheckInLevel ?? t('therapist.noCheckInYet'),
    score: typeof patient.latestCheckInScore === 'number' ? `${patient.latestCheckInScore}/${CHECK_IN_MAX_SCORE}` : t('therapist.noCheckInYet'),
    risk: currentRisk,
    activity: lastActivity,
  });
  const therapistReportText = useMemo(() => buildPatientReportText({
    title: t('therapist.reportTitle'),
    patientLabel: t('therapist.reportPatientLabel'),
    patient: patientLabel,
    generatedAtLabel: t('therapist.reportGeneratedAtLabel'),
    generatedAt: generatedAt.toLocaleString(locale),
    summaryTitle: t('therapist.reportClinicalSummaryTitle'),
    summary: therapistReportSummary,
    sections: [
      {
        title: t('therapist.reportCheckInHistoryTitle'),
        lines: sortedCheckups.length === 0
          ? [t('therapist.noCheckInsYet')]
          : sortedCheckups.slice(0, 5).map((checkup) => `${toDate(checkup.createdAt)?.toLocaleString(locale) ?? t('therapist.noRecentActivity')} · ${checkup.resultTitle} · ${t('therapist.scoreLabel')}: ${checkup.score}/${checkup.maxScore}`),
      },
      {
        title: t('therapist.reportThoughtsTitle'),
        lines: sortedThoughts.length === 0
          ? [t('therapist.noThoughtsYet')]
          : sortedThoughts.slice(0, 5).map((thought) => `${toDate(thought.recordedAt)?.toLocaleString(locale) ?? t('therapist.noRecentActivity')} · ${thought.thoughtText} · ${t('observer.intensity')}: ${thought.intensity}/10`),
      },
      {
        title: t('therapist.reportMissionsTitle'),
        lines: sortedMissions.length === 0
          ? [t('therapist.noMissionsYet')]
          : sortedMissions.slice(0, 5).map((mission) => `${mission.title} · ${t(`progress.${mission.status}`)}`),
      },
    ],
    patientSignatureLabel: t('therapist.reportPatientSignature'),
    therapistSignatureLabel: t('therapist.reportTherapistSignature'),
  }), [generatedAt, locale, patientLabel, sortedCheckups, sortedMissions, sortedThoughts, t, therapistReportSummary]);

  if (isLoading || isPatientLoading || areCheckupsLoading || areThoughtsLoading || areMissionsLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!patient || !canViewPatient) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>{t('therapist.patientNotFound')}</CardTitle>
            <CardDescription>{t('therapist.patientNotAssigned')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/therapist">{t('therapist.backToPatients')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex min-h-16 flex-wrap items-center gap-3 border-b bg-background px-4 py-3 md:px-6">
        <Logo className="shrink-0" />
        <div className="flex w-full flex-col gap-2 sm:ml-auto sm:w-auto sm:flex-row sm:items-center">
          <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
            <Link href="/therapist">
              <ArrowLeft className="h-4 w-4" />
              {t('therapist.backToPatients')}
            </Link>
          </Button>
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">{t('therapist.backToSite')}</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{t('therapist.patientDetail')}</p>
            <h1 className="break-words text-2xl font-semibold md:text-3xl">{patient.displayName || patient.email}</h1>
            <p className="break-all text-sm text-muted-foreground">{patient.email}</p>
          </div>
          <div className="flex flex-col gap-2 md:items-end">
            <Badge className="w-fit" variant={patientStatus === 'active' ? 'secondary' : 'destructive'}>
              {t(`therapist.statuses.${patientStatus}`)}
            </Badge>
            <PatientReportActions reportTitle={t('therapist.reportTitle')} reportText={therapistReportText} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.latestCheckIn')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {hasLatestCheckIn && typeof patient.latestCheckInScore === 'number'
                  ? `${patient.latestCheckInScore}/${CHECK_IN_MAX_SCORE}`
                  : t('therapist.noCheckInYet')}
              </div>
              <p className="text-xs text-muted-foreground">{lastActivity}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.lastMentalRecord')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patient.latestThoughtIntensity
                  ? `${patient.latestThoughtIntensity}/10`
                  : t('therapist.noThoughtsYet')}
              </div>
              <p className="text-xs text-muted-foreground">
                {patient.latestThoughtEmotion
                  ? translateEmotion(t, patient.latestThoughtEmotion)
                  : t('therapist.noThoughtsYet')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.latestMissionSummary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedMissions}</div>
              <p className="text-xs text-muted-foreground">
                {activeMissions} {t('therapist.activeMissions').toLowerCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('therapist.riskLevel')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <ShieldAlert className="h-5 w-5" />
                {patient.latestCheckInLevel ?? t('therapist.noCheckInYet')}
              </div>
              <p className="text-xs text-muted-foreground">{t('therapist.riskLevelDesc')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t('therapist.checkInHistory')}
              </CardTitle>
              <CardDescription>{t('therapist.checkInHistoryDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedCheckups.length === 0 && (
                <p className="text-sm text-muted-foreground">{t('therapist.noCheckInsYet')}</p>
              )}
              {sortedCheckups.map((checkup) => (
                <div key={checkup.id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-medium">{checkup.resultTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {toDate(checkup.createdAt)?.toLocaleString(locale) ?? t('therapist.noRecentActivity')}
                      </p>
                    </div>
                    <Badge className="w-fit" variant={checkup.level === 'severe' ? 'destructive' : 'secondary'}>
                      {checkup.level}
                    </Badge>
                  </div>
                  <p className="mt-2 break-words text-sm">{checkup.summary}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t('therapist.scoreLabel')}: {checkup.score}/{checkup.maxScore}
                  </p>
                  <p className="mt-2 break-words text-sm text-muted-foreground">
                    {t('therapist.latestNote')}: {checkup.professionalNote}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" />
                  {t('therapist.patientOverview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">{t('therapist.latestNote')}</p>
                  <p className="break-words">{patient.latestCheckInNote || t('therapist.noCheckInYet')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('therapist.lastActivity')}</p>
                  <p>{lastActivity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('therapist.status')}</p>
                  <Badge variant={patientStatus === 'active' ? 'secondary' : 'destructive'}>
                    {t(`therapist.statuses.${patientStatus}`)}
                  </Badge>
                </div>
                {patient.latestThoughtPreview && (
                  <div>
                    <p className="text-muted-foreground">{t('therapist.latestThoughtPreview')}</p>
                    <p className="break-words">{patient.latestThoughtPreview}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BrainCircuit className="h-5 w-5" />
                  {t('therapist.observerTracking')}
                </CardTitle>
                <CardDescription>{t('therapist.observerTrackingDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t('therapist.thoughtsThisWeek')}</p>
                    <p className="text-xl font-semibold">{thoughtInsights.recentCount}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t('therapist.averageIntensity')}</p>
                    <p className="text-xl font-semibold">{thoughtInsights.averageIntensity.toLocaleString(locale)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t('therapist.intrusiveRate')}</p>
                    <p className="text-xl font-semibold">{thoughtInsights.intrusiveRate}%</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{t('therapist.mainEmotion')}</p>
                    <p className="text-xl font-semibold">
                      {thoughtInsights.topEmotion ? translateEmotion(t, thoughtInsights.topEmotion) : t('therapist.noThoughtsYet')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {thoughtTimeline.map((point) => (
                    <div key={point.day} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{point.day}</span>
                        <span className="text-muted-foreground">
                          {t('observer.timelinePoint', {
                            count: point.count,
                            intensity: point.averageIntensity.toLocaleString(locale),
                          })}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min((point.count / Math.max(thoughtInsights.recentCount, 1)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  {t('therapist.recentMissions')}
                </CardTitle>
                <CardDescription>{t('therapist.recentMissionsDesc')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {sortedMissions.length === 0 && (
                  <p className="text-sm text-muted-foreground">{t('therapist.noMissionsYet')}</p>
                )}
                {sortedMissions.map((mission) => (
                  <div key={mission.id} className="rounded-lg border p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="break-words text-sm font-medium">{mission.title}</p>
                      <Badge variant={mission.status === 'completed' ? 'secondary' : mission.status === 'failed' ? 'destructive' : 'outline'}>
                        {t(`progress.${mission.status}`)}
                      </Badge>
                    </div>
                    <p className="mt-1 break-words text-xs text-muted-foreground">{mission.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('therapist.reportTitle')}</CardTitle>
            <CardDescription>{t('therapist.reportDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border p-4">
              <p className="font-semibold">{t('therapist.reportHeaderTitle')}</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                <p><span className="font-medium">{t('therapist.reportPatientLabel')}:</span> {patientLabel}</p>
                <p><span className="font-medium">{t('therapist.reportGeneratedAtLabel')}:</span> {generatedAt.toLocaleString(locale)}</p>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{t('therapist.reportClinicalSummaryTitle')}</p>
              <p className="mt-2">{therapistReportSummary}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{t('therapist.reportCheckInHistoryTitle')}</p>
              <div className="mt-3 space-y-2">
                {sortedCheckups.length === 0 ? (
                  <p className="text-muted-foreground">{t('therapist.noCheckInsYet')}</p>
                ) : (
                  sortedCheckups.slice(0, 5).map((checkup) => (
                    <p key={`therapist-report-checkup-${checkup.id}`}>
                      {toDate(checkup.createdAt)?.toLocaleString(locale) ?? t('therapist.noRecentActivity')} · {checkup.resultTitle} · {t('therapist.scoreLabel')}: {checkup.score}/{checkup.maxScore}
                    </p>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{t('therapist.reportThoughtsTitle')}</p>
              <div className="mt-3 space-y-2">
                {sortedThoughts.length === 0 ? (
                  <p className="text-muted-foreground">{t('therapist.noThoughtsYet')}</p>
                ) : (
                  sortedThoughts.slice(0, 5).map((thought) => (
                    <p key={`therapist-report-thought-${thought.id}`}>
                      {toDate(thought.recordedAt)?.toLocaleString(locale) ?? t('therapist.noRecentActivity')} · {thought.thoughtText} · {t('observer.intensity')}: {thought.intensity}/10
                    </p>
                  ))
                )}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="font-medium">{t('therapist.reportMissionsTitle')}</p>
              <div className="mt-3 space-y-2">
                {sortedMissions.length === 0 ? (
                  <p className="text-muted-foreground">{t('therapist.noMissionsYet')}</p>
                ) : (
                  sortedMissions.slice(0, 5).map((mission) => (
                    <p key={`therapist-report-mission-${mission.id}`}>
                      {mission.title} · {t(`progress.${mission.status}`)}
                    </p>
                  ))
                )}
              </div>
            </div>
            <div className="grid gap-6 pt-6 md:grid-cols-2">
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">{t('therapist.reportPatientSignature')}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground">{t('therapist.reportTherapistSignature')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              {t('therapist.recentThoughts')}
            </CardTitle>
            <CardDescription>{t('therapist.recentThoughtsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedThoughts.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('therapist.noThoughtsYet')}</p>
            )}
            {sortedThoughts.slice(0, 8).map((thought) => (
              <div key={thought.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <p className="break-words text-sm font-medium">{thought.thoughtText}</p>
                    <p className="text-xs text-muted-foreground">
                      {toDate(thought.recordedAt)?.toLocaleString(locale) ?? t('therapist.noRecentActivity')}
                    </p>
                  </div>
                  <Badge variant={getThoughtRiskLevel(thought) === 'high' ? 'destructive' : 'secondary'}>
                    {t(`observer.riskLevels.${getThoughtRiskLevel(thought)}`)}
                  </Badge>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <p className="text-xs text-muted-foreground">
                    {t('observer.emotion')}: {translateEmotion(t, thought.associatedEmotion)} | {t('observer.intensity')}: {thought.intensity}/10
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('observer.compulsionUrge')}: {thought.compulsionUrge ?? 0}/10 | {t('observer.trigger')}: {thought.trigger || t('observer.noData')}
                  </p>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t('observer.situation')}</p>
                    <p className="text-sm">{thought.situation || t('observer.noData')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t('observer.analysis')}</p>
                    <p className="text-sm">{thought.analysis || t('observer.noData')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{t('observer.reframing')}</p>
                    <p className="text-sm">{thought.reframingSuggestion || t('observer.noData')}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
