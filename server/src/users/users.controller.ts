import {
  Controller,
  ForbiddenException,
  Get,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole, UserWithRole } from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async getAllUsers(@User() appUser: UserWithRole) {
    if (appUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have enough permissions to view all users',
      );
    }

    const users = await this.usersService.findAll();

    return { status: 'success', users };
  }
}
