import { AppBaseEntity } from 'src/base.entity';
import { Column, Entity, Index } from 'typeorm';
import { UserGender, UserRole } from 'src/users/interfaces/user-role.interface';

@Entity()
export class User extends AppBaseEntity {
  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: UserGender,
  })
  gender: UserGender;

  @Column({ type: 'date' })
  dob: Date;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  constructor() {
    super();
  }
}
