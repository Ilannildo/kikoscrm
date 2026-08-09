import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';
import { API_AUTH_PREFIX, PUBLIC_ROUTES } from './common/constants/routes';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAccessingApiAuthRoute = pathname.startsWith(API_AUTH_PREFIX);
  const isAccessingAuthRoute = PUBLIC_ROUTES.some((route) => match(route)(pathname));
  

  if (isAccessingApiAuthRoute || isAccessingAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
