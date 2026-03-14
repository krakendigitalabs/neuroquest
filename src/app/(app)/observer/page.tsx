'use client';

import { ThoughtAnalyzer } from './_components/thought-analyzer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { History } from 'lucide-react';
import { useTranslation } from '@/context/language-provider';

const mockThoughtHistory = [
  { thought: 'Did I leave the stove on?', analysis: "A common checking-related thought, often associated with OCD.", reframe: "This is a 'what if' thought. I can choose to let it pass without checking." },
  { thought: 'Everyone thinks I am awkward.', analysis: "This sounds like social anxiety and mind-reading.", reframe: "I cannot know what others think. I will focus on my own actions." },
  { thought: 'I might have contaminated the food.', analysis: "A classic contamination fear. This is likely an OCD thought.", reframe: "I have followed normal hygiene. This fear is the OCD, not reality." },
];

export default function ObserverPage() {
  const { t } = useTranslation();
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
          {mockThoughtHistory.map((item, index) => (
            <Card key={index} className="bg-card">
              <CardHeader>
                <CardTitle className="text-lg">{t('observer.thought')}: "{item.thought}"</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <p><strong className="text-primary">{t('observer.analysis')}:</strong> {item.analysis}</p>
                <p><strong className="text-accent">{t('observer.reframing')}:</strong> {item.reframe}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
