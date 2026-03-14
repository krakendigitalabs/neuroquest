'use client';

import { useFormState } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeThought } from '@/ai/flows/thought-analysis-and-coaching-flow';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import { useRef, useState } from 'react';

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

export function ThoughtAnalyzer() {
  const [state, formAction] = useFormState(analyzeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsAnalyzing(true);
    const formData = new FormData(event.currentTarget);
    // @ts-ignore
    await formAction(formData);
    setIsAnalyzing(false);
    formRef.current?.reset();
  };

  if (state.error && !isAnalyzing) {
    toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: state.error,
    });
    // Clear the error after showing toast
    state.error = undefined;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Thought Analysis</CardTitle>
        <CardDescription>What's on your mind? Log it here to gain clarity.</CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
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
          <Button type="submit" disabled={isAnalyzing}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Thought'}
          </Button>
        </CardFooter>
      </form>
      
      {(state.analysis || state.reframingSuggestion) && (
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
