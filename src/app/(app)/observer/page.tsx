'use client';

import { useMemo } from 'react';
import { AlertTriangle, BrainCircuit, History, Siren, Sparkles } from 'lucide-react';
import { ThoughtAnalyzer } from './_components/thought-analyzer';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { ThoughtRecord } from '@/models/thought-record';
import { buildThoughtInsights, buildThoughtTimeline, getThoughtRiskLevel, toDate } from '@/lib/thought-insights';
import { normalizeThoughtRecords } from '@/lib/thought-records';

function translateLabel(t: (key: string) => string, label?: string) {
  if (!label) return '';
  const key = `observer.labels.${label.toLowerCase().replace(/ /g, '_')}`;
  const translation = t(key);
  return translation === key ? label : translation;
}

function translateEmotion(t: (key: string) => string, emotion?: string) {
  if (!emotion) return '';
  const key = `observer.emotions.${emotion.toLowerCase()}`;
  const translation = t(key);
  return translation === key ? emotion : translation;
}

function ThoughtHistoryItem({ item }: { item: ThoughtRecord }) {
  const { t, locale } = useTranslation();
  const date = toDate(item.recordedAt);
  const formattedDate = date
    ? date.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
  const riskLevel = getThoughtRiskLevel(item);

  return (
    <Card className="bg-card">
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg leading-snug">&quot;{item.thoughtText}&quot;</CardTitle>
            <CardDescription>{formattedDate || ' '}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'outline' : 'secondary'}>
              {t(`observer.riskLevels.${riskLevel}`)}
            </Badge>
            <Badge variant={item.isIntrusive ? 'destructive' : 'secondary'}>
              {item.isIntrusive ? t('observer.intrusiveThought') : t('observer.nonIntrusiveThought')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <p className="text-sm">
            <strong className="text-primary">{t('observer.emotion')}:</strong>{' '}
            {translateEmotion(t, item.associatedEmotion)} ({t('observer.intensity')}: {item.intensity}/10)
          </p>
          <p className="text-sm">
            <strong className="text-accent">{t('observer.label')}:</strong>{' '}
            {translateLabel(t, item.cognitiveLabel)}
          </p>
          <p className="text-sm">
            <strong>{t('observer.compulsionUrge')}:</strong> {item.compulsionUrge ?? 0}/10
          </p>
          <p className="text-sm">
            <strong>{t('observer.trigger')}:</strong> {item.trigger || t('observer.noData')}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('observer.situation')}</p>
            <p className="text-sm">{item.situation || t('observer.noData')}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('observer.reframing')}</p>
            <p className="text-sm">{item.reframingSuggestion || t('observer.noData')}</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t('observer.analysis')}</p>
          <p className="text-sm">{item.analysis || t('observer.noData')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ObserverPage() {
  const { t, locale } = useTranslation();
  const { firestore, user } = useFirebase();

  const thoughtsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'thoughtRecords');
  }, [firestore, user]);

  const { data: thoughtHistory, isLoading } = useCollection<ThoughtRecord>(thoughtsQuery);
  const normalizedThoughtHistory = useMemo(() => normalizeThoughtRecords(thoughtHistory), [thoughtHistory]);

  const sortedThoughts = useMemo(
    () =>
      [...normalizedThoughtHistory].sort(
        (a, b) => (toDate(b.recordedAt)?.getTime() ?? 0) - (toDate(a.recordedAt)?.getTime() ?? 0)
      ),
    [normalizedThoughtHistory]
  );

  const insights = useMemo(() => buildThoughtInsights(sortedThoughts), [sortedThoughts]);
  const timeline = useMemo(() => buildThoughtTimeline(sortedThoughts, 7), [sortedThoughts]);

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('observer.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('observer.description')}
      </p>

      <ThoughtAnalyzer />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('observer.totalLogged')}</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.totalCount}</div>
            <p className="text-xs text-muted-foreground">{t('observer.totalLoggedDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('observer.last7Days')}</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.recentCount}</div>
            <p className="text-xs text-muted-foreground">{t('observer.last7DaysDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('observer.averageIntensity')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.averageIntensity.toLocaleString(locale)}</div>
            <p className="text-xs text-muted-foreground">{t('observer.averageIntensityDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('observer.intrusiveRate')}</CardTitle>
            <Siren className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.intrusiveRate}%</div>
            <p className="text-xs text-muted-foreground">
              {insights.topEmotion
                ? t('observer.topEmotionDesc', { emotion: translateEmotion(t, insights.topEmotion) })
                : t('observer.noEmotionTrend')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5" />
              {t('observer.patternsTitle')}
            </CardTitle>
            <CardDescription>{t('observer.patternsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t('observer.averageCompulsionUrge')}</p>
                <p className="text-2xl font-semibold">{insights.averageCompulsionUrge.toLocaleString(locale)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{t('observer.highRiskThoughts')}</p>
                <p className="text-2xl font-semibold">{insights.highRiskCount}</p>
              </div>
            </div>

            <div className="space-y-3">
              {timeline.map((point) => (
                <div key={point.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{point.day}</span>
                    <span className="text-muted-foreground">
                      {t('observer.timelinePoint', {
                        count: point.count,
                        intensity: point.averageIntensity.toLocaleString(locale),
                      })}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min((point.count / Math.max(insights.recentCount, 1)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight font-headline">
            <History className="h-6 w-6" />
            {t('observer.recentThoughts')}
          </h2>
          <div className="space-y-4">
            {isLoading && <p>{t('observer.loadingThoughts')}</p>}
            {!isLoading && sortedThoughts.length === 0 && <p>{t('observer.noThoughts')}</p>}
            {sortedThoughts.map((item) => (
              <ThoughtHistoryItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
