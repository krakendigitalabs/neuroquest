'use client';

import { useState } from 'react';
import { Wind, Waves } from 'lucide-react';
import { BreathingExercise } from './_components/breathing-exercise';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { logProgressEventNonBlocking } from '@/lib/progress-events';

export default function RegulationPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const [lastPractice, setLastPractice] = useState<string | null>(null);

  const handlePracticeStart = (title: string) => {
    setLastPractice(title);
    if (!firestore || !user?.uid) return;

    logProgressEventNonBlocking(firestore, {
      userId: user.uid,
      module: 'regulation',
      type: 'saved',
      detail: title,
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('regulation.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('regulation.description')}
      </p>
      {lastPractice ? (
        <p className="text-sm text-muted-foreground">
          {t('regulation.lastPractice', { title: lastPractice })}
        </p>
      ) : null}

      <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-2">
        <BreathingExercise 
          title={t('regulation.boxBreathingTitle')}
          description={t('regulation.boxBreathingDescription')}
          icon={<Wind className="h-8 w-8 text-primary" />}
          steps={[t('regulation.boxStep1'), t('regulation.boxStep2'), t('regulation.boxStep3'), t('regulation.boxStep4')]}
          onStart={() => handlePracticeStart(t('regulation.boxBreathingTitle'))}
        />
        <BreathingExercise 
          title={t('regulation.fourSixBreathingTitle')}
          description={t('regulation.fourSixBreathingDescription')}
          icon={<Waves className="h-8 w-8 text-primary" />}
          steps={[t('regulation.fourSixStep1'), t('regulation.fourSixStep2')]}
          onStart={() => handlePracticeStart(t('regulation.fourSixBreathingTitle'))}
        />
      </div>
    </div>
  );
}
