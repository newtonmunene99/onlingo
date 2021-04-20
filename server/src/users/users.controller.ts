import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';
import { User } from 'src/users/user.decorator';
import { UsersService } from 'src/users/users.service';
import { UpdateUserDTO, UserDTO } from './dto/user.dto';

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

  @Patch(':userId')
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async updateUser(
    @User() appUser: UserWithRole,
    @Param('userId', ParseIntPipe) userId: number,
    @Body() updateUserDto: UpdateUserDTO,
  ) {
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }

    const userIsOwner = appUser.id === user.id;

    if (userIsOwner || appUser.role === UserRole.ADMIN) {
      user.firstName = updateUserDto.firstName;
      user.lastName = updateUserDto.lastName;
      user.dob = new Date(updateUserDto.dob);
      user.gender = updateUserDto.gender;

      const updatedUser = await this.usersService.updateUser(user);

      return { status: 'success', user: updatedUser };
    }

    throw new ForbiddenException(`You are not allowed to update this user`);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async deleteUser(
    @User() appUser: UserWithRole,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with id ${userId} does not exist`);
    }

    const userIsOwner = appUser.id === user.id;

    if (userIsOwner || appUser.role === UserRole.ADMIN) {
      await this.usersService.deleteUser(user);

      return {
        status: 'success',
      };
    }

    throw new ForbiddenException(
      `You are not authorized to perform this operation`,
    );
  }
}
