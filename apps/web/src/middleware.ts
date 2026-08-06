import { HttpStatusCode } from 'axios';
import { getSessionCookie } from 'better-auth/cookies';
import { type NextRequest, NextResponse } from 'next/server';
import { match } from 'path-to-regexp';
import { API_AUTH_PREFIX, PROTECTED_ROUTES, PUBLIC_ROUTES } from './common/constants/routes';
import { api } from './trpc/server';
import { UserDto } from '@kikos/shared';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAccessingApiAuthRoute = pathname.startsWith(API_AUTH_PREFIX);
  const isAccessingAuthRoute = PUBLIC_ROUTES.some((route) => match(route)(pathname));

  const protectedRoute = PROTECTED_ROUTES.find((route) => match(route.route)(pathname));

  if (isAccessingApiAuthRoute || isAccessingAuthRoute) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(req);
  if (!sessionCookie) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  let user: UserDto | undefined;

  try {
    user = await api.users.me();
  } catch (error: any) {
    if (error.cause) {
      const { status } = error.cause;
      const isUnauthorized = status === HttpStatusCode.Unauthorized;

      if (isUnauthorized) {
        const url = new URL('/login', req.url);
        return NextResponse.redirect(url);
      }
    }
  }

  if (!user) {
    const url = new URL('/login', req.url);
    return NextResponse.redirect(url);
  }

  if (!user && protectedRoute) {
    const url = new URL('/login', req.url);
    url.searchParams.set('callbackUrl', encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  if (protectedRoute && !protectedRoute.roles.some((role) => role === user.role)) {
    const url = new URL('/forbidden', req.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
