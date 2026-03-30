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

export async function POST(request: NextRequest) {
  const secure = shouldUseSecureCookie(request.nextUrl.hostname);

  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'missing-token' }, { status: 400 });
    }

    const decodedToken = await getAdminAuth().verifyIdToken(token, true);
    console.info(
      `[auth/session] verified uid=${decodedToken.uid} email=${decodedToken.email ?? 'n/a'}`
    );

    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE_NAME, token, buildSessionCookieOptions(SESSION_MAX_AGE_SECONDS, secure));
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch (error) {
    const isConfigError =
      error instanceof Error &&
      (error.message === 'firebase-admin-config-missing' || error.message === 'firebase-admin-project-mismatch');

    if (isConfigError) {
      console.error('[auth/session] Firebase admin configuration missing or mismatched.', error);
      const response = NextResponse.json({ error: 'server-auth-config-missing' }, { status: 500 });
      response.headers.set('Cache-Control', 'no-store');
      return response;
    }

    console.warn('[auth/session] invalid token', error);
    const response = NextResponse.json({ error: 'invalid-token' }, { status: 401 });
    response.cookies.set(AUTH_COOKIE_NAME, '', buildSessionCookieOptions(0, secure));
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }
}

export async function DELETE(request: NextRequest) {
  const secure = shouldUseSecureCookie(request.nextUrl.hostname);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, '', buildSessionCookieOptions(0, secure));
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
