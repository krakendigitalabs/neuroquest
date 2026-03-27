'use client';

import { useMemo } from 'react';
import { Activity, LineChart, Printer, ShieldAlert, TrendingDown, TrendingUp } from 'lucide-react';
import { CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';
import { collection } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { MentalCheckup } from '@/models/mental-checkup';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps } from 'recharts';
import { getProgressMetrics, normalizeProgressCheckups } from '@/lib/progress-checkups';

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

  const sortedCheckups = useMemo(() => normalizeProgressCheckups(checkups), [checkups]);
  const metrics = useMemo(() => getProgressMetrics(sortedCheckups), [sortedCheckups]);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('progress.title')}</h1>
        <Button type="button" variant="outline" className="print:hidden" onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          {t('progress.printReport')}
        </Button>
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
