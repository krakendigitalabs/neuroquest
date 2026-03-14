'use client';

import { useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Wand2 } from 'lucide-react';

import { generatePersonalizedMission } from '@/ai/flows/personalized-mission-generation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type State = {
  personalizedMission?: {
    title: string;
    description: string;
    type: string;
    difficulty: string;
    xpReward: number;
  };
  cognitiveCoachingSuggestion?: {
    title: string;
    suggestion: string;
    example?: string | undefined;
  };
  error?: string;
};

const initialState: State = {};

const generateMissionAction = async (prevState: State): Promise<State> => {
  try {
    // In a real app, you would fetch these from a database
    const mockInput = {
      thoughtRecords: [
        { thought: "I might have hit someone with my car.", label: "TOC", timestamp: new Date().toISOString() },
        { thought: "Did I lock the door?", label: "Anxiety", timestamp: new Date().toISOString() },
      ],
      anxietyLogs: [{ level: 7, trigger: "Driving", timestamp: new Date().toISOString() }],
      compulsionRecords: [{ behavior: "Checked the door 5 times", resisted: false, timestamp: new Date().toISOString() }],
      userLevel: "Explorador Mental",
    };
    const result = await generatePersonalizedMission(mockInput);
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate mission. Please try again.' };
  }
};

function GenerateButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      <Wand2 className="mr-2 h-4 w-4" />
      {pending ? 'Generating...' : 'Generate New Mission'}
    </Button>
  );
}


export function PersonalizedMissionGenerator() {
  const [state, formAction] = useFormState(generateMissionAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
          variant: "destructive",
          title: "Generation Failed",
          description: state.error,
      })
    }
  }, [state.error, toast]);
  

  return (
    <div>
      <form action={formAction}>
        <GenerateButton />
      </form>
      
      {(state.personalizedMission || state.cognitiveCoachingSuggestion) && !state.error && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {state.personalizedMission && (
                <Card className="bg-secondary/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{state.personalizedMission.title}</span>
                            <Badge variant="default" className="bg-primary">{`+${state.personalizedMission.xpReward} XP`}</Badge>
                        </CardTitle>
                        <CardDescription>{state.personalizedMission.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex gap-2">
                        <Badge variant="secondary">{state.personalizedMission.type}</Badge>
                        <Badge variant="outline">{state.personalizedMission.difficulty}</Badge>
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
                                Example: "{state.cognitiveCoachingSuggestion.example}"
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
