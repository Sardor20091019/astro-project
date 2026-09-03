import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(2, { message: 'Comment must be at least 2 characters long' })
  @MaxLength(1200, { message: 'Comment cannot exceed 1200 characters' })
  body!: string;
}
