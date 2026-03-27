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
      badge={t('upcoming.badge')}
      readyTitle={t('upcoming.readyTitle')}
      readyDescription={t('upcoming.readyDescription')}
      readyItems={[
        t('upcoming.readyItems.dashboard'),
        t('upcoming.readyItems.checkIn'),
        t('upcoming.readyItems.progress'),
        t('upcoming.readyItems.observer'),
        t('upcoming.readyItems.therapist'),
      ]}
    />
  );
}
