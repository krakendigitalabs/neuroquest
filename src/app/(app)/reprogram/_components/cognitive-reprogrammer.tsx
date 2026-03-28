'use client';

import { useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { cognitiveReprogramming } from '@/ai/flows/cognitive-reprogramming';
import { Wand2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useRef, useEffect, useActionState } from 'react';
import { useTranslation } from '@/context/language-provider';

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

function ReprogramButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending}>
      <Wand2 className="mr-2 h-4 w-4" />
      {pending ? t('cognitiveReprogrammer.processing') : t('cognitiveReprogrammer.reprogramButton')}
    </Button>
  );
}

export function CognitiveReprogrammer() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { t, locale } = useTranslation();

  const localizedReprogramAction = async (prevState: State, formData: FormData): Promise<State> => {
    const thought = formData.get('thought') as string;
    if (!thought || thought.trim().length < 5) {
      return { error: 'cognitiveReprogrammer.validationError' };
    }

    try {
      return await cognitiveReprogramming({ thought, locale });
    } catch (error) {
      console.error(error);
      return { error: 'cognitiveReprogrammer.genericError' };
    }
  };
  const [localizedState, localizedFormAction] = useActionState(localizedReprogramAction, initialState);

  useEffect(() => {
    if (localizedState.error) {
      toast({
          variant: "destructive",
          title: t('cognitiveReprogrammer.processingFailed'),
          description: t(localizedState.error),
      });
    } else if (localizedState.initialThought) {
      formRef.current?.reset();
    }
  }, [localizedState, toast, t]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('cognitiveReprogrammer.title')}</CardTitle>
        <CardDescription>{t('cognitiveReprogrammer.description')}</CardDescription>
      </CardHeader>
      <form ref={formRef} action={localizedFormAction}>
        <CardContent>
          <Textarea
            name="thought"
            placeholder={t('cognitiveReprogrammer.placeholder')}
            rows={3}
            required
            minLength={5}
          />
        </CardContent>
        <CardFooter>
          <ReprogramButton />
        </CardFooter>
      </form>
      
      {localizedState.initialThought && !localizedState.error &&(
        <CardContent>
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-destructive h-5 w-5" />
                    {t('cognitiveReprogrammer.initialThought')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground italic">
                &quot;{localizedState.initialThought}&quot;
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>{t('cognitiveReprogrammer.probabilityAssessment')}</AccordionTrigger>
              <AccordionContent>
                <p><strong>{t('cognitiveReprogrammer.identifiedDistortion')}</strong> {localizedState.cognitiveDistortion}</p>
                <p className="mt-2 text-muted-foreground">{localizedState.probabilityAssessment}</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t('cognitiveReprogrammer.challengeQuestions')}</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc list-inside space-y-2">
                  {localizedState.challengeQuestions?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-600 h-5 w-5" />
                    {t('cognitiveReprogrammer.reprogrammedThought')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="font-semibold">
                &quot;{localizedState.reprogrammedThought}&quot;
                 <p className="mt-4 font-normal text-muted-foreground">{localizedState.conclusion}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      )}
    </Card>
  );
}
