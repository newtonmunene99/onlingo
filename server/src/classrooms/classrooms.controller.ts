import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';
import { ClassroomsService } from 'src/classrooms/classrooms.service';
import { ClassroomDTO } from 'src/classrooms/dto/classroom.dto';
import { AssignmentDTO, GradeDTO, PostDTO } from 'src/classrooms/dto/post.dto';
import { Response } from 'express';
import { createReadStream, promises } from 'fs';

@Controller('classrooms')
export class ClassroomsController {
  private logger = new Logger(ClassroomsController.name);

  constructor(private classroomsService: ClassroomsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async getAllClassrooms(@User() appUser: UserWithRole) {
    if (appUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have enough permissions to perform this operation',
      );
    }

    const classrooms = await this.classroomsService.findAll();

    return { status: 'success', classrooms };
  }

  @Get(':code')
  @UseGuards(JwtAuthGuard)
  async getClassroom(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(
      code,
      appUser,
    );

    return { status: 'success', classroom };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async createNewClassroom(
    @User() user: UserWithRole,
    @Body() classroomDto: ClassroomDTO,
  ) {
    if (user.role !== UserRole.USER) {
      throw new ForbiddenException(
        `You are not authorized to perform this operation.`,
      );
    }

    const classroom = await this.classroomsService.createNewClassroom(
      user,
      classroomDto,
    );

    return {
      status: 'success',
      classroom,
    };
  }

  @Patch(':code')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updateClassroom(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Body() classroomDto: ClassroomDTO,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = classroom.members.find(
      (member) =>
        member.user.id === appUser.id &&
        member.role === ClassroomMemberRole.FACILITATOR,
    );

    if (classroomMember || appUser.role === UserRole.ADMIN) {
      classroom.name = classroomDto.name;
      classroom.description = classroomDto.description;
      classroom.unitCode = classroomDto.unitCode;
      const updatedClassroom = await this.classroomsService.updateClassroom(
        classroom,
      );

      return { status: 'success', classroom: updatedClassroom };
    }

    throw new ForbiddenException(
      `You are not allowed to update this classroom`,
    );
  }

  @Get(':code/posts')
  @UseGuards(JwtAuthGuard)
  async getAllClassroomPosts(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
  ) {
    const posts = await this.classroomsService.findPostsByClassroom(
      appUser,
      code,
    );

    return { status: 'success', posts };
  }

  @Get(':code/assignments')
  @UseGuards(JwtAuthGuard)
  async getAllClassroomAssignments(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
  ) {
    const assignments = await this.classroomsService.findAssignmentsByClassroom(
      appUser,
      code,
    );

    return { status: 'success', assignments };
  }

  @Get(':code/posts/:postId/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async downloadAttachment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('postId', ParseIntPipe) id: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Res() res: Response,
  ): Promise<void> {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const post = await this.classroomsService.findPostById(id);

    if (!post) {
      throw new NotFoundException(`Post with id ${id} does not exist`);
    }

    const attachment = await this.classroomsService.findPostAttachmentById(
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with id ${attachmentId} does not exist`,
      );
    }

    if (attachment.post.id !== post.id) {
      throw new ForbiddenException(
        `You are not allowed to download attachments for another post`,
      );
    }

    const classroomMember = classroom.members.find(
      (member) => member.user.id == appUser.id,
    );

    if (classroomMember || appUser.role === UserRole.ADMIN) {
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
      `You are not allowed to download attachments for another post`,
    );
  }

  @Get(
    ':code/assignments/:assignmentId/submissions/:submissionId/attachments/:attachmentId',
  )
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async downloadAssignmentSubmissionAttachment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
    @Res() res: Response,
  ): Promise<void> {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const assignment = await this.classroomsService.findAssignmentById(
      assignmentId,
    );

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with id ${assignmentId} does not exist`,
      );
    }

    const submission = await this.classroomsService.findAssignmentSubmissionById(
      submissionId,
    );

    if (!submission) {
      throw new NotFoundException(
        `Assignment Submission with id ${submissionId} does not exist`,
      );
    }

    const attachment = await this.classroomsService.findAssignmentSubmissionAttachmentById(
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with id ${attachmentId} does not exist`,
      );
    }

    const classroomMember = classroom.members.find(
      (member) => member.user.id == appUser.id,
    );

    if (classroomMember || appUser.role === UserRole.ADMIN) {
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
      `You are not allowed to download attachments for another classroom`,
    );
  }

  @Patch(':code/posts/:id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updateClassroomPost(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() postDto: PostDTO,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const post = await this.classroomsService.findPostById(id);

    if (!post) {
      throw new NotFoundException(`Post with id ${post} does not exist`);
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

  @Patch(':code/assignments/:assignmentId/submissions/:submissionId/grade')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async gradeAssignmentSubmission(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Param('submissionId', ParseIntPipe) submissionId: number,
    @Body() gradedDto: GradeDTO,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const assignment = await this.classroomsService.findAssignmentById(
      assignmentId,
    );

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with id ${assignmentId} does not exist`,
      );
    }

    const submission = await this.classroomsService.findAssignmentSubmissionById(
      submissionId,
    );

    if (!submission) {
      throw new NotFoundException(
        `Assignment Submission with id ${submissionId} does not exist`,
      );
    }

    if (
      assignment.author.user.id === appUser.id ||
      appUser.role === UserRole.ADMIN
    ) {
      const grade = await this.classroomsService.createGrade(
        submission,
        gradedDto,
      );

      return { status: 'success', grade };
    }

    throw new ForbiddenException(
      `You are not allowed to grade this assignment`,
    );
  }

  @Patch(':code/assignments/:assignmentId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updateClassroomAssignment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body() assignmentDto: AssignmentDTO,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const assignment = await this.classroomsService.findAssignmentById(
      assignmentId,
    );

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with id ${assignmentId} does not exist`,
      );
    }

    if (
      assignment.author.user.id === appUser.id ||
      appUser.role === UserRole.ADMIN
    ) {
      assignment.title = assignmentDto.title;
      assignment.body = assignmentDto.body;
      assignment.dueDate = assignmentDto.dueDate
        ? new Date(assignmentDto.dueDate)
        : null;
      assignment.totalPoints = assignmentDto.totalPoints;
      const updatedAssignment = await this.classroomsService.updateClassroomPost(
        assignment,
      );

      return { status: 'success', assignment: updatedAssignment };
    }

    throw new ForbiddenException(
      `You are not allowed to update this assignment`,
    );
  }

  @Delete(':code/posts/:id')
  @UseGuards(JwtAuthGuard)
  async deleteClassroomPost(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const post = await this.classroomsService.findPostById(id);

    if (!post) {
      throw new NotFoundException(`Post with id ${post} does not exist`);
    }

    if (post.author.user.id === appUser.id || appUser.role === UserRole.ADMIN) {
      await this.classroomsService.deleteClassroomPost(post);
      return { status: 'success' };
    }

    throw new ForbiddenException(`You are not allowed to delete this post`);
  }

  @Delete(':code/posts/:id/attachments/:attachmentId')
  @UseGuards(JwtAuthGuard)
  async deletePostAttachment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('id', ParseIntPipe) id: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const post = await this.classroomsService.findPostById(id);

    if (!post) {
      throw new NotFoundException(`Post with id ${id} does not exist`);
    }

    const attachment = await this.classroomsService.findPostAttachmentById(
      attachmentId,
    );

    if (!attachment) {
      throw new NotFoundException(
        `Attachment with id ${attachmentId} does not exist`,
      );
    }

    if (attachment.post.id !== post.id) {
      throw new ForbiddenException(
        `You are not allowed to delete attachments for another post`,
      );
    }

    if (post.author.user.id === appUser.id || appUser.role === UserRole.ADMIN) {
      await this.classroomsService.deletePostAttachment(attachment);
      return { status: 'success' };
    }

    throw new ForbiddenException(
      `You are not allowed to delete this attachment`,
    );
  }

  @Delete(':code')
  @UseGuards(JwtAuthGuard)
  async deleteClassroom(
    @User() user: UserWithRole,
    @Param('code') code: string,
  ) {
    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const facilitator = classroom.members.find(
      (member) =>
        member.role === ClassroomMemberRole.FACILITATOR &&
        member?.user?.email === user?.email,
    );

    if (facilitator || user.role === UserRole.ADMIN) {
      await this.classroomsService.deleteClassroom(classroom);

      return {
        status: 'success',
      };
    }

    throw new ForbiddenException(
      `You are not authorized to perform this operation`,
    );
  }
}
