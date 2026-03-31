import type { AppAccessRole, UserProfile } from '@/models/user';

export type ModuleKey =
  | 'check-in'
  | 'observer'
  | 'exposure'
  | 'reprogram'
  | 'regulation'
  | 'wellness'
  | 'medication'
  | 'grounding'
  | 'progress'
  | 'medical-support';

export type ModuleCatalogEntry = {
  key: ModuleKey;
  name: string;
  route: string;
  enabled: boolean;
  audience: AppAccessRole[];
  supportsAutoRules: boolean;
  order: number;
};

export type RolePolicy = {
  role: AppAccessRole;
  baseModules: Array<ModuleKey | '*'>;
  maxPatientModules?: number;
  canCreateModules: boolean;
};

export type AccessRule = {
  id: string;
  active: boolean;
  targetRoles: AppAccessRole[];
  condition: {
    latestCheckInLevel?: Array<'healthy' | 'mild' | 'moderate' | 'severe'>;
  };
  effect: {
    allowModules: ModuleKey[];
    denyModules: ModuleKey[];
    priority: number;
  };
};

export type UserModuleOverrides = {
  manualAllow: ModuleKey[];
  manualDeny: ModuleKey[];
  pinnedPatientModules: ModuleKey[];
  updatedAt?: unknown;
  updatedBy?: string;
};

export type ResolvedAccess = {
  userId: string;
  role: AppAccessRole;
  visibleModules: ModuleKey[];
  routeAccess: string[];
  actions: {
    canCreateModules: boolean;
    canManageWorkspaceUsers: boolean;
  };
  resolvedAt: string;
};

export type ResolveAccessInput = {
  user: UserProfile;
  rolePolicy: RolePolicy;
  moduleCatalog: ModuleCatalogEntry[];
  rules: AccessRule[];
  overrides: UserModuleOverrides | null;
};
