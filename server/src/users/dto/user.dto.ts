import {
  IsAlphanumeric,
  IsDateString,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { UserGender } from '../interfaces/user-role.interface';

export class UserDTO {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender;

  @IsString()
  @IsAlphanumeric()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
    message: 'Password must be at least 8 characters long and alphanumeric',
  })
  password: string;
}

export class UpdateUserDTO {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsDateString()
  dob: string;

  @IsNotEmpty()
  @IsEnum(UserGender)
  gender: UserGender;
}
