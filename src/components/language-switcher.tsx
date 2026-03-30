'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/context/language-provider';

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();

  return (
    <div className={cn('flex gap-1', className)}>
      <Button
        type="button"
        variant={locale === 'es' ? 'secondary' : 'ghost'}
        size="sm"
        className={cn('justify-start', compact ? 'px-3' : 'flex-1')}
        onClick={() => setLocale('es')}
      >
        <span className="flex h-6 w-6 items-center justify-center">ES</span>
        {!compact && <span>{t('languageSwitcher.spanish')}</span>}
      </Button>

      <Button
        type="button"
        variant={locale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className={cn('justify-start', compact ? 'px-3' : 'flex-1')}
        onClick={() => setLocale('en')}
      >
        <span className="flex h-6 w-6 items-center justify-center">EN</span>
        {!compact && <span>{t('languageSwitcher.english')}</span>}
      </Button>
    </div>
  );
}
