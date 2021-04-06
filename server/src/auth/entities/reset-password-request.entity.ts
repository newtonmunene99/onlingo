import { AppBaseEntity } from 'src/base.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class ResetPasswordRequest extends AppBaseEntity {
  @OneToOne(() => User, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column()
  otp: string;

  constructor() {
    super();
  }
}
