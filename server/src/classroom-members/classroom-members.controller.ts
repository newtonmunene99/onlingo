import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';
import { ClassroomMembersService } from 'src/classroom-members/classroom-members.service';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { UsersService } from 'src/users/users.service';
import {
  AssignmentDTO,
  CommentDTO,
  PostDTO,
} from 'src/classrooms/dto/post.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ClassroomsService } from 'src/classrooms/classrooms.service';
import { Attachment } from 'src/classrooms/entities/attachment.entity';
import { Comment } from 'src/classrooms/entities/comment.entity';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';

@Controller('classroom-members')
export class ClassroomMembersController {
  private logger = new Logger(ClassroomMembersController.name);

  constructor(
    private classroomsService: ClassroomsService,
    private classroomMembersService: ClassroomMembersService,
    private usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getClassroomMemberships(
    @Query('as') filter: 'admin' | 'user',
    @User() { id, role }: UserWithRole,
  ) {
    let classroomMembers: ClassroomMember[] = [];

    switch (filter) {
      case 'user': {
        const user = await this.usersService.findOneById(id);
        classroomMembers = await this.classroomMembersService.findByUser(user);
        break;
      }
      case 'admin': {
        if (role !== UserRole.ADMIN) {
          throw new ForbiddenException(
            `You are not allowed to perform this operation`,
          );
        }

        classroomMembers = await this.classroomMembersService.findAll();
        break;
      }

      default:
        break;
    }

    return { status: 'success', classroomMembers };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getClassroomMember(@Param('id', ParseIntPipe) id: number) {
    const classroomMember = await this.classroomMembersService.findOneById(id);

    return { status: 'success', classroomMember };
  }

  @Get('enroll/:code')
  @UseGuards(JwtAuthGuard)
  async joinClass(@User() user: UserWithRole, @Param('code') code: string) {
    if (user.role !== UserRole.USER) {
      throw new ForbiddenException(
        `You are not allowed to perform this operation`,
      );
    }

    const classroomMember = await this.classroomMembersService.joinClassroom(
      user,
      code,
    );

    return { status: 'success', classroomMember };
  }

  @Post('classroom/:code/posts')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async addNewPost(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Body() postDto: PostDTO,
  ) {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException(`You are not authorized`);
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.classroomMembersService.findOne(
      user,
      classroom,
    );

    if (!classroomMember) {
      throw new BadRequestException(`You're not a member of this classroom`);
    }

    const post = await this.classroomsService.createNewPost(
      classroomMember,
      postDto,
    );

    return {
      status: 'success',
      post,
    };
  }

  @Post('classroom/:code/assignments')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async addNewAssignment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Body() assignmentDto: AssignmentDTO,
  ) {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException(`You are not authorized`);
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.classroomMembersService.findOne(
      user,
      classroom,
    );

    if (!classroomMember) {
      throw new BadRequestException(`You're not a member of this classroom`);
    }

    if (classroomMember.role === ClassroomMemberRole.STUDENT) {
      throw new ForbiddenException(`Only facilitators can create assignments`);
    }

    const assignment = await this.classroomsService.createNewAssignment(
      classroomMember,
      assignmentDto,
    );

    return {
      status: 'success',
      assignment,
    };
  }

  @Post('classroom/:code/posts/:id/comments')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async addNewPostComment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() commentDto: CommentDTO,
  ) {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.classroomMembersService.findOne(
      user,
      classroom,
    );

    if (!classroomMember) {
      throw new BadRequestException(`User is not a member of this classroom`);
    }

    const post = await this.classroomsService.findClassroomPost(
      appUser,
      code,
      id,
    );

    if (!post) {
      throw new NotFoundException(`Post with id ${code} does not exist`);
    }

    const comment = await this.classroomsService.createNewPostComment(
      classroomMember,
      post,
      commentDto,
    );

    return {
      status: 'success',
      comment,
    };
  }

  @Post('classroom/:code/assignments/:assignmentId/comments')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async addNewAssignmentComment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @Body() commentDto: CommentDTO,
  ) {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.classroomMembersService.findOne(
      user,
      classroom,
    );

    if (!classroomMember) {
      throw new BadRequestException(`User is not a member of this classroom`);
    }

    const assignment = await this.classroomsService.findClassroomAssignment(
      appUser,
      code,
      assignmentId,
    );

    if (!assignment) {
      throw new NotFoundException(`Assignment with id ${code} does not exist`);
    }

    const comment = await this.classroomsService.createNewPostComment(
      classroomMember,
      assignment,
      commentDto,
    );

    return {
      status: 'success',
      comment,
    };
  }

  @Post('classroom/:code/posts/:id/attachments')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async addAttachmentsToPost(
    @User() user: UserWithRole,
    @Param('code') code: string,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const attachments = await this.classroomMembersService.addAttachmentsToPost(
      user,
      code,
      id,
      files,
    );
    return {
      status: 'success',
      attachments,
    };
  }

  @Post('classroom/:code/assignments/:assignmentId/attachments')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async addAttachmentsToAssignment(
    @User() user: UserWithRole,
    @Param('code') code: string,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const attachments = await this.classroomMembersService.addAttachmentsToPost(
      user,
      code,
      assignmentId,
      files,
    );
    return {
      status: 'success',
      attachments,
    };
  }

  @Post('classroom/:code/assignments/:assignmentId/submissions')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  async addSubmissionToAssignment(
    @User() appUser: UserWithRole,
    @Param('code') code: string,
    @Param('assignmentId', ParseIntPipe) assignmentId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() commentDto: CommentDTO,
  ) {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.classroomMembersService.findOne(
      user,
      classroom,
    );

    if (!classroomMember) {
      throw new BadRequestException(`User is not a member of this classroom`);
    }

    const assignment = await this.classroomsService.findClassroomAssignment(
      appUser,
      code,
      assignmentId,
    );

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with id ${assignmentId} does not exist`,
      );
    }

    const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

    if (dueDate) {
      const now = new Date();

      if (now > dueDate) {
        throw new ForbiddenException(`The due date has already passed`);
      }
    }

    let assignmentSubmission: AssignmentSubmission;

    assignmentSubmission = await this.classroomsService.createNewAssignmentSubmission(
      classroomMember,
      assignment,
      commentDto,
    );

    let attachments: Attachment[];

    try {
      attachments = await this.classroomsService.createNewAssignmentSubmissionAttachments(
        assignmentSubmission,
        files,
      );
    } catch (error) {
      await this.classroomsService.deleteAssignmentSubmission(
        assignmentSubmission,
      );
      throw new BadRequestException(error);
    }

    let addedAssignmentSubmission = await this.classroomsService.findAssignmentSubmissionById(
      assignmentSubmission.id,
    );

    addedAssignmentSubmission.assignment = assignment;
    await this.classroomsService.updateClassroomAssignmentSubmission(
      addedAssignmentSubmission,
    );

    return {
      status: 'success',
      attachments,
      assignmentSubmission: addedAssignmentSubmission,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteClassroomMember(
    @User() user: UserWithRole,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const classroomMember = await this.classroomMembersService.findOneById(id);

    if (!classroomMember) {
      throw new NotFoundException(
        `Classroom Member with id ${id} does not exist`,
      );
    }

    const facilitator = classroomMember.classroom.members.find(
      (member) =>
        member.role === ClassroomMemberRole.FACILITATOR &&
        member?.user?.email === user?.email,
    );

    if (user.role === UserRole.ADMIN || facilitator) {
      await this.classroomMembersService.deleteClassroomMember(classroomMember);

      return {
        status: 'success',
      };
    }

    throw new ForbiddenException(
      `You are not authorized to perform this operation`,
    );
  }
}
