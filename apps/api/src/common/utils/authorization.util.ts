import { UserRole } from '@kikos/shared';
import { throwForbidden } from './http-error.util';

export interface AuthContext {
  userId: string;
  role: UserRole;
}

export function isAdmin(role: UserRole): boolean {
  return role === UserRole.admin;
}

export function canAccessSellerResource(
  auth: AuthContext,
  resourceSellerId: string,
): boolean {
  if (isAdmin(auth.role)) return true;
  return auth.userId === resourceSellerId;
}

export function resolveSellerId(
  auth: AuthContext,
  requestedSellerId?: string,
): string {
  if (isAdmin(auth.role)) {
    if (!requestedSellerId) {
      return auth.userId;
    }
    return requestedSellerId;
  }
  return auth.userId;
}

export function assertSellerAccess(
  auth: AuthContext,
  resourceSellerId: string,
): void {
  if (!canAccessSellerResource(auth, resourceSellerId)) {
    throwForbidden('Você não tem permissão para acessar este recurso.');
  }
}
