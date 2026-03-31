import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { AUTH_COOKIE_NAME } from '@/modules/auth/server-session';

export const runtime = 'nodejs';

const SESSION_MAX_AGE_SECONDS = 60 * 60;

function shouldUseSecureCookie(hostname: string) {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}

function buildSessionCookieOptions(maxAge: number, secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge,
  };
}

type TokenSource = 'authorization header' | 'request body' | 'unknown';

async function extractToken(request: NextRequest): Promise<{ token: string | null; source: TokenSource }> {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return { token: authHeader.slice('bearer '.length).trim(), source: 'authorization header' };
  }

  try {
    const payload = await request.json();
    if (payload && typeof payload === 'object' && typeof (payload as { token?: unknown }).token === 'string') {
      return { token: (payload as { token: string }).token, source: 'request body' };
    }
  } catch {
    // ignore JSON parse failures
  }

  return { token: null, source: 'unknown' };
}

function isConfigError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return ['firebase-admin-config-missing', 'firebase-admin-project-mismatch'].includes(error.message);
}

function isFirebaseAuthError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const firebaseErrorCode = (error as { code?: string }).code;
  return typeof firebaseErrorCode === 'string' && firebaseErrorCode.startsWith('auth/');
}

export async function POST(request: NextRequest) {
  const secure = shouldUseSecureCookie(request.nextUrl.hostname);
  const tokenInfo = await extractToken(request);

  console.info(
    `[auth/session] token extraction source=${tokenInfo.source} tokenPresent=${Boolean(tokenInfo.token)}`
  );

  if (!tokenInfo.token) {
    const response = NextResponse.json({ error: 'missing-token' }, { status: 400 });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(tokenInfo.token, true);
    console.info(
      `[auth/session] verified token uid=${decodedToken.uid} email=${decodedToken.email ?? 'n/a'} auth_time=${decodedToken.auth_time ?? 'n/a'}`
    );
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      AUTH_COOKIE_NAME,
      tokenInfo.token,
      buildSessionCookieOptions(SESSION_MAX_AGE_SECONDS, secure)
    );
    response.headers.set('Cache-Control', 'no-store');
    console.info(`[auth/session] session cookie written secure=${secure}`);
    return response;
  } catch (error) {
    if (isConfigError(error)) {
      console.error(
        '[auth/session] Firebase admin configuration missing or mismatched.',
        { reason: (error as Error).message }
      );
      const response = NextResponse.json({ error: 'server-auth-config-missing' }, { status: 500 });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    if (isFirebaseAuthError(error) || error instanceof Error) {
      const response = NextResponse.json({ error: 'invalid-token' }, { status: 401 });
      response.cookies.set(AUTH_COOKIE_NAME, '', buildSessionCookieOptions(0, secure));
      response.headers.set('Cache-Control', 'no-store');
      console.warn('[auth/session] invalid Firebase token', {
        message: error instanceof Error ? error.message : 'unknown',
      });
      return response;
    }

    const response = NextResponse.json({ error: 'unexpected-error' }, { status: 500 });
    response.headers.set('Cache-Control', 'no-store');
    console.error('[auth/session] unexpected error', error);
    return response;
  }
}

export async function DELETE(request: NextRequest) {
  const secure = shouldUseSecureCookie(request.nextUrl.hostname);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', buildSessionCookieOptions(0, secure));
  response.headers.set('Cache-Control', 'no-store');
  console.info('[auth/session] session cookie cleared');
  return response;
}
