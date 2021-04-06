import {
  ChildEntity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Assignment } from 'src/classrooms/entities/assignment.entity';
import { Comment } from 'src/classrooms/entities/comment.entity';
import { Grade } from 'src/classrooms/entities/grade.entity';
import { AssignmentSubmissionAttachment } from './assignment-submission-attachment.entity';

@ChildEntity()
export class AssignmentSubmission extends Comment {
  @ManyToOne(() => Assignment, (assignment) => assignment.submissions, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  assignment: Assignment;

  @OneToMany(
    () => AssignmentSubmissionAttachment,
    (assignmentSubmissionAttachment) =>
      assignmentSubmissionAttachment.assignmentSubmission,
  )
  attachments: AssignmentSubmissionAttachment[];

  @OneToOne(() => Grade, (grade) => grade.assignmentSubmisstion, {
    nullable: true,
  })
  grade: Grade;
}
