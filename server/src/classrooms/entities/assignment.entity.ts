import { ChildEntity, Column, OneToMany } from 'typeorm';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';
import { Post } from 'src/classrooms/entities/post.entity';

@ChildEntity()
export class Assignment extends Post {
  @OneToMany(
    () => AssignmentSubmission,
    (submission) => submission.assignment,
  )
  submissions: AssignmentSubmission[];

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date;

  @Column({ nullable: false, default: 100 })
  totalPoints: number;
}
