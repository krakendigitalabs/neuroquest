'use client';

import { ThoughtAnalyzer } from './_components/thought-analyzer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { WithId } from '@/firebase/firestore/use-collection';
import {ThoughtRecord} from '@/models/thought-record';

function ThoughtHistoryItem({ item }: { item: WithId<ThoughtRecord> }) {
  const { t, locale } = useTranslation();
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    if (item.recordedAt) {
      // This effect runs only on the client, after hydration, preventing mismatch.
      const date = (item.recordedAt as any).toDate ? (item.recordedAt as any).toDate() : new Date(item.recordedAt as any);
      setFormattedDate(date.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
  }, [item.recordedAt, locale]);

  const getLabel = (label: string) => {
    if (!label) return '';
    const key = `observer.labels.${label.toLowerCase().replace(/ /g, '_')}`;
    const translation = t(key);
    return translation === key ? label : translation;
  }

  const getEmotion = (emotion: string) => {
    if (!emotion) return '';
    const key = `observer.emotions.${emotion.toLowerCase()}`;
    const translation = t(key);
    return translation === key ? emotion : translation;
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-lg">{t('observer.thought')}: "{item.thoughtText}"</CardTitle>
        <CardDescription>{formattedDate || ' '}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
         <p><strong className="text-primary">{t('observer.emotion')}:</strong> {getEmotion(item.associatedEmotion)} ({t('observer.intensity')}: {item.intensity})</p>
         <p><strong className="text-accent">{t('observer.label')}:</strong> {getLabel(item.cognitiveLabel)}</p>
      </CardContent>
    </Card>
  )
}


export default function ObserverPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'thoughtRecords');
  }, [firestore, user]);

  const { data: thoughtHistory, isLoading } = useCollection<ThoughtRecord>(thoughtsQuery);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('observer.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('observer.description')}
      </p>

      <ThoughtAnalyzer />

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight font-headline flex items-center gap-2 mb-4">
          <History className="h-6 w-6" />
          {t('observer.recentThoughts')}
        </h2>
        <div className="space-y-4">
          {isLoading && <p>{t('observer.loadingThoughts')}</p>}
          {thoughtHistory && thoughtHistory.length === 0 && <p>{t('observer.noThoughts')}</p>}
          {thoughtHistory && thoughtHistory.map((item) => (
            <ThoughtHistoryItem key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
