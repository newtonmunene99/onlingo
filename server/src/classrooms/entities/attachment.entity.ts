import { AppBaseEntity } from 'src/base.entity';
import { Column, Entity, TableInheritance } from 'typeorm';

@Entity()
@TableInheritance({
  column: {
    name: 'type',
    type: 'enum',
    default: 'PostAttachment',
    enum: [
      'PostAttachment',
      'PostCommentAttachment',
      'AssignmentSubmissionAttachment',
    ],
  },
})
export class Attachment extends AppBaseEntity {
  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  originalFileName: string;

  @Column({ nullable: false })
  fileName: string;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false })
  mimeType: string;

  @Column({ nullable: true })
  size: number;

  @Column({
    name: 'type',
    type: 'enum',
    default: 'PostAttachment',
    enum: [
      'PostAttachment',
      'PostCommentAttachment',
      'AssignmentSubmissionAttachment',
    ],
  })
  type:
    | 'PostAttachment'
    | 'PostCommentAttachment'
    | 'AssignmentSubmissionAttachment';

  constructor() {
    super();
  }
}
