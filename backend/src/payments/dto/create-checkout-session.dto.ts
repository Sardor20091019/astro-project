import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNumber()
  @IsOptional()
  photoId?: number;

  @IsNumber()
  @IsOptional()
  @Min(50)
  amount?: number;

  @IsString()
  @IsOptional()
  name?: string;
}
