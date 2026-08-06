import { Codes, formatErrorMessage } from '@kikos/shared';
import { HttpException, HttpStatus } from '@nestjs/common';

export function createHttpException(
  code: Codes,
  status: HttpStatus,
  message?: string,
): HttpException {
  return new HttpException(message ?? formatErrorMessage(code) ?? code, status, {
    cause: { message: code },
  });
}

export function throwNotFound(code: Codes): never {
  throw createHttpException(code, HttpStatus.NOT_FOUND);
}

export function throwForbidden(message?: string): never {
  throw createHttpException(Codes.CRM__FORBIDDEN, HttpStatus.FORBIDDEN, message);
}

export function throwBadRequest(code: Codes, message?: string): never {
  throw createHttpException(code, HttpStatus.BAD_REQUEST, message);
}

export function throwConflict(code: Codes, message?: string): never {
  throw createHttpException(code, HttpStatus.CONFLICT, message);
}
