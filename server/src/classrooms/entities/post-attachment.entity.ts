import { ChildEntity, ManyToOne } from 'typeorm';
import { Attachment } from 'src/classrooms/entities/attachment.entity';
import { Post } from 'src/classrooms/entities/post.entity';

@ChildEntity()
export class PostAttachment extends Attachment {
  @ManyToOne(() => Post, (post) => post.attachments, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  post: Post;
}
