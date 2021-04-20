import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { AppConfigService } from 'src/app-config/app-config.service';
import {
  ChangePasswordDTO,
  InitiateResetPasswordDTO,
  ResetPasswordDTO,
} from 'src/users/dto/password.dto';
import { UserDTO } from 'src/users/dto/user.dto';
import { User } from 'src/users/entities/user.entity';
import { UserPayload } from 'src/users/interfaces/user-payload.interface';
import {
  UserWithAssignedPassword,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { UsersService } from 'src/users/users.service';
import { In, Repository } from 'typeorm';
import { ResetPasswordRequest } from 'src/auth/entities/reset-password-request.entity';

/**
 * This class contains logic for authentication of users.
 */
@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private appConfigService: AppConfigService,
    @InjectRepository(ResetPasswordRequest)
    private resetPasswordRequestRepository: Repository<ResetPasswordRequest>,
  ) {}

  async createSuperAdmin(userDto: UserDTO) {
    return await this.usersService.createSuperAdmin(userDto);
  }

  /**
   * This method takes in the user's `email` and `password` and validates this information against that in the database. If the information is valid, it returns a `User` object.
   * @param email The user's email address
   * @param password The user's password
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByEmail(email, true);

    if (user) {
      const isAuthentic = await compare(password, user.password);

      if (isAuthentic) {
        return { ...user, password: null };
      }

      return null;
    }

    return null;
  }

  /**
   *  This method creates a payload based on the user for JWT. JWT then proceeds to sign the custom payload and returns it as an access token for user in Authentication headers.
   * e.g.
   * ```
   * fetch('https://mybaseurl.com/shops',{
   *  method: "GET",
   *  headers: {
   *    // Notice the use of `accessToken`
   *    "Authorization": `Bearer ${accessToken}`
   *  }
   * });
   * ```
   *
   * @param user `User` object
   */
  async login(user: User) {
    const payload: UserPayload = {
      username: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(userDto: UserDTO) {
    return await this.usersService.createUser(userDto);
  }

  async changePassword(
    { id }: UserWithRole,
    { password, newPassword }: ChangePasswordDTO,
  ): Promise<User> {
    const user = await this.usersService.findOneById(id);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const authenticatedUser = await this.validateUser(user.email, password);

    if (!authenticatedUser) {
      throw new UnauthorizedException(
        'Wrong password. Please reset your password if you cannot remember',
      );
    }

    const { hash } = await this.usersService.hashPassword(newPassword);
    user.password = hash;

    return await this.usersService.updateUser(user);
  }

  async initiateResetPassword({
    email,
  }: InitiateResetPasswordDTO): Promise<UserWithAssignedPassword> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    let resetPasswordRequest = await this.resetPasswordRequestRepository.findOne(
      { user },
    );

    if (resetPasswordRequest) {
      const { createdAt } = resetPasswordRequest;

      const expiry = new Date(
        createdAt.getTime() +
          this.appConfigService.userPasswordResetTimeout * 60000,
      );

      const now = new Date();

      if (now < expiry) {
        throw new BadRequestException(
          `Please wait ${this.appConfigService.userPasswordResetTimeout} before requesting for another code`,
        );
      }

      await this.resetPasswordRequestRepository.delete(resetPasswordRequest);
    }

    const { plain, hash } = await this.usersService.hashPassword(null, null, 6);

    resetPasswordRequest = new ResetPasswordRequest();
    resetPasswordRequest.otp = hash;
    resetPasswordRequest.user = user;

    await this.resetPasswordRequestRepository.save(resetPasswordRequest);

    return { user, assignedPassword: plain };
  }

  async resetPassword({
    email,
    otp,
    newPassword,
  }: ResetPasswordDTO): Promise<User> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new NotFoundException('This user does not exist');
    }

    const resetPasswordRequest = await this.resetPasswordRequestRepository.findOne(
      {
        user,
      },
    );

    if (!resetPasswordRequest) {
      throw new UnauthorizedException(
        'Your not authorized to perform this operation',
      );
    }

    const { createdAt } = resetPasswordRequest;

    const expiry = new Date(
      createdAt.getTime() +
        this.appConfigService.userPasswordResetTimeout * 60000,
    );

    const now = new Date();

    if (now > expiry) {
      throw new BadRequestException(
        `Your code has already expired. Please request another one`,
      );
    }

    const isAuthentic = await compare(otp, resetPasswordRequest.otp);

    if (!isAuthentic) {
      throw new UnauthorizedException(
        'Your not authorized to perform this operation',
      );
    }

    const { hash } = await this.usersService.hashPassword(newPassword);
    user.password = hash;

    return await this.usersService.updateUser(user);
  }
}
