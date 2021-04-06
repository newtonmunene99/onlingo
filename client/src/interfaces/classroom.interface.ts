import { User } from './user.interface';

export interface IClassroomMembershipsResponse {
  status: string;
  classroomMembers: ClassroomMember[];
}

export interface IClassroomResponse {
  status: string;
  classroom: Classroom;
}

export interface IEnrollToClassResponse {
  status: string;
  classroomMember: ClassroomMember;
}

export interface Classroom {
  id: number;
  createdAt: string;
  name: string;
  code: string;
  description: string;
  members?: ClassroomMember[];
}

export interface ClassroomMember {
  id: number;
  createdAt: string;
  role: 'facilitator' | 'student';
  classroom?: Classroom;
  user?: User;
  posts?: Post[];
}

export interface ClassroomPayload {
  name: string;
  description: string;
}

export type PostWithPopUpOptions = PostOrAssignment;

export type PostOrAssignment = (Assignment & { popupOpen: boolean }) | (Post & { popupOpen: boolean });

export interface Post {
  id: number;
  createdAt: string;
  title: string;
  body: string;
  author: ClassroomMember;
  comments: IComment[];
  attachments: IAttachment[];
  type: 'Post' | 'Assignment';
}

export interface Assignment extends Post {
  submissions: AssignmentSubmission[];
  dueDate: string;
  totalPoints: number;
}

export interface AssignmentSubmission extends IComment {
  post: Assignment;
  grade: Grade;
  attachments: IAttachment[];
}

export interface Grade {
  assignmentSubmission: AssignmentSubmission;
  points: number;
  comments: string | null;
}

export interface IAttachment {
  id: number;
  createdAt: string;
  post: Post;
  title: string;
  originalFileName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  type: 'Attachment' | 'CommentAttachment';
}

export interface ICommentAttachment extends IAttachment {
  comment: IComment;
}

export interface GradePayload {
  points: number;
  comments?: string;
}

export interface GradeResponse {
  status: string;
  grade: Grade;
}

export interface GradesResponse {
  status: string;
  grades: Grade[];
}

export interface PostPayload {
  title: string;
  body: string;
}

export interface IPostResponse {
  status: string;
  post: Post;
}

export interface IPostsResponse {
  status: string;
  posts: Post[];
}

export type AssignmentWithPopUpOptions = Assignment & { popupOpen: boolean };

export interface AssignmentPayload extends PostPayload {
  dueDate: string;
  totalPoints: number;
}

export interface IAssignmentResponse {
  status: string;
  assignment: Assignment;
}

export interface IAssignmentsResponse {
  status: string;
  assignments: Assignment[];
}

export type CommentWithPopUpOptions = IComment & { popupOpen: boolean };

export interface IComment {
  id: number;
  createdAt: string;
  body: string;
  author: ClassroomMember;
  post: Post;
  type: 'Comment' | 'AssignmentSubmission';
}

export interface CommentPayload {
  body: string;
}

export interface ICommentResponse {
  status: string;
  comment: IComment;
}

export interface ICommentsResponse {
  status: string;
  comments: IComment[];
}
