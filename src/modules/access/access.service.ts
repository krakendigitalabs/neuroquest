import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import { getFallbackRolePolicy, getSortedModuleCatalog, MODULE_CATALOG_FALLBACK } from '@/modules/access/module-catalog';
import { resolveAccess } from '@/modules/access/access.resolver';
import type { AccessRule, ModuleCatalogEntry, ModuleKey, ResolvedAccess, RolePolicy, UserModuleOverrides } from '@/modules/access/access.types';
import type { UserProfile } from '@/models/user';

function resolveUserRole(rawUser: Partial<UserProfile>) {
  if (rawUser.role) {
    return rawUser.role;
  }

  if (rawUser.isAnonymous) {
    return 'guest';
  }

  if (rawUser.userRole === 'professional') {
    return 'professional';
  }

  if (rawUser.userRole === 'clinic') {
    return 'clinic';
  }

  return 'patient';
}

function normalizeUserProfile(userId: string, rawUser: Partial<UserProfile>): UserProfile {
  const role = resolveUserRole(rawUser);

  return {
    ...rawUser,
    id: userId,
    role,
    pinnedPatientModules: rawUser.pinnedPatientModules ?? [],
    moduleVisibilityLimit: rawUser.moduleVisibilityLimit ?? 'all',
  } as UserProfile;
}

function normalizeModuleCatalog(moduleCatalog: ModuleCatalogEntry[]) {
  return getSortedModuleCatalog(moduleCatalog);
}

const SPECIAL_MODULE_ACCESS_EMAILS_ENV = 'SPECIAL_MODULE_ACCESS_EMAILS';
const SPECIAL_MODULE_ACCESS_EMAILS_DEFAULT = ['tortasmariasnecocli@gmail.com'];

const specialModuleAccessEmails = createSpecialModuleAccessSet();

function createSpecialModuleAccessSet(): Set<string> {
  const envValue = process.env[SPECIAL_MODULE_ACCESS_EMAILS_ENV] ?? '';
  const envEmails = envValue
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  const normalized = [
    ...SPECIAL_MODULE_ACCESS_EMAILS_DEFAULT.map((entry) => entry.toLowerCase()),
    ...envEmails,
  ].filter(Boolean);

  return new Set(normalized);
}

function buildSpecialModuleOverrides(email: string | undefined, moduleCatalog: ModuleCatalogEntry[]): UserModuleOverrides | null {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  if (!specialModuleAccessEmails.has(normalizedEmail)) {
    return null;
  }

  const moduleKeys = moduleCatalog.map((entry) => entry.key);
  return {
    manualAllow: moduleKeys,
    manualDeny: [],
    pinnedPatientModules: moduleKeys,
    updatedAt: new Date().toISOString(),
    updatedBy: 'special-module-access',
  };
}

function mergeUserModuleOverrides(base: UserModuleOverrides | null, extra: UserModuleOverrides | null): UserModuleOverrides | null {
  if (!base && !extra) {
    return null;
  }

  const manualAllow = [...new Set<ModuleKey>([
    ...(base?.manualAllow ?? []),
    ...(extra?.manualAllow ?? []),
  ])];

  const manualDeny = [...new Set<ModuleKey>([
    ...(base?.manualDeny ?? []),
    ...(extra?.manualDeny ?? []),
  ])];

  const pinnedPatientModules = base?.pinnedPatientModules?.length
    ? base.pinnedPatientModules
    : extra?.pinnedPatientModules ?? [];

  const updatedAt = extra?.updatedAt ?? base?.updatedAt;
  const updatedBy = extra?.updatedBy ?? base?.updatedBy;

  if (!manualAllow.length && !manualDeny.length && !pinnedPatientModules.length && !updatedAt && !updatedBy) {
    return null;
  }

  const merged: UserModuleOverrides = {
    manualAllow,
    manualDeny,
    pinnedPatientModules,
  };

  if (updatedAt) {
    merged.updatedAt = updatedAt;
  }

  if (updatedBy) {
    merged.updatedBy = updatedBy;
  }

  return merged;
}

async function bootstrapMissingUserProfile(userId: string) {
  const authUser = await getAdminAuth().getUser(userId);
  const db = getAdminDb();
  const isAnonymous = authUser.providerData.length === 0;
  const role = isAnonymous ? 'guest' : 'patient';

  const fallbackProfile: Partial<UserProfile> = {
    id: userId,
    email: authUser.email ?? '',
    displayName: authUser.displayName || (isAnonymous ? 'Invitado' : 'Usuario'),
    photoURL: authUser.photoURL ?? '',
    role,
    userRole: 'patient',
    accountRole: 'viewer',
    requestedRole: 'patient',
    pinnedPatientModules: role === 'patient' ? ['check-in', 'observer', 'progress'] : [],
    level: 1,
    currentXp: 0,
    xpToNextLevel: 100,
    isAdmin: false,
    isAnonymous,
    therapistIds: [],
    latestThoughtAt: null,
    latestThoughtEmotion: '',
    latestThoughtIntensity: 0,
    latestThoughtLabel: '',
    latestThoughtPreview: '',
    latestThoughtIsIntrusive: false,
    moduleVisibilityLimit: 'all',
  };

  await db.collection('users').doc(userId).set(fallbackProfile, { merge: true });
  return fallbackProfile;
}

export async function getResolvedAccessForUser(userId: string): Promise<ResolvedAccess> {
  const db = getAdminDb();

  const [userSnap, moduleCatalogSnap, rulesSnap, overridesSnap, guestPolicySnap, patientPolicySnap, professionalPolicySnap, clinicPolicySnap] = await Promise.all([
    db.collection('users').doc(userId).get(),
    db.collection('moduleCatalog').orderBy('order', 'asc').get().catch(() => null),
    db.collection('accessRules').where('active', '==', true).get().catch(() => null),
    db.collection('userModuleOverrides').doc(userId).get().catch(() => null),
    db.collection('rolePolicies').doc('guest').get().catch(() => null),
    db.collection('rolePolicies').doc('patient').get().catch(() => null),
    db.collection('rolePolicies').doc('professional').get().catch(() => null),
    db.collection('rolePolicies').doc('clinic').get().catch(() => null),
  ]);

  const rawUser = userSnap.exists
    ? (userSnap.data() as Partial<UserProfile>)
    : await bootstrapMissingUserProfile(userId);
  const user = normalizeUserProfile(userSnap.id, rawUser);

  const policySnapshots = {
    guest: guestPolicySnap,
    patient: patientPolicySnap,
    professional: professionalPolicySnap,
    clinic: clinicPolicySnap,
  };

  const rolePolicy = (
    policySnapshots[user.role]?.exists
      ? policySnapshots[user.role]?.data()
      : getFallbackRolePolicy(user.role)
  ) as RolePolicy;

  const moduleCatalog = normalizeModuleCatalog((moduleCatalogSnap?.docs?.length
    ? moduleCatalogSnap.docs.map((doc) => doc.data() as ModuleCatalogEntry)
    : MODULE_CATALOG_FALLBACK) as ModuleCatalogEntry[]);

  const rules = (rulesSnap?.docs?.length
    ? rulesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as AccessRule))
    : []) as AccessRule[];

  const overrides = (overridesSnap?.exists ? overridesSnap.data() : null) as UserModuleOverrides | null;
  const specialOverrides = buildSpecialModuleOverrides(user.email, moduleCatalog);
  const mergedOverrides = mergeUserModuleOverrides(overrides, specialOverrides);

  const resolved = resolveAccess({
    user,
    rolePolicy,
    moduleCatalog,
    rules,
    overrides: mergedOverrides,
  });

  await db.collection('resolvedAccess').doc(userId).set(resolved, { merge: true });
  return resolved;
}
