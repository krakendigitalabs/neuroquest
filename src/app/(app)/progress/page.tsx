'use client';

import { useMemo } from 'react';
import { BarChart, LineChart, TrendingDown, TrendingUp, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, CartesianGrid, XAxis, YAxis, Line, ComposedChart, TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useTranslation } from '@/context/language-provider';
import { collection } from 'firebase/firestore';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import type { ExposureMission } from '@/models/exposure-mission';
import type { MentalCheckup } from '@/models/mental-checkup';
import type { ThoughtRecord } from '@/models/thought-record';

type DatedRecord = {
  createdAt?: unknown;
  recordedAt?: unknown;
  completionDate?: unknown;
};

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

function isWithinLastDays(date: Date | null, days: number, now: Date) {
  if (!date) return false;
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() - days);
  return date >= threshold;
}

function isWithinPreviousWindow(date: Date | null, days: number, now: Date) {
  if (!date) return false;
  const recentThreshold = new Date(now);
  recentThreshold.setDate(recentThreshold.getDate() - days);
  const previousThreshold = new Date(now);
  previousThreshold.setDate(previousThreshold.getDate() - days * 2);
  return date >= previousThreshold && date < recentThreshold;
}

function average(numbers: number[]) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}


const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-lg shadow-lg">
          <p className="label font-bold">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }}>
              {`${pld.name}: ${pld.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

export default function ProgressPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'thoughtRecords');
  }, [firestore, user]);

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'exposureMissions');
  }, [firestore, user]);

  const checkupsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'mental_checkups');
  }, [firestore, user]);

  const { data: thoughts } = useCollection<ThoughtRecord>(thoughtsQuery);
  const { data: missions } = useCollection<ExposureMission>(missionsQuery);
  const { data: checkups } = useCollection<MentalCheckup>(checkupsQuery);

  const now = useMemo(() => new Date(), []);

  const completedMissions = missions?.filter((mission) => mission.status === 'completed') ?? [];
  const activeMissions = missions?.filter((mission) => mission.status === 'active') ?? [];
  const pendingMissions = missions?.filter((mission) => mission.status === 'pending') ?? [];
  const failedMissions = missions?.filter((mission) => mission.status === 'failed') ?? [];
  const missionCompletionRate = missions?.length ? Math.round((completedMissions.length / missions.length) * 100) : 0;

  const recentCompletedMissions = completedMissions.filter((mission) =>
    isWithinLastDays(toDate((mission as DatedRecord).completionDate ?? (mission as DatedRecord).createdAt), 7, now)
  ).length;
  const previousCompletedMissions = completedMissions.filter((mission) =>
    isWithinPreviousWindow(toDate((mission as DatedRecord).completionDate ?? (mission as DatedRecord).createdAt), 7, now)
  ).length;
  const missionCompletionDelta = recentCompletedMissions - previousCompletedMissions;

  const recentCheckups = checkups?.filter((checkup) => isWithinLastDays(toDate((checkup as DatedRecord).createdAt), 7, now)) ?? [];
  const previousCheckups = checkups?.filter((checkup) => isWithinPreviousWindow(toDate((checkup as DatedRecord).createdAt), 7, now)) ?? [];
  const weeklyCheckInScore = Math.round(average(recentCheckups.map((checkup) => checkup.score)) * 10) / 10;
  const previousWeeklyCheckInScore = Math.round(average(previousCheckups.map((checkup) => checkup.score)) * 10) / 10;
  const checkInScoreDelta = Math.round((weeklyCheckInScore - previousWeeklyCheckInScore) * 10) / 10;

  const recentThoughts = thoughts?.filter((thought) => isWithinLastDays(toDate((thought as DatedRecord).recordedAt), 7, now)) ?? [];
  const previousThoughts = thoughts?.filter((thought) => isWithinPreviousWindow(toDate((thought as DatedRecord).recordedAt), 7, now)) ?? [];
  const thoughtDelta = recentThoughts.length - previousThoughts.length;

  const checkupTrendData = useMemo(() => {
    return [...(checkups ?? [])]
      .sort((a, b) => {
        const dateA = toDate((a as DatedRecord).createdAt)?.getTime() ?? 0;
        const dateB = toDate((b as DatedRecord).createdAt)?.getTime() ?? 0;
        return dateA - dateB;
      })
      .slice(-7)
      .map((checkup, index) => {
        const date = toDate((checkup as DatedRecord).createdAt);
        return {
          day: date
            ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            : `${t('progress.entryLabel')} ${index + 1}`,
          score: checkup.score,
        };
      });
  }, [checkups, t]);

  const missionStatusData = [
    {
      name: t('progress.currentSnapshot'),
      completed: completedMissions.length,
      active: activeMissions.length,
      pending: pendingMissions.length,
      failed: failedMissions.length,
    },
  ];

  const chartConfig = {
    score: { label: t('progress.checkInScore'), color: 'hsl(var(--destructive))' },
    completed: { label: t('progress.completed'), color: 'hsl(var(--chart-2))' },
    active: { label: t('progress.active'), color: 'hsl(var(--chart-1))' },
    pending: { label: t('progress.pending'), color: 'hsl(var(--chart-4))' },
    failed: { label: t('progress.failed'), color: 'hsl(var(--chart-5))' },
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('progress.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('progress.description')}
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.missionCompletionRate')}</CardTitle>
            <Medal className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missionCompletionRate}%</div>
            <p className="text-xs text-muted-foreground">{t('progress.missionCompletionRateChange', { value: missionCompletionDelta })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.weeklyCheckInScore')}</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyCheckInScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('progress.weeklyCheckInChange', { value: checkInScoreDelta })}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('progress.thoughtsLogged')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentThoughts.length}</div>
            <p className="text-xs text-muted-foreground">{t('progress.thoughtsLoggedChange', { value: thoughtDelta })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5" />{t('progress.checkInTrendTitle')}</CardTitle>
            <CardDescription>{t('progress.checkInTrendDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ComposedChart data={checkupTrendData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis width={20} tickLine={false} axisLine={false} />
                <ChartTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke={chartConfig.score.color} strokeWidth={2} dot={true} name={t('progress.checkInScore')} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5" />{t('progress.missionStatusTitle')}</CardTitle>
            <CardDescription>{t('progress.missionStatusDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ComposedChart data={missionStatusData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis width={20} />
                <ChartTooltip content={<CustomTooltip />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="completed" stackId="a" fill={chartConfig.completed.color} radius={[4, 4, 0, 0]} name={t('progress.completed')} />
                <Bar dataKey="active" stackId="a" fill={chartConfig.active.color} radius={[4, 4, 0, 0]} name={t('progress.active')} />
                <Bar dataKey="pending" stackId="a" fill={chartConfig.pending.color} radius={[4, 4, 0, 0]} name={t('progress.pending')} />
                <Bar dataKey="failed" stackId="a" fill={chartConfig.failed.color} radius={[4, 4, 0, 0]} name={t('progress.failed')} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
