import { IsNumber, IsString, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsNumber()
  @Min(50)
  amount!: number;

  @IsString()
  name!: string;
}