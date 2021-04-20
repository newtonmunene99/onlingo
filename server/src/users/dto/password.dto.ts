import {
  IsAlphanumeric,
  IsEmail,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsAlphanumeric()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
    message: 'Password must be at least 8 characters long and alphanumeric',
  })
  newPassword: string;

  @IsString()
  password: string;
}

export class InitiateResetPasswordDTO {
  @IsString()
  @IsEmail()
  email: string;
}

export class ResetPasswordDTO extends InitiateResetPasswordDTO {
  @IsString()
  @IsAlphanumeric()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, {
    message: 'Password must be at least 8 characters long and alphanumeric',
  })
  newPassword: string;

  @IsString()
  otp: string;
}
