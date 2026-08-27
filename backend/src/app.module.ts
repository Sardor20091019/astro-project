// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KyselyModule } from 'nestjs-kysely';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { PhotosModule } from './photos/photos.module';
import * as path from 'path';

@Module({
  imports: [
    // Point to the root directory's .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(__dirname, '../../.env'),
    }),
    KyselyModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: new PostgresDialect({
          pool: new Pool({
            connectionString: configService.get<string>('DATABASE_URL'),
          }),
        }),
      }),
    }),
    PhotosModule,
  ],
})
export class AppModule {}