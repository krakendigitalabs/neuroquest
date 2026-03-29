import type { AppAccessRole } from '@/models/user';
import type { ModuleCatalogEntry, RolePolicy } from '@/modules/access/access.types';

export const MODULE_CATALOG_FALLBACK: ModuleCatalogEntry[] = [
  { key: 'check-in', name: 'Chequeo Mental', route: '/check-in', enabled: true, audience: ['guest', 'patient', 'professional', 'clinic'], supportsAutoRules: false, order: 1 },
  { key: 'observer', name: 'Observer', route: '/observer', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 2 },
  { key: 'exposure', name: 'Exposure', route: '/exposure', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 3 },
  { key: 'reprogram', name: 'Reprogram', route: '/reprogram', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 4 },
  { key: 'regulation', name: 'Regulation', route: '/regulation', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 5 },
  { key: 'wellness', name: 'Wellness', route: '/wellness', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 6 },
  { key: 'medication', name: 'Medication', route: '/medication', enabled: true, audience: ['professional', 'clinic'], supportsAutoRules: false, order: 7 },
  { key: 'grounding', name: 'Grounding', route: '/grounding', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 8 },
  { key: 'progress', name: 'Progress', route: '/progress', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 9 },
  { key: 'medical-support', name: 'Medical Support', route: '/medical-support', enabled: true, audience: ['patient', 'professional', 'clinic'], supportsAutoRules: true, order: 10 },
];

export const ROLE_POLICIES_FALLBACK: Record<AppAccessRole, RolePolicy> = {
  guest: { role: 'guest', baseModules: ['check-in'], maxPatientModules: 1, canCreateModules: false },
  patient: { role: 'patient', baseModules: ['check-in'], maxPatientModules: 3, canCreateModules: false },
  professional: { role: 'professional', baseModules: ['*'], canCreateModules: false },
  clinic: { role: 'clinic', baseModules: ['*'], canCreateModules: true },
};

export function getFallbackRolePolicy(role: AppAccessRole): RolePolicy {
  return ROLE_POLICIES_FALLBACK[role];
}

export function getSortedModuleCatalog(catalog: ModuleCatalogEntry[]): ModuleCatalogEntry[] {
  return [...catalog].sort((left, right) => left.order - right.order);
}
