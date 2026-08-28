import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PhotosModule } from './photos/photos.module';
import { KyselyModule } from './database/kysely.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    KyselyModule,
    PhotosModule,
  ],
})
export class AppModule {}