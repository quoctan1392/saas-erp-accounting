import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// Bootstrap application
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get('API_PREFIX', '/api/v1');
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Tenant Service API')
    .setDescription('Multi-Tenant Management API for SaaS ERP System')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('tenants', 'Tenant management endpoints')
    .addTag('subscriptions', 'Subscription management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get('PORT', 3002);
  await app.listen(port);

  console.log(`🚀 Tenant Service is running on: http://localhost:${port}${apiPrefix}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}${apiPrefix}/docs`);
}

bootstrap();
