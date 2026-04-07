import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import {
  isAllowedSuperadminEmail,
  SUPERADMIN_COOKIE_NAME,
  SUPERADMIN_SESSION_COOKIE_NAME,
} from '@/lib/superadmin-config';

export const runtime = 'nodejs';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function shouldUseSecureCookie(hostname: string) {
  if (process.env.NODE_ENV !== 'production') {
    return false;
  }

  return hostname !== 'localhost' && hostname !== '127.0.0.1';
}

function buildCookieOptions(maxAge: number, secure: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure,
    path: '/',
    maxAge,
  };
}

async function extractToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (authHeader?.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice('bearer '.length).trim();
  }

  try {
    const payload = await request.json();
    if (payload && typeof payload === 'object' && typeof (payload as { token?: unknown }).token === 'string') {
      return (payload as { token: string }).token;
    }
  } catch {
    // ignore JSON parse failures
  }

  return null;
}

export async function POST(request: NextRequest) {
  const secure = shouldUseSecureCookie(request.nextUrl.hostname);
  const unlockedCookie = request.cookies.get(SUPERADMIN_COOKIE_NAME)?.value ?? null;

  if (unlockedCookie !== '1') {
    return NextResponse.json({ error: 'superadmin-gate-required' }, { status: 403 });
  }

  const token = await extractToken(request);
  if (!token) {
    return NextResponse.json({ error: 'missing-token' }, { status: 400 });
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(token, true);
    const email = decoded.email?.toLowerCase() ?? '';

    if (!isAllowedSuperadminEmail(email)) {
      const forbidden = NextResponse.json({ error: 'forbidden' }, { status: 403 });
      forbidden.cookies.set(SUPERADMIN_SESSION_COOKIE_NAME, '', buildCookieOptions(0, secure));
      return forbidden;
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(SUPERADMIN_SESSION_COOKIE_NAME, token, buildCookieOptions(SESSION_MAX_AGE_SECONDS, secure));
    return response;
  } catch {
    const response = NextResponse.json({ error: 'invalid-token' }, { status: 401 });
    response.cookies.set(SUPERADMIN_SESSION_COOKIE_NAME, '', buildCookieOptions(0, secure));
    return response;
  }
}

export async function DELETE(request: NextRequest) {
  const secure = shouldUseSecureCookie(request.nextUrl.hostname);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SUPERADMIN_SESSION_COOKIE_NAME, '', buildCookieOptions(0, secure));
  response.cookies.set(SUPERADMIN_COOKIE_NAME, '', buildCookieOptions(0, secure));
  return response;
}
