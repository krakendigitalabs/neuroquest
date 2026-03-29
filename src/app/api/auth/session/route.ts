import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/firebase/admin';
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
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'missing-token' }, { status: 400 });
    }

    await getAdminAuth().verifyIdToken(token, true);

    const secure = shouldUseSecureCookie(request.nextUrl.hostname);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(AUTH_COOKIE_NAME, token, buildSessionCookieOptions(SESSION_MAX_AGE_SECONDS, secure));
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch {
    const secure = shouldUseSecureCookie(request.nextUrl.hostname);
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
