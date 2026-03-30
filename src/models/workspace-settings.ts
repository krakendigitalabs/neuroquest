import type { AccountRole } from '@/lib/account-role';
import type { UserRole } from '@/models/user';

export type WorkspaceThemePreset = 'dark-blue' | 'clinical-white' | 'soft-gold' | 'graphite' | 'ivory';
export type WorkspaceLanguage = 'es' | 'en' | 'bilingual' | 'es-co' | 'es-mx';
export type WorkspaceCrisisRouting = 'strict' | 'guided' | 'professional-first' | 'clinic-review' | 'emergency-direct';
export type WorkspaceDashboardDensity = 'compact' | 'comfortable' | 'focused' | 'clinical' | 'expanded';
export type WorkspaceFollowUpMode = 'daily' | 'business-days' | 'weekly' | 'manual' | 'critical-only';

export type WorkspaceSettings = {
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
