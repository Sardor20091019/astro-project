// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so Next.js (localhost:3000) can talk to NestJS (localhost:4000)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // Force port 4000
  await app.listen(process.env.PORT ?? 4000);
  console.log(`🚀 Backend is running on: http://localhost:4000`);
}
bootstrap();