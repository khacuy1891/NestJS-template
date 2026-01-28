import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'generated/prisma/client';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMyPosts(@CurrentUser() user: User) {
    const userId = user?.id;
    return this.postService.findByAuthorId(userId);
  }

  @Post()
  async create(@Body() body: CreatePostDto) {
    const data = await this.postService.create(body);
    return data;
  }
}
