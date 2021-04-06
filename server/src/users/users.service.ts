import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { UserDTO } from 'src/users/dto/user.dto';
import { hash } from 'bcrypt';
import { UserRole } from 'src/users/interfaces/user-role.interface';
import { HashedPassword } from 'src/users/interfaces/password.interface';
import { randomString } from 'src/shared/randomString';

@Injectable()
export class UsersService {
  private logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createSuperAdmin({
    email,
    firstName,
    lastName,
    password: preferredPassword,
  }: UserDTO): Promise<User> {
    const existingUsers = await this.findAll();

    if (existingUsers.length) {
      throw new BadRequestException(
        'You cannot create a super admin while other users already exist',
      );
    }

    const password = await hash(preferredPassword, 10);

    let user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password;
    user.role = UserRole.ADMIN;

    user = await this.usersRepository.save(user);

    return user;
  }

  async createAdmin({
    email,
    firstName,
    lastName,
    password: preferredPassword,
  }: UserDTO): Promise<User> {
    const existingUser = await this.findOneByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        'This email is already registered with another admin',
      );
    }

    const password = await hash(preferredPassword, 10);

    let user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password;
    user.role = UserRole.ADMIN;

    user = await this.usersRepository.save(user);

    return user;
  }

  async createUser({
    email,
    firstName,
    lastName,
    password: preferredPassword,
  }: UserDTO): Promise<User> {
    const admins = await this.usersRepository.find({ role: UserRole.ADMIN });

    if (!admins?.length) {
      throw new ForbiddenException(
        `You are not allowed to perform this operation`,
      );
    }

    const existingUser = await this.findOneByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        'This email is already registered with another user',
      );
    }

    const password = await hash(preferredPassword, 10);

    let user = new User();
    user.email = email;
    user.firstName = firstName;
    user.lastName = lastName;
    user.password = password;
    user.role = UserRole.USER;

    user = await this.usersRepository.save(user);

    return user;
  }

  async updateUser(user: User): Promise<User> {
    const updatedUser = await this.usersRepository.save(user);

    return updatedUser;
  }

  async hashPassword(
    plainText?: string,
    rounds?: number,
    length?: number,
  ): Promise<HashedPassword> {
    let plainTextPassword = plainText ?? randomString(length ?? 15);

    const password = await hash(plainTextPassword, rounds ?? 10);

    return { plain: plainTextPassword, hash: password };
  }

  findByEmails(emails: string[]): Promise<User[]> {
    return this.usersRepository.find({
      where: {
        email: { $in: emails },
      },
      select: ['firstName', 'lastName', 'email', 'id', 'role'],
    });
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['firstName', 'lastName', 'email', 'id', 'role'],
    });
  }

  findOneById(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne(id, {
      select: ['firstName', 'lastName', 'email', 'id', 'role'],
    });
  }

  findOneByEmail(
    email: string,
    withPassword = false,
  ): Promise<User | undefined> {
    if (withPassword) {
      return this.usersRepository.findOne(
        { email },
        {
          select: ['firstName', 'lastName', 'email', 'id', 'role', 'password'],
        },
      );
    }

    return this.usersRepository.findOne(
      { email },
      {
        select: ['firstName', 'lastName', 'email', 'id', 'role'],
      },
    );
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
