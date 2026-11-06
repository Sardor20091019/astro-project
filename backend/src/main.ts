import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../.env') });

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { createRouteHandler } from 'uploadthing/express';
import { ourFileRouter } from './uploadthing/uploadthing.router';
import type { Express, Request, Response, NextFunction } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // HTTP Security Headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload',
    );
    next();
  });

  // Cookie Parsing for Session Identification
  app.use(cookieParser());

  // Global Input Validation & Sanitization Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    'https://astro-project-1213.onrender.com',
    'https://astrospectrum.uz',
    'https://www.astrospectrum.uz',
  ];

  if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:4000');
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const expressInstance = app.getHttpAdapter().getInstance() as Express;
  expressInstance.use(
    '/api/uploadthing',
    createRouteHandler({
      router: ourFileRouter,
    }),
  );

  const port = process.env.BACKEND_PORT || process.env.PORT || 4000;

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
void bootstrap();
