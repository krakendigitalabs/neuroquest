'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from '@/context/language-provider';
import { useFirebase } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useUserProfile } from '@/hooks/use-user-profile';
import type { CheckupAnswer, MentalCheckup, Recommendations, RiskFlags } from '@/models/mental-checkup';

type Severity = 'healthy' | 'mild' | 'moderate' | 'severe';

type MissionResult = {
  category: string;
  mission: string;
  description: string;
  tasks: string[];
};

function getMoodScore(mood: string) {
  switch (mood) {
    case 'very-bad':
      return 4;
    case 'bad':
      return 3;
    case 'neutral':
      return 2;
    case 'good':
      return 1;
    case 'very-good':
      return 0;
    default:
      return 2;
  }
}

function getSleepPenalty(hours: number) {
  if (hours <= 3) return 4;
  if (hours <= 5) return 3;
  if (hours <= 6) return 2;
  if (hours <= 7) return 1;
  if (hours <= 9) return 0;
  if (hours <= 11) return 1;
  return 2;
}

function getEnergyPenalty(energy: number) {
  if (energy <= 2) return 4;
  if (energy <= 4) return 3;
  if (energy <= 6) return 2;
  if (energy <= 8) return 1;
  return 0;
}

function calculateScore(params: {
  mood: string;
  anxiety: number;
  energy: number;
  sleepHours: number;
}) {
  const moodPart = getMoodScore(params.mood);
  const anxietyPart = Math.max(0, params.anxiety - 1);
  const energyPart = getEnergyPenalty(params.energy);
  const sleepPart = getSleepPenalty(params.sleepHours);

  return moodPart + anxietyPart + energyPart + sleepPart;
}

function getSeverity(score: number): Severity {
  if (score <= 5) return 'healthy';
  if (score <= 9) return 'mild';
  if (score <= 13) return 'moderate';
  return 'severe';
}

export default function CheckInPage() {
  const { t } = useTranslation();
  const { user, firestore } = useFirebase();
  const { userProfile } = useUserProfile();

  const [mood, setMood] = useState('neutral');
  const [anxiety, setAnxiety] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [sleepHours, setSleepHours] = useState(8);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    score: number;
    severity: Severity;
    mission: MissionResult;
  } | null>(null);

  const computedScore = useMemo(() => {
    return calculateScore({ mood, anxiety, energy, sleepHours });
  }, [mood, anxiety, energy, sleepHours]);

  const computedSeverity = useMemo(() => {
    return getSeverity(computedScore);
  }, [computedScore]);

  const currentMission = useMemo(() => {
    const key = `checkIn.results.${computedSeverity}`;
    return {
      category: t(`${key}.category`),
      mission: t(`${key}.mission`),
      description: t(`${key}.description`),
      tasks: [
        t(`${key}.tasks.0`),
        t(`${key}.tasks.1`),
        t(`${key}.tasks.2`),
        t(`${key}.tasks.3`),
      ],
    };
  }, [computedSeverity, t]);

  const checkupAnswers = useMemo<CheckupAnswer[]>(() => [
    {
      questionId: 1,
      question: t('checkIn.moodLabel'),
      value: getMoodScore(mood),
    },
    {
      questionId: 2,
      question: t('checkIn.anxietyLabel'),
      value: anxiety,
    },
    {
      questionId: 3,
      question: t('checkIn.energyLabel'),
      value: energy,
    },
    {
      questionId: 4,
      question: t('checkIn.sleepLabel'),
      value: sleepHours,
    },
  ], [anxiety, energy, mood, sleepHours, t]);

  const recommendations = useMemo<Recommendations>(() => ({
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
  }), [computedSeverity, currentMission.tasks, t]);

  const activatedModules = useMemo(() => {
    const modules = ['check-in'];

    if (computedSeverity === 'healthy') {
      modules.push('regulation');
    } else if (computedSeverity === 'mild') {
      modules.push('regulation', 'grounding');
    } else if (computedSeverity === 'moderate') {
      modules.push('regulation', 'grounding', 'reprogram');
    } else {
      modules.push('regulation', 'grounding', 'reprogram', 'crisis');
    }

    return modules;
  }, [computedSeverity]);

  const riskFlags = useMemo<RiskFlags>(() => ({
    selfHarmRisk: false,
    needsProfessionalSupport: computedSeverity === 'severe',
  }), [computedSeverity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    const payload: MentalCheckup = {
      userId: user?.uid ?? '',
      patientName: userProfile?.displayName || user?.displayName || user?.email || 'Guest',
      score: computedScore,
      maxScore: 20,
      level: computedSeverity,
      resultTitle: currentMission.category,
      mission: currentMission.mission,
      summary: currentMission.description,
      answers: checkupAnswers,
      recommendations,
      activatedModules,
      riskFlags,
      professionalNote: notes.trim() || t('checkIn.defaultProfessionalNote'),
      createdAt: serverTimestamp(),
    };

    setResult({
      score: computedScore,
      severity: computedSeverity,
      mission: currentMission,
    });

    if (!user?.uid) {
      setError('No user session found. Please sign in or continue as guest correctly.');
      return;
    }

    if (!firestore) {
      setError('Firestore is not available in useFirebase().');
      return;
    }

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
    } catch (err) {
      console.error('Error saving check-in:', err);
      setError('Failed to save check-in in Firebase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('checkIn.title')}</h1>
        <p className="text-muted-foreground">{t('checkIn.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border p-6 shadow-sm bg-card">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('checkIn.moodLabel')}</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full rounded-md border px-3 py-2 bg-background"
          >
            <option value="very-bad">{t('checkIn.moods.veryBad')}</option>
            <option value="bad">{t('checkIn.moods.bad')}</option>
            <option value="neutral">{t('checkIn.moods.neutral')}</option>
            <option value="good">{t('checkIn.moods.good')}</option>
            <option value="very-good">{t('checkIn.moods.veryGood')}</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('checkIn.anxietyLabel')}: {anxiety}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={anxiety}
            onChange={(e) => setAnxiety(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t('checkIn.energyLabel')}: {energy}/10
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('checkIn.sleepLabel')}</label>
          <input
            type="number"
            min="0"
            max="24"
            value={sleepHours}
            onChange={(e) => setSleepHours(Number(e.target.value))}
            className="w-full rounded-md border px-3 py-2 bg-background"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('checkIn.notesLabel')}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('checkIn.notesPlaceholder')}
            className="w-full rounded-md border px-3 py-2 min-h-[120px] bg-background"
          />
        </div>

        <div className="rounded-lg border p-4 bg-muted/30 space-y-2">
          <p className="text-sm font-semibold">Preview</p>
          <p className="text-sm">Score: {computedScore}</p>
          <p className="text-sm">Severity: {computedSeverity}</p>
          <p className="text-sm">Mission: {currentMission.mission}</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : t('checkIn.saveButton')}
        </button>

        {saved && (
          <div className="rounded-md border border-green-500 bg-green-50 px-4 py-3 text-green-700">
            {t('checkIn.savedMessage')}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-500 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}
      </form>

      {result && (
        <section className="rounded-xl border p-6 bg-card shadow-sm space-y-4">
          <h2 className="text-2xl font-bold">{t('checkIn.resultTitle')}</h2>
          <div className="grid gap-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.totalScore')}</p>
              <p className="text-2xl font-bold">{result.score}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.category')}</p>
              <p className="text-lg font-semibold">{result.mission.category}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.assignedMission')}</p>
              <p className="text-lg font-semibold">{result.mission.mission}</p>
              <p className="text-sm mt-2 text-muted-foreground">{result.mission.description}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">{t('checkIn.dailyMission')}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {result.mission.tasks.map((task, index) => (
                  <li key={`${task}-${index}`}>{task}</li>
                ))}
              </ul>
            </div>

            {result.severity === 'severe' && (
              <div className="rounded-lg border border-red-400 bg-red-50 p-4">
                <p className="font-semibold text-red-700">{t('checkIn.alertTitle')}</p>
                <p className="text-red-700 mt-1">{t('checkIn.alertText')}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
