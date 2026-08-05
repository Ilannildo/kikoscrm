import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { HttpExceptionDto } from '@common/types/http-exception';
import { SignInResponseDto } from '@module/authentication/dto/response/sign-in-response.dto';
import { Codes, formatErrorMessage } from '@kikos/shared';

export function SignInDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login',
      description: 'Realiza a autenticação do usuário',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Login bem-sucedido.',
      type: SignInResponseDto,      
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Login incorreto',
      type: HttpExceptionDto,
      example: {        
        code: Codes.AUTH__UNEXPECTED_AUTHORIZATION,
        timestamp: new Date(),
        path: '/api/auth/sign-in',
        message: formatErrorMessage(Codes.AUTH__UNEXPECTED_AUTHORIZATION),
      },
    }),
  );
}
