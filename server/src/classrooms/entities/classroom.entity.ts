import { AppBaseEntity } from 'src/base.entity';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { Column, Entity, Index, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class Classroom extends AppBaseEntity {
  @OneToMany(
    () => ClassroomMember,
    (classroomMember) => classroomMember.classroom,
  )
  members: ClassroomMember[];

  @Column({ nullable: false })
  name: string;

  @Column()
  @Index({ unique: true })
  code: string;

  @Column({ nullable: false })
  unitCode: string;

  @Column({ nullable: true })
  description: string;

  constructor() {
    super();
  }
}
