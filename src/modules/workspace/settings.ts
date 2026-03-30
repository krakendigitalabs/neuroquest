import type { WorkspaceSettings } from '@/models/workspace-settings';

export const DEFAULT_WORKSPACE_SETTINGS: WorkspaceSettings = {
  themePreset: 'dark-blue',
  defaultUserRole: 'patient',
  defaultAccountRole: 'viewer',
  crisisRouting: 'professional-first',
  workspaceLanguage: 'es',
  dashboardDensity: 'comfortable',
  followUpMode: 'daily',
};

export const WORKSPACE_SETTINGS_DOC_PATH = ['workspaceSettings', 'default'] as const;
