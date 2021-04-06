import { UserRole } from 'src/users/interfaces/user-role.interface';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class UserDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(6)
  password: string;
}
