import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { ClassroomsController } from 'src/classrooms/classrooms.controller';
import { ClassroomsService } from 'src/classrooms/classrooms.service';
import { Classroom } from 'src/classrooms/entities/classroom.entity';
import { Post } from 'src/classrooms/entities/post.entity';
import { Comment } from 'src/classrooms/entities/comment.entity';
import { Attachment } from 'src/classrooms/entities/attachment.entity';
import { Assignment } from 'src/classrooms/entities/assignment.entity';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';
import { Grade } from 'src/classrooms/entities/grade.entity';
import { PostCommentAttachment } from 'src/classrooms/entities/post-comment-attachment.entity';
import { PostComment } from 'src/classrooms/entities/post-comment.entity';
import { PostAttachment } from 'src/classrooms/entities/post-attachment.entity';
import { AssignmentSubmissionAttachment } from 'src/classrooms/entities/assignment-submission-attachment.entity';
import { ClassroomsGateway } from './classrooms.gateway';
import { VideoSession } from './entities/video-session.entity';
import { VideoSessionParticipant } from './entities/video-session-participant.entity';
import { PostsController } from './posts.controller';
import { AttachmentsController } from './attachments.controller';
import { GradesController } from './grades.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Post,
      Comment,
      PostComment,
      Attachment,
      Assignment,
      AssignmentSubmission,
      PostAttachment,
      PostCommentAttachment,
      AssignmentSubmissionAttachment,
      Grade,
      Classroom,
      VideoSession,
      VideoSessionParticipant,
    ]),
    UsersModule,
  ],
  controllers: [
    ClassroomsController,
    PostsController,
    AttachmentsController,
    GradesController,
  ],
  providers: [ClassroomsService, ClassroomsGateway],
  exports: [ClassroomsService, TypeOrmModule],
})
export class ClassroomsModule {}
