import { User } from 'src/users/entities/user.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
}

export type UserWithRole = User & { role: UserRole };

export type UserWithAssignedPassword = { user: User; assignedPassword: string };
