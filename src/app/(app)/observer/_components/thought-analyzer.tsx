'use client';

import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { analyzeThought } from '@/ai/flows/thought-analysis-and-coaching-flow';
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';
import { useRef, useEffect, useActionState } from 'react';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection, serverTimestamp } from 'firebase/firestore';

type State = {
  isTOCRelated?: boolean;
  analysis?: string;
  reframingSuggestion?: string;
  error?: string;
  thought?: string;
};

const initialState: State = {};

function AnalyzeButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      <Wand2 className="mr-2 h-4 w-4" />
      {pending ? t('thoughtAnalyzer.analyzing') : t('thoughtAnalyzer.analyzeButton')}
    </Button>
  );
}

export function ThoughtAnalyzer() {
  const { firestore, user } = useFirebase();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  const analyzeAction = async (prevState: State, formData: FormData): Promise<State> => {
    const thought = formData.get('thought') as string;
    const emotion = (formData.get('emotion') as string) || 'unknown';
    const intensity = Number(formData.get('intensity') as string) || 5;
    if (!thought || thought.trim().length < 5) {
      return { error: 'thoughtAnalyzer.validationError' };
    }
  
    if (!user || !firestore) {
      return { error: 'thoughtAnalyzer.notAuthenticated' };
    }

    try {
      const result = await analyzeThought({ thought });
      
      const thoughtRecord = {
        userId: user.uid,
        recordedAt: serverTimestamp(),
        thoughtText: thought,
        cognitiveLabel: result.isTOCRelated ? 'toc_thought' : 'general_thought',
        isFactNotThought: true,
        associatedEmotion: emotion,
        intensity,
        isIntrusive: result.isTOCRelated,
      };

      const thoughtsCollection = collection(firestore, 'users', user.uid, 'thoughtRecords');
      await addDocumentNonBlocking(thoughtsCollection, thoughtRecord);

      return { ...result, thought };
    } catch (error) {
      console.error(error);
      return { error: 'thoughtAnalyzer.genericError' };
    }
  };

  const [state, formAction] = useActionState(analyzeAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast({
          variant: "destructive",
          title: t('thoughtAnalyzer.analysisFailed'),
          description: t(state.error),
      });
    } else if (state.analysis) {
      toast({
        title: t('thoughtAnalyzer.thoughtLogged'),
        description: t('thoughtAnalyzer.thoughtLoggedDesc'),
      })
      formRef.current?.reset();
    }
  }, [state, toast, t]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('thoughtAnalyzer.title')}</CardTitle>
        <CardDescription>{t('thoughtAnalyzer.description')}</CardDescription>
      </CardHeader>
      <form ref={formRef} action={formAction}>
        <CardContent>
          <Textarea
            name="thought"
            placeholder={t('thoughtAnalyzer.placeholder')}
            rows={3}
            required
            minLength={5}
          />
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="emotion">
                {t('observer.emotion')}
              </label>
              <select
                id="emotion"
                name="emotion"
                defaultValue="anxiety"
                className="w-full rounded-md border px-3 py-2 bg-background"
              >
                <option value="anxiety">{t('observer.emotions.anxiety')}</option>
                <option value="fear">{t('observer.emotions.fear')}</option>
                <option value="sadness">{t('observer.emotions.sadness')}</option>
                <option value="guilt">{t('observer.emotions.guilt')}</option>
                <option value="anger">{t('observer.emotions.anger')}</option>
                <option value="shame">{t('observer.emotions.shame')}</option>
                <option value="confusion">{t('observer.emotions.confusion')}</option>
                <option value="unknown">{t('observer.emotions.unknown')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="intensity">
                {t('observer.intensity')}: 5/10
              </label>
              <input
                id="intensity"
                name="intensity"
                type="range"
                min="1"
                max="10"
                defaultValue="5"
                className="w-full"
              />
            </div>
          </div>
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
                        {t('thoughtAnalyzer.aiAnalysis')}
                        <Badge variant={state.isTOCRelated ? 'destructive' : 'secondary'}>
                            {state.isTOCRelated ? t('thoughtAnalyzer.ocdPattern') : t('thoughtAnalyzer.generalThought')}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-1">{t('thoughtAnalyzer.analysis')}</h4>
                        <p className="text-sm text-muted-foreground">{state.analysis}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-1">{t('thoughtAnalyzer.reframingSuggestion')}</h4>
                        <p className="text-sm text-muted-foreground">{state.reframingSuggestion}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </Card>
  );
}
    
