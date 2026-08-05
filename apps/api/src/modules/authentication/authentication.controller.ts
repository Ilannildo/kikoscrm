import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { AuthenticationService } from './authentication.service';
import { SignInRequestDto } from './dto/request/sign-in-request.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';
import { SignInDocs } from '@docs/authentication/sign-in.doc';

@ApiTags('Autenticação')
@Controller('/auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @SignInDocs()
  @Post('/sign-in')
  @ZodSerializerDto(SignInResponseDto)
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() data: SignInRequestDto) {
    const response = await this.authenticationService.signIn(data);

    return response;
  }
}
