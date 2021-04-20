import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Res,
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
import { createReadStream, promises } from 'fs';
import { Response } from 'express';

@Controller('attachments')
export class AttachmentsController {
  private logger = new Logger(AttachmentsController.name);

  constructor(private classroomsService: ClassroomsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllAttachments(@User() appUser: UserWithRole) {
    if (appUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(`You do not have enough permissions`);
    }

    const attachments = await this.classroomsService.findAllAttachments();

    return { status: 'success', attachments };
  }

  @Get(':attachmentId/download')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async downloadAttachment(
    @User() appUser: UserWithRole,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Res() res: Response,
  ): Promise<void> {
    const attachment = await this.classroomsService.findPostAttachmentById(
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with id ${attachmentId} does not exist`,
      );
    }

    if (
      attachment?.post?.author?.user?.id === appUser.id ||
      appUser.role === UserRole.ADMIN
    ) {
      const stats = await promises.stat(attachment.path);

      if (!stats.isFile) {
        throw new NotFoundException('File unavailable');
      }

      res.setHeader('Content-Length', stats.size);
      res.setHeader('Content-Type', attachment.mimeType);
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${attachment.originalFileName}`,
      );

      const stream = createReadStream(attachment.path);

      stream.pipe(res);
      return;
    }

    throw new ForbiddenException(
      `You are not allowed to download this attachment`,
    );
  }

  @Delete(':attachmentId')
  @UseGuards(JwtAuthGuard)
  async deletePostAttachment(
    @User() appUser: UserWithRole,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
  ) {
    const attachment = await this.classroomsService.findPostAttachmentById(
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with id ${attachmentId} does not exist`,
      );
    }

    if (
      attachment.post.author.user.id === appUser.id ||
      appUser.role === UserRole.ADMIN
    ) {
      await this.classroomsService.deletePostAttachment(attachment);
      return { status: 'success' };
    }

    throw new ForbiddenException(
      `You are not allowed to delete this attachment`,
    );
  }
}
