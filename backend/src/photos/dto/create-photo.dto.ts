/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePhotoDto {
  @IsString()
  @IsUrl()
  photoUrl!: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  coordinates?: string;

  @IsString()
  @IsOptional()
  camera?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  iso?: number;

  @IsString()
  @IsOptional()
  aperture?: string;

  @IsString()
  @IsOptional()
  shutter?: string;

  @IsString()
  @IsOptional()
  focalLength?: string;

  @IsString()
  @IsOptional()
  authorName?: string;

  @IsString()
  @IsOptional()
  category?: string;
}
