import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramAuthDto {
  @IsString()
  @IsNotEmpty()
  hash!: string;

  @IsNumber()
  @Type(() => Number)
  id!: number;

  @IsString()
  @IsNotEmpty()
  first_name!: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;

  @IsNumber()
  @Type(() => Number)
  auth_date!: number;

  [key: string]: unknown;
}
