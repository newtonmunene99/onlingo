import { AppBaseEntity } from 'src/base.entity';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  TableInheritance,
} from 'typeorm';
import { PostAttachment } from 'src/classrooms/entities/post-attachment.entity';
import { PostComment } from 'src/classrooms/entities/post-comment.entity';

@Entity()
@TableInheritance({
  column: {
    name: 'type',
    type: 'enum',
    default: 'Post',
    enum: ['Post', 'Assignment'],
  },
})
export class Post extends AppBaseEntity {
  @ManyToOne(() => ClassroomMember, (author) => author.posts, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  author: ClassroomMember;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, length: '3000' })
  body: string;

  @OneToMany(() => PostComment, (comment) => comment.post)
  comments: PostComment[];

  @OneToMany(() => PostAttachment, (attachment) => attachment.post)
  attachments: PostAttachment[];

  @Column({
    name: 'type',
    type: 'enum',
    default: 'Post',
    enum: ['Post', 'Assignment'],
  })
  type: 'Post' | 'Assignment';

  constructor() {
    super();
  }
}
