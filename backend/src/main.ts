// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'https://astrospectrum.uz',
    'https://www.astrospectrum.uz',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  });

  await app.listen(process.env.PORT);
  console.log(`🚀 Backend is running on port ${process.env.PORT}`);
}
bootstrap();