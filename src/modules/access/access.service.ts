import { getAdminDb } from '@/firebase/admin';
import { getFallbackRolePolicy, getSortedModuleCatalog, MODULE_CATALOG_FALLBACK } from '@/modules/access/module-catalog';
import { resolveAccess } from '@/modules/access/access.resolver';
import type { AccessRule, ModuleCatalogEntry, ResolvedAccess, RolePolicy, UserModuleOverrides } from '@/modules/access/access.types';
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
  } as UserProfile;
}

function normalizeModuleCatalog(moduleCatalog: ModuleCatalogEntry[]) {
  return getSortedModuleCatalog(moduleCatalog);
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

  if (!userSnap.exists) {
    throw new Error('user-not-found');
  }

  const rawUser = userSnap.data() as Partial<UserProfile>;
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

  const resolved = resolveAccess({
    user,
    rolePolicy,
    moduleCatalog,
    rules,
    overrides,
  });

  await db.collection('resolvedAccess').doc(userId).set(resolved, { merge: true });
  return resolved;
}
