'use client';

import { useFormState } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { cognitiveReprogramming } from '@/ai/flows/cognitive-reprogramming';
import { Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRef, useState } from 'react';

type State = {
  initialThought?: string;
  probabilityAssessment?: string;
  cognitiveDistortion?: string;
  challengeQuestions?: string[];
  reprogrammedThought?: string;
  conclusion?: string;
  error?: string;
};

const initialState: State = {};

const reprogramAction = async (prevState: State, formData: FormData): Promise<State> => {
  const thought = formData.get('thought') as string;
  if (!thought || thought.trim().length < 5) {
    return { error: 'Please enter a thought with at least 5 characters.' };
  }

  try {
    const result = await cognitiveReprogramming({ thought });
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to reprogram thought. Please try again.' };
  }
};

export function CognitiveReprogrammer() {
  const [state, formAction] = useFormState(reprogramAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsProcessing(true);
    const formData = new FormData(event.currentTarget);
    // @ts-ignore
    await formAction(formData);
    setIsProcessing(false);
    formRef.current?.reset();
  };

  if (state.error && !isProcessing) {
    toast({
        variant: "destructive",
        title: "Processing Failed",
        description: state.error,
    });
    // Clear the error after showing toast
    state.error = undefined;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Reprogramming Tool</CardTitle>
        <CardDescription>Enter a thought you want to challenge.</CardDescription>
      </CardHeader>
      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            name="thought"
            placeholder="e.g., 'If I don't check the stove, the house will explode.'"
            rows={3}
            required
            minLength={5}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isProcessing}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Start Reprogramming'}
          </Button>
        </CardFooter>
      </form>
      
      {state.initialThought && (
        <CardContent>
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-5 w-5" />
                    Initial Thought
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground italic">
                "{state.initialThought}"
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Probability Assessment</AccordionTrigger>
              <AccordionContent>
                <p><strong>Identified Distortion:</strong> {state.cognitiveDistortion}</p>
                <p className="mt-2 text-muted-foreground">{state.probabilityAssessment}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Challenge Questions</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-2">
                  {state.challengeQuestions?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600 h-5 w-5" />
                    Reprogrammed Thought
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-semibold">
                "{state.reprogrammedThought}"
                 <p className="mt-4 font-normal text-muted-foreground">{state.conclusion}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}
