import Joi from '@hapi/joi';
import { CacheInterceptor } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { appConfig } from 'config/app.config';
import { databaseConfig } from 'config/database.config';
import { mailConfig } from 'config/mail.config';
import { serverConfig } from 'config/server.config';
import { AppConfigService } from 'src/app-config/app-config.service';
import { ResetPasswordRequest } from 'src/auth/entities/reset-password-request.entity';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { Classroom } from 'src/classrooms/entities/classroom.entity';
import { User } from 'src/users/entities/user.entity';
import { PostCommentAttachment } from 'src/classrooms/entities/post-comment-attachment.entity';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';
import { Assignment } from 'src/classrooms/entities/assignment.entity';
import { Attachment } from 'src/classrooms/entities/attachment.entity';
import { Comment } from 'src/classrooms/entities/comment.entity';
import { Grade } from 'src/classrooms/entities/grade.entity';
import { Post } from 'src/classrooms/entities/post.entity';
import { PostComment } from 'src/classrooms/entities/post-comment.entity';
import { PostAttachment } from 'src/classrooms/entities/post-attachment.entity';
import { AssignmentSubmissionAttachment } from 'src/classrooms/entities/assignment-submission-attachment.entity';
import { VideoSession } from './classrooms/entities/video-session.entity';
import { VideoSessionParticipant } from './classrooms/entities/video-session-participant.entity';

/**
 * Connection options for TypeOrm
 * @see https://typeorm.io/#connection-options/common-connection-options
 */
export const connectionOptions = (
  appConfigService: AppConfigService,
): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: appConfigService.dbHost,
  port: appConfigService.dbPort,
  username: appConfigService.dbUserName,
  password: appConfigService.dbPassword,
  database: appConfigService.dbName,
  entities: [
    User,
    ResetPasswordRequest,
    ClassroomMember,
    PostCommentAttachment,
    Post,
    Comment,
    PostComment,
    Attachment,
    Assignment,
    AssignmentSubmission,
    PostAttachment,
    AssignmentSubmissionAttachment,
    Grade,
    Classroom,
    VideoSession,
    VideoSessionParticipant,
  ],
  subscribers: [],
  migrations: ['migrations/*.js'],
  logging: [
    //'query', 'error', 'info', 'log', 'migration', 'schema', 'warn'
  ],
  autoLoadEntities: false,
  cli: {
    migrationsDir: 'migrations',
  },
  // TODO(newtonmunene99): Review for production use
  synchronize: true,
  cache: false,
});
/**
 * Connection Options for config module
 * @see https://docs.nestjs.com/techniques/configuration
 */
export const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  load: [appConfig, databaseConfig, mailConfig, serverConfig],
  expandVariables: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production')
      .default('development'),
    PORT: Joi.number().default(5000),
  }),
};

export const CacheInterceptorOptions = {
  provide: APP_INTERCEPTOR,
  useClass: CacheInterceptor,
};
