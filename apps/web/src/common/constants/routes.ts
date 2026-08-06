import { UserRole } from "@kikos/shared";

export const API_AUTH_PREFIX = "/api/auth";

export const PUBLIC_ROUTES = ["/", "/login", "/register"];

export const PROTECTED_ROUTES = [
  // dashboard
  {
    route: "/dashboard",
    roles: [UserRole.admin, UserRole.seller],
  },
];
