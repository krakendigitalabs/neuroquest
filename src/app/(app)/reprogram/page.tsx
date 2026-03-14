'use client';

import { CognitiveReprogrammer } from "./_components/cognitive-reprogrammer";
import { useTranslation } from "@/context/language-provider";

export default function ReprogramPage() {
  const { t } = useTranslation();
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">{t('reprogram.title')}</h1>
      </div>
      <p className="text-muted-foreground">
        {t('reprogram.description')}
      </p>

      <div className="mt-6">
        <CognitiveReprogrammer />
      </div>
    </div>
  );
}
