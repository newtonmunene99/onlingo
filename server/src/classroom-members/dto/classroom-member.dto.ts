import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';

export class ClassroomMemberDTO {
  @IsString()
  classroomCode: string;

  @IsString()
  @IsEmail()
  userEmail: string;

  @IsNotEmpty()
  @IsEnum(ClassroomMemberRole)
  role: ClassroomMemberRole;
}
