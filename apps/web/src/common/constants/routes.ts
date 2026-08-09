import { UserRole } from "@kikos/shared";

export const API_AUTH_PREFIX = "/api/auth";

export const PUBLIC_ROUTES = ["/", "/login", "/register"];

export const PROTECTED_ROUTES = [
  {
    route: "/dashboard",
    roles: [UserRole.admin, UserRole.seller],
  },
  {
    route: "/leads",
    roles: [UserRole.admin, UserRole.seller],
  },
  {
    route: "/deals",
    roles: [UserRole.admin, UserRole.seller],
  },
  {
    route: "/sellers",
    roles: [UserRole.admin, UserRole.seller],
  },
];
