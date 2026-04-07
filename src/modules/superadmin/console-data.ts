import 'server-only';

import { FieldValue } from 'firebase-admin/firestore';
import type { AccountRole } from '@/lib/account-role';
import { getAdminDb } from '@/lib/firebase-admin';
import type { AppAccessRole, ModuleVisibilityLimit, UserRole } from '@/models/user';
import { MODULE_CATALOG_FALLBACK, ROLE_POLICIES_FALLBACK } from '@/modules/access/module-catalog';
import type { ModuleCatalogEntry, ModuleKey, RolePolicy, UserModuleOverrides } from '@/modules/access/access.types';
import { mergeModuleCatalogWithFallback } from '@/modules/superadmin/module-catalog-utils';

const MODULE_KEY_SET = new Set<ModuleKey>(MODULE_CATALOG_FALLBACK.map((entry) => entry.key));

const FALLBACK_PATIENT_MODULES: ModuleKey[] = ['check-in', 'observer', 'progress'];

export const SUPERADMIN_THEME_PRESETS = [
  { id: 'aurora-light', name: 'Aurora Light', mode: 'light', primary: '#0F766E', secondary: '#14B8A6' },
  { id: 'clinical-white', name: 'Clinical White', mode: 'light', primary: '#1D4ED8', secondary: '#93C5FD' },
  { id: 'soft-gold', name: 'Soft Gold', mode: 'light', primary: '#A16207', secondary: '#FDE68A' },
  { id: 'ivory-zen', name: 'Ivory Zen', mode: 'light', primary: '#475569', secondary: '#CBD5E1' },
  { id: 'forest-balance', name: 'Forest Balance', mode: 'light', primary: '#166534', secondary: '#86EFAC' },
  { id: 'dark-blue', name: 'Dark Blue', mode: 'dark', primary: '#1D4ED8', secondary: '#60A5FA' },
  { id: 'graphite', name: 'Graphite', mode: 'dark', primary: '#64748B', secondary: '#94A3B8' },
  { id: 'night-teal', name: 'Night Teal', mode: 'dark', primary: '#0F766E', secondary: '#2DD4BF' },
  { id: 'deep-emerald', name: 'Deep Emerald', mode: 'dark', primary: '#065F46', secondary: '#34D399' },
  { id: 'midnight-gold', name: 'Midnight Gold', mode: 'dark', primary: '#CA8A04', secondary: '#FACC15' },
] as const;

export type SuperadminThemePreset = typeof SUPERADMIN_THEME_PRESETS[number];

export type ManagedUserRow = {
  id: string;
  email: string;
  displayName: string;
  role: AppAccessRole;
  userRole: UserRole;
  accountRole: AccountRole;
  accountStatus: 'active' | 'inactive';
  organizationName: string;
  moduleVisibilityLimit: ModuleVisibilityLimit;
  themePreset: string;
  adminNotes: string;
  createdAt: Date | null;
};

export type InviteRow = {
  id: string;
  email: string;
  role: AppAccessRole;
  status: 'pending' | 'revoked' | 'accepted' | 'expired';
  expiresAt: Date | null;
  createdAt: Date | null;
  allowedModules: ModuleKey[];
  notes: string;
};

export type ThemeAssignmentRow = {
  id: string;
  targetType: 'organization' | 'user';
  targetId: string;
  targetLabel: string;
  themePreset: string;
  primaryColor: string;
  secondaryColor: string;
  updatedAt: Date | null;
  updatedBy: string;
};

export type UserOverrideRow = {
  id: string;
  userId: string;
  manualAllow: ModuleKey[];
  manualDeny: ModuleKey[];
  pinnedPatientModules: ModuleKey[];
  updatedAt: Date | null;
  updatedBy: string;
};

function toDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }
  return null;
}

function normalizeModuleList(value: unknown): ModuleKey[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is ModuleKey => typeof entry === 'string' && MODULE_KEY_SET.has(entry as ModuleKey));
}

function normalizeBaseModules(value: unknown): Array<ModuleKey | '*'> {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (entry): entry is ModuleKey | '*' => typeof entry === 'string' && (entry === '*' || MODULE_KEY_SET.has(entry as ModuleKey)),
  );
}

export function resolveUserRoleFromAccessRole(role: AppAccessRole): UserRole {
  if (role === 'clinic') return 'clinic';
  if (role === 'professional') return 'professional';
  return 'patient';
}

export function normalizeVisibilityLimit(value: FormDataEntryValue | null): ModuleVisibilityLimit {
  if (value === 'all' || value === null) return 'all';
  const parsed = Number(value);
  if (parsed === 1 || parsed === 2 || parsed === 3) return parsed;
  return 'all';
}

export function normalizeSelectedModules(values: FormDataEntryValue[]): ModuleKey[] {
  return [...new Set(
    values
      .filter((entry): entry is string => typeof entry === 'string')
      .filter((entry): entry is ModuleKey => MODULE_KEY_SET.has(entry as ModuleKey))
  )];
}

function normalizeManagedUser(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): ManagedUserRow {
  const data = doc.data();
  const role = (typeof data.role === 'string' ? data.role : 'patient') as AppAccessRole;
  const userRole = (typeof data.userRole === 'string' ? data.userRole : resolveUserRoleFromAccessRole(role)) as UserRole;

  return {
    id: doc.id,
    email: typeof data.email === 'string' ? data.email : '',
    displayName: typeof data.displayName === 'string' ? data.displayName : 'Sin nombre',
    role,
    userRole,
    accountRole: (typeof data.accountRole === 'string' ? data.accountRole : 'viewer') as AccountRole,
    accountStatus: data.accountStatus === 'inactive' ? 'inactive' : 'active',
    organizationName: typeof data.organizationName === 'string' ? data.organizationName : '',
    moduleVisibilityLimit: [1, 2, 3].includes(data.moduleVisibilityLimit) ? data.moduleVisibilityLimit : 'all',
    themePreset: typeof data.themePreset === 'string' ? data.themePreset : '',
    adminNotes: typeof data.adminNotes === 'string' ? data.adminNotes : '',
    createdAt: toDateOrNull(data.createdAt),
  };
}

function normalizeInvite(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): InviteRow {
  const data = doc.data();
  return {
    id: doc.id,
    email: typeof data.email === 'string' ? data.email : '',
    role: (typeof data.role === 'string' ? data.role : 'guest') as AppAccessRole,
    status: (typeof data.status === 'string' ? data.status : 'pending') as InviteRow['status'],
    expiresAt: toDateOrNull(data.expiresAt),
    createdAt: toDateOrNull(data.createdAt),
    allowedModules: normalizeModuleList(data.allowedModules),
    notes: typeof data.notes === 'string' ? data.notes : '',
  };
}

function normalizeThemeAssignment(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): ThemeAssignmentRow {
  const data = doc.data();
  return {
    id: doc.id,
    targetType: data.targetType === 'organization' ? 'organization' : 'user',
    targetId: typeof data.targetId === 'string' ? data.targetId : '',
    targetLabel: typeof data.targetLabel === 'string' ? data.targetLabel : '',
    themePreset: typeof data.themePreset === 'string' ? data.themePreset : 'dark-blue',
    primaryColor: typeof data.primaryColor === 'string' ? data.primaryColor : '',
    secondaryColor: typeof data.secondaryColor === 'string' ? data.secondaryColor : '',
    updatedAt: toDateOrNull(data.updatedAt),
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : '',
  };
}

function normalizeOverride(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): UserOverrideRow {
  const data = doc.data() as UserModuleOverrides;
  return {
    id: doc.id,
    userId: doc.id,
    manualAllow: normalizeModuleList(data.manualAllow),
    manualDeny: normalizeModuleList(data.manualDeny),
    pinnedPatientModules: normalizeModuleList(data.pinnedPatientModules),
    updatedAt: toDateOrNull(data.updatedAt),
    updatedBy: typeof data.updatedBy === 'string' ? data.updatedBy : '',
  };
}

export function listModuleKeys(): ModuleKey[] {
  return MODULE_CATALOG_FALLBACK.map((entry) => entry.key);
}

export async function getManagedUsers(limit = 100): Promise<ManagedUserRow[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('users').orderBy('createdAt', 'desc').limit(limit).get().catch(() => db.collection('users').limit(limit).get());
  return snapshot.docs.map(normalizeManagedUser);
}

export async function saveManagedUser(input: {
  id?: string;
  email: string;
  displayName: string;
  role: AppAccessRole;
  userRole: UserRole;
  accountRole: AccountRole;
  accountStatus: 'active' | 'inactive';
  organizationName: string;
  moduleVisibilityLimit: ModuleVisibilityLimit;
  themePreset: string;
  adminNotes: string;
  actorEmail: string;
}) {
  const db = getAdminDb();
  const docId = input.id?.trim() || input.email.trim().toLowerCase() || `manual_${Date.now()}`;
  const userRef = db.collection('users').doc(docId);
  const snap = await userRef.get();
  const exists = snap.exists;
  const existing = exists ? snap.data() : null;

  const payload: Record<string, unknown> = {
    id: docId,
    email: input.email.trim().toLowerCase(),
    displayName: input.displayName.trim() || 'Sin nombre',
    role: input.role,
    userRole: input.userRole,
    accountRole: input.accountRole,
    requestedRole: input.userRole,
    isAdmin: input.accountRole === 'owner' || input.accountRole === 'manager' || input.accountRole === 'administrator',
    isAnonymous: input.role === 'guest',
    accountStatus: input.accountStatus,
    organizationName: input.organizationName.trim(),
    moduleVisibilityLimit: input.moduleVisibilityLimit,
    themePreset: input.themePreset.trim(),
    adminNotes: input.adminNotes.trim(),
    pinnedPatientModules: input.role === 'patient' ? FALLBACK_PATIENT_MODULES : [],
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: input.actorEmail,
  };

  if (!exists) {
    payload.createdAt = FieldValue.serverTimestamp();
    payload.level = 1;
    payload.currentXp = 0;
    payload.xpToNextLevel = 100;
    payload.photoURL = '';
    payload.therapistIds = [];
  } else {
    payload.createdAt = existing?.createdAt ?? FieldValue.serverTimestamp();
  }

  await userRef.set(payload, { merge: true });

  return docId;
}

export async function setManagedUserStatus(userId: string, status: 'active' | 'inactive', actorEmail: string) {
  const db = getAdminDb();
  await db.collection('users').doc(userId).set(
    {
      accountStatus: status,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorEmail,
    },
    { merge: true },
  );
}

export async function setManagedUserVisibilityLimit(userId: string, moduleVisibilityLimit: ModuleVisibilityLimit, actorEmail: string) {
  const db = getAdminDb();
  await db.collection('users').doc(userId).set(
    {
      moduleVisibilityLimit,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorEmail,
    },
    { merge: true },
  );
}

export async function deleteManagedUser(userId: string) {
  const db = getAdminDb();
  await Promise.all([
    db.collection('users').doc(userId).delete(),
    db.collection('resolvedAccess').doc(userId).delete().catch(() => undefined),
    db.collection('userModuleOverrides').doc(userId).delete().catch(() => undefined),
    db.collection('roles_admin').doc(userId).delete().catch(() => undefined),
  ]);
}

export async function getModuleCatalog() {
  const db = getAdminDb();
  const snapshot = await db.collection('moduleCatalog').orderBy('order', 'asc').get().catch(() => null);
  if (!snapshot || snapshot.empty) {
    return MODULE_CATALOG_FALLBACK;
  }

  const normalizedDocs = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      key: typeof data.key === 'string' ? data.key : doc.id,
    };
  }) as Array<Partial<Omit<ModuleCatalogEntry, 'key'>> & { key?: string }>;

  return mergeModuleCatalogWithFallback(normalizedDocs);
}

export async function saveModuleCatalogEnabled(enabledModules: ModuleKey[], actorEmail: string) {
  const db = getAdminDb();
  const enabledSet = new Set(enabledModules);
  const writes = MODULE_CATALOG_FALLBACK.map((module) =>
    db.collection('moduleCatalog').doc(module.key).set(
      {
        ...module,
        enabled: enabledSet.has(module.key),
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: actorEmail,
      },
      { merge: true },
    ),
  );
  await Promise.all(writes);
}

export async function getRolePolicies(): Promise<RolePolicy[]> {
  const db = getAdminDb();
  const roles: Array<AppAccessRole> = ['guest', 'patient', 'professional', 'clinic'];
  const docs = await Promise.all(roles.map((role) => db.collection('rolePolicies').doc(role).get().catch(() => null)));

  return roles.map((role, idx) => {
    const snap = docs[idx];
    if (snap && snap.exists) {
      return {
        role,
        baseModules: normalizeBaseModules(snap.data()?.baseModules ?? []),
        maxPatientModules: typeof snap.data()?.maxPatientModules === 'number' ? snap.data()?.maxPatientModules : undefined,
        canCreateModules: !!snap.data()?.canCreateModules,
      } as RolePolicy;
    }
    return ROLE_POLICIES_FALLBACK[role];
  });
}

export async function saveRolePolicy(policy: RolePolicy, actorEmail: string) {
  const db = getAdminDb();
  await db.collection('rolePolicies').doc(policy.role).set(
    {
      ...policy,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorEmail,
    },
    { merge: true },
  );
}

export async function getUserOverrides(limit = 100): Promise<UserOverrideRow[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('userModuleOverrides').limit(limit).get();
  return snapshot.docs.map(normalizeOverride);
}

export async function saveUserOverride(input: {
  userId: string;
  manualAllow: ModuleKey[];
  manualDeny: ModuleKey[];
  pinnedPatientModules: ModuleKey[];
  actorEmail: string;
}) {
  const db = getAdminDb();
  await db.collection('userModuleOverrides').doc(input.userId).set(
    {
      manualAllow: input.manualAllow,
      manualDeny: input.manualDeny,
      pinnedPatientModules: input.pinnedPatientModules.slice(0, 3),
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: input.actorEmail,
    },
    { merge: true },
  );
}

export async function getInvitations(limit = 100): Promise<InviteRow[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('superadminInvitations').orderBy('createdAt', 'desc').limit(limit).get().catch(() => db.collection('superadminInvitations').limit(limit).get());
  return snapshot.docs.map(normalizeInvite);
}

export async function createInvitation(input: {
  email: string;
  role: AppAccessRole;
  allowedModules: ModuleKey[];
  expiresAt: Date | null;
  notes: string;
  actorEmail: string;
}) {
  const db = getAdminDb();
  const ref = db.collection('superadminInvitations').doc();
  await ref.set({
    email: input.email.trim().toLowerCase(),
    role: input.role,
    status: 'pending',
    allowedModules: input.allowedModules,
    notes: input.notes.trim(),
    expiresAt: input.expiresAt ?? null,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: input.actorEmail,
    updatedAt: FieldValue.serverTimestamp(),
    updatedBy: input.actorEmail,
  });
}

export async function setInvitationStatus(inviteId: string, status: InviteRow['status'], actorEmail: string) {
  const db = getAdminDb();
  await db.collection('superadminInvitations').doc(inviteId).set(
    {
      status,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: actorEmail,
    },
    { merge: true },
  );
}

export async function deleteInvitation(inviteId: string) {
  const db = getAdminDb();
  await db.collection('superadminInvitations').doc(inviteId).delete();
}

export async function getThemeAssignments(limit = 100): Promise<ThemeAssignmentRow[]> {
  const db = getAdminDb();
  const snapshot = await db.collection('superadminThemeAssignments').orderBy('updatedAt', 'desc').limit(limit).get().catch(() => db.collection('superadminThemeAssignments').limit(limit).get());
  return snapshot.docs.map(normalizeThemeAssignment);
}

export async function assignTheme(input: {
  targetType: 'organization' | 'user';
  targetId: string;
  targetLabel: string;
  themePreset: string;
  primaryColor: string;
  secondaryColor: string;
  actorEmail: string;
}) {
  const db = getAdminDb();
  const assignmentId = `${input.targetType}:${input.targetId}`;
  await db.collection('superadminThemeAssignments').doc(assignmentId).set(
    {
      targetType: input.targetType,
      targetId: input.targetId,
      targetLabel: input.targetLabel,
      themePreset: input.themePreset,
      primaryColor: input.primaryColor,
      secondaryColor: input.secondaryColor,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: input.actorEmail,
    },
    { merge: true },
  );

  if (input.targetType === 'user') {
    await db.collection('users').doc(input.targetId).set(
      {
        themePreset: input.themePreset,
        branding: {
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
        },
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: input.actorEmail,
      },
      { merge: true },
    );
  }
}
