import { User } from '@kikos/db';
import { Request } from 'express';

export type AuthenticatedRequest = Request & {
  user: User;
};
