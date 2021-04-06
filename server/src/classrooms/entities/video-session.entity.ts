import { AppBaseEntity } from 'src/base.entity';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { Column, Entity, Index, ManyToOne, OneToMany } from 'typeorm';
import { Classroom } from './classroom.entity';
import { VideoSessionParticipant } from './video-session-participant.entity';

@Entity()
export class VideoSession extends AppBaseEntity {
  @ManyToOne(() => Classroom, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  classroom: Classroom;

  @ManyToOne(() => ClassroomMember, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  owner: ClassroomMember;

  @OneToMany(
    () => VideoSessionParticipant,
    (videoSessionParticipant) => videoSessionParticipant.videoSession,
  )
  participants: VideoSessionParticipant[];

  @Column()
  @Index({ unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  constructor() {
    super();
  }
}
