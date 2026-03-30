'use client';

import { useMemo, useState } from 'react';
import { Target, CheckCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { addDoc, collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import type { ExposureMission } from '@/models/exposure-mission';
import { WithId } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientReportActions } from '@/components/patient-report-actions';
import { buildPatientReportText } from '@/lib/patient-report';
import { toDate } from '@/lib/thought-insights';
import { logProgressEventNonBlocking } from '@/lib/progress-events';
import { useTrackModuleActivity } from '@/hooks/use-track-module-activity';

const MissionCard = ({ mission, onComplete }: { mission: WithId<ExposureMission>, onComplete: (missionId: string, xp: number) => void }) => {
  const { t } = useTranslation();

  const getDifficulty = (level: number) => {
    if (level <= 3) return t('exposure.difficultyEasy');
    if (level <= 7) return t('exposure.difficultyMedium');
    return t('exposure.difficultyHard');
  }

  const normalizedMissionType = (mission.missionType || '').toLowerCase().replace(/ /g, '_');
  const missionTypeKey = (() => {
    switch (normalizedMissionType) {
      case 'observer':
      case 'observador_mental':
        return 'observer';
      case 'exposure':
      case 'exposición':
        return 'exposure';
      case 'regulation':
      case 'regulación_emocional':
        return 'regulation';
      case 'reprogram':
      case 'reprogramación_cognitiva':
        return 'reprogram';
      default:
        return normalizedMissionType;
    }
  })();

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
          <Badge variant="secondary">{t(`missionTypes.${missionTypeKey}`)}</Badge>
          <Badge variant="outline">{getDifficulty(mission.difficultyLevel)}</Badge>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="default" className="bg-primary">{t('exposure.xpRewardBadge', { xp: mission.xpReward })}</Badge>
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
  const { t, locale } = useTranslation();
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const [showCustomMissionForm, setShowCustomMissionForm] = useState(false);
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDescription, setMissionDescription] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('5');
  const [targetBehavior, setTargetBehavior] = useState('');
  const [resistanceTarget, setResistanceTarget] = useState('');
  const [isSavingMission, setIsSavingMission] = useState(false);

  useTrackModuleActivity({ firestore, userId: user?.uid, module: 'exposure' });

  const missionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'exposureMissions');
  }, [firestore, user]);

  const { data: missions, isLoading } = useCollection<ExposureMission>(missionsQuery);

  const resetCustomMissionForm = () => {
    setMissionTitle('');
    setMissionDescription('');
    setDifficultyLevel('5');
    setTargetBehavior('');
    setResistanceTarget('');
  };

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
      logProgressEventNonBlocking(firestore, {
        userId: user.uid,
        module: 'exposure',
        type: 'completed',
        detail: `XP ${xp}`,
      });
    } catch (e) {
      console.error("Transaction failed: ", e);
      toast({
        variant: "destructive",
        title: t('exposure.missionCompletionFailed'),
      });
    }
  };

  const handleCreateCustomMission = async () => {
    if (!firestore || !user) return;
    if (!missionTitle.trim() || !missionDescription.trim() || !targetBehavior.trim() || !resistanceTarget.trim()) {
      toast({
        variant: 'destructive',
        title: t('exposure.customMissionValidationTitle'),
        description: t('exposure.customMissionValidationDescription'),
      });
      return;
    }

    try {
      setIsSavingMission(true);

      const parsedDifficulty = Number(difficultyLevel);
      const xpReward = 20 + parsedDifficulty * 5;

      const missionPayload = {
        userId: user.uid,
        title: missionTitle.trim(),
        description: missionDescription.trim(),
        difficultyLevel: parsedDifficulty,
        status: 'active',
        xpReward,
        assignedBy: 'System',
        targetBehavior: targetBehavior.trim(),
        resistanceTarget: resistanceTarget.trim(),
        isAiGenerated: false,
        missionType: 'exposición',
        createdAt: serverTimestamp(),
      } satisfies Omit<ExposureMission, 'id'>;

      await addDoc(collection(firestore, 'users', user.uid, 'exposureMissions'), missionPayload);
      logProgressEventNonBlocking(firestore, {
        userId: user.uid,
        module: 'exposure',
        type: 'created',
        detail: missionPayload.title,
      });

      toast({
        title: t('exposure.customMissionCreatedTitle'),
        description: t('exposure.customMissionCreatedDescription'),
      });

      resetCustomMissionForm();
      setShowCustomMissionForm(false);
    } catch (error) {
      console.error('Failed to create custom mission:', error);
      toast({
        variant: 'destructive',
        title: t('exposure.customMissionFailedTitle'),
        description: t('exposure.customMissionFailedDescription'),
      });
    } finally {
      setIsSavingMission(false);
    }
  };

  const availableMissions = missions?.filter(m => m.status === 'active' || m.status === 'pending') ?? [];
  const completedMissions = missions?.filter(m => m.status === 'completed') ?? [];

  const completedCount = completedMissions.length;
  const totalMissions = (missions || []).length;
  const progressValue = totalMissions > 0 ? (completedCount / totalMissions) * 100 : 0;
  const generatedAt = useMemo(() => new Date(), []);
  const reportPatient = user?.displayName || user?.email || t('sidebar.guestUser');
  const reportText = useMemo(() => buildPatientReportText({
    title: t('exposure.reportTitle'),
    patientLabel: t('exposure.reportPatientLabel'),
    patient: reportPatient,
    generatedAtLabel: t('exposure.reportGeneratedAtLabel'),
    generatedAt: generatedAt.toLocaleString(locale),
    summaryTitle: t('exposure.reportSummaryTitle'),
    summary: totalMissions
      ? t('exposure.reportSummaryWithProgress', {
          completed: completedCount,
          total: totalMissions,
          xp: completedMissions.reduce((sum, mission) => sum + mission.xpReward, 0),
        })
      : t('exposure.reportSummaryEmpty'),
    sections: [
      {
        title: t('exposure.completedMissions'),
        lines: completedMissions.length
          ? completedMissions.map((mission) => {
              const completionDate = toDate(mission.completionDate)?.toLocaleString(locale) ?? t('progress.unknownDate');
              const missionTypeKey = (mission.missionType || '').toLowerCase().replace(/ /g, '_');
              const translatedType = t(`missionTypes.${missionTypeKey}`);
              return `${completionDate} · ${mission.title} · ${translatedType === `missionTypes.${missionTypeKey}` ? mission.missionType || t('nav.exposure') : translatedType} · XP ${mission.xpReward}`;
            })
          : [t('exposure.noCompletedMissions')],
      },
      {
        title: t('exposure.availableMissions'),
        lines: availableMissions.length
          ? availableMissions.slice(0, 5).map((mission) => `${mission.title} · ${t(`progress.${mission.status}`)}`)
          : [t('exposure.noAvailableMissions')],
      },
    ],
    patientSignatureLabel: t('exposure.reportPatientSignature'),
    therapistSignatureLabel: t('exposure.reportTherapistSignature'),
  }), [availableMissions, completedCount, completedMissions, generatedAt, locale, reportPatient, t, totalMissions]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-3xl font-bold tracking-tight font-headline">{t('exposure.title')}</h1>
          <div className="flex flex-wrap gap-2">
            <PatientReportActions reportTitle={t('exposure.reportTitle')} reportText={reportText} />
            <Button onClick={() => setShowCustomMissionForm((value) => !value)}>
              <Plus className="mr-2 h-4 w-4" /> {t('exposure.customMission')}
            </Button>
          </div>
        </div>
      </div>
      <p className="text-muted-foreground">
        {t('exposure.description')}
      </p>

      {showCustomMissionForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t('exposure.customMissionFormTitle')}</CardTitle>
            <CardDescription>{t('exposure.customMissionFormDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium">{t('exposure.customMissionTitleLabel')}</p>
              <Input value={missionTitle} onChange={(event) => setMissionTitle(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium">{t('exposure.customMissionDescriptionLabel')}</p>
              <Textarea value={missionDescription} onChange={(event) => setMissionDescription(event.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('exposure.customMissionDifficultyLabel')}</p>
              <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">{t('exposure.difficultyEasy')}</SelectItem>
                  <SelectItem value="5">{t('exposure.difficultyMedium')}</SelectItem>
                  <SelectItem value="8">{t('exposure.difficultyHard')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t('exposure.customMissionBehaviorLabel')}</p>
              <Input value={targetBehavior} onChange={(event) => setTargetBehavior(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium">{t('exposure.customMissionResistanceLabel')}</p>
              <Input value={resistanceTarget} onChange={(event) => setResistanceTarget(event.target.value)} />
            </div>
            <div className="flex gap-3 md:col-span-2">
              <Button onClick={handleCreateCustomMission} disabled={isSavingMission}>
                {isSavingMission ? t('exposure.customMissionSaving') : t('exposure.customMissionCreateButton')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetCustomMissionForm();
                  setShowCustomMissionForm(false);
                }}
              >
                {t('exposure.customMissionCancel')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="my-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('exposure.progressTitle')}</CardTitle>
            <CardDescription>{t('exposure.reportDescription')}</CardDescription>
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
            {isLoading && <p>{t('loading')}</p>}
            {!isLoading && availableMissions.length === 0 && <p>{t('exposure.noAvailableMissions')}</p>}
            {availableMissions.map((mission) => <MissionCard key={mission.id} mission={mission} onComplete={handleCompleteMission} />)}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">{t('exposure.completedMissions')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {!isLoading && completedMissions.length === 0 && <p>{t('exposure.noCompletedMissions')}</p>}
            {completedMissions.map((mission) => <MissionCard key={mission.id} mission={mission} onComplete={handleCompleteMission} />)}
          </div>
        </div>
        
      </div>
    </div>
  );
}
