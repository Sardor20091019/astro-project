import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createRouteHandler } from 'uploadthing/express';
import { ourFileRouter } from './uploadthing/uploadthing.router';
import type { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: [
      'https://astro-project-1213.onrender.com',
      'http://localhost:3000',
      'http://localhost:4000',
      'https://astrospectrum.uz',
      'https://www.astrospectrum.uz',
    ],
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
