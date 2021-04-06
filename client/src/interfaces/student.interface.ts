import { User, UserPayload } from './user.interface';

export interface IGetAllStudentsResponse {
  status: string;
  students: Student[];
}

export interface Student {
  id: number;
  createdAt: string;
  studentId: string;
  user: User;
}

export interface StudentPayload {
  studentId: string;
  user: UserPayload;
}

export interface IStudentResponse {
  status: string;
  student: Student;
}
