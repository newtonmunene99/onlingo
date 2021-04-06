import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassroomsService } from 'src/classrooms/classrooms.service';
import { Classroom } from 'src/classrooms/entities/classroom.entity';
import { User } from 'src/users/entities/user.entity';
import { UserWithRole } from 'src/users/interfaces/user-role.interface';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { ClassroomMemberDTO } from 'src/classroom-members/dto/classroom-member.dto';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';
import { PostDTO, CommentDTO } from 'src/classrooms/dto/post.dto';
import { Post } from 'src/classrooms/entities/post.entity';
import { Comment } from 'src/classrooms/entities/comment.entity';
import { Attachment } from 'src/classrooms/entities/attachment.entity';

@Injectable()
export class ClassroomMembersService {
  private logger = new Logger(ClassroomMembersService.name);

  constructor(
    @InjectRepository(ClassroomMember)
    private classroomMembersRepository: Repository<ClassroomMember>,
    private usersService: UsersService,
    private classroomsService: ClassroomsService,
  ) {}

  async addClassroomMember({
    userEmail,
    classroomCode,
    role,
  }: ClassroomMemberDTO): Promise<ClassroomMember> {
    const user = await this.usersService.findOneByEmail(userEmail);

    if (!user) {
      throw new NotFoundException(
        `User with email ${userEmail} does not exist`,
      );
    }

    const classroom = await this.classroomsService.findOneByClassCode(
      classroomCode,
    );

    if (!classroom) {
      throw new NotFoundException(
        `Classroom with code ${classroomCode} does not exist`,
      );
    }

    let classroomMember = new ClassroomMember();
    classroomMember.user = user;
    classroomMember.classroom = classroom;
    classroomMember.role = role;

    classroomMember = await this.classroomMembersRepository.save(
      classroomMember,
    );

    return classroomMember;
  }

  async joinClassroom(
    { email }: UserWithRole,
    code: string,
  ): Promise<ClassroomMember> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const existingClassroomMember = await this.findOne(user, classroom);

    if (existingClassroomMember) {
      throw new BadRequestException(
        `User is already a member of this classroom`,
      );
    }

    let classroomMember = new ClassroomMember();
    classroomMember.user = user;
    classroomMember.classroom = classroom;
    classroomMember.role = ClassroomMemberRole.STUDENT;

    classroomMember = await this.classroomMembersRepository.save(
      classroomMember,
    );

    return classroomMember;
  }

  async createNewPost(
    { email }: UserWithRole,
    code: string,
    postDto: PostDTO,
  ): Promise<Post> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.findOne(user, classroom);

    if (!classroomMember) {
      throw new BadRequestException(`User is not a member of this classroom`);
    }

    const post = await this.classroomsService.createNewPost(
      classroomMember,
      postDto,
    );

    return post;
  }

  async createNewPostComment(
    appUser: UserWithRole,
    code: string,
    id: number,
    commentDto: CommentDTO,
  ): Promise<Comment> {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.findOne(user, classroom);

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

    return comment;
  }

  async addAttachmentsToPost(
    appUser: UserWithRole,
    code: string,
    id: number,
    attachments: Express.Multer.File[],
  ): Promise<Attachment[]> {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.findOne(user, classroom);

    if (!classroomMember) {
      throw new BadRequestException(`User is not a member of this classroom`);
    }

    const post = await this.classroomsService.findClassroomPost(
      appUser,
      code,
      id,
    );

    if (!post) {
      throw new NotFoundException(`Post with id ${id} does not exist`);
    }

    return await this.classroomsService.createNewPostAttachments(
      post,
      attachments,
    );
  }

  async addAttachmentsToAssignment(
    appUser: UserWithRole,
    code: string,
    id: number,
    attachments: Express.Multer.File[],
  ): Promise<Attachment[]> {
    const user = await this.usersService.findOneByEmail(appUser.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const classroom = await this.classroomsService.findOneByClassCode(code);

    if (!classroom) {
      throw new NotFoundException(`Classroom with code ${code} does not exist`);
    }

    const classroomMember = await this.findOne(user, classroom);

    if (!classroomMember) {
      throw new BadRequestException(`User is not a member of this classroom`);
    }

    const assignment = await this.classroomsService.findClassroomAssignment(
      appUser,
      code,
      id,
    );

    if (!assignment) {
      throw new NotFoundException(`Post with id ${id} does not exist`);
    }

    return await this.classroomsService.createNewPostAttachments(
      assignment,
      attachments,
    );
  }

  async deletePost({ email }: UserWithRole, postId: number): Promise<Post> {
    const post = await this.classroomsService.findPostById(postId);

    if (!post) {
      throw new NotFoundException(`Post with id ${postId} does not exist`);
    }

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    if (user?.id != post?.author?.user?.id) {
      throw new ForbiddenException(`You are not allowed to delete this post`);
    }

    return;
  }

  findAll(): Promise<ClassroomMember[]> {
    return this.classroomMembersRepository.find({
      relations: ['user', 'classroom'],
    });
  }

  findOne(
    user: User,
    classroom: Classroom,
  ): Promise<ClassroomMember | undefined> {
    return this.classroomMembersRepository.findOne(
      {
        user,
        classroom,
      },
      { relations: ['user', 'classroom'] },
    );
  }

  findOneById(id: number): Promise<ClassroomMember | undefined> {
    return this.classroomMembersRepository.findOne(id, {
      relations: [
        'user',
        'classroom',
        'classroom.members',
        'classroom.members.user',
      ],
    });
  }

  findByUser(user: User): Promise<ClassroomMember[]> {
    return this.classroomMembersRepository.find({
      where: { user },
      relations: ['classroom', 'classroom.members', 'classroom.members.user'],
      order: {
        role: 'ASC',
        createdAt: 'DESC',
      },
    });
  }

  findByClassroom(classroom: Classroom): Promise<ClassroomMember[]> {
    return this.classroomMembersRepository.find({
      where: { classroom },
      relations: ['user'],
    });
  }

  findByClassroomMemberRole(
    classroom: Classroom,
    role: ClassroomMemberRole,
  ): Promise<ClassroomMember[]> {
    return this.classroomMembersRepository.find({
      where: { role, classroom },
      relations: ['user', 'classroom'],
    });
  }

  async deleteClassroomMember(classroomMember: ClassroomMember) {
    await this.classroomMembersRepository.remove(classroomMember);
  }
}
