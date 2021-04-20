import { User } from './user.interface';

export interface IClassroomMembershipsResponse {
  status: string;
  classroomMembers: ClassroomMember[];
}

export interface IClassroomsResponse {
  status: string;
  classrooms: Classroom[];
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
  unitCode: string;
  description: string;
  members?: ClassroomMember[];
}

export type ClassroomWithPopUpOptions = Classroom & { popupOpen: boolean };

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
  unitCode: string;
  description: string;
}

export type PostWithPopUpOptions = PostOrAssignment;

export type PostOrAssignment = (Assignment & { popupOpen: boolean }) | (Post & { popupOpen: boolean });

export interface PostPayload {
  title: string;
  body: string;
}

export interface PostResponse {
  status: string;
  post: Post;
}

export interface PostsResponse {
  status: string;
  posts: Post[];
}
export interface Post {
  id: number;
  createdAt: string;
  title: string;
  body: string;
  author: ClassroomMember;
  comments: IComment[];
  attachments: Attachment[];
  type: 'Post' | 'Assignment';
}

export interface Assignment extends Post {
  submissions: AssignmentSubmission[];
  dueDate: string;
  totalPoints: number;
}

export interface AssignmentSubmission extends IComment {
  assignment: Assignment;
  grade: Grade;
  attachments: AssignmentSubmissionAttachment[];
}

export type GradeWithPopUpOptions = Grade & { popupOpen: boolean };
export interface Grade {
  assignmentSubmission: AssignmentSubmission;
  points: number;
  comments: string | null;
  createdAt: string;
}

export interface AttachmentResponse {
  status: string;
  attachment: Attachment;
}

export interface AttachmentsResponse {
  status: string;
  attachments: Attachment[];
}

export type AttachmentWithPopUpOptions = Attachment & { popupOpen: boolean };
export interface Attachment {
  id: number;
  createdAt: string;
  title: string;
  originalFileName: string;
  fileName: string;
  path: string;
  mimeType: string;
  size: number;
  type: 'PostAttachment' | 'PostCommentAttachment' | 'AssignmentSubmissionAttachment';
  post?: Post;
  assignmentSubmission?: AssignmentSubmission;
}

export interface PostAttachment extends Attachment {
  post: Post;
}

export interface PostCommentAttachment extends Attachment {
  postComment: PostComment;
}

export interface AssignmentSubmissionAttachment extends Attachment {
  assignmentSubmission: AssignmentSubmission;
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
  author: ClassroomMember;
  body: string;
  type: 'PostComment' | 'AssignmentSubmission';
}

export interface PostComment extends IComment {
  post: Post;
  attachments: PostCommentAttachment[];
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
