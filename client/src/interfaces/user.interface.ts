export interface IUserProfileResponse {
  status: string;
  user: User;
}

export interface UserPayload {
  email: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female';
}

export interface UserResponse {
  status: 'success';
  user: User;
}

export interface UsersResponse {
  status: 'success';
  users: User[];
}

export type UserWithPopUpOptions = User & { popupOpen: boolean };

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'user';
  gender: 'male' | 'female';
  dob: string;
  password: null;
  createdAt?: string;
}
