import { Module } from '@nestjs/common';
import { KyselyModule as NestKyselyModule } from 'nestjs-kysely';
import { PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestKyselyModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        dialect: new PostgresDialect({
          pool: new Pool({
            connectionString: configService.get<string>('DATABASE_URL'),
          }),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [NestKyselyModule],
})
export class KyselyModule {}