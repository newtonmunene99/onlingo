import { IsOptional, IsString, MinLength } from 'class-validator';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { Classroom } from '../entities/classroom.entity';

export class ClassroomDTO {
  @IsString()
  @MinLength(8)
  name: string;

  @IsOptional()
  @IsString()
  description: string;
}

export class VideoSessionDTO {
  classroom: Classroom;
  classroomMember: ClassroomMember;
}

export class JoinVideoSessionDTO {
  classroom: Classroom;
  classroomMember: ClassroomMember;
  videoSessionCode: string;
  peerId: string;
}
