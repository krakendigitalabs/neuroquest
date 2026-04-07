import { cookies, headers } from 'next/headers';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from '@/lib/firebase-admin';

export const AUTH_COOKIE_NAME = 'nq_id_token';

export async function readServerIdTokenCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  if (token) {
    console.info(`[server-session] read cookie present=${Boolean(token)}`);
    return token;
  }

  try {
    const headerStore = await headers();
    const authHeader = headerStore.get('authorization') ?? headerStore.get('Authorization');
    if (authHeader?.toLowerCase().startsWith('bearer ')) {
      const bearerToken = authHeader.slice('bearer '.length).trim();
      if (bearerToken) {
        console.info('[server-session] using bearer token from authorization header');
        return bearerToken;
      }
    }

    const explicitHeaderToken = headerStore.get('x-nq-id-token');
    if (explicitHeaderToken) {
      console.info('[server-session] using token from x-nq-id-token header');
      return explicitHeaderToken;
    }
  } catch {
    // ignore header resolution errors
  }

  console.info('[server-session] no auth token found in cookie or headers');
  return null;
}

export async function verifyServerIdToken(idToken: string): Promise<DecodedIdToken> {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);
  console.info(`[server-session] verified token uid=${decoded.uid} email=${decoded.email ?? 'n/a'}`);
  return decoded;
}

export async function getOptionalServerUser(): Promise<DecodedIdToken | null> {
  const idToken = await readServerIdTokenCookie();

  if (!idToken) {
    console.info('[server-session] no id token present');
    return null;
  }

  try {
    return await verifyServerIdToken(idToken);
  } catch (error) {
    console.warn('[server-session] failed to verify id token', {
      message: error instanceof Error ? error.message : 'unknown error',
    });
    return null;
  }
}

export async function requireServerUser(): Promise<DecodedIdToken> {
  const idToken = await readServerIdTokenCookie();

  if (!idToken) {
    console.warn('[server-session] requireServerUser missing token');
    throw new Error('unauthenticated');
  }

  return verifyServerIdToken(idToken);
}
