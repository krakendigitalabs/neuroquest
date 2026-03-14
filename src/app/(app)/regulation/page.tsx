'use client';

import { Zap, Wind, Waves } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BreathingExercise } from './_components/breathing-exercise';
import { useTranslation } from '@/context/language-provider';

export default function RegulationPage() {
  const { t } = useTranslation();

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

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <span>{t('regulation.groundingTitle')}</span>
            </CardTitle>
            <CardDescription>
              {t('regulation.groundingDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{t('regulation.acknowledge')}</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>{t('regulation.see')}</strong></li>
              <li><strong>{t('regulation.feel')}</strong></li>
              <li><strong>{t('regulation.hear')}</strong></li>
              <li><strong>{t('regulation.smell')}</strong></li>
              <li><strong>{t('regulation.taste')}</strong></li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
