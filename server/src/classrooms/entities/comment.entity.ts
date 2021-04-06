import { AppBaseEntity } from 'src/base.entity';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { Column, Entity, ManyToOne, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({
  column: {
    name: 'type',
    type: 'enum',
    default: 'PostComment',
    enum: ['PostComment', 'AssignmentSubmission'],
  },
})
export class Comment extends AppBaseEntity {
  @ManyToOne(() => ClassroomMember, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  author: ClassroomMember;

  @Column({ nullable: true })
  body: string;

  @Column({
    name: 'type',
    type: 'enum',
    default: 'PostComment',
    enum: ['PostComment', 'AssignmentSubmission'],
  })
  type: 'PostComment' | 'AssignmentSubmission';

  constructor() {
    super();
  }
}
