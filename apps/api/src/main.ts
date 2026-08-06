import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { CORS_ALLOWED_ORIGINS } from 'src/common/config/app';
import { LoggerService } from 'src/infra/logger/logger.service';
import { AppModule } from './app.module';
import { env } from './env';
import { ResponseInterceptor } from './infra/response/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  // DOMAIN
  app.set('trust proxy', true);
  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
    credentials: true,
  });

  // LOGGER
  const LoggerServiceInstance = app.get(LoggerService);
  app.useLogger(LoggerServiceInstance);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  // RESPONSE
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  app.use(
    helmet({
      crossOriginResourcePolicy: {
        policy: 'cross-origin',
      },

      crossOriginEmbedderPolicy: false,

      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],

          connectSrc: [
            `'self'`,
            'https://api.scalar.com',
            'https://cdn.jsdelivr.net',
          ],

          scriptSrc: [
            `'self'`,
            'https://cdn.jsdelivr.net',
            `'unsafe-inline'`,
            `'unsafe-eval'`,
          ],

          styleSrc: [
            `'self'`,
            `'unsafe-inline'`,
            'https://cdn.jsdelivr.net',
            'https://fonts.googleapis.com',
            'https://unpkg.com',
          ],

          fontSrc: [
            `'self'`,
            'https://fonts.gstatic.com',
            'data:',
          ],

          imgSrc: [
            `'self'`,
            'data:',
            'https://cdn.jsdelivr.net',
            'https:',
          ],
        },
      },
    }),
  );

  // SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Kikos CRM Docs')
    .setContact(
      'Ilannildo Viana',
      'https://ilannildo.com.br',
      'ilannildoviana12@gmail.com',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      title: `${env.APP_NAME} API Reference`,
      hideModels: true, hideClientButton: true,
      showDeveloperTools: 'localhost',
      defaultOpenAllTags: true,
      theme: 'kepler',
      sources: [
        {
          content: document,
          title: 'Kikos CRM API',
          slug: 'api',
          default: true,
        },
        {
          url: '/auth/open-api/generate-schema',
          title: 'Autenticação',
          slug: 'auth',
        },
      ],
    }),
  );

  const PORT = env.PORT || 3000;

  await app.listen(PORT).then(() => {
    LoggerServiceInstance.log(
      `${env.APP_NAME} api is running on port ${PORT} 🔥`,
    );
  });
}
bootstrap();
