import {
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';
import { ClassroomsService } from 'src/classrooms/classrooms.service';
import { UsersService } from 'src/users/users.service';

@Controller('grades')
export class GradesController {
  private logger = new Logger(GradesController.name);

  constructor(
    private classroomsService: ClassroomsService,
    private usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserGrades(
    @User() appUser: UserWithRole,
    @Query('userId', ParseIntPipe) userId: number,
  ) {
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }

    if (appUser.id == user.id || appUser.role === UserRole.ADMIN) {
      const grades = await this.classroomsService.findUserGrades(user);

      return { status: 'success', grades };
    }

    throw new ForbiddenException(`You do not have enough permissions`);
  }
}
