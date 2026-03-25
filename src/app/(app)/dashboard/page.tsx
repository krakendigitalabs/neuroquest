'use client';

import { Award, BrainCircuit, ShieldAlert, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PersonalizedMissionGenerator } from './_components/personalized-mission-generator';
import { useTranslation } from '@/context/language-provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ExposureMission } from '@/models/exposure-mission';
import type { ThoughtRecord } from '@/models/thought-record';

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
  const missionsCompleted = missions?.filter(m => m.status === 'completed').length ?? 0;
  const thoughtsIdentified = thoughts?.length ?? 0;
  const compulsionsResisted = 0; // This is not tracked yet.

  const isLoading = isProfileLoading || areMissionsLoading || areThoughtsLoading;

  const stats = [
    { title: t('dashboard.xpEarned'), value: isLoading ? '...' : xpEarned.toLocaleString(), icon: <Award className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.compulsionsResisted'), value: isLoading ? '...' : compulsionsResisted, icon: <ShieldAlert className="h-6 w-6 text-primary" /> },
    { title: t('dashboard.thoughtsIdentified'), value: isLoading ? '...' : thoughtsIdentified, icon: <BrainCircuit className="h-6 w-6 text-primary" /> },
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
