import { AppBaseEntity } from 'src/base.entity';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { Entity, ManyToOne } from 'typeorm';
import { VideoSession } from './video-session.entity';

@Entity()
export class VideoSessionParticipant extends AppBaseEntity {
  @ManyToOne(() => VideoSession, (videoSession) => videoSession.participants, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  videoSession: VideoSession;

  @ManyToOne(() => ClassroomMember, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  participant: ClassroomMember;

  constructor() {
    super();
  }
}
