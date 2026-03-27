'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { useUserProfile } from '@/hooks/use-user-profile';
import { calculateMentalCheckInScore, CHECK_IN_MAX_SCORE, getMentalCheckInLevel, type MentalCheckInLevel } from '@/lib/mental-check-in';
import type { CheckupAnswer, MentalCheckup, Recommendations, RiskFlags } from '@/models/mental-checkup';

type MissionResult = {
  category: string;
  mission: string;
  description: string;
  tasks: string[];
};

type QuestionItem = {
  id: number;
  text: string;
};

type OptionItem = {
  value: number;
  label: string;
};

export default function CheckInPage() {
  const { t } = useTranslation();
  const { user, firestore } = useFirebase();
  const { userProfile } = useUserProfile();

  const questions = useMemo<QuestionItem[]>(() => (
    Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      text: t(`checkIn.questions.${index}.text`),
    }))
  ), [t]);

  const options = useMemo<OptionItem[]>(() => (
    Array.from({ length: 5 }, (_, index) => ({
      value: index,
      label: t(`checkIn.options.${index}.label`),
    }))
  ), [t]);

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    score: number;
    severity: MentalCheckInLevel;
    mission: MissionResult;
  } | null>(null);

  const answeredAllQuestions = questions.every((question) => typeof answers[question.id] === 'number');
  const draftAnswers = useMemo<CheckupAnswer[]>(() => (
    questions.map((question) => ({
      questionId: question.id,
      question: question.text,
      value: answers[question.id] ?? 0,
    }))
  ), [answers, questions]);

  const computedScore = answeredAllQuestions ? calculateMentalCheckInScore(draftAnswers) : 0;
  const computedSeverity = answeredAllQuestions ? getMentalCheckInLevel(computedScore) : null;

  const currentMission = useMemo<MissionResult | null>(() => {
    if (!computedSeverity) return null;
    const key = `checkIn.results.${computedSeverity}`;
    return {
      category: t(`${key}.category`),
      mission: t(`${key}.mission`),
      description: t(`${key}.description`),
      tasks: Array.from({ length: 4 }, (_, index) => t(`${key}.tasks.${index}`)),
    };
  }, [computedSeverity, t]);

  const recommendations = useMemo<Recommendations>(() => {
    if (!currentMission || !computedSeverity) {
      return {
        daily: [],
        family: [],
        partner: [],
        work: [],
        study: [],
        exercise: [],
        readings: [],
      };
    }

    return {
      daily: currentMission.tasks,
      family: computedSeverity === 'severe' ? [t('checkIn.familySupportRecommendation')] : [],
      partner: computedSeverity === 'moderate' || computedSeverity === 'severe'
        ? [t('checkIn.partnerSupportRecommendation')]
        : [],
      work: computedSeverity === 'healthy'
        ? [t('checkIn.workSupportRecommendation')]
        : [t('checkIn.workReliefRecommendation')],
      study: computedSeverity === 'healthy'
        ? [t('checkIn.studySupportRecommendation')]
        : [t('checkIn.studyReliefRecommendation')],
      exercise: [t('checkIn.exerciseRecommendation')],
      readings: [t('checkIn.readingRecommendation')],
    };
  }, [computedSeverity, currentMission, t]);

  const riskFlags = useMemo<RiskFlags>(() => ({
    selfHarmRisk: (answers[10] ?? 0) >= 3,
    needsProfessionalSupport: computedSeverity === 'severe',
  }), [answers, computedSeverity]);

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaved(false);
    setResult(null);

    if (!answeredAllQuestions || !computedSeverity || !currentMission) {
      setError(t('checkIn.validationError'));
      return;
    }

    if (!user?.uid) {
      setError(t('checkIn.sessionError'));
      return;
    }

    if (!firestore) {
      setError(t('checkIn.firestoreUnavailable'));
      return;
    }

    const payload: MentalCheckup = {
      userId: user.uid,
      patientName: userProfile?.displayName || user.displayName || user.email || t('sidebar.guestUser'),
      score: computedScore,
      maxScore: CHECK_IN_MAX_SCORE,
      level: computedSeverity,
      resultTitle: currentMission.category,
      mission: currentMission.mission,
      summary: currentMission.description,
      answers: draftAnswers,
      recommendations,
      activatedModules: ['check-in'],
      riskFlags,
      professionalNote: notes.trim() || t('checkIn.defaultProfessionalNote'),
      createdAt: serverTimestamp(),
    };

    try {
      setSaving(true);

      await addDoc(collection(firestore, 'users', user.uid, 'mental_checkups'), payload);

      await setDoc(doc(firestore, 'users', user.uid), {
        latestCheckInScore: computedScore,
        latestCheckInLevel: computedSeverity,
        latestCheckInAt: serverTimestamp(),
        latestCheckInNote: notes.trim() || t('checkIn.defaultProfessionalNote'),
      }, { merge: true });

      setSaved(true);
      setResult({
        score: computedScore,
        severity: computedSeverity,
        mission: currentMission,
      });
    } catch (submitError) {
      console.error('Error saving check-in:', submitError);
      setError(t('checkIn.saveError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('checkIn.title')}</h1>
        <p className="text-muted-foreground">{t('checkIn.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('checkIn.importantTitle')}</CardTitle>
          <CardDescription>{t('checkIn.importantText')}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('checkIn.title')}</CardTitle>
          <CardDescription>{t('checkIn.disclaimerText')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-lg border p-4">
                  <p className="text-sm font-medium">{question.text}</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-5">
                    {options.map((option) => {
                      const isSelected = answers[question.id] === option.value;

                      return (
                        <button
                          key={`${question.id}-${option.value}`}
                          type="button"
                          onClick={() => handleAnswerChange(question.id, option.value)}
                          className={`rounded-md border px-3 py-2 text-sm text-left transition ${
                            isSelected ? 'border-primary bg-primary/10 text-foreground' : 'bg-background text-muted-foreground'
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('checkIn.notesLabel')}</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('checkIn.notesPlaceholder')}
                className="min-h-[120px] w-full rounded-md border bg-background px-3 py-2"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{t('checkIn.previewTitle')}</p>
                <Badge variant={computedSeverity === 'severe' ? 'destructive' : 'secondary'}>
                  {computedSeverity ? t(`checkIn.results.${computedSeverity}.category`) : t('checkIn.pendingAnswers')}
                </Badge>
              </div>
              <p className="text-sm">
                {t('checkIn.totalScore')}: {computedScore}/{CHECK_IN_MAX_SCORE}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentMission?.description || t('checkIn.completeAllQuestions')}
              </p>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? t('checkIn.saving') : t('checkIn.saveButton')}
            </Button>

            {saved ? (
              <div className="rounded-md border border-green-500 bg-green-50 px-4 py-3 text-green-700">
                {t('checkIn.savedMessage')}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-md border border-red-500 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>

      {result ? (
        <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-2xl font-bold">{t('checkIn.resultTitle')}</h2>
          <div className="grid gap-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.totalScore')}</p>
              <p className="text-2xl font-bold">{result.score}/{CHECK_IN_MAX_SCORE}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.category')}</p>
              <p className="text-lg font-semibold">{result.mission.category}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.assignedMission')}</p>
              <p className="text-lg font-semibold">{result.mission.mission}</p>
              <p className="mt-2 text-sm text-muted-foreground">{result.mission.description}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.dailyMission')}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {result.mission.tasks.map((task, index) => (
                  <li key={`${task}-${index}`}>{task}</li>
                ))}
              </ul>
            </div>

            {result.severity === 'severe' ? (
              <div className="rounded-lg border border-red-400 bg-red-50 p-4">
                <p className="font-semibold text-red-700">{t('checkIn.alertTitle')}</p>
                <p className="mt-1 text-red-700">{t('checkIn.alertText')}</p>
                <div className="mt-4">
                  <Button asChild variant="destructive">
                    <Link href="/crisis">{t('checkIn.openCrisisSupport')}</Link>
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
