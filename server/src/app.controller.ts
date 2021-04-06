import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Logger,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AppConfigService } from 'src/app-config/app-config.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { MailService } from 'src/mail/mail.service';
import {
  ChangePasswordDTO,
  InitiateResetPasswordDTO,
  ResetPasswordDTO,
} from 'src/users/dto/password.dto';
import { UserDTO } from 'src/users/dto/user.dto';
import { UserWithRole } from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);

  constructor(
    private authService: AuthService,
    private appConfigService: AppConfigService,
    private mailService: MailService,
  ) {}

  @Post('auth/super/create')
  @UsePipes(ValidationPipe)
  async createSuperAdmin(
    @Headers('Authorization') authorization: string,
    @Body() body: UserDTO,
  ) {
    const encodedAuthString = authorization?.split(' ')[1];

    if (encodedAuthString) {
      const credentials = Buffer.from(encodedAuthString, 'base64').toString();

      if (credentials === `master:${this.appConfigService.masterPassword}`) {
        return await this.authService.createSuperAdmin(body);
      }
    }

    throw new UnauthorizedException(
      'You are not authorized to perform this operation',
    );
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() request) {
    return this.authService.login(request.user);
  }

  @Post('auth/register')
  @UsePipes(ValidationPipe)
  async register(@Body() body: UserDTO) {
    const user = await this.authService.register(body);

    await this.mailService.sendNewUserEmail(user);

    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/password-change')
  @UsePipes(ValidationPipe)
  async changePassword(
    @User() user: UserWithRole,
    @Body() body: ChangePasswordDTO,
  ) {
    const newUser = await this.authService.changePassword(user, body);

    if (!newUser) {
      throw new BadRequestException('We were unable to change your password');
    }

    await this.mailService.sendPasswordChangedEmail(newUser);

    return {
      status: 'success',
      message: 'Your password has been changed successfully',
    };
  }

  @Post('auth/password-reset')
  @UsePipes(ValidationPipe)
  async initiateResetPassword(@Body() body: InitiateResetPasswordDTO) {
    const newUser = await this.authService.initiateResetPassword(body);

    if (!newUser) {
      throw new BadRequestException('We were unable to reset your password');
    }

    await this.mailService.sendInitiatePasswordResetEmail(newUser);

    return {
      status: 'success',
      message: 'One time pin has been sent to your email',
    };
  }

  @Put('auth/password-reset')
  @UsePipes(ValidationPipe)
  async resetPassword(@Body() body: ResetPasswordDTO) {
    const newUser = await this.authService.resetPassword(body);

    if (!newUser) {
      throw new BadRequestException('We were unable to reset your password');
    }

    await this.mailService.sendPasswordResetEmail(newUser);

    return {
      status: 'success',
      message: 'Your password has been reset successfully',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return { status: 'success', user: req.user };
  }

  @Get('hello')
  hello() {
    return 'hello';
  }
}
