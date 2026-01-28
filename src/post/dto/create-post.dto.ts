import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  // @IsNotEmpty()
  // id: number;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsNotEmpty()
  authorId: number;
}
