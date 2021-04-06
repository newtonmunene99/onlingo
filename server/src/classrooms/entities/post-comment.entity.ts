import { ChildEntity, ManyToOne, OneToMany } from 'typeorm';
import { Post } from 'src/classrooms/entities/post.entity';
import { Comment } from 'src/classrooms/entities/comment.entity';
import { PostCommentAttachment } from './post-comment-attachment.entity';

@ChildEntity()
export class PostComment extends Comment {
  @ManyToOne(() => Post, (post) => post.comments, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  post: Post;

  @OneToMany(
    () => PostCommentAttachment,
    (postCommentAttachment) => postCommentAttachment.postComment,
  )
  attachments: PostCommentAttachment[];
}
