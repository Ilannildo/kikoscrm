import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { CORS_ALLOWED_ORIGINS } from 'src/common/config/app';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerService } from 'src/infra/logger/logger.service';
import { ResponseInterceptor } from './infra/response/response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { env } from './env';
import { apiReference } from '@scalar/nestjs-api-reference';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { LoggerErrorInterceptor } from 'nestjs-pino';
import { patchNestJsSwagger } from 'nestjs-zod';

patchNestJsSwagger();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  // DOMAIN
  app.set('trust proxy', 'loopback');
  app.enableCors({
    origin: CORS_ALLOWED_ORIGINS,
  });

  // LOGGER
  const LoggerServiceInstance = app.get(LoggerService);
  app.useLogger(LoggerServiceInstance);
  app.useGlobalInterceptors(new LoggerErrorInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));  
  // RESPONSE
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableShutdownHooks();

  // SWAGGER
  const config = new DocumentBuilder()
    .setTitle('kikos Docs')
    .setVersion(env.APP_VERSION)
    .setContact(
      'kikos',
      'https://kikos.com.br',
      'contato@kikos.com.br',
    )
    .addSecurity('bearer', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/docs',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(env.APP_PORT).then(() => {
    LoggerServiceInstance.log(
      `${env.APP_NAME.toUpperCase()} is running on port ${env.APP_PORT} 🔥`,
    );
  });
}
bootstrap();
