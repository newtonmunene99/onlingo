import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';
import { ClassroomsService } from 'src/classrooms/classrooms.service';
import { PostDTO } from './dto/post.dto';

@Controller('posts')
export class PostsController {
  private logger = new Logger(PostsController.name);

  constructor(private classroomsService: ClassroomsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPosts(@User() appUser: UserWithRole) {
    if (appUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(`You do not have enough permissions`);
    }

    const posts = await this.classroomsService.findAllPosts();

    return { status: 'success', posts };
  }

  @Patch(':postId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updatePost(
    @User() appUser: UserWithRole,
    @Param('postId', ParseIntPipe) postId: number,
    @Body() postDto: PostDTO,
  ) {
    const post = await this.classroomsService.findPostById(postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} does not exist`);
    }

    if (post.author.user.id === appUser.id || appUser.role === UserRole.ADMIN) {
      post.title = postDto.title;
      post.body = postDto.body;
      const updatedPost = await this.classroomsService.updateClassroomPost(
        post,
      );

      return { status: 'success', post: updatedPost };
    }

    throw new ForbiddenException(`You are not allowed to update this post`);
  }

  @Delete(':postId')
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @User() appUser: UserWithRole,
    @Param('postId', ParseIntPipe) postId: number,
  ) {
    const post = await this.classroomsService.findPostById(postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} does not exist`);
    }

    if (post.author.user.id === appUser.id || appUser.role === UserRole.ADMIN) {
      await this.classroomsService.deleteClassroomPost(post);

      return { status: 'success' };
    }

    throw new ForbiddenException(`You are not allowed to delete this post`);
  }
}
