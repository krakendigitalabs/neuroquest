'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Activity, Award, ShieldAlert, Star, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PersonalizedMissionGenerator } from './_components/personalized-mission-generator';
import { useTranslation } from '@/context/language-provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, limit, orderBy, query } from 'firebase/firestore';
import type { ExposureMission } from '@/models/exposure-mission';
import type { ProgressEvent, ProgressModuleKey } from '@/models/progress-event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CHECK_IN_MAX_SCORE } from '@/lib/mental-check-in';
import { getLatestActiveMission } from '@/lib/dashboard';

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
  const { t, locale } = useTranslation();
  const { firestore, user } = useFirebase();
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'exposureMissions'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore, user]);
  const { data: missions, isLoading: areMissionsLoading } = useCollection<ExposureMission>(missionsQuery);
  const activityQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'progressEvents'),
      orderBy('createdAt', 'desc'),
      limit(8)
    );
  }, [firestore, user]);
  const { data: activityEvents, isLoading: isActivityLoading } = useCollection<ProgressEvent>(activityQuery);

  const xpEarned = userProfile?.currentXp ?? 0;
  const level = userProfile?.level ?? 1;
  const hasLatestCheckIn = !!userProfile?.latestCheckInAt;
  const latestCheckInScore = hasLatestCheckIn ? (userProfile?.latestCheckInScore ?? null) : null;
  const activeMission = useMemo(() => getLatestActiveMission(missions), [missions]);
  const latestCheckInDate = toDate(userProfile?.latestCheckInAt);
  const meaningfulActivityEvents = useMemo(
    () => (activityEvents ?? []).filter((event) => event.type !== 'opened'),
    [activityEvents]
  );
  const activeModuleCount = useMemo(
    () => new Set(meaningfulActivityEvents.map((event) => event.module)).size,
    [meaningfulActivityEvents]
  );
  const latestActivity = meaningfulActivityEvents[0] ?? null;
  const summaryText = useMemo(() => {
    if (!hasLatestCheckIn) {
      return t('dashboard.summaryNoCheckIn');
    }

    const severityKey = userProfile?.latestCheckInLevel ?? 'healthy';
    const note = userProfile?.latestCheckInNote?.trim();
    return note || t(`dashboard.summaryBySeverity.${severityKey}`);
  }, [hasLatestCheckIn, t, userProfile?.latestCheckInLevel, userProfile?.latestCheckInNote]);

  const isLoading = isProfileLoading || areMissionsLoading || isActivityLoading;

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
        return t('progress.activityTypes.saved');
      case 'created':
        return t('progress.activityTypes.created');
      case 'completed':
        return t('progress.activityTypes.completed');
      default:
        return event.type;
    }
  };

  const stats = [
    { title: t('dashboard.xpEarned'), value: isLoading ? '...' : xpEarned.toLocaleString(locale), icon: <Award className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.levelTitle'), value: isLoading ? '...' : t('userProgress.level', { level }), icon: <Star className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.latestCheckIn'), value: isLoading ? '...' : latestCheckInScore !== null ? `${latestCheckInScore}/${CHECK_IN_MAX_SCORE}` : t('dashboard.noCheckInYet'), icon: <ShieldAlert className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.activeMissionTitle'), value: isLoading ? '...' : activeMission?.title || t('dashboard.noActiveMission'), icon: <Target className="h-6 w-6 text-primary" /> },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">{t('dashboard.welcome')}</h1>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
              <Link href="/home">{t('dashboard.returnHome')}</Link>
            </Button>
            <Button asChild size="sm" className="w-full sm:w-auto">
              <Link href="/check-in">{t('nav.checkIn')}</Link>
            </Button>
          </div>
        </div>
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
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('dashboard.activeMissionTitle')}</p>
              <p className="mt-2 text-lg font-semibold">
                {isLoading ? '...' : activeMission?.title || t('dashboard.noActiveMission')}
              </p>
              {activeMission && !isLoading && (
                <div className="mt-2">
                  <Badge variant={activeMission.status === 'active' ? 'secondary' : 'outline'}>
                    {t(`progress.${activeMission.status}`)}
                  </Badge>
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading ? '...' : activeMission?.description || t('dashboard.activeMissionHint')}
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('dashboard.summaryTitle')}</p>
              {hasLatestCheckIn && latestCheckInDate && !isLoading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('dashboard.latestCheckInDate', { date: latestCheckInDate.toLocaleString(locale) })}
                </p>
              )}
              {hasLatestCheckIn && userProfile?.latestCheckInLevel && !isLoading && (
                <div className="mt-2">
                  <Badge variant={userProfile.latestCheckInLevel === 'severe' ? 'destructive' : 'secondary'}>
                    {t(`checkIn.results.${userProfile.latestCheckInLevel}.category`)}
                  </Badge>
                </div>
              )}
              <p className="mt-2 text-sm leading-6 text-foreground">
                {isLoading ? '...' : summaryText}
              </p>
              {userProfile?.latestCheckInLevel === 'severe' && !isLoading && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm font-semibold text-destructive">
                    {t('dashboard.crisisBannerTitle')}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('dashboard.crisisBannerDescription')}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/medical-support">{t('therapist.openMedicalSupport')}</Link>
                    </Button>
                    <Button asChild variant="destructive" size="sm">
                      <Link href="/crisis">{t('sidebar.crisisSupport')}</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">{t('dashboard.recentActivityTitle')}</p>
              </div>
              <p className="mt-2 text-lg font-semibold">
                {isLoading
                  ? '...'
                  : latestActivity
                    ? moduleLabel(latestActivity.module)
                    : t('dashboard.noRecentActivity')}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLoading
                  ? '...'
                  : latestActivity
                    ? `${activityLabel(latestActivity)}${latestActivity.detail ? ` · ${latestActivity.detail}` : ''}`
                    : t('dashboard.recentActivityHint')}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">
                  {isLoading ? '...' : t('dashboard.activeModulesCount', { count: activeModuleCount })}
                </Badge>
                <Button asChild variant="ghost" size="sm" className="px-2">
                  <Link href="/progress">{t('nav.progress')}</Link>
                </Button>
              </div>
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
