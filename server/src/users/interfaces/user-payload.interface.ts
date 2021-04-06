import { UserRole } from 'src/users/interfaces/user-role.interface';

export interface UserPayload {
  username: string;
  sub: number;
  role: UserRole;
}
