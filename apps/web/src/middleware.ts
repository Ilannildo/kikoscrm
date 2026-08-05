import {
  API_AUTH_PREFIX,
  PUBLIC_ROUTES,
  PROTECTED_ROUTES,
} from "./common/constants/routes";
import { match } from "path-to-regexp";
import { auth } from "./server/auth";
import { NextResponse } from "next/server";
import { me } from "./services/users.service";

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;
  let user = req.auth?.user.user;
  
  if (user && pathname === "/login") {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  const isAccessingApiAuthRoute = pathname.startsWith(API_AUTH_PREFIX);
  const isAccessingAuthRoute = PUBLIC_ROUTES.some((route) =>
    match(route)(pathname)
  );

  const protectedRoute = PROTECTED_ROUTES.find((route) =>
    match(route.route)(pathname)
  );

  // console.log("** middleware is available **");
  // console.log("pathname", pathname);
  // console.log("user", user);
  // console.log("isAccessingApiAuthRoute", isAccessingApiAuthRoute);
  // console.log("isAccessingAuthRoute", isAccessingAuthRoute);
  // console.log("protectedRoute", protectedRoute);

  if (isAccessingApiAuthRoute || isAccessingAuthRoute) {
    return NextResponse.next();
  }

  if (!user && protectedRoute) {
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", encodeURI(req.url));
    return NextResponse.redirect(url);
  }

  if (user) {
    try {
      user = await me();
    } catch (error: any) {
      if (error.response) {
        const { status } = error.response;
        const isUnauthorized = status === 401;

        if (isUnauthorized) {
          const url = new URL("/api/auth/logout", req.url);
          return Response.redirect(url);
        }
      }
    }
  }

  if (
    protectedRoute &&
    user &&
    !protectedRoute.roles.some((role) => role.includes(user.role))
  ) {
    const url = new URL("/forbidden", req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)",
};
