'use client';

import { useMemo } from 'react';
import { Award, ShieldAlert, Star, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PersonalizedMissionGenerator } from './_components/personalized-mission-generator';
import { useTranslation } from '@/context/language-provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ExposureMission } from '@/models/exposure-mission';
import type { ThoughtRecord } from '@/models/thought-record';

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

export default function DashboardPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'exposureMissions');
  }, [firestore, user]);
  const { data: missions, isLoading: areMissionsLoading } = useCollection<ExposureMission>(missionsQuery);

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'thoughtRecords');
  }, [firestore, user]);
  const { data: thoughts, isLoading: areThoughtsLoading } = useCollection<ThoughtRecord>(thoughtsQuery);

  const xpEarned = userProfile?.currentXp ?? 0;
  const level = userProfile?.level ?? 1;
  const missionsCompleted = missions?.filter(m => m.status === 'completed').length ?? 0;
  const hasLatestCheckIn = !!userProfile?.latestCheckInAt;
  const latestCheckInScore = hasLatestCheckIn ? (userProfile?.latestCheckInScore ?? null) : null;
  const activeMission = useMemo(() => {
    return [...(missions ?? [])]
      .filter((mission) => mission.status === 'active' || mission.status === 'pending')
      .sort((a, b) => (toDate(b.createdAt)?.getTime() ?? 0) - (toDate(a.createdAt)?.getTime() ?? 0))[0] ?? null;
  }, [missions]);
  const summaryText = useMemo(() => {
    if (!hasLatestCheckIn) {
      return t('dashboard.summaryNoCheckIn');
    }

    const severityKey = userProfile?.latestCheckInLevel ?? 'healthy';
    const note = userProfile?.latestCheckInNote?.trim();
    return note || t(`dashboard.summaryBySeverity.${severityKey}`);
  }, [hasLatestCheckIn, t, userProfile?.latestCheckInLevel, userProfile?.latestCheckInNote]);

  const isLoading = isProfileLoading || areMissionsLoading || areThoughtsLoading;

  const stats = [
    { title: t('dashboard.xpEarned'), value: isLoading ? '...' : xpEarned.toLocaleString(), icon: <Award className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.levelTitle'), value: isLoading ? '...' : t('userProgress.level', { level }), icon: <Star className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.latestCheckIn'), value: isLoading ? '...' : latestCheckInScore !== null ? `${latestCheckInScore}/20` : t('dashboard.noCheckInYet'), icon: <ShieldAlert className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.missionsCompleted'), value: isLoading ? '...' : missionsCompleted, icon: <Target className="h-6 w-6 text-primary" /> },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">{t('dashboard.welcome')}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.overviewTitle')}</CardTitle>
            <CardDescription>{t('dashboard.overviewDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('dashboard.activeMissionTitle')}</p>
              <p className="mt-2 text-lg font-semibold">
                {isLoading ? '...' : activeMission?.title || t('dashboard.noActiveMission')}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading ? '...' : activeMission?.description || t('dashboard.activeMissionHint')}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('dashboard.summaryTitle')}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isLoading ? '...' : summaryText}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('dashboard.nextMissionTitle')}</CardTitle>
            <CardDescription>
              {t('dashboard.nextMissionDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PersonalizedMissionGenerator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
