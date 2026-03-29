import { NextRequest, NextResponse } from 'next/server';
import { SUPERADMIN_COOKIE_NAME } from '@/lib/superadmin-config';

const SERVER_GATED_PATHS = ['/superadmin/login', '/workspace-users'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const requiresSuperadminCookie = SERVER_GATED_PATHS.some((path) => pathname.startsWith(path));

  if (!requiresSuperadminCookie) {
    return NextResponse.next();
  }

  const unlocked = request.cookies.get(SUPERADMIN_COOKIE_NAME)?.value === '1';
  if (unlocked) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/superadmin';
  url.searchParams.set('next', pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/superadmin/login/:path*', '/workspace-users/:path*'],
};
