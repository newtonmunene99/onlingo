// @collapse

import {
  BadRequestException,
  ForbiddenException,
  GatewayTimeoutException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';
import { randomString } from 'src/shared/randomString';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { UsersService } from 'src/users/users.service';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { ClassroomDTO } from 'src/classrooms/dto/classroom.dto';
import { Classroom } from 'src/classrooms/entities/classroom.entity';
import {
  AssignmentDTO,
  CommentDTO,
  GradeDTO,
  PostDTO,
} from 'src/classrooms/dto/post.dto';
import { Post } from 'src/classrooms/entities/post.entity';
import { PostComment } from 'src/classrooms/entities/post-comment.entity';
import { Attachment } from 'src/classrooms/entities/attachment.entity';
import { promises } from 'fs';
import { Assignment } from 'src/classrooms/entities/assignment.entity';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';
import { PostCommentAttachment } from 'src/classrooms/entities/post-comment-attachment.entity';
import { PostAttachment } from 'src/classrooms/entities/post-attachment.entity';
import { AssignmentSubmissionAttachment } from 'src/classrooms/entities/assignment-submission-attachment.entity';
import { Grade } from './entities/grade.entity';
import { VideoSession } from './entities/video-session.entity';
import { VideoSessionParticipant } from './entities/video-session-participant.entity';

@Injectable()
export class ClassroomsService {
  private logger = new Logger(ClassroomsService.name);

  constructor(
    private connection: Connection,
    @InjectRepository(Classroom)
    private classroomsRepository: Repository<Classroom>,

    @InjectRepository(Post)
    private postsRepository: Repository<Post>,

    @InjectRepository(Assignment)
    private assignmentsRepository: Repository<Assignment>,

    @InjectRepository(PostComment)
    private postCommentsRepository: Repository<PostComment>,

    @InjectRepository(AssignmentSubmission)
    private assignmentSubmissionsRepository: Repository<AssignmentSubmission>,

    @InjectRepository(PostAttachment)
    private postAttachmentsRepository: Repository<PostAttachment>,

    @InjectRepository(PostCommentAttachment)
    private postCommentAttachmentsRepository: Repository<PostCommentAttachment>,

    @InjectRepository(AssignmentSubmissionAttachment)
    private assignmentSubmissionAttachmentsRepository: Repository<AssignmentSubmissionAttachment>,

    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,

    @InjectRepository(VideoSession)
    private videoSessionsRepository: Repository<VideoSession>,

    @InjectRepository(VideoSessionParticipant)
    private videoSessionParticipantsRepository: Repository<VideoSessionParticipant>,

    private usersService: UsersService,
  ) {}

  async createNewClassroom(
    { email }: UserWithRole,
    { name, description }: ClassroomDTO,
  ): Promise<Classroom> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    let classroomCode: string;
    let tries = 0;

    while (!classroomCode) {
      const possibleClassroomCode = randomString(6);

      const existingClassroom = await this.findOneByClassCode(
        possibleClassroomCode,
      );

      if (!existingClassroom) {
        classroomCode = possibleClassroomCode;
        break;
      }

      if (tries === 5) {
        throw new GatewayTimeoutException(
          `Server has failed to generate a unique code for the classroom`,
        );
      }
      tries += 1;
    }

    let classroom = new Classroom();
    classroom.code = classroomCode;
    classroom.name = name;
    classroom.description = description;

    let classroomMember = new ClassroomMember();
    classroomMember.user = user;
    classroomMember.role = ClassroomMemberRole.FACILITATOR;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      classroom = await queryRunner.manager.save(classroom);

      classroomMember.classroom = classroom;
      classroomMember = await queryRunner.manager.save(classroomMember);

      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error({ ...error });
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Transaction failed to complete`);
    } finally {
      await queryRunner.release();
    }

    return classroom;
  }

  findAll(): Promise<Classroom[]> {
    return this.classroomsRepository.find({
      relations: ['members', 'members.user'],
    });
  }

  findOneById(id: number): Promise<Classroom | undefined> {
    return this.classroomsRepository.findOne(id, {
      relations: ['members', 'members.user'],
    });
  }

  async findOneByClassCode(
    code: string,
    appUser?: UserWithRole,
  ): Promise<Classroom | undefined> {
    const classroom = await this.classroomsRepository.findOne({
      where: { code },
      relations: [
        'members',
        'members.user',
        'members.posts',
        'members.posts.author',
        'members.posts.author.user',
        'members.posts.comments',
        'members.posts.comments.author',
        'members.posts.comments.author.user',
        'members.posts.attachments',
      ],
    });

    if (appUser) {
      const classroomMember = classroom.members.find(
        (member) => member?.user?.id === appUser?.id,
      );

      if (!classroomMember) {
        throw new ForbiddenException(
          `You are not allowed to view this classroom`,
        );
      }
    }

    return classroom;
  }

  async findVideoSessionByCode(
    code: string,
    appUser?: UserWithRole,
  ): Promise<VideoSession | undefined> {
    const videoSession = await this.videoSessionsRepository.findOne({
      where: { code },
      relations: [
        'classroom',
        'classroom.members',
        'classroom.members.user',
        'owner',
        'owner.user',
        'participants',
        'participants.participant',
        'participants.participant.user',
      ],
    });

    if (appUser) {
      const classroomMember = videoSession?.classroom?.members?.find(
        (member) => member?.user?.id === appUser?.id,
      );

      if (!classroomMember) {
        throw new ForbiddenException(
          `You are not allowed to view this video session`,
        );
      }
    }

    return videoSession;
  }

  async createNewPost(
    classroomMember: ClassroomMember,
    { title, body }: PostDTO,
  ): Promise<Post> {
    let post = new Post();
    post.author = classroomMember;
    post.title = title;
    post.body = body;

    post = await this.postsRepository.save(post);

    return post;
  }

  async createNewAssignment(
    classroomMember: ClassroomMember,
    { title, body, dueDate, totalPoints }: AssignmentDTO,
  ): Promise<Assignment> {
    let assignment = new Assignment();
    assignment.author = classroomMember;
    assignment.title = title;
    assignment.body = body;
    assignment.dueDate = dueDate ? new Date(dueDate) : null;
    assignment.totalPoints = totalPoints;

    assignment = await this.assignmentsRepository.save(assignment);

    return assignment;
  }

  async createNewPostComment(
    classroomMember: ClassroomMember,
    post: Post,
    { body }: CommentDTO,
  ): Promise<PostComment> {
    let comment = new PostComment();
    comment.author = classroomMember;
    comment.body = body;
    comment.post = post;

    comment = await this.postCommentsRepository.save(comment);

    return comment;
  }

  async createNewAssignmentSubmission(
    classroomMember: ClassroomMember,
    assignment: Assignment,
    { body }: CommentDTO,
  ): Promise<AssignmentSubmission> {
    let assignmentSubmission = new AssignmentSubmission();
    assignmentSubmission.author = classroomMember;
    assignmentSubmission.body = body;
    assignmentSubmission.assignment = assignment;
    assignmentSubmission.grade = null;

    assignmentSubmission = await this.assignmentSubmissionsRepository.save(
      assignmentSubmission,
    );

    return assignmentSubmission;
  }

  async createNewVideoSession(
    classroom: Classroom,
    classroomMember: ClassroomMember,
  ): Promise<VideoSession> {
    let videoSession = new VideoSession();
    videoSession.classroom = classroom;
    videoSession.owner = classroomMember;
    videoSession.code = randomString(6);

    videoSession = await this.videoSessionsRepository.save(videoSession);

    return videoSession;
  }

  async joinVideoSession(
    videoSession: VideoSession,
    classroomMember: ClassroomMember,
  ): Promise<VideoSessionParticipant> {
    let videoSessionParticipant = new VideoSessionParticipant();
    videoSessionParticipant.videoSession = videoSession;
    videoSessionParticipant.participant = classroomMember;

    videoSessionParticipant = await this.videoSessionParticipantsRepository.save(
      videoSessionParticipant,
    );

    return videoSessionParticipant;
  }

  async createNewPostAttachments(
    post: Post,
    files: Express.Multer.File[],
  ): Promise<Attachment[]> {
    let addedAttachments: Attachment[] = [];
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const file of files) {
        const {
          path,
          filename,
          mimetype,
          size,
          originalname,
          destination,
        } = file;

        let attachment = new PostAttachment();
        attachment.post = post;
        attachment.fileName = filename;
        attachment.originalFileName = originalname;
        attachment.mimeType = mimetype;
        attachment.path = path;
        attachment.size = size;
        attachment.title = filename;

        addedAttachments.push(attachment);
      }

      addedAttachments = await this.postAttachmentsRepository.save(
        addedAttachments,
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error({ ...error });
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Some attachments failed to save`);
    } finally {
      await queryRunner.release();
    }

    return addedAttachments;
  }

  async createNewAssignmentAttachments(
    assignment: Assignment,
    files: Express.Multer.File[],
  ): Promise<PostAttachment[]> {
    let addedAttachments: PostAttachment[] = [];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const file of files) {
        const {
          path,
          filename,
          mimetype,
          size,
          originalname,
          destination,
        } = file;

        let attachment = new PostAttachment();
        attachment.post = assignment;
        attachment.fileName = filename;
        attachment.originalFileName = originalname;
        attachment.mimeType = mimetype;
        attachment.path = path;
        attachment.size = size;
        attachment.title = filename;

        addedAttachments.push(attachment);
      }

      addedAttachments = await this.postAttachmentsRepository.save(
        addedAttachments,
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error({ ...error });
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Some attachments failed to save`);
    } finally {
      await queryRunner.release();
    }

    return addedAttachments;
  }

  async createNewAssignmentSubmissionAttachments(
    assignmentSubmission: AssignmentSubmission,
    files: Express.Multer.File[],
  ): Promise<AssignmentSubmissionAttachment[]> {
    let addedAttachments: AssignmentSubmissionAttachment[] = [];

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const file of files) {
        const {
          path,
          filename,
          mimetype,
          size,
          originalname,
          destination,
        } = file;

        let attachment = new AssignmentSubmissionAttachment();
        attachment.assignmentSubmission = assignmentSubmission;
        attachment.fileName = filename;
        attachment.originalFileName = originalname;
        attachment.mimeType = mimetype;
        attachment.path = path;
        attachment.size = size;
        attachment.title = filename;

        addedAttachments.push(attachment);
      }

      addedAttachments = await queryRunner.manager.save(addedAttachments);
      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.error({ ...error });
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Some attachments failed to save`);
    } finally {
      await queryRunner.release();
    }

    return addedAttachments;
  }

  async createGrade(
    assignmentSubmission: AssignmentSubmission,
    { points, comments }: GradeDTO,
  ): Promise<Grade> {
    let grade = new Grade();
    grade.assignmentSubmisstion = assignmentSubmission;
    grade.points = points;
    grade.comments = comments;

    grade = await this.gradesRepository.save(grade);

    return grade;
  }

  async findPostsByClassroom(
    { id, role }: UserWithRole,
    classroomCode: string,
  ): Promise<Post[]> {
    const classroom = await this.findOneByClassCode(classroomCode);

    if (!classroom) {
      throw new NotFoundException(
        `Classroom with code ${classroomCode} does not exist`,
      );
    }

    const classroomMembership = classroom.members.find(
      (member) => member.user.id === id,
    );

    if (classroomMembership || role === UserRole.ADMIN) {
      return this.postsRepository.find({
        relations: [
          'author',
          'author.user',
          'comments',
          'comments.author',
          'comments.author.user',
          'attachments',
        ],

        where: (qb: SelectQueryBuilder<Post>) => {
          qb.where('Post.type = :type', { type: 'Post' }).andWhere(
            'Post__author.classroom = :classroom',
            {
              classroom: classroom.id,
            },
          );
        },
      });
    }

    throw new ForbiddenException(
      `You are not allowed to perform this operation`,
    );
  }

  async findAssignmentsByClassroom(
    { id, role }: UserWithRole,
    classroomCode: string,
  ): Promise<Assignment[]> {
    const classroom = await this.findOneByClassCode(classroomCode);

    if (!classroom) {
      throw new NotFoundException(
        `Classroom with code ${classroomCode} does not exist`,
      );
    }

    const classroomMembership = classroom.members.find(
      (member) => member.user.id === id,
    );

    if (classroomMembership || role === UserRole.ADMIN) {
      const assignments = await this.assignmentsRepository.find({
        relations: [
          'author',
          'author.user',
          'comments',
          'comments.author',
          'comments.author.user',
          'submissions',
          'submissions.attachments',
          'submissions.grade',
          'submissions.author',
          'submissions.author.user',
          'attachments',
        ],
        where: (qb: SelectQueryBuilder<Post>) => {
          qb.where('Assignment.type = :type', { type: 'Assignment' }).andWhere(
            'Assignment__author.classroom = :classroom',
            {
              classroom: classroom.id,
            },
          );
        },
      });

      for (let assignment of assignments) {
        for (let submission of assignment.submissions) {
          const submissionAttachments = await this.assignmentSubmissionAttachmentsRepository.find(
            {
              assignmentSubmission: submission,
            },
          );

          submission.attachments = submissionAttachments;
        }
      }

      return assignments;
    }

    throw new ForbiddenException(
      `You are not allowed to perform this operation`,
    );
  }

  async findClassroomPost(
    { id, role }: UserWithRole,
    classroomCode: string,
    postId: number,
  ): Promise<Post> {
    const classroom = await this.findOneByClassCode(classroomCode);

    if (!classroom) {
      throw new NotFoundException(
        `Classroom with code ${classroomCode} does not exist`,
      );
    }

    const classroomMembership = classroom.members.find(
      (member) => member.user.id === id,
    );

    if (classroomMembership || role === UserRole.ADMIN) {
      return this.postsRepository.findOne({
        relations: [
          'author',
          'author.user',
          'comments',
          'comments.author',
          'comments.author.user',
          'attachments',
        ],

        where: (qb: SelectQueryBuilder<Post>) => {
          qb.where('Post.id = :id', {
            id: postId,
          }).andWhere('Post__author.classroom = :classroom', {
            classroom: classroom.id,
          });
        },
      });
    }

    throw new ForbiddenException(
      `You are not allowed to perform this operation`,
    );
  }

  async findClassroomAssignment(
    { id, role }: UserWithRole,
    classroomCode: string,
    assignmentId: number,
  ): Promise<Assignment> {
    const classroom = await this.findOneByClassCode(classroomCode);

    if (!classroom) {
      throw new NotFoundException(
        `Classroom with code ${classroomCode} does not exist`,
      );
    }

    const classroomMembership = classroom.members.find(
      (member) => member.user.id === id,
    );

    if (classroomMembership || role === UserRole.ADMIN) {
      return this.assignmentsRepository.findOne({
        relations: [
          'author',
          'author.user',
          'comments',
          'comments.author',
          'comments.author.user',
          'attachments',
          'submissions',
        ],

        where: (qb: SelectQueryBuilder<Post>) => {
          qb.where('Assignment.id = :id', {
            id: assignmentId,
          }).andWhere('Assignment__author.classroom = :classroom', {
            classroom: classroom.id,
          });
        },
      });
    }

    throw new ForbiddenException(
      `You are not allowed to perform this operation`,
    );
  }

  findPostById(id: number): Promise<Post> {
    return this.postsRepository.findOne(id, {
      relations: [
        'author',
        'author.user',
        'comments',
        'comments.author',
        'comments.author.user',
        'attachments',
      ],
    });
  }

  findAssignmentById(id: number): Promise<Assignment> {
    return this.assignmentsRepository.findOne(id, {
      relations: [
        'author',
        'author.user',
        'comments',
        'comments.author',
        'comments.author.user',
        'attachments',
        'submissions',
      ],
    });
  }

  findAssignmentSubmissionById(id: number): Promise<AssignmentSubmission> {
    return this.assignmentSubmissionsRepository.findOne(id, {
      relations: [
        'assignment',
        'assignment.submissions',
        'attachments',
        'grade',
      ],
    });
  }

  findPostAttachmentById(id: number): Promise<PostAttachment> {
    return this.postAttachmentsRepository.findOne(id, {
      relations: [
        'post',
        'post.author',
        'post.author.user',
        'post.comments',
        'post.comments.author',
        'post.comments.author.user',
      ],
    });
  }

  async updateClassroom(classroom: Classroom): Promise<Classroom> {
    return this.classroomsRepository.save(classroom);
  }

  async updateClassroomPost(post: Post): Promise<Post> {
    return this.postsRepository.save(post);
  }

  async updateClassroomAssignment(assignment: Assignment): Promise<Assignment> {
    return this.assignmentsRepository.save(assignment);
  }

  async updateClassroomAssignmentSubmission(
    assignmentSubmission: AssignmentSubmission,
  ): Promise<AssignmentSubmission> {
    return this.assignmentSubmissionsRepository.save(assignmentSubmission);
  }

  async deleteClassroomPost(post: Post): Promise<void> {
    await this.postsRepository.remove(post);
  }

  async deletePostComment(comment: PostComment): Promise<void> {
    await this.postCommentsRepository.remove(comment);
  }

  async deleteAssignmentSubmission(
    assignmentSubmission: AssignmentSubmission,
  ): Promise<void> {
    await this.assignmentSubmissionsRepository.remove(assignmentSubmission);
  }

  async deletePostAttachment(attachment: PostAttachment): Promise<void> {
    await this.postAttachmentsRepository.remove(attachment);

    const stats = await promises.stat(attachment.path);

    if (stats.isFile) {
      await promises.unlink(attachment.path);
    }
  }

  async deletePostCommentAttachment(
    attachment: PostCommentAttachment,
  ): Promise<void> {
    await this.postCommentAttachmentsRepository.remove(attachment);

    const stats = await promises.stat(attachment.path);

    if (stats.isFile) {
      await promises.unlink(attachment.path);
    }
  }

  async deleteClassroom(classroom: Classroom): Promise<void> {
    await this.classroomsRepository.remove(classroom);
  }
}
