import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { KyselyModule } from '../database/kysely.module';

@Module({
  imports: [KyselyModule],
  controllers: [PhotosController],
  providers: [PhotosService],
})
export class PhotosModule {}