import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '../.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createRouteHandler } from 'uploadthing/express';
import { ourFileRouter } from './uploadthing/uploadthing.router'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.use(
    '/uploadthing',
    createRouteHandler({
      router: ourFileRouter,
    }),
  );

  const port = process.env.PORT;
  if (!port) {
    throw new Error('❌ PORT environment variable is not defined. The application cannot start.');
  }

  await app.listen(port);
  console.log(`Server running on port ${port}`);
}
bootstrap();