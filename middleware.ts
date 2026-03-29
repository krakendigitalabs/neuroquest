import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/modules/auth/server-session';
import { pathnameMatches, WORKSPACE_ADMIN_PATHS } from '@/modules/auth/permissions';

const AUTH_PROTECTED_PATHS = [
  '/dashboard',
  '/check-in',
  '/observer',
  '/exposure',
  '/reprogram',
  '/regulation',
  '/wellness',
  '/medication',
  '/grounding',
  '/progress',
  '/medical-support',
  '/superadmin',
  ...WORKSPACE_ADMIN_PATHS,
];

const PUBLIC_PATH_EXCEPTIONS = ['/superadmin/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicException = pathnameMatches(pathname, PUBLIC_PATH_EXCEPTIONS);
  const requiresAuthCookie = !isPublicException && pathnameMatches(pathname, AUTH_PROTECTED_PATHS);

  if (!requiresAuthCookie) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (authCookie) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('next', pathname);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/check-in/:path*',
    '/observer/:path*',
    '/exposure/:path*',
    '/reprogram/:path*',
    '/regulation/:path*',
    '/wellness/:path*',
    '/medication/:path*',
    '/grounding/:path*',
    '/progress/:path*',
    '/medical-support/:path*',
    '/superadmin/:path*',
    '/workspace-users/:path*',
    '/workspace-settings/:path*',
    '/workspace-audit/:path*',
  ],
};
