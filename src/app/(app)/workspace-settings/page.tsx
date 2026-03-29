'use client';

import { ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSettingsCard } from '@/components/workspace/workspace-settings-card';
import { useTranslation } from '@/context/language-provider';
import { useAccountAccess } from '@/hooks/use-account-access';
import { useWorkspaceSettings } from '@/hooks/use-workspace-settings';
import { requireAccountRole } from '@/modules/auth/guards';

export default function WorkspaceSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { accountRole, isLoading } = useAccountAccess();
  const canManageSettings = requireAccountRole(accountRole, 'administrator');
  const { draft, isLoading: isSettingsLoading, saved, updateSetting, saveSettings } =
    useWorkspaceSettings(canManageSettings);

  useEffect(() => {
    if (!isLoading && !canManageSettings) {
      router.push('/dashboard');
    }
  }, [canManageSettings, isLoading, router]);

  if (isLoading || isSettingsLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!canManageSettings) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_24%),linear-gradient(135deg,rgba(8,17,31,1)_0%,rgba(15,25,45,0.96)_48%,rgba(24,36,58,0.92)_100%)] p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.24)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-[#F2D16B]">
              <ShieldCheck className="h-4 w-4" />
              {t('workspaceUsers.consoleBadge')}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {t('workspaceUsers.settingsTitle')}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                {t('workspaceUsers.settingsDescription')}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="border-0 bg-white/12 px-4 py-2 text-white">
            {t(`accountRoles.${accountRole ?? 'viewer'}`)}
          </Badge>
        </div>
      </section>

      <WorkspaceSettingsCard
        draft={draft}
        saved={saved}
        onUpdateSetting={updateSetting}
        onSave={saveSettings}
      />
    </div>
  );
}
