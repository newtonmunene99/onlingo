export interface IUserProfileResponse {
  status: string;
  user: User;
}

export interface UserPayload {
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  status: 'success';
  user: User;
}

export interface UsersResponse {
  status: 'success';
  users: User[];
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  password: null;
  createdAt?: string;
}
