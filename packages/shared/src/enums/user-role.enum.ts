export const UserRole = {
  admin: 'admin',  
  seller: 'seller',  
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole]