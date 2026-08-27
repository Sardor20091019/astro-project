// backend/src/photos/photos.controller.ts
import { Controller, Get, Param, ParseIntPipe, Query, NotFoundException } from '@nestjs/common';
import { PhotosService } from './photos.service';

@Controller('photos')
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get()
  async findAll() {
    return await this.photosService.getApprovedPhotos();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId?: string,
    @Query('anonymousToken') anonymousToken?: string,
  ) {
    const photo = await this.photosService.getPhotoById(id, userId, anonymousToken);
    if (!photo) {
      throw new NotFoundException(`Photo with ID ${id} not found`);
    }
    return photo;
  }
}