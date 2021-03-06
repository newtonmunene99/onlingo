import { AxiosError } from 'axios';
import { Assignment, AssignmentSubmission, Attachment, IComment, Post, PostCommentAttachment } from './interfaces/classroom.interface';

export const BASE_URL = 'http://localhost:5000';
export const AUTH_URL = '/api/auth';
export const LOGIN_URL = '/api/auth/login';
export const REGISTER_URL = '/api/auth/register';
export const PROFILE_URL = '/api/profile';
export const USERS_URL = '/api/users';
export const CLASSROOMS_URL = '/api/classrooms';
export const POSTS_URL = '/api/posts';
export const ATTACHMENTS_URL = '/api/attachments';
export const CLASSROOM_MEMBERSHIPS_URL = '/api/classroom-members';
export const GRADES_URL = '/api/grades';

export const HOME_PATH = '/';
export const REGISTER_PATH = '/register';
export const DASHBOARD_PATH = '/dashboard';

export const isAxiosError = <T extends unknown>(object: any): object is AxiosError<T> => {
  return (object as AxiosError<T>).isAxiosError;
};

export const isAssignment = (object: any): object is Assignment => {
  return (object as Post).type === 'Assignment';
};

export const isAssignmentSubmission = (object: any): object is AssignmentSubmission => {
  return (object as IComment).type === 'AssignmentSubmission';
};

export const isCommentAttachment = (object: any): object is PostCommentAttachment => {
  return (object as Attachment).type === 'PostCommentAttachment';
};

export const toDatetimeLocal = (date: Date) => {
  const ten = (i: any) => {
      return (i < 10 ? '0' : '') + i;
    },
    YYYY = date.getFullYear(),
    MM = ten(date.getMonth() + 1),
    DD = ten(date.getDate()),
    HH = ten(date.getHours()),
    II = ten(date.getMinutes()),
    SS = ten(date.getSeconds());
  return YYYY + '-' + MM + '-' + DD + 'T' + HH + ':' + II + ':' + SS;
};
