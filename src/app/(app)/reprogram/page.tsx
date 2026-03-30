'use client';

import { useState } from 'react';
import { CognitiveReprogrammer } from "./_components/cognitive-reprogrammer";
import { useTranslation } from "@/context/language-provider";
import { useFirebase } from '@/firebase';
import { logProgressEventNonBlocking } from '@/lib/progress-events';

export default function ReprogramPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const [lastSavedThought, setLastSavedThought] = useState<string | null>(null);

  const handleReprogrammed = (thought: string) => {
    const trimmedThought = thought.trim();
    setLastSavedThought(trimmedThought);
    if (!firestore || !user?.uid) return;

    logProgressEventNonBlocking(firestore, {
      userId: user.uid,
      module: 'reprogram',
      type: 'saved',
      detail: trimmedThought.slice(0, 80),
    });
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('reprogram.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('reprogram.description')}
      </p>
      {lastSavedThought ? (
        <p className="text-sm text-muted-foreground">
          {t('reprogram.lastSavedThought', { thought: lastSavedThought })}
        </p>
      ) : null}

      <div className="mt-6">
        <CognitiveReprogrammer onSuccess={handleReprogrammed} />
      </div>
    </div>
  );
}
