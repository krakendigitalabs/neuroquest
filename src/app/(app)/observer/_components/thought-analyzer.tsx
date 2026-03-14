'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeThought } from '@/ai/flows/thought-analysis-and-coaching-flow';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import { useRef, useEffect } from 'react';

type State = {
  isTOCRelated?: boolean;
  analysis?: string;
  reframingSuggestion?: string;
  error?: string;
};

const initialState: State = {};

const analyzeAction = async (prevState: State, formData: FormData): Promise<State> => {
  const thought = formData.get('thought') as string;
  if (!thought || thought.trim().length < 5) {
    return { error: 'Please enter a thought with at least 5 characters.' };
  }

  try {
    const result = await analyzeThought({ thought });
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to analyze thought. Please try again.' };
  }
};

function AnalyzeButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Wand2 className="mr-2 h-4 w-4" />
      {pending ? 'Analyzing...' : 'Analyze Thought'}
    </Button>
  );
}

export function ThoughtAnalyzer() {
  const [state, formAction] = useFormState(analyzeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.error) {
      toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: state.error,
      });
    } else if (state.analysis) {
      formRef.current?.reset();
    }
  }, [state, toast]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Thought Analysis</CardTitle>
        <CardDescription>What's on your mind? Log it here to gain clarity.</CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent>
          <Textarea
            name="thought"
            placeholder="e.g., 'I might have made a mistake at work that will get me fired.'"
            rows={3}
            required
            minLength={5}
          />
        </CardContent>
        <CardFooter>
          <AnalyzeButton />
        </CardFooter>
      </form>
      
      {state.analysis && !state.error && (
        <div className="p-6 pt-0">
            <Card className="bg-secondary/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                        AI Analysis
                        <Badge variant={state.isTOCRelated ? 'destructive' : 'secondary'}>
                            {state.isTOCRelated ? "OCD/Anxiety Pattern" : "General Thought"}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-1">Analysis</h4>
                        <p className="text-sm text-muted-foreground">{state.analysis}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">Reframing Suggestion</h4>
                        <p className="text-sm text-muted-foreground">{state.reframingSuggestion}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </Card>
  );
}
