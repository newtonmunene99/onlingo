import { AppBaseEntity } from 'src/base.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';

@Entity()
export class Grade extends AppBaseEntity {
  @OneToOne(
    () => AssignmentSubmission,
    (assignmentSubmisstion) => assignmentSubmisstion.grade,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  assignmentSubmission: AssignmentSubmission;

  @Column({ nullable: false, default: 0 })
  points: number;

  @Column({ nullable: true })
  comments: string;

  constructor() {
    super();
  }
}
