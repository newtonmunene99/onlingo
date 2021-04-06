import { AppBaseEntity } from 'src/base.entity';
import { Classroom } from 'src/classrooms/entities/classroom.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';
import { Post } from 'src/classrooms/entities/post.entity';

@Entity()
@Index('classroom_member_index', ['classroom', 'user'], { unique: true })
export class ClassroomMember extends AppBaseEntity {
  @ManyToOne(() => Classroom, (classroom) => classroom.members, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  classroom: Classroom;

  @ManyToOne(() => User, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column({
    type: 'enum',
    enum: ClassroomMemberRole,
  })
  role: ClassroomMemberRole;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  constructor() {
    super();
  }
}
