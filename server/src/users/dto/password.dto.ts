import { IsAlphanumeric, IsEmail, IsString, MinLength } from 'class-validator';

export class ChangePasswordDTO {
  @IsString()
  @IsAlphanumeric()
  @MinLength(3)
  newPassword: string;

  @IsString()
  @IsAlphanumeric()
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
  @MinLength(3)
  newPassword: string;

  @IsString()
  otp: string;
}
