import { getAdminDb } from '@/lib/firebase-admin';

type RecentUser = {
  id: string;
  displayName: string;
  email: string;
  role: string;
  userRole: string;
  accountRole: string;
  createdAt: Date | null;
};

export type SuperadminDashboardSummary = {
  counters: {
    totalUsers: number;
    clinics: number;
    professionals: number;
    patients: number;
    guests: number;
    superadmins: number;
    moduleLimitedUsers: number;
  };
  recentUsers: RecentUser[];
};

async function getCount(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) {
  const aggregateSnapshot = await query.count().get();
  return Number(aggregateSnapshot.data().count ?? 0);
}

function toDateOrNull(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      return ((value as { toDate: () => Date }).toDate());
    } catch {
      return null;
    }
  }

  return null;
}

function normalizeRecentUser(doc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>): RecentUser {
  const data = doc.data();

  return {
    id: doc.id,
    displayName: typeof data.displayName === 'string' ? data.displayName : 'Sin nombre',
    email: typeof data.email === 'string' ? data.email : '',
    role: typeof data.role === 'string' ? data.role : 'patient',
    userRole: typeof data.userRole === 'string' ? data.userRole : 'patient',
    accountRole: typeof data.accountRole === 'string' ? data.accountRole : 'viewer',
    createdAt: toDateOrNull(data.createdAt),
  };
}

export async function getSuperadminDashboardSummary(): Promise<SuperadminDashboardSummary> {
  const db = getAdminDb();
  const usersCollection = db.collection('users');

  const [totalUsers, clinics, professionals, patients, guests, superadmins, moduleLimitedUsers] = await Promise.all([
    getCount(usersCollection),
    getCount(usersCollection.where('userRole', '==', 'clinic')),
    getCount(usersCollection.where('userRole', '==', 'professional')),
    getCount(usersCollection.where('userRole', '==', 'patient')),
    getCount(usersCollection.where('role', '==', 'guest')),
    getCount(db.collection('roles_admin')),
    getCount(usersCollection.where('moduleVisibilityLimit', 'in', [1, 2, 3])),
  ]);

  const recentUsersSnapshot = await usersCollection
    .orderBy('createdAt', 'desc')
    .limit(6)
    .get()
    .catch(() => usersCollection.limit(6).get());

  return {
    counters: {
      totalUsers,
      clinics,
      professionals,
      patients,
      guests,
      superadmins,
      moduleLimitedUsers,
    },
    recentUsers: recentUsersSnapshot.docs.map(normalizeRecentUser),
  };
}
