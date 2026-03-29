'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, doc, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Globe2, LayoutDashboard, Palette, ShieldCheck, Siren, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/context/language-provider';
import { useCollection, useDoc, useFirebase, useMemoFirebase } from '@/firebase';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useAccountAccess } from '@/hooks/use-account-access';
import { AccountRole, getAssignableAccountRoles } from '@/lib/account-role';
import type { UserProfile, UserRole } from '@/models/user';

type DraftRow = {
  accountRole: AccountRole;
  userRole: UserRole;
};

type WorkspaceThemePreset = 'dark-blue' | 'clinical-white' | 'soft-gold' | 'graphite' | 'ivory';
type WorkspaceLanguage = 'es' | 'en' | 'bilingual' | 'es-co' | 'es-mx';
type WorkspaceCrisisRouting = 'strict' | 'guided' | 'professional-first' | 'clinic-review' | 'emergency-direct';
type WorkspaceDashboardDensity = 'compact' | 'comfortable' | 'focused' | 'clinical' | 'expanded';
type WorkspaceFollowUpMode = 'daily' | 'business-days' | 'weekly' | 'manual' | 'critical-only';

type WorkspaceSettings = {
  themePreset: WorkspaceThemePreset;
  defaultUserRole: UserRole;
  defaultAccountRole: AccountRole;
  crisisRouting: WorkspaceCrisisRouting;
  workspaceLanguage: WorkspaceLanguage;
  dashboardDensity: WorkspaceDashboardDensity;
  followUpMode: WorkspaceFollowUpMode;
  updatedAt?: unknown;
  updatedBy?: string;
};

const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  themePreset: 'dark-blue',
  defaultUserRole: 'patient',
  defaultAccountRole: 'viewer',
  crisisRouting: 'professional-first',
  workspaceLanguage: 'es',
  dashboardDensity: 'comfortable',
  followUpMode: 'daily',
};

export default function WorkspaceUsersPage() {
  const { t } = useTranslation();
  const { firestore, user } = useFirebase();
  const { accountRole, canManageWorkspaceUsers, isLoading } = useAccountAccess();
  const router = useRouter();
  const [drafts, setDrafts] = useState<Record<string, DraftRow>>({});
  const [settingsDraft, setSettingsDraft] = useState<WorkspaceSettings>(DEFAULT_WORKSPACE_SETTINGS);
  const [settingsTouched, setSettingsTouched] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore || !canManageWorkspaceUsers) return null;

    return query(collection(firestore, 'users'), orderBy('displayName', 'asc'));
  }, [canManageWorkspaceUsers, firestore]);
  const { data: users, isLoading: areUsersLoading } = useCollection<UserProfile>(usersQuery);

  const settingsRef = useMemoFirebase(() => {
    if (!firestore || !canManageWorkspaceUsers) return null;

    return doc(firestore, 'workspaceSettings', 'default');
  }, [canManageWorkspaceUsers, firestore]);
  const { data: settingsDoc, isLoading: isSettingsLoading } = useDoc<WorkspaceSettings>(settingsRef);

  const assignableAccountRoles = useMemo(
    () => getAssignableAccountRoles(accountRole),
    [accountRole]
  );

  useEffect(() => {
    if (!isLoading && !canManageWorkspaceUsers) {
      router.push('/dashboard');
    }
  }, [canManageWorkspaceUsers, isLoading, router]);

  useEffect(() => {
    if (!settingsDoc || settingsTouched) return;

    setSettingsDraft({
      ...DEFAULT_WORKSPACE_SETTINGS,
      ...settingsDoc,
    });
  }, [settingsDoc, settingsTouched]);

  const sortedUsers = useMemo(() => [...(users ?? [])], [users]);

  const setDraftField = (userId: string, field: keyof DraftRow, value: string) => {
    const currentUser = sortedUsers.find((entry) => entry.id === userId);
    if (!currentUser) return;

    setDrafts((current) => ({
      ...current,
      [userId]: {
        accountRole: current[userId]?.accountRole ?? currentUser.accountRole,
        userRole: current[userId]?.userRole ?? currentUser.userRole,
        [field]: value,
      } as DraftRow,
    }));
  };

  const updateSetting = <K extends keyof WorkspaceSettings>(field: K, value: WorkspaceSettings[K]) => {
    setSettingsTouched(true);
    setSettingsSaved(false);
    setSettingsDraft((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const workspaceStats = useMemo(() => {
    const totalUsers = sortedUsers.length;
    const clinicalUsers = sortedUsers.filter((entry) => entry.userRole === 'clinic').length;
    const professionalUsers = sortedUsers.filter((entry) => entry.userRole === 'professional').length;
    const managedUsers = sortedUsers.filter((entry) =>
      ['owner', 'manager', 'administrator'].includes(entry.accountRole)
    ).length;

    return { totalUsers, clinicalUsers, professionalUsers, managedUsers };
  }, [sortedUsers]);

  if (isLoading || areUsersLoading || isSettingsLoading) {
    return <div>{t('loading')}</div>;
  }

  if (!canManageWorkspaceUsers) {
    return null;
  }

  return (
    <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
      <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_24%),linear-gradient(135deg,rgba(8,17,31,1)_0%,rgba(15,25,45,0.96)_48%,rgba(24,36,58,0.92)_100%)] p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.24)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-[#F2D16B]">
              <ShieldCheck className="h-4 w-4" />
              {t('workspaceUsers.consoleBadge')}
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {t('workspaceUsers.title')}
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-white/72 md:text-base">
                {t('workspaceUsers.description')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary" className="border-0 bg-white/12 px-4 py-2 text-white">
              {t(`accountRoles.${accountRole ?? 'viewer'}`)}
            </Badge>
            <Badge variant="secondary" className="border-0 bg-[#D4AF37]/18 px-4 py-2 text-[#F8E6A0]">
              {t('workspaceUsers.serverControlled')}
            </Badge>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">{t('workspaceUsers.stats.totalUsers')}</p>
            <p className="mt-2 text-3xl font-semibold">{workspaceStats.totalUsers}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">{t('workspaceUsers.stats.clinics')}</p>
            <p className="mt-2 text-3xl font-semibold">{workspaceStats.clinicalUsers}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">{t('workspaceUsers.stats.professionals')}</p>
            <p className="mt-2 text-3xl font-semibold">{workspaceStats.professionalUsers}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">{t('workspaceUsers.stats.operators')}</p>
            <p className="mt-2 text-3xl font-semibold">{workspaceStats.managedUsers}</p>
          </div>
        </div>
      </section>

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
                value={settingsDraft.themePreset}
                onValueChange={(value) => updateSetting('themePreset', value as WorkspaceThemePreset)}
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
                value={settingsDraft.workspaceLanguage}
                onValueChange={(value) => updateSetting('workspaceLanguage', value as WorkspaceLanguage)}
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
                value={settingsDraft.defaultUserRole}
                onValueChange={(value) => updateSetting('defaultUserRole', value as UserRole)}
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
                value={settingsDraft.defaultAccountRole}
                onValueChange={(value) => updateSetting('defaultAccountRole', value as AccountRole)}
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
                value={settingsDraft.crisisRouting}
                onValueChange={(value) => updateSetting('crisisRouting', value as WorkspaceCrisisRouting)}
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
                value={settingsDraft.dashboardDensity}
                onValueChange={(value) => updateSetting('dashboardDensity', value as WorkspaceDashboardDensity)}
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
                value={settingsDraft.followUpMode}
                onValueChange={(value) => updateSetting('followUpMode', value as WorkspaceFollowUpMode)}
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
              {settingsSaved ? (
                <span className="text-sm text-emerald-600">{t('workspaceUsers.settingsSaved')}</span>
              ) : null}
              <Button
                type="button"
                onClick={() => {
                  if (!settingsRef) return;

                  setDocumentNonBlocking(
                    settingsRef,
                    {
                      ...settingsDraft,
                      updatedAt: serverTimestamp(),
                      updatedBy: user?.uid ?? '',
                    },
                    { merge: true }
                  );
                  setSettingsSaved(true);
                }}
              >
                {t('workspaceUsers.saveSettings')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>{t('workspaceUsers.guardrailsTitle')}</CardTitle>
          </div>
          <CardDescription>{t('workspaceUsers.guardrailsDescription')}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>{t('workspaceUsers.listTitle')}</CardTitle>
          </div>
          <CardDescription>{t('workspaceUsers.listDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedUsers.map((entry) => {
            const draft = drafts[entry.id];
            const currentAccountRole = draft?.accountRole ?? entry.accountRole;
            const currentUserRole = draft?.userRole ?? entry.userRole;
            const hasChanges =
              currentAccountRole !== entry.accountRole ||
              currentUserRole !== entry.userRole;

            return (
              <div key={entry.id} className="rounded-2xl border border-border/60 bg-card p-4">
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_0.8fr_auto] xl:items-center">
                  <div className="space-y-1">
                    <p className="font-medium">{entry.displayName || entry.email || entry.id}</p>
                    <p className="text-sm text-muted-foreground">{entry.email || entry.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('workspaceUsers.currentSummary', {
                        accountRole: t(`accountRoles.${entry.accountRole}`),
                        userRole: t(`userRoles.${entry.userRole}`),
                      })}
                    </p>
                  </div>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium">{t('workspaceUsers.accountRoleLabel')}</span>
                    <Select
                      value={currentAccountRole}
                      onValueChange={(value) => setDraftField(entry.id, 'accountRole', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {assignableAccountRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {t(`accountRoles.${role}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>

                  <label className="space-y-2 text-sm">
                    <span className="font-medium">{t('workspaceUsers.userRoleLabel')}</span>
                    <Select
                      value={currentUserRole}
                      onValueChange={(value) => setDraftField(entry.id, 'userRole', value)}
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

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      disabled={!hasChanges}
                      onClick={() => {
                        if (!firestore) return;

                        const docRef = doc(firestore, 'users', entry.id);
                        updateDocumentNonBlocking(docRef, {
                          accountRole: currentAccountRole,
                          userRole: currentUserRole,
                        });
                        setDrafts((current) => {
                          const next = { ...current };
                          delete next[entry.id];
                          return next;
                        });
                      }}
                    >
                      {t('workspaceUsers.save')}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
