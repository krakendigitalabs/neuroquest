'use client';

import { Target, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { ExposureMission } from '@/models/exposure-mission';
import { WithId } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';

const MissionCard = ({ mission, onComplete }: { mission: WithId<ExposureMission>, onComplete: (missionId: string, xp: number) => void }) => {
  const { t } = useTranslation();

  const getDifficulty = (level: number) => {
    if (level <= 3) return t('exposure.difficultyEasy');
    if (level <= 7) return t('exposure.difficultyMedium');
    return t('exposure.difficultyHard');
  }

  return (
    <Card className={`transition-all ${mission.status === 'completed' ? 'bg-secondary/30' : 'hover:shadow-lg hover:-translate-y-1'}`}>
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-lg">{mission.title}</span>
          {mission.status === 'completed' ? <CheckCircle className="h-6 w-6 text-green-500" /> : <Target className="h-6 w-6 text-primary" />}
        </CardTitle>
        <CardDescription>{mission.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="secondary">{mission.missionType || t('exposure.missionType')}</Badge>
          <Badge variant="outline">{getDifficulty(mission.difficultyLevel)}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="bg-primary">{`+${mission.xpReward} XP`}</Badge>
          {mission.status !== 'completed' && (
              <Button size="sm" onClick={() => onComplete(mission.id, mission.xpReward)}>
                {t('exposure.completeMission')}
              </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
};


export default function ExposurePage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'exposureMissions');
  }, [firestore, user]);

  const { data: missions, isLoading } = useCollection<ExposureMission>(missionsQuery);

  const handleCompleteMission = async (missionId: string, xp: number) => {
    if (!firestore || !user) return;
    const missionRef = doc(firestore, 'users', user.uid, 'exposureMissions', missionId);
    const userRef = doc(firestore, 'users', user.uid);

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "User document does not exist!";
        }

        transaction.update(missionRef, { 
          status: 'completed',
          completionDate: serverTimestamp()
        });
        
        const profile = userDoc.data();
        const currentXp = profile.currentXp || 0;
        const xpToNextLevel = profile.xpToNextLevel || 100;
        let newXp = currentXp + xp;
        let newLevel = profile.level || 1;
        let newXpToNextLevel = xpToNextLevel;

        if (newXp >= xpToNextLevel) {
          newLevel += 1;
          newXp -= xpToNextLevel;
          newXpToNextLevel = Math.floor(xpToNextLevel * 1.5);
        }

        transaction.update(userRef, {
            currentXp: newXp,
            level: newLevel,
            xpToNextLevel: newXpToNextLevel
        });
      });
      toast({
        title: t('exposure.missionCompletedToast'),
        description: t('exposure.missionCompletedToastDesc', { xp }),
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
      toast({
        variant: "destructive",
        title: t('exposure.missionCompletionFailed'),
      });
    }
  };

  const availableMissions = missions?.filter(m => m.status === 'active' || m.status === 'pending') ?? [];
  const completedMissions = missions?.filter(m => m.status === 'completed') ?? [];

  const completedCount = completedMissions.length;
  const totalMissions = (missions || []).length;
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
            {isLoading && <p>Loading...</p>}
            {availableMissions.map((mission) => <MissionCard key={mission.id} mission={mission} onComplete={handleCompleteMission} />)}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">{t('exposure.completedMissions')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {completedMissions.map((mission) => <MissionCard key={mission.id} mission={mission} onComplete={handleCompleteMission} />)}
          </div>
        </div>
        
      </div>
    </div>
  );
}
