import { ChildEntity, ManyToOne } from 'typeorm';
import { Attachment } from 'src/classrooms/entities/attachment.entity';
import { PostComment } from 'src/classrooms/entities/post-comment.entity';

@ChildEntity()
export class PostCommentAttachment extends Attachment {
  @ManyToOne(() => PostComment, (postComment) => postComment.attachments, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  postComment: PostComment;
}
