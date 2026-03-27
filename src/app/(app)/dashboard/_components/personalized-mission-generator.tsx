'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Wand2, PlusCircle } from 'lucide-react';

import { generatePersonalizedMission } from '@/ai/flows/personalized-mission-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { ThoughtRecord } from '@/models/thought-record';

type PersonalizedMission = {
  title: string;
  description: string;
  type: string;
  difficulty: string;
  xpReward: number;
  targetBehavior?: string;
  resistanceTarget?: string;
};

type State = {
  personalizedMission?: PersonalizedMission,
  cognitiveCoachingSuggestion?: {
    title: string;
    suggestion: string;
    example?: string | undefined;
  };
  error?: string;
};

const initialState: State = {};

const generateMissionAction = async (prevState: State, formData: FormData): Promise<State> => {
  const { thoughtRecords, userLevel } = JSON.parse(formData.get('context') as string);
  try {
     const missionInput = {
      thoughtRecords: thoughtRecords.map((r: any) => ({
        thought: r.thoughtText,
        label: r.cognitiveLabel,
        timestamp: r.recordedAt?.toDate ? r.recordedAt.toDate().toISOString() : new Date().toISOString(),
      })),
      anxietyLogs: [], // Not implemented yet in the app
      compulsionRecords: [], // Not implemented yet in the app
      userLevel: `Level ${userLevel}`,
    };
    const result = await generatePersonalizedMission(missionInput);
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'personalizedMissionGenerator.genericError' };
  }
};

function GenerateButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <Button type="submit" disabled={pending}>
      <Wand2 className="mr-2 h-4 w-4" />
      {pending ? t('personalizedMissionGenerator.generating') : t('personalizedMissionGenerator.generateNewMission')}
    </Button>
  );
}


export function PersonalizedMissionGenerator() {
  const [state, formAction] = useActionState(generateMissionAction, initialState);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const { userProfile } = useUserProfile();
  const [missionAccepted, setMissionAccepted] = useState(false);

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'thoughtRecords');
  }, [firestore, user]);

  const { data: thoughtHistory } = useCollection<ThoughtRecord>(thoughtsQuery);

  useEffect(() => {
    if (state.error) {
      toast({
          variant: "destructive",
          title: t('personalizedMissionGenerator.generationFailed'),
          description: t(state.error),
      })
    }
  }, [state.error, toast, t]);

  useEffect(() => {
    // Reset accepted state when a new mission is generated
    if (state.personalizedMission) {
      setMissionAccepted(false);
    }
  }, [state.personalizedMission]);

  const handleAcceptMission = async () => {
    if (!firestore || !user || !state.personalizedMission) return;

    const { title, description, type, difficulty, xpReward, targetBehavior, resistanceTarget } = state.personalizedMission;

    const missionToSave = {
        title,
        description,
        missionType: type,
        difficultyLevel: difficulty === 'Fácil' ? 3 : difficulty === 'Media' ? 6 : 9,
        xpReward,
        userId: user.uid,
        status: 'active',
        assignedBy: 'AI',
        isAiGenerated: true,
        targetBehavior: targetBehavior ?? title,
        resistanceTarget: resistanceTarget ?? 'Complete the mission once',
        createdAt: serverTimestamp()
    };

    const missionsCollection = collection(firestore, 'users', user.uid, 'exposureMissions');
    await addDocumentNonBlocking(missionsCollection, missionToSave);

    toast({
      title: t('personalizedMissionGenerator.missionAccepted'),
      description: t('personalizedMissionGenerator.missionAcceptedDesc'),
    });

    setMissionAccepted(true);
  };
  
  const formInputContext = JSON.stringify({
    thoughtRecords: thoughtHistory || [],
    userLevel: userProfile?.level || 1,
  });

  return (
    <div>
      <form action={formAction}>
        <input type="hidden" name="context" value={formInputContext} />
        <GenerateButton />
      </form>
      
      {state.personalizedMission && !state.error && !missionAccepted && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
            {state.personalizedMission && (
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{state.personalizedMission.title}</span>
                            <Badge variant="default" className="bg-primary">{`+${state.personalizedMission.xpReward} XP`}</Badge>
                        </CardTitle>
                        <CardDescription>{state.personalizedMission.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Badge variant="secondary">{state.personalizedMission.type}</Badge>
                            <Badge variant="outline">{state.personalizedMission.difficulty}</Badge>
                        </div>
                        <Button onClick={handleAcceptMission}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            {t('personalizedMissionGenerator.acceptMission')}
                        </Button>
                    </CardFooter>
                </Card>
            )}
            {state.cognitiveCoachingSuggestion && (
                 <Card>
                    <CardHeader>
                        <CardTitle>{state.cognitiveCoachingSuggestion.title}</CardTitle>
                        <CardDescription>{state.cognitiveCoachingSuggestion.suggestion}</CardDescription>
                    </CardHeader>
                    {state.cognitiveCoachingSuggestion.example && (
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">
                                {t('thoughtAnalyzer.example')} "{state.cognitiveCoachingSuggestion.example}"
                            </p>
                        </CardContent>
                    )}
                </Card>
            )}
        </div>
      )}
    </div>
  );
}
