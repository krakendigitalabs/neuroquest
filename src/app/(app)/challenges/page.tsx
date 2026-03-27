'use client';

import { ComingSoonPage } from '@/components/coming-soon-page';
import { useTranslation } from '@/context/language-provider';

export default function ChallengesPage() {
  const { t } = useTranslation();

  return (
    <ComingSoonPage
      title={t('upcoming.challengesTitle')}
      description={t('upcoming.challengesDescription')}
      backLabel={t('upcoming.backToDashboard')}
    />
  );
}
