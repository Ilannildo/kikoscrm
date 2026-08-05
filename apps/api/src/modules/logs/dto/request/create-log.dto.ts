import { LogAction, LogEntity } from "@kikos/shared";

export interface CreateLogDto<T> {
  description?: string;
  action: LogAction;
  entity: LogEntity;
  body?: T;
  userId?: string;
  companyId?: string;
  ipAddress?: string;
}
