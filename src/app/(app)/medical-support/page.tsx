'use client';

import { ComingSoonPage } from '@/components/coming-soon-page';
import { useTranslation } from '@/context/language-provider';

export default function MedicalSupportPage() {
  const { t } = useTranslation();

  return (
    <ComingSoonPage
      title={t('upcoming.medicalSupportTitle')}
      description={t('upcoming.medicalSupportDescription')}
      backLabel={t('upcoming.backToDashboard')}
    />
  );
}
