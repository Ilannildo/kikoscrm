import { UserRole } from "@kikos/shared";

export interface UserEntity {
  id: string;
  name: string;
  email: string;  
  emailVerifiedAt?: Date | null;
  emailVerified?: boolean;  
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
