import { HttpException, HttpStatus } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const ZodValidationPipe = createZodValidationPipe({
  createValidationException: (error: ZodError) => {
    const errorMessage =
      error.errors && error.errors.length > 0 ? error.errors[0] : undefined;
    throw new HttpException(
      errorMessage?.message || 'Os dados informados estão inválidos',
      HttpStatus.BAD_REQUEST,
    );
  },
});
