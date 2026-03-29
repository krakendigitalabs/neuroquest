import { cookies } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '@/firebase/admin';

export const AUTH_COOKIE_NAME = 'nq_id_token';

export async function readServerIdTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export async function verifyServerIdToken(idToken: string): Promise<DecodedIdToken> {
  return getAdminAuth().verifyIdToken(idToken, true);
}

export async function getOptionalServerUser(): Promise<DecodedIdToken | null> {
  const idToken = await readServerIdTokenCookie();

  if (!idToken) {
    return null;
  }

  try {
    return await verifyServerIdToken(idToken);
  } catch {
    return null;
  }
}

export async function requireServerUser(): Promise<DecodedIdToken> {
  const idToken = await readServerIdTokenCookie();

  if (!idToken) {
    throw new Error('unauthenticated');
  }

  return verifyServerIdToken(idToken);
}
