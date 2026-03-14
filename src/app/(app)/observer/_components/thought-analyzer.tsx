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
    return { error: 'thoughtAnalyzer.validationError' };
  }

  try {
    const result = await analyzeThought({ thought });
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'thoughtAnalyzer.genericError' };
  }
};

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
  const [state, formAction] = useActionState(analyzeAction, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (state.error) {
      toast({
          variant: "destructive",
          title: t('thoughtAnalyzer.analysisFailed'),
          description: t(state.error),
      });
    } else if (state.analysis) {
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
