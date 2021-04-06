import { ChildEntity, ManyToOne } from 'typeorm';
import { AssignmentSubmission } from 'src/classrooms/entities/assignment-submission.entity';
import { Attachment } from 'src/classrooms/entities/attachment.entity';

@ChildEntity()
export class AssignmentSubmissionAttachment extends Attachment {
  @ManyToOne(
    () => AssignmentSubmission,
    (assignmentSubmission) => assignmentSubmission.attachments,
    {
      nullable: true,
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  assignmentSubmission: AssignmentSubmission;
}
