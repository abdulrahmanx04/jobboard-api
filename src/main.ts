import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/Http.exception';
import { TypeORMFitler } from './common/filters/TypeORM.Exception';
import {  ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  app.useGlobalFilters(new TypeORMFitler(),new HttpExceptionFilter())
  app.use(helmet())
  app.enableCors({
    origin: process.env.FRONTEND_URL
  })
  const config= new DocumentBuilder()
    .setTitle('Jobboard-API')
    .setDescription('API documentation for Jobboard-API platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap();
