/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsOptional } from 'class-validator';

export class UpdatePhotoDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  location?: string;
}
