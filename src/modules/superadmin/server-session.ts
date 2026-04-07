import 'server-only';

import { cookies } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '@/lib/firebase-admin';
import { isAllowedSuperadminEmail, SUPERADMIN_SESSION_COOKIE_NAME } from '@/lib/superadmin-config';

export async function readSuperadminSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SUPERADMIN_SESSION_COOKIE_NAME)?.value ?? null;
}

export async function verifySuperadminSessionToken(idToken: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);
  const email = decoded.email?.toLowerCase() ?? '';

  if (!isAllowedSuperadminEmail(email)) {
    throw new Error('forbidden-superadmin-email');
  }

  return decoded;
}

export async function getOptionalSuperadminServerUser(): Promise<DecodedIdToken | null> {
  const idToken = await readSuperadminSessionCookie();
  if (!idToken) return null;

  try {
    return await verifySuperadminSessionToken(idToken);
  } catch {
    return null;
  }
}

export async function requireSuperadminServerUser(): Promise<DecodedIdToken> {
  const idToken = await readSuperadminSessionCookie();
  if (!idToken) throw new Error('unauthenticated-superadmin');

  return verifySuperadminSessionToken(idToken);
}
