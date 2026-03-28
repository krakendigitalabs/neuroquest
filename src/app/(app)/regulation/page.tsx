'use client';

import { Wind, Waves } from 'lucide-react';
import { BreathingExercise } from './_components/breathing-exercise';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { useTrackModuleActivity } from '@/hooks/use-track-module-activity';

export default function RegulationPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();

  useTrackModuleActivity({ firestore, userId: user?.uid, module: 'regulation' });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('regulation.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('regulation.description')}
      </p>

      <div className="grid gap-6 mt-6 md:grid-cols-1 lg:grid-cols-2">
        <BreathingExercise 
          title={t('regulation.boxBreathingTitle')}
          description={t('regulation.boxBreathingDescription')}
          icon={<Wind className="h-8 w-8 text-primary" />}
          steps={[t('regulation.boxStep1'), t('regulation.boxStep2'), t('regulation.boxStep3'), t('regulation.boxStep4')]}
        />
        <BreathingExercise 
          title={t('regulation.fourSixBreathingTitle')}
          description={t('regulation.fourSixBreathingDescription')}
          icon={<Waves className="h-8 w-8 text-primary" />}
          steps={[t('regulation.fourSixStep1'), t('regulation.fourSixStep2')]}
        />
      </div>
    </div>
  );
}
