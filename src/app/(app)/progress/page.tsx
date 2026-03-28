'use client';

import { useMemo } from 'react';
import { Activity, LineChart, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { collection } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { MentalCheckup } from '@/models/mental-checkup';
import type { ThoughtRecord } from '@/models/thought-record';
import type { ExposureMission } from '@/models/exposure-mission';
import type { ProgressEvent, ProgressModuleKey } from '@/models/progress-event';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps } from 'recharts';
import { getProgressMetrics, normalizeProgressCheckups } from '@/lib/progress-checkups';
import { PatientReportActions } from '@/components/patient-report-actions';
import { buildPatientReportText } from '@/lib/patient-report';
import { normalizeThoughtRecords } from '@/lib/thought-records';
import { toDate } from '@/lib/thought-insights';

const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-lg">
        <p className="font-bold">{label}</p>
        {payload.map((item, index) => (
          <p key={index} style={{ color: item.color }}>
            {`${item.name}: ${item.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function ProgressPage() {
  const { t, locale } = useTranslation();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();

  const checkupsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'mental_checkups');
  }, [firestore, user]);

  const { data: checkups } = useCollection<MentalCheckup>(checkupsQuery);
  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'thoughtRecords');
  }, [firestore, user]);
  const { data: thoughtHistory } = useCollection<ThoughtRecord>(thoughtsQuery);
  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'exposureMissions');
  }, [firestore, user]);
  const { data: missions } = useCollection<ExposureMission>(missionsQuery);
  const activityQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'progressEvents');
  }, [firestore, user]);
  const { data: activityEvents } = useCollection<ProgressEvent>(activityQuery);

  const sortedCheckups = useMemo(() => normalizeProgressCheckups(checkups), [checkups]);
  const metrics = useMemo(() => getProgressMetrics(sortedCheckups), [sortedCheckups]);
  const sortedThoughts = useMemo(
    () =>
      [...normalizeThoughtRecords(thoughtHistory)].sort(
        (a, b) => (toDate(b.recordedAt)?.getTime() ?? 0) - (toDate(a.recordedAt)?.getTime() ?? 0)
      ),
    [thoughtHistory]
  );
  const sortedMissions = useMemo(
    () =>
      [...(missions ?? [])].sort(
        (a, b) => (toDate(b.completionDate ?? b.createdAt)?.getTime() ?? 0) - (toDate(a.completionDate ?? a.createdAt)?.getTime() ?? 0)
      ),
    [missions]
  );
  const completedMissionCount = useMemo(
    () => sortedMissions.filter((mission) => mission.status === 'completed').length,
    [sortedMissions]
  );
  const averageThoughtIntensity = useMemo(() => {
    if (!sortedThoughts.length) return null;
    const total = sortedThoughts.reduce((sum, thought) => sum + thought.intensity, 0);
    return Math.round((total / sortedThoughts.length) * 10) / 10;
  }, [sortedThoughts]);
  const sortedActivityEvents = useMemo(
    () =>
      [...(activityEvents ?? [])].sort(
        (a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0)
      ),
    [activityEvents]
  );
  const meaningfulActivityEvents = useMemo(
    () => sortedActivityEvents.filter((event) => event.type !== 'opened'),
    [sortedActivityEvents]
  );
  const engagementEvents = useMemo(
    () => sortedActivityEvents.filter((event) => event.type === 'opened'),
    [sortedActivityEvents]
  );
  const activeModuleCount = useMemo(
    () => new Set(meaningfulActivityEvents.map((event) => event.module)).size,
    [meaningfulActivityEvents]
  );
  const recentActivityCount = meaningfulActivityEvents.length;
  const moduleOpenCount = engagementEvents.length;
  const moduleCounts = useMemo(() => {
    return meaningfulActivityEvents.reduce<Record<string, number>>((accumulator, event) => {
      accumulator[event.module] = (accumulator[event.module] ?? 0) + 1;
      return accumulator;
    }, {});
  }, [meaningfulActivityEvents]);
  const thoughtTrendData = useMemo(
    () =>
      sortedThoughts
        .slice(0, 7)
        .reverse()
        .map((thought, index) => ({
          day: toDate(thought.recordedAt)
            ? toDate(thought.recordedAt)?.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
            : `${t('progress.entryLabel')} ${index + 1}`,
          intensity: thought.intensity,
        })),
    [locale, sortedThoughts, t]
  );

  const trendData = useMemo(() => (
    [...metrics.trendData]
      .reverse()
      .map((checkup, index) => {
        return {
          day: checkup.createdAt
            ? checkup.createdAt.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
            : `${t('progress.entryLabel')} ${index + 1}`,
          score: checkup.score,
        };
      })
  ), [locale, metrics.trendData, t]);

  const chartConfig = {
    score: { label: t('progress.checkInScore'), color: 'hsl(var(--destructive))' },
    intensity: { label: t('observer.intensity'), color: 'hsl(var(--primary))' },
  };
  const moduleLabel = (module: ProgressModuleKey) => {
    switch (module) {
      case 'check-in':
        return t('nav.checkIn');
      case 'observer':
        return t('nav.observer');
      case 'exposure':
        return t('nav.exposure');
      case 'medical-support':
        return t('medical.title');
      case 'grounding':
        return t('nav.grounding');
      case 'regulation':
        return t('nav.regulation');
      case 'reprogram':
        return t('nav.reprogram');
      case 'wellness':
        return t('nav.wellness');
      default:
        return module;
    }
  };
  const activityLabel = (event: ProgressEvent) => {
    switch (event.type) {
      case 'saved':
        return locale === 'es' ? 'Registro guardado' : 'Saved entry';
      case 'created':
        return locale === 'es' ? 'Creado' : 'Created';
      case 'completed':
        return locale === 'es' ? 'Completado' : 'Completed';
      case 'opened':
        return locale === 'es' ? 'Módulo usado' : 'Module opened';
      default:
        return event.type;
    }
  };
  const generatedAt = useMemo(() => new Date(), []);
  const reportPatient = userProfile?.displayName || user?.displayName || user?.email || t('sidebar.guestUser');
  const reportClinicalSummary = useMemo(() => {
    if (!metrics.latestLevel) {
      return t('progress.reportClinicalSummaryEmpty');
    }

    if (!metrics.trendDirection || metrics.trendDelta === null) {
      return t('progress.reportClinicalSummaryNoTrend', {
        level: t(`checkIn.results.${metrics.latestLevel}.category`),
      });
    }

    return t('progress.reportClinicalSummaryWithTrend', {
      level: t(`checkIn.results.${metrics.latestLevel}.category`),
      trend: t(`progress.trendStates.${metrics.trendDirection}`).toLowerCase(),
      delta: metrics.trendDelta.toLocaleString(locale),
    });
  }, [locale, metrics.latestLevel, metrics.trendDelta, metrics.trendDirection, t]);

  const reportText = useMemo(() => buildPatientReportText({
    title: t('progress.reportTitle'),
    patientLabel: t('progress.reportPatientLabel'),
    patient: reportPatient,
    generatedAtLabel: t('progress.reportGeneratedAtLabel'),
    generatedAt: generatedAt.toLocaleString(locale),
    summaryTitle: t('progress.reportClinicalSummaryTitle'),
    summary: reportClinicalSummary,
    sections: [
      {
        title: t('progress.reportRecentHistoryTitle'),
        lines: metrics.latestFive.length === 0
          ? [t('progress.noCheckInsYet')]
          : metrics.latestFive.map((checkup) => [
              checkup.createdAt?.toLocaleString(locale) ?? t('progress.unknownDate'),
              `${t('progress.checkInScore')}: ${checkup.score}/${checkup.maxScore || '—'}`,
              t(`checkIn.results.${checkup.level}.category`),
            ].join(' · ')),
      },
      {
        title: t('progress.trendTitle'),
        lines: [
          metrics.trendDirection && metrics.trendDelta !== null
            ? `${t(`progress.trendStates.${metrics.trendDirection}`)} (${metrics.trendDelta.toLocaleString(locale)})`
            : t('progress.trendUnavailableDescription'),
        ],
      },
      {
        title: t('progress.reportObserverTitle'),
        lines: sortedThoughts.length
          ? sortedThoughts.slice(0, 5).map((thought) => {
              const thoughtDate = toDate(thought.recordedAt)?.toLocaleString(locale) ?? t('progress.unknownDate');
              return `${thoughtDate} · ${thought.thoughtText} · ${t('observer.intensity')}: ${thought.intensity}/10`;
            })
          : [t('observer.noThoughts')],
      },
      {
        title: t('progress.reportMissionsTitle'),
        lines: sortedMissions.length
          ? sortedMissions.slice(0, 5).map((mission) => `${mission.title} · ${t(`progress.${mission.status}`)} · XP ${mission.xpReward}`)
          : [t('progress.noMissionsYet')],
      },
      {
        title: locale === 'es' ? 'Actividad por módulos' : 'Module activity',
        lines: meaningfulActivityEvents.length
          ? meaningfulActivityEvents.slice(0, 8).map((event) => {
              const eventDate = toDate(event.createdAt)?.toLocaleString(locale) ?? t('progress.unknownDate');
              const detail = event.detail ? ` · ${event.detail}` : '';
              return `${eventDate} · ${moduleLabel(event.module)} · ${activityLabel(event)}${detail}`;
            })
          : [locale === 'es' ? 'Aún no hay actividad relevante registrada.' : 'No meaningful activity has been recorded yet.'],
      },
      {
        title: locale === 'es' ? 'Accesos a módulos' : 'Module opens',
        lines: engagementEvents.length
          ? engagementEvents.slice(0, 8).map((event) => {
              const eventDate = toDate(event.createdAt)?.toLocaleString(locale) ?? t('progress.unknownDate');
              return `${eventDate} · ${moduleLabel(event.module)} · ${activityLabel(event)}`;
            })
          : [locale === 'es' ? 'Aún no hay accesos registrados.' : 'No module opens have been recorded yet.'],
      },
    ],
    patientSignatureLabel: t('progress.reportPatientSignature'),
    therapistSignatureLabel: t('progress.reportTherapistSignature'),
  }), [engagementEvents, generatedAt, locale, meaningfulActivityEvents, metrics.latestFive, metrics.trendDelta, metrics.trendDirection, reportClinicalSummary, reportPatient, sortedMissions, sortedThoughts, t]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('progress.title')}</h1>
        <PatientReportActions reportTitle={t('progress.reportTitle')} reportText={reportText} />
      </div>
      <p className="text-muted-foreground">{t('progress.description')}</p>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.averageScoreTitle')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.latestAverage !== null ? metrics.latestAverage.toLocaleString(locale) : t('progress.noCheckInsYet')}
            </div>
            <p className="text-xs text-muted-foreground">{t('progress.averageScoreDescription')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.trendTitle')}</CardTitle>
            {metrics.trendDirection === 'up' ? (
              <TrendingUp className="h-4 w-4 text-destructive" />
            ) : metrics.trendDirection === 'down' ? (
              <TrendingDown className="h-4 w-4 text-primary" />
            ) : (
              <LineChart className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.trendDirection ? t(`progress.trendStates.${metrics.trendDirection}`) : t('progress.trendUnavailableTitle')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.trendDelta !== null
                ? t('progress.trendDescription', { value: metrics.trendDelta.toLocaleString(locale) })
                : t('progress.trendUnavailableDescription')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.latestLevelTitle')}</CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.latestLevel ? t(`checkIn.results.${metrics.latestLevel}.category`) : t('progress.noCheckInsYet')}
            </div>
            <p className="text-xs text-muted-foreground">{t('progress.latestLevelDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.observerSummaryTitle')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageThoughtIntensity !== null ? averageThoughtIntensity.toLocaleString(locale) : t('observer.noThoughts')}
            </div>
            <p className="text-xs text-muted-foreground">{t('progress.observerSummaryDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.missionsSummaryTitle')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMissionCount.toLocaleString(locale)}</div>
            <p className="text-xs text-muted-foreground">{t('progress.missionsSummaryDescription')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'es' ? 'Módulos activos' : 'Active modules'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeModuleCount.toLocaleString(locale)}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'es'
                ? 'Módulos con acciones reales registradas.'
                : 'Modules with recorded meaningful actions.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'es' ? 'Actividad registrada' : 'Recorded activity'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentActivityCount.toLocaleString(locale)}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'es'
                ? 'Eventos de guardado, creación o finalización.'
                : 'Saved, created, or completed events.'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {locale === 'es' ? 'Accesos a módulos' : 'Module opens'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{moduleOpenCount.toLocaleString(locale)}</div>
            <p className="text-xs text-muted-foreground">
              {locale === 'es'
                ? 'Se muestra aparte para no inflar el progreso.'
                : 'Tracked separately so progress is not inflated.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {t('progress.checkInTrendTitle')}
            </CardTitle>
            <CardDescription>{t('progress.checkInTrendDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {trendData.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('progress.noCheckInsYet')}</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <ComposedChart data={trendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis width={20} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="score" stroke={chartConfig.score.color} strokeWidth={2} dot name={t('progress.checkInScore')} />
                </ComposedChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('progress.latestCheckInsTitle')}</CardTitle>
            <CardDescription>{t('progress.latestCheckInsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {metrics.latestFive.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('progress.noCheckInsYet')}</p>
            ) : null}

            {metrics.latestFive.map((checkup) => (
              <div key={checkup.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{checkup.resultTitle}</p>
                  <Badge variant={checkup.level === 'severe' ? 'destructive' : 'secondary'}>
                    {t(`checkIn.results.${checkup.level}.category`)}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-semibold">
                  {t('progress.checkInScore')}: {checkup.score}/{checkup.maxScore || '—'}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {checkup.createdAt?.toLocaleString(locale) ?? t('progress.unknownDate')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === 'es' ? 'Actividad reciente de módulos' : 'Recent module activity'}</CardTitle>
            <CardDescription>
              {locale === 'es'
                ? 'Se actualiza en tiempo real cuando un módulo guarda o registra uso.'
                : 'Updates in real time when a module saves data or logs usage.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {meaningfulActivityEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {locale === 'es' ? 'Aún no hay actividad relevante registrada.' : 'No meaningful activity has been recorded yet.'}
              </p>
            ) : (
              meaningfulActivityEvents.slice(0, 8).map((event) => (
                <div key={event.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{moduleLabel(event.module)}</p>
                    <Badge variant="outline">{activityLabel(event)}</Badge>
                  </div>
                  {event.detail ? <p className="mt-2 text-sm text-muted-foreground">{event.detail}</p> : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {toDate(event.createdAt)?.toLocaleString(locale) ?? t('progress.unknownDate')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === 'es' ? 'Cobertura por módulo' : 'Module coverage'}</CardTitle>
            <CardDescription>
              {locale === 'es'
                ? 'Resumen acumulado de actividad relevante por módulo.'
                : 'Cumulative summary of meaningful activity by module.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(moduleCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {locale === 'es' ? 'Aún no hay actividad relevante registrada.' : 'No meaningful activity has been recorded yet.'}
              </p>
            ) : (
              (Object.entries(moduleCounts) as Array<[ProgressModuleKey, number]>)
                .sort((a, b) => b[1] - a[1])
                .map(([module, count]) => (
                  <div key={module} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                    <span>{moduleLabel(module)}</span>
                    <Badge variant="secondary">{count.toLocaleString(locale)}</Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('progress.observerChartTitle')}</CardTitle>
            <CardDescription>{t('progress.observerChartDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            {thoughtTrendData.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('observer.noThoughts')}</p>
            ) : (
              <ChartContainer config={chartConfig} className="h-64">
                <ComposedChart data={thoughtTrendData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis width={20} tickLine={false} axisLine={false} domain={[0, 10]} />
                  <ChartTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="intensity" stroke={chartConfig.intensity.color} strokeWidth={2} dot name={t('observer.intensity')} />
                </ComposedChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('progress.latestMissionsTitle')}</CardTitle>
            <CardDescription>{t('progress.latestMissionsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedMissions.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('progress.noMissionsYet')}</p>
            ) : (
              sortedMissions.slice(0, 5).map((mission) => (
                <div key={mission.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{mission.title}</p>
                    <Badge variant={mission.status === 'completed' ? 'secondary' : 'outline'}>
                      {t(`progress.${mission.status}`)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{mission.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {toDate(mission.completionDate ?? mission.createdAt)?.toLocaleString(locale) ?? t('progress.unknownDate')}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('progress.reportTitle')}</CardTitle>
          <CardDescription>{t('progress.reportDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="rounded-lg border p-4">
            <p className="font-semibold">{t('progress.reportHeaderTitle')}</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <p><span className="font-medium">{t('progress.reportPatientLabel')}:</span> {reportPatient}</p>
              <p><span className="font-medium">{t('progress.reportGeneratedAtLabel')}:</span> {generatedAt.toLocaleString(locale)}</p>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">{t('progress.reportClinicalSummaryTitle')}</p>
            <p className="mt-2">{reportClinicalSummary}</p>
          </div>
          <p>
            <span className="font-medium">{t('progress.averageScoreTitle')}:</span>{' '}
            {metrics.latestAverage !== null ? metrics.latestAverage.toLocaleString(locale) : t('progress.noCheckInsYet')}
          </p>
          <p>
            <span className="font-medium">{t('progress.trendTitle')}:</span>{' '}
            {metrics.trendDirection && metrics.trendDelta !== null
              ? `${t(`progress.trendStates.${metrics.trendDirection}`)} (${metrics.trendDelta.toLocaleString(locale)})`
              : t('progress.trendUnavailableDescription')}
          </p>
          <p>
            <span className="font-medium">{t('progress.latestLevelTitle')}:</span>{' '}
            {metrics.latestLevel ? t(`checkIn.results.${metrics.latestLevel}.category`) : t('progress.noCheckInsYet')}
          </p>
          <p>
            <span className="font-medium">{t('progress.reportCheckInCount')}:</span>{' '}
            {sortedCheckups.length.toLocaleString(locale)}
          </p>
          <div className="rounded-lg border p-4">
            <p className="font-medium">{t('progress.reportRecentHistoryTitle')}</p>
            {metrics.latestFive.length === 0 ? (
              <p className="mt-2 text-muted-foreground">{t('progress.noCheckInsYet')}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {metrics.latestFive.map((checkup) => (
                  <div key={`report-${checkup.id}`} className="grid gap-1 border-b pb-2 last:border-b-0 last:pb-0 md:grid-cols-[1.2fr_0.8fr_1fr]">
                    <p>{checkup.createdAt?.toLocaleString(locale) ?? t('progress.unknownDate')}</p>
                    <p>{checkup.score}/{checkup.maxScore || '—'}</p>
                    <p>{t(`checkIn.results.${checkup.level}.category`)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">{t('progress.reportObserverTitle')}</p>
            {sortedThoughts.length === 0 ? (
              <p className="mt-2 text-muted-foreground">{t('observer.noThoughts')}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {sortedThoughts.slice(0, 5).map((thought) => (
                  <p key={`report-thought-${thought.id}`}>
                    {toDate(thought.recordedAt)?.toLocaleString(locale) ?? t('progress.unknownDate')} · {thought.thoughtText} · {t('observer.intensity')}: {thought.intensity}/10
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="rounded-lg border p-4">
            <p className="font-medium">{t('progress.reportMissionsTitle')}</p>
            {sortedMissions.length === 0 ? (
              <p className="mt-2 text-muted-foreground">{t('progress.noMissionsYet')}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {sortedMissions.slice(0, 5).map((mission) => (
                  <p key={`report-mission-${mission.id}`}>
                    {mission.title} · {t(`progress.${mission.status}`)} · XP {mission.xpReward}
                  </p>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-6 pt-6 md:grid-cols-2">
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">{t('progress.reportPatientSignature')}</p>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground">{t('progress.reportTherapistSignature')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
