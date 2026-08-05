import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { SignInRequestDto } from './dto/request/sign-in-request.dto';
import { SignInResponseDto } from './dto/response/sign-in-response.dto';
import { DatabaseModule } from '@infra/database/database.module';
import { UsersRepository } from '@infra/database/repositories/users.repository';

describe('AuthenticationController', () => {
  let app: INestApplication;
  let authenticationService: AuthenticationService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [AuthenticationController],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            signIn: jest.fn().mockResolvedValue({ access_token: 'fake-token' }),
          },
        },
        UsersRepository,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    authenticationService = module.get<AuthenticationService>(
      AuthenticationService,
    );
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should sign in successfully and return a token', async () => {
    const signInData: SignInRequestDto = {
      email: 'user@example.com',
      password: 'password123',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send(signInData)
      .expect(200);

    const responseBody: SignInResponseDto = response.body;

    expect(responseBody.access_token).toBeDefined();
    expect(responseBody.access_token).toBe('fake-token');    
  });

  it('should call the signIn service with the correct parameters', async () => {
    const signInData: SignInRequestDto = {
      email: 'user@example.com',
      password: 'password123',
    };

    await request(app.getHttpServer())
      .post('/api/auth/sign-in')
      .send(signInData)
      .expect(200);

    expect(authenticationService.signIn).toHaveBeenCalledWith(signInData);
  });

  afterAll(async () => {
    await app.close();
  });
});
