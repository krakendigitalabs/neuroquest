import { NextRequest, NextResponse } from 'next/server';
import {
  SUPERADMIN_COOKIE_NAME,
  SUPERADMIN_UNLOCK_TTL_SECONDS,
  createSuperadminUnlockToken,
} from '@/lib/superadmin-config';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();
  const expectedPin = process.env.SUPERADMIN_PIN?.trim();

  if (!expectedPin || expectedPin.length !== 3) {
    return NextResponse.json({ error: 'superadmin-pin-not-configured' }, { status: 500 });
  }

  if (pin !== expectedPin) {
    return NextResponse.json({ error: 'invalid-pin' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  const host = request.nextUrl.hostname;
  const useSecureCookie =
    process.env.NODE_ENV === 'production' && host !== 'localhost' && host !== '127.0.0.1';
  response.cookies.set(SUPERADMIN_COOKIE_NAME, createSuperadminUnlockToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: useSecureCookie,
    path: '/',
    maxAge: SUPERADMIN_UNLOCK_TTL_SECONDS,
  });
  response.headers.set('Cache-Control', 'no-store');

  return response;
}
