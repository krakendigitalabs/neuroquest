'use client';

import { Globe2, LayoutDashboard, Palette, ShieldCheck, Siren, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/context/language-provider';
import type { AccountRole } from '@/lib/account-role';
import type { UserRole } from '@/models/user';
import type {
  WorkspaceCrisisRouting,
  WorkspaceDashboardDensity,
  WorkspaceFollowUpMode,
  WorkspaceLanguage,
  WorkspaceSettings,
  WorkspaceThemePreset,
} from '@/models/workspace-settings';

type Props = {
  draft: WorkspaceSettings;
  saved: boolean;
  onUpdateSetting: <K extends keyof WorkspaceSettings>(field: K, value: WorkspaceSettings[K]) => void;
  onSave: () => void;
};

export function WorkspaceSettingsCard({ draft, saved, onUpdateSetting, onSave }: Props) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <CardTitle>{t('workspaceUsers.settingsTitle')}</CardTitle>
        </div>
        <CardDescription>{t('workspaceUsers.settingsDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-5">
          <label className="space-y-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Palette className="h-4 w-4 text-primary" />
              {t('workspaceUsers.settings.themePreset')}
            </span>
            <Select
              value={draft.themePreset}
              onValueChange={(value) => onUpdateSetting('themePreset', value as WorkspaceThemePreset)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark-blue">{t('workspaceUsers.themeOptions.dark-blue')}</SelectItem>
                <SelectItem value="clinical-white">{t('workspaceUsers.themeOptions.clinical-white')}</SelectItem>
                <SelectItem value="soft-gold">{t('workspaceUsers.themeOptions.soft-gold')}</SelectItem>
                <SelectItem value="graphite">{t('workspaceUsers.themeOptions.graphite')}</SelectItem>
                <SelectItem value="ivory">{t('workspaceUsers.themeOptions.ivory')}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Globe2 className="h-4 w-4 text-primary" />
              {t('workspaceUsers.settings.workspaceLanguage')}
            </span>
            <Select
              value={draft.workspaceLanguage}
              onValueChange={(value) => onUpdateSetting('workspaceLanguage', value as WorkspaceLanguage)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">{t('workspaceUsers.languageOptions.es')}</SelectItem>
                <SelectItem value="en">{t('workspaceUsers.languageOptions.en')}</SelectItem>
                <SelectItem value="bilingual">{t('workspaceUsers.languageOptions.bilingual')}</SelectItem>
                <SelectItem value="es-co">{t('workspaceUsers.languageOptions.es-co')}</SelectItem>
                <SelectItem value="es-mx">{t('workspaceUsers.languageOptions.es-mx')}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-primary" />
              {t('workspaceUsers.settings.defaultUserRole')}
            </span>
            <Select
              value={draft.defaultUserRole}
              onValueChange={(value) => onUpdateSetting('defaultUserRole', value as UserRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">{t('userRoles.patient')}</SelectItem>
                <SelectItem value="professional">{t('userRoles.professional')}</SelectItem>
                <SelectItem value="clinic">{t('userRoles.clinic')}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t('workspaceUsers.settings.defaultAccountRole')}
            </span>
            <Select
              value={draft.defaultAccountRole}
              onValueChange={(value) => onUpdateSetting('defaultAccountRole', value as AccountRole)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">{t('accountRoles.viewer')}</SelectItem>
                <SelectItem value="commentator">{t('accountRoles.commentator')}</SelectItem>
                <SelectItem value="editor">{t('accountRoles.editor')}</SelectItem>
                <SelectItem value="administrator">{t('accountRoles.administrator')}</SelectItem>
                <SelectItem value="manager">{t('accountRoles.manager')}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Siren className="h-4 w-4 text-primary" />
              {t('workspaceUsers.settings.crisisRouting')}
            </span>
            <Select
              value={draft.crisisRouting}
              onValueChange={(value) => onUpdateSetting('crisisRouting', value as WorkspaceCrisisRouting)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">{t('workspaceUsers.crisisOptions.strict')}</SelectItem>
                <SelectItem value="guided">{t('workspaceUsers.crisisOptions.guided')}</SelectItem>
                <SelectItem value="professional-first">{t('workspaceUsers.crisisOptions.professional-first')}</SelectItem>
                <SelectItem value="clinic-review">{t('workspaceUsers.crisisOptions.clinic-review')}</SelectItem>
                <SelectItem value="emergency-direct">{t('workspaceUsers.crisisOptions.emergency-direct')}</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">{t('workspaceUsers.settings.dashboardDensity')}</span>
            <Select
              value={draft.dashboardDensity}
              onValueChange={(value) => onUpdateSetting('dashboardDensity', value as WorkspaceDashboardDensity)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">{t('workspaceUsers.dashboardDensityOptions.compact')}</SelectItem>
                <SelectItem value="comfortable">{t('workspaceUsers.dashboardDensityOptions.comfortable')}</SelectItem>
                <SelectItem value="focused">{t('workspaceUsers.dashboardDensityOptions.focused')}</SelectItem>
                <SelectItem value="clinical">{t('workspaceUsers.dashboardDensityOptions.clinical')}</SelectItem>
                <SelectItem value="expanded">{t('workspaceUsers.dashboardDensityOptions.expanded')}</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">{t('workspaceUsers.settings.followUpMode')}</span>
            <Select
              value={draft.followUpMode}
              onValueChange={(value) => onUpdateSetting('followUpMode', value as WorkspaceFollowUpMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t('workspaceUsers.followUpOptions.daily')}</SelectItem>
                <SelectItem value="business-days">{t('workspaceUsers.followUpOptions.business-days')}</SelectItem>
                <SelectItem value="weekly">{t('workspaceUsers.followUpOptions.weekly')}</SelectItem>
                <SelectItem value="manual">{t('workspaceUsers.followUpOptions.manual')}</SelectItem>
                <SelectItem value="critical-only">{t('workspaceUsers.followUpOptions.critical-only')}</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-medium">{t('workspaceUsers.settingsSummaryTitle')}</p>
            <p className="text-sm text-muted-foreground">{t('workspaceUsers.settingsSummaryDescription')}</p>
          </div>
          <div className="flex items-center gap-3">
            {saved ? <span className="text-sm text-emerald-600">{t('workspaceUsers.settingsSaved')}</span> : null}
            <Button type="button" onClick={onSave}>
              {t('workspaceUsers.saveSettings')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
