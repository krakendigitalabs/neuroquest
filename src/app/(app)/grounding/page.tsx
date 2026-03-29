'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/language-provider';
import { Zap } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { logProgressEventNonBlocking } from '@/lib/progress-events';

const ExerciseCard = ({
  title,
  description,
  actionLabel,
  onStart,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onStart: () => void;
}) => (
    <Card>
        <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-muted-foreground">{description}</p>
            <Button onClick={onStart} variant="outline" className="w-full">
              {actionLabel}
            </Button>
        </CardContent>
    </Card>
);


export default function GroundingPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const [lastStartedExercise, setLastStartedExercise] = useState<string | null>(null);

  const handleStartExercise = (title: string) => {
    setLastStartedExercise(title);
    if (!firestore || !user?.uid) return;

    logProgressEventNonBlocking(firestore, {
      userId: user.uid,
      module: 'grounding',
      type: 'saved',
      detail: title,
    });
  };

  const mildExercises = [
    { id: 'mild1', title: t('grounding.mild.ex1.title'), description: t('grounding.mild.ex1.desc') },
    { id: 'mild2', title: t('grounding.mild.ex2.title'), description: t('grounding.mild.ex2.desc') },
    { id: 'mild3', title: t('grounding.mild.ex3.title'), description: t('grounding.mild.ex3.desc') },
    { id: 'mild4', title: t('grounding.mild.ex4.title'), description: t('grounding.mild.ex4.desc') },
    { id: 'mild5', title: t('grounding.mild.ex5.title'), description: t('grounding.mild.ex5.desc') },
    { id: 'mild6', title: t('grounding.mild.ex6.title'), description: t('grounding.mild.ex6.desc') },
  ];

  const moderateExercises = [
    { id: 'mod1', title: t('grounding.moderate.ex1.title'), description: t('grounding.moderate.ex1.desc') },
    { id: 'mod2', title: t('grounding.moderate.ex2.title'), description: t('grounding.moderate.ex2.desc') },
    { id: 'mod3', title: t('grounding.moderate.ex3.title'), description: t('grounding.moderate.ex3.desc') },
    { id: 'mod4', title: t('grounding.moderate.ex4.title'), description: t('grounding.moderate.ex4.desc') },
    { id: 'mod5', title: t('grounding.moderate.ex5.title'), description: t('grounding.moderate.ex5.desc') },
    { id: 'mod6', title: t('grounding.moderate.ex6.title'), description: t('grounding.moderate.ex6.desc') },
    { id: 'mod7', title: t('grounding.moderate.ex7.title'), description: t('grounding.moderate.ex7.desc') },
  ];

  const severeExercises = [
    { id: 'sev1', title: t('grounding.severe.ex1.title'), description: t('grounding.severe.ex1.desc') },
    { id: 'sev2', title: t('grounding.severe.ex2.title'), description: t('grounding.severe.ex2.desc') },
    { id: 'sev3', title: t('grounding.severe.ex3.title'), description: t('grounding.severe.ex3.desc') },
    { id: 'sev4', title: t('grounding.severe.ex4.title'), description: t('grounding.severe.ex4.desc') },
    { id: 'sev5', title: t('grounding.severe.ex5.title'), description: t('grounding.severe.ex5.desc') },
    { id: 'sev6', title: t('grounding.severe.ex6.title'), description: t('grounding.severe.ex6.desc') },
    { id: 'sev7', title: t('grounding.severe.ex7.title'), description: t('grounding.severe.ex7.desc') },
  ];

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('grounding.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('grounding.description')}
      </p>
      {lastStartedExercise ? (
        <p className="text-sm text-muted-foreground">
          {t('grounding.lastStarted', { title: lastStartedExercise })}
        </p>
      ) : null}

      <section id="mild">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-green-500" />
          {t('grounding.mild.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mildExercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              title={ex.title}
              description={ex.description}
              actionLabel={t('grounding.startExercise')}
              onStart={() => handleStartExercise(ex.title)}
            />
          ))}
        </div>
      </section>

      <section id="moderate">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          {t('grounding.moderate.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {moderateExercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              title={ex.title}
              description={ex.description}
              actionLabel={t('grounding.startExercise')}
              onStart={() => handleStartExercise(ex.title)}
            />
          ))}
        </div>
      </section>

      <section id="severe">
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4 flex items-center gap-2">
          <Zap className="h-6 w-6 text-red-500" />
          {t('grounding.severe.title')}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {severeExercises.map(ex => (
            <ExerciseCard
              key={ex.id}
              title={ex.title}
              description={ex.description}
              actionLabel={t('grounding.startExercise')}
              onStart={() => handleStartExercise(ex.title)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
