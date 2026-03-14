'use client';

import { Target, Lock, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/language-provider';

const MissionCard = ({ mission }: { mission: { title: string, description: string, type: string, difficulty: string, xp: number, completed: boolean } }) => (
  <Card className={`transition-all ${mission.completed ? 'bg-secondary/30' : 'hover:shadow-lg hover:-translate-y-1'}`}>
    <CardHeader>
      <CardTitle className="flex items-start justify-between">
        <span className="text-lg">{mission.title}</span>
        {mission.completed ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Target className="h-6 w-6 text-primary" />}
      </CardTitle>
      <CardDescription>{mission.description}</CardDescription>
    </CardHeader>
    <CardFooter className="flex justify-between items-center">
      <div className="flex gap-2">
        <Badge variant="secondary">{mission.type}</Badge>
        <Badge variant="outline">{mission.difficulty}</Badge>
      </div>
      <Badge variant="default" className="bg-primary">{`+${mission.xp} XP`}</Badge>
    </CardFooter>
  </Card>
);

const LockedMissionCard = ({ mission }: { mission: { title: string, description: string, type: string, difficulty: string, xp: number } }) => (
  <Card className="bg-muted/50 border-dashed">
    <CardHeader>
      <CardTitle className="flex items-start justify-between text-muted-foreground">
        <span className="text-lg">{mission.title}</span>
        <Lock className="h-6 w-6" />
      </CardTitle>
      <CardDescription>{mission.description}</CardDescription>
    </CardHeader>
    <CardFooter className="flex justify-between items-center">
      <div className="flex gap-2">
        <Badge variant="outline">{mission.type}</Badge>
        <Badge variant="outline">{mission.difficulty}</Badge>
      </div>
       <Badge variant="secondary">{`+${mission.xp} XP`}</Badge>
    </CardFooter>
  </Card>
);

export default function ExposurePage() {
  const { t } = useTranslation();

  const missions = {
    available: [
      {
        title: t('exposure.mission1Title'),
        description: t('exposure.mission1Description'),
        type: t('exposure.missionType'),
        difficulty: t('exposure.difficultyEasy'),
        xp: 50,
        completed: false
      },
      {
        title: t('exposure.mission2Title'),
        description: t('exposure.mission2Description'),
        type: t('exposure.missionType'),
        difficulty: t('exposure.difficultyMedium'),
        xp: 80,
        completed: false
      }
    ],
    completed: [
      {
        title: t('exposure.missionCompleted1Title'),
        description: t('exposure.missionCompleted1Description'),
        type: t('exposure.observerType'),
        difficulty: t('exposure.difficultyEasy'),
        xp: 30,
        completed: true
      }
    ],
    locked: [
      {
        title: t('exposure.missionLocked1Title'),
        description: t('exposure.missionLocked1Description'),
        type: t('exposure.missionType'),
        difficulty: t('exposure.difficultyHard'),
        xp: 120,
      }
    ]
  };

  const completedCount = missions.completed.length;
  const availableCount = missions.available.length;
  const totalMissions = completedCount + availableCount;
  const progressValue = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('exposure.title')}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('exposure.customMission')}
        </Button>
      </div>
      <p className="text-muted-foreground">
        {t('exposure.description')}
      </p>

      <div className="my-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('exposure.progressTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressValue} className="h-3" />
            <p className="text-sm text-muted-foreground mt-2">{t('exposure.progressDescription', { completed: completedCount, total: totalMissions })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">{t('exposure.availableMissions')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {missions.available.map((mission, index) => <MissionCard key={index} mission={mission} />)}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">{t('exposure.completedMissions')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {missions.completed.map((mission, index) => <MissionCard key={index} mission={mission} />)}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">{t('exposure.lockedMissions')}</h2>
           <p className="text-muted-foreground text-sm mb-4">{t('exposure.lockedDescription')}</p>
          <div className="grid gap-4 md:grid-cols-2">
            {missions.locked.map((mission, index) => <LockedMissionCard key={index} mission={mission} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
