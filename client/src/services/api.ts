import axios, { AxiosInstance, AxiosResponse, CancelTokenSource } from 'axios';
import Cookies from 'universal-cookie';
import { CLASSROOM_MEMBERSHIPS_URL, BASE_URL, LOGIN_URL, REGISTER_URL, PROFILE_URL, CLASSROOMS_URL, AUTH_URL } from '../constants';
import { UserResponse, IUserProfileResponse, User } from '../interfaces/user.interface';
import { IResetPasswordPayload } from '../interfaces/auth.interface';
import {
  ClassroomMember,
  ClassroomPayload,
  IClassroomMembershipsResponse,
  IClassroomResponse,
  Classroom,
  IEnrollToClassResponse,
  PostPayload,
  IPostResponse,
  IPostsResponse,
  Post,
  CommentPayload,
  ICommentResponse,
  IComment,
  IAttachment,
  IAssignmentResponse,
  IAssignmentsResponse,
  Assignment,
  AssignmentPayload,
  GradePayload,
  GradeResponse,
  Grade,
} from '../interfaces/classroom.interface';
import IO from 'socket.io-client';

interface IAuthPayload {
  email: string;
  password: string;
}

interface IRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

class ApiService {
  private https: AxiosInstance = axios.create();
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.https = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  isAuthorized() {
    const accessToken = cookies.get('accessToken');

    return accessToken != (null || undefined);
  }

  role(): 'admin' | 'user' {
    const role = cookies.get('role');

    return role;
  }

  async login({ email, password }: IAuthPayload): Promise<User> {
    const response = await this.https.post(LOGIN_URL, JSON.stringify({ email, password }));

    const { accessToken } = response.data;

    cookies.set('accessToken', accessToken, { path: '/' });

    const user = await this.getProfile();

    const { role } = user;

    cookies.set('role', role, { path: '/' });

    return user;
  }

  async register(registerPayload: IRegisterPayload): Promise<User> {
    const response = await this.https.post(REGISTER_URL, JSON.stringify(registerPayload));

    const { accessToken } = response.data;

    cookies.set('accessToken', accessToken, { path: '/' });

    const user = await this.getProfile();

    const { role } = user;

    cookies.set('role', role, { path: '/' });

    return user;
  }

  async getProfile(source?: CancelTokenSource): Promise<User> {
    try {
      const accessToken = cookies.get('accessToken');

      const response = await this.https.get<any, AxiosResponse<IUserProfileResponse>>(PROFILE_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source?.token,
      });

      return response.data.user;
    } catch (error) {
      console.error(error);

      this.logout();

      window.location.replace('/');
    }
  }

  async getClassroomMemberships(source?: CancelTokenSource): Promise<ClassroomMember[]> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.get<any, AxiosResponse<IClassroomMembershipsResponse>>(CLASSROOM_MEMBERSHIPS_URL + `?as=${this.role()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.classroomMembers;
  }

  async createNewClassroom(classroom: ClassroomPayload, source?: CancelTokenSource): Promise<Classroom> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.post<any, AxiosResponse<IClassroomResponse>>(CLASSROOMS_URL, JSON.stringify(classroom), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.classroom;
  }

  async enrollToClassroom(code: string, source?: CancelTokenSource): Promise<ClassroomMember> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.get<any, AxiosResponse<IEnrollToClassResponse>>(CLASSROOM_MEMBERSHIPS_URL + `/enroll/${code}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.classroomMember;
  }

  async deleteClassroomMember(classroomMemberId: number, source?: CancelTokenSource): Promise<void> {
    const accessToken = cookies.get('accessToken');

    await this.https.delete<any, AxiosResponse<any>>(CLASSROOM_MEMBERSHIPS_URL + `/${classroomMemberId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      cancelToken: source?.token,
    });

    return;
  }

  async updateClassroom(classroomCode: string, classroomPayload: ClassroomPayload, source?: CancelTokenSource): Promise<Post> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.patch<any, AxiosResponse<IPostResponse>>(CLASSROOMS_URL + `/${classroomCode}`, JSON.stringify(classroomPayload), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.post;
  }

  async getClassroomByCode(classroomCode: string, source?: CancelTokenSource): Promise<Classroom> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.get<any, AxiosResponse<IClassroomResponse>>(CLASSROOMS_URL + `/${classroomCode}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.classroom;
  }

  async createNewPost(classroomCode: string, post: PostPayload, source?: CancelTokenSource): Promise<Post> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.post<any, AxiosResponse<IPostResponse>>(CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/posts`, JSON.stringify(post), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.post;
  }

  async createNewAssignment(classroomCode: string, assignment: AssignmentPayload, source?: CancelTokenSource): Promise<Assignment> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.post<any, AxiosResponse<IAssignmentResponse>>(
      CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/assignments`,
      JSON.stringify(assignment),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source?.token,
      },
    );

    return response.data.assignment;
  }

  async getClassroomPosts(classroomCode: string, source?: CancelTokenSource): Promise<Post[]> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.get<any, AxiosResponse<IPostsResponse>>(CLASSROOMS_URL + `/${classroomCode}/posts`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.posts;
  }

  async getClassroomAssignments(classroomCode: string, source?: CancelTokenSource): Promise<Assignment[]> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.get<any, AxiosResponse<IAssignmentsResponse>>(CLASSROOMS_URL + `/${classroomCode}/assignments`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.assignments;
  }

  async updateClassroomPost(classroomCode: string, postId: number, postPayload: PostPayload, source?: CancelTokenSource): Promise<Post> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.patch<any, AxiosResponse<IPostResponse>>(CLASSROOMS_URL + `/${classroomCode}/posts/${postId}`, JSON.stringify(postPayload), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return response.data.post;
  }

  async gradeAssignment(classroomCode: string, assignmentId: number, submissionId: number, gradePayload: GradePayload, source?: CancelTokenSource): Promise<Grade> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.patch<any, AxiosResponse<GradeResponse>>(
      CLASSROOMS_URL + `/${classroomCode}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      JSON.stringify(gradePayload),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source?.token,
      },
    );

    return response.data.grade;
  }

  async updateClassroomAssignment(classroomCode: string, assignmentId: number, assignmentPayload: AssignmentPayload, source?: CancelTokenSource): Promise<Assignment> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.patch<any, AxiosResponse<IAssignmentResponse>>(
      CLASSROOMS_URL + `/${classroomCode}/assignments/${assignmentId}`,
      JSON.stringify(assignmentPayload),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source?.token,
      },
    );

    return response.data.assignment;
  }

  async deleteClassroomPost(classroomCode: string, postId: number, source?: CancelTokenSource): Promise<void> {
    const accessToken = cookies.get('accessToken');

    await this.https.delete<any, AxiosResponse<Omit<IPostResponse, 'post'>>>(CLASSROOMS_URL + `/${classroomCode}/posts/${postId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return;
  }

  async deleteClassroom(classroomCode: string, source?: CancelTokenSource): Promise<void> {
    const accessToken = cookies.get('accessToken');

    await this.https.delete<any, AxiosResponse<Omit<IClassroomResponse, 'classroom'>>>(CLASSROOMS_URL + `/${classroomCode}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cancelToken: source?.token,
    });

    return;
  }

  async createNewPostComment(classroomCode: string, postId: number, comment: CommentPayload, source?: CancelTokenSource): Promise<IComment> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.post<any, AxiosResponse<ICommentResponse>>(
      CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/posts/${postId}/comments`,
      JSON.stringify(comment),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source?.token,
      },
    );

    return response.data.comment;
  }

  async createNewAssignmentComment(classroomCode: string, assignmentId: number, comment: CommentPayload, source?: CancelTokenSource): Promise<IComment> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.post<any, AxiosResponse<ICommentResponse>>(
      CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/assignments/${assignmentId}/comments`,
      JSON.stringify(comment),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cancelToken: source?.token,
      },
    );

    return response.data.comment;
  }

  async addAttachmentsToPost(classroomCode: string, postId: number, attachments: File[], source?: CancelTokenSource): Promise<void> {
    const formData = new FormData();

    for (const attachment of attachments) {
      formData.append('files', attachment);
    }
    const accessToken = cookies.get('accessToken');

    await this.https.post<any, AxiosResponse<any>>(CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/posts/${postId}/attachments`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      cancelToken: source?.token,
    });

    return;
  }

  async addAttachmentsToAssignment(classroomCode: string, assignmentId: number, attachments: File[], source?: CancelTokenSource): Promise<void> {
    const formData = new FormData();

    for (const attachment of attachments) {
      formData.append('files', attachment);
    }
    const accessToken = cookies.get('accessToken');

    await this.https.post<any, AxiosResponse<any>>(CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/assignments/${assignmentId}/attachments`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      cancelToken: source?.token,
    });

    return;
  }

  async addSubmissionToAssignment(classroomCode: string, assignmentId: number, attachments: File[], comment: CommentPayload, source?: CancelTokenSource): Promise<void> {
    const formData = new FormData();

    for (const attachment of attachments) {
      formData.append('files', attachment);
    }

    if (comment?.body) {
      formData.append('body', comment.body);
    }

    const accessToken = cookies.get('accessToken');

    await this.https.post<any, AxiosResponse<any>>(CLASSROOM_MEMBERSHIPS_URL + `/classroom/${classroomCode}/assignments/${assignmentId}/submissions`, formData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
      cancelToken: source?.token,
    });

    return;
  }

  async downloadAttachment(classroomCode: string, postId: number, attachment: IAttachment, source?: CancelTokenSource): Promise<void> {
    const accessToken = cookies.get('accessToken');

    const response = await this.https.get<any, AxiosResponse<any>>(CLASSROOMS_URL + `/${classroomCode}/posts/${postId}/attachments/${attachment.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob',
      cancelToken: source?.token,
    });

    const { data } = response;
    const downloadUrl = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', attachment.originalFileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  async deleteAttachment(classroomCode: string, postId: number, attachment: IAttachment, source?: CancelTokenSource): Promise<void> {
    const accessToken = cookies.get('accessToken');

    await this.https.delete<any, AxiosResponse<any>>(CLASSROOMS_URL + `/${classroomCode}/posts/${postId}/attachments/${attachment.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },

      cancelToken: source?.token,
    });

    return;
  }

  async resetPasswordInitiate(email: string, source?: CancelTokenSource): Promise<void> {
    try {
      await this.https.post<any, AxiosResponse<Omit<UserResponse, 'user'>>>(`${AUTH_URL}/password-reset`, JSON.stringify({ email }), {
        cancelToken: source?.token,
      });

      return;
    } catch (error) {
      throw error;
    }
  }

  async resetPasswordComplete(resetPasswordPayload: IResetPasswordPayload, source?: CancelTokenSource): Promise<void> {
    try {
      await this.https.put<any, AxiosResponse<Omit<UserResponse, 'user'>>>(`${AUTH_URL}/password-reset`, JSON.stringify(resetPasswordPayload), {
        cancelToken: source?.token,
      });

      return;
    } catch (error) {
      throw error;
    }
  }

  createSocketClient(namespace = 'virtual-classrooms'): SocketIOClient.Socket {
    const io = IO(`${this.baseUrl}/${namespace}`, {
      // transportOptions: {
      //   polling: {
      //     extraHeaders: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   },
      // },
    });

    return io;
  }

  logout() {
    const accessToken = cookies.get('accessToken');
    const role = cookies.get('role');

    if (accessToken) {
      cookies.remove('accessToken');
    }

    if (role) {
      cookies.remove('role');
    }
  }
}

export const apiService = new ApiService(BASE_URL);
export const cookies = new Cookies();
export const classroomsSocketClient = apiService.createSocketClient();
