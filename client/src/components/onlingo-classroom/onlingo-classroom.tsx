import { Component, h, Prop, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { isAssignment, toDatetimeLocal } from '../../constants';
import { Assignment, AssignmentSubmission, Classroom, ClassroomMember, IAttachment, Post, PostWithPopUpOptions } from '../../interfaces/classroom.interface';
import { User } from '../../interfaces/user.interface';
import { apiService, classroomsSocketClient } from '../../services/api';

@Component({
  tag: 'onlingo-classroom',
  styleUrl: 'onlingo-classroom.scss',
  shadow: false,
})
export class OnlingoClassroom {
  @Prop() classroomCode: string;

  @State() createNewClassroomPostModalOpen = false;
  @State() createNewClassroomAssignmentModalOpen = false;
  @State() showClassroomAssignmentSubmissionsModalOpen = false;
  @State() editClassroomAssignmentModalOpen = false;
  @State() editClassroomPostModalOpen = false;
  @State() addAttachmentsToPostModalOpen = false;
  @State() addSubmissionsToAssignmentModalOpen = false;
  @State() classroomMembersModalOpen = false;

  @State() postTitle = '';
  @State() postBody = '';

  @State() assignmentTitle = '';
  @State() assignmentBody = '';
  @State() assignmentDueDate: Date;
  @State() assignmentTotalPoints = 100;

  @State() editPost: Post;
  @State() editAssignment: Assignment;
  @State() assignmentComment: string;
  @State() selectedAttachments: File[] = [];

  @State() classroom: Classroom;

  @State() classroomPosts: PostWithPopUpOptions[] = [];

  @State() user: User;

  @State() classroomMember: ClassroomMember;

  socket: SocketIOClient.Socket;

  componentDidLoad() {
    this.getClassroom();
  }

  disconnectedCallback() {
    this.socket?.close();
  }

  private handleDeleteMember = async (member: ClassroomMember) => {
    const result = await Swal.fire({
      title: 'Are you sure',
      html: 'Do you want to proceed and delete this member?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: async () => {
        try {
          return await apiService.deleteClassroomMember(member.id);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.classroomMembersModalOpen = false;

      this.classroom.members = [];
      await this.getClassroom();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Member has been deleted`,
      });
    }
  };

  private handleCreateNewClassroomPostSubmit = async () => {
    if (!this.postTitle || !this.postBody) {
      Swal.fire({
        title: 'Fill in all fields',
        html: 'Please fill in all required fields',
        icon: 'error',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Create New Post',
      html: 'Do you want to proceed and create a new post?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Create',
      preConfirm: async () => {
        try {
          return await apiService.createNewPost(this.classroomCode, {
            title: this.postTitle,
            body: this.postBody,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.createNewClassroomPostModalOpen = false;
      this.clearVariables();
      await this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Post has been created`,
      });
    }
  };

  private handleCreateNewClassroomAssignment = async () => {
    if (!this.assignmentTitle || !this.assignmentBody || !this.assignmentTotalPoints) {
      Swal.fire({
        title: 'Fill in all fields',
        html: 'Please fill in all required fields',
        icon: 'error',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Create New Assignment',
      html: 'Do you want to proceed and create a new assignment?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Create',
      preConfirm: async () => {
        try {
          return await apiService.createNewAssignment(this.classroomCode, {
            title: this.assignmentTitle,
            body: this.assignmentBody,
            dueDate: this.assignmentDueDate ? toDatetimeLocal(this.assignmentDueDate) : null,
            totalPoints: this.assignmentTotalPoints,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.createNewClassroomAssignmentModalOpen = false;
      this.clearVariables();
      await this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Assignment has been created`,
      });
    }
  };

  private handleUpdatePost = async () => {
    const result = await Swal.fire({
      title: 'Are you sure',
      html: 'Do you want to proceed and update this post',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: async () => {
        try {
          return await apiService.updateClassroomPost(this.classroom.code, this.editPost?.id, {
            title: this.editPost.title,
            body: this.editPost.body,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.editClassroomPostModalOpen = false;
      this.clearEditVariables();
      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Post has been updated`,
      });
    }
  };

  private handleUpdateAssignment = async () => {
    const result = await Swal.fire({
      title: 'Are you sure',
      html: 'Do you want to proceed and update this assignment',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: async () => {
        try {
          return await apiService.updateClassroomAssignment(this.classroom.code, this.editAssignment?.id, {
            title: this.editAssignment.title,
            body: this.editAssignment.body,
            dueDate: this.editAssignment.dueDate,
            totalPoints: this.editAssignment.totalPoints,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.editClassroomAssignmentModalOpen = false;
      this.clearEditVariables();
      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Assignment has been updated`,
      });
    }
  };

  private handleDeletePost = async (post: PostWithPopUpOptions) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          return await apiService.deleteClassroomPost(this.classroom.code, post.id);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Post has been deleted`,
      });
    }
  };

  private handleDeleteAttachment = async (post: Post, attachment: IAttachment) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      preConfirm: async () => {
        try {
          return await apiService.deleteAttachment(this.classroom.code, post.id, attachment);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Attachment has been deleted`,
      });
    }
  };

  private handleSeePostComments = async (post: PostWithPopUpOptions) => {
    const result = await Swal.fire({
      html: `<div class="text-left">
        <h1 class="font-bold">${post.title}</h1>
        <p class="text-sm">${post.body}</p>
        <div class="mt-8 bg-gray-100 p-2 rounded-md divide-y divide-white">
          ${post.comments.map(
            comment =>
              `
              <div class="py-1">
                <h2 class=" font-semibold">
                  ${comment.author.user.firstName} ${comment.author.user.lastName}
                </h2>
                <p class="text-sm">
                  ${comment.body}
                </p>
              </div>`,
            undefined,
          )}
        </div>
      </div>`,
      width: '75%',
      input: 'textarea',
      inputPlaceholder: 'Enter your comment',
      inputAttributes: {
        min: '1',
      },
      inputValidator: body => {
        if (body.length > 0) return;

        return 'Comment needs to be at least one charachter long';
      },
      showCancelButton: true,
      confirmButtonText: 'Comment',
      showLoaderOnConfirm: true,
      preConfirm: async body => {
        try {
          if (isAssignment(post)) {
            return await apiService.createNewAssignmentComment(this.classroom?.code, post?.id, {
              body,
            });
          }

          return await apiService.createNewPostComment(this.classroom?.code, post?.id, {
            body,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Comment has been added`,
      });
    }
  };

  private handleAddPostComment = async (post: PostWithPopUpOptions) => {
    const result = await Swal.fire({
      title: post.title,
      html: post.body,
      input: 'textarea',
      inputPlaceholder: 'Enter your comment',
      inputAttributes: {
        min: '1',
      },
      inputValidator: body => {
        if (body.length > 0) return;

        return 'Comment needs to be at least one charachter long';
      },
      showCancelButton: true,
      confirmButtonText: 'Comment',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      preConfirm: async body => {
        try {
          if (isAssignment(post)) {
            return await apiService.createNewAssignmentComment(this.classroom?.code, post?.id, {
              body,
            });
          }

          return await apiService.createNewPostComment(this.classroom?.code, post?.id, {
            body,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Comment has been added`,
      });
    }
  };

  private handleGradeAssignmentSubmission = async (assignment: Assignment, submission: AssignmentSubmission) => {
    const result = await Swal.fire({
      title: assignment.title,
      text: `Grade ${submission.author.user.firstName} ${submission.author.user.lastName}'s assignment out of a possible total score of ${assignment.totalPoints}%`,
      width: '50%',
      input: 'number',
      inputPlaceholder: `% Score/${assignment.totalPoints}`,
      inputAttributes: {
        min: '0',
        max: assignment.totalPoints.toString(),
      },
      inputValidator: body => {
        if (parseInt(body) < 0 || parseInt(body) > assignment.totalPoints) {
          return `Grade needs to be more than 0 and less than or equal to ${assignment.totalPoints}`;
        }

        return;
      },
      showCancelButton: true,
      confirmButtonText: 'Grade',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      preConfirm: async points => {
        try {
          return await apiService.gradeAssignment(this.classroom?.code, assignment?.id, submission.id, {
            points: parseInt(points),
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      submission.grade = result.value;

      this.getClassroomPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Assignment has been graded`,
      });
    }
  };

  private handleAddPostAttachments = async (post: Post) => {
    const result = await Swal.fire({
      title: post.title,
      text: 'Add Attachments',
      showCancelButton: true,
      confirmButtonText: 'Add Attachments',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      preConfirm: async () => {
        try {
          return await apiService.addAttachmentsToPost(this.classroom?.code, post?.id, this.selectedAttachments);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.getClassroomPosts();
      this.clearEditVariables();
      this.addAttachmentsToPostModalOpen = false;

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Attachments have been added`,
      });
    }
  };

  private handleAddAssignmentSubmission = async (assignment: Assignment) => {
    const result = await Swal.fire({
      title: assignment.title,
      text: 'Add Submission',
      showCancelButton: true,
      confirmButtonText: 'Add Submission',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      preConfirm: async () => {
        try {
          return await apiService.addSubmissionToAssignment(this.classroom?.code, assignment?.id, this.selectedAttachments, { body: this.assignmentComment });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.getClassroomPosts();
      this.clearEditVariables();
      this.addSubmissionsToAssignmentModalOpen = false;

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Submission has been added`,
      });
    }
  };

  clearVariables = () => {
    this.postTitle = '';
    this.postBody = '';
    this.assignmentBody = '';
    this.assignmentTitle = '';
    this.assignmentDueDate = null;
    this.assignmentTotalPoints = 100;
  };

  clearEditVariables = () => {
    this.editPost = null;
    this.editAssignment = null;
    this.assignmentComment = '';
    this.selectedAttachments = [];
  };

  getClassroom = async () => {
    try {
      this.classroom = await apiService.getClassroomByCode(this.classroomCode);

      this.socket = classroomsSocketClient;

      this.socket.emit('subscribe-classroom-events', this.classroom, data => {
        console.log('subscribed to classroom events');
        console.log(data);
      });

      this.socket.on(`${this.classroom.code}-events`, data => {
        console.log('classroom events');
        console.log(data);
      });

      this.socket.on('new virtual classroom', data => {
        console.log('new virtual classroom');
        console.log(data);
        Swal.fire({
          title: 'Virtual classroom currently in session',
          position: 'bottom-right',
          showCancelButton: false,
          showConfirmButton: true,
          confirmButtonText: 'Join Classroom',
          showLoaderOnConfirm: true,
          allowOutsideClick: false,
          backdrop: false,
        });
      });

      this.getProfile();

      this.getClassroomPosts();
    } catch (error) {
      console.error({ ...error });
    }
  };

  getClassroomPosts = async () => {
    try {
      const posts = await apiService.getClassroomPosts(this.classroomCode);

      const assignments = await apiService.getClassroomAssignments(this.classroomCode);

      const existingPosts = posts.map(classroomPost => {
        return {
          ...classroomPost,
          popupOpen: false,
        };
      });
      const existingAssignments = assignments.map(classroomPost => {
        return {
          ...classroomPost,
          popupOpen: false,
        };
      });

      this.classroomPosts = [...existingPosts, ...existingAssignments].sort((a, b) => new Date(b.createdAt).getTime() / 1000 - new Date(a.createdAt).getTime() / 1000);
    } catch (error) {
      console.error({ ...error });
    }
  };

  getProfile = async () => {
    this.user = await apiService.getProfile();

    this.classroomMember = this.classroom?.members?.find(classroomMember => classroomMember.user?.id === this.user?.id);
  };

  render() {
    return (
      <div class="h-full overflow-y-auto">
        <div class="classroom-header bg-secondary px-16 pb-8 flex flex-col justify-end items-start">
          <h2 class="text-text-heading-inverse font-bold text-2xl">{this.classroomCode}</h2>
          <h1 class="text-text-heading-inverse font-bold text-4xl">{this.classroom?.name}</h1>
          <p class="text-text-heading-inverse">{this.classroom?.description}</p>
        </div>
        {this.classroomMember ? (
          <div class=" h-36 flex flex-row justify-center items-center p-4">
            <button
              class=" bg-gray-200 shadow-sm p-8 rounded-md font-bold text-text-heading hover:bg-primary hover:text-text-heading-inverse hover:shadow-md"
              onClick={() => (this.createNewClassroomPostModalOpen = true)}
            >
              Make New Post
            </button>

            {this.classroomMember.role === 'facilitator' ? (
              <button
                class=" bg-gray-200 shadow-sm p-8 rounded-md font-bold text-text-heading hover:bg-primary hover:text-text-heading-inverse hover:shadow-md ml-2"
                onClick={() => (this.createNewClassroomAssignmentModalOpen = true)}
              >
                Add New Assignment
              </button>
            ) : null}
            {this.classroomMember.role === 'facilitator' ? (
              <button
                class=" bg-gray-200 shadow-sm p-8 rounded-md font-bold text-text-heading hover:bg-primary hover:text-text-heading-inverse hover:shadow-md ml-2"
                onClick={() => {
                  this.socket.emit(
                    'create classroom',
                    {
                      classroom: this.classroom,
                      classroomMember: this.classroomMember,
                    },
                    data => {
                      if (!data.code) {
                        //TODO Show error
                        return;
                      }
                      location.replace(`/user/classrooms/${this.classroom.code}/video-sessions/${data?.code}`);
                    },
                  );
                }}
              >
                Start Video Conference
              </button>
            ) : null}
            <button
              class=" bg-gray-200 shadow-sm p-8 rounded-md font-bold text-text-heading hover:bg-primary hover:text-text-heading-inverse hover:shadow-md ml-2"
              onClick={() => {
                this.classroomMembersModalOpen = true;
              }}
            >
              Classroom Members
            </button>
          </div>
        ) : null}
        {this.classroomPosts.length > 0 ? (
          <div class="bg-background h-full">
            {this.classroomPosts.map((post, postIndex) => {
              const date = new Date(post.createdAt);
              const popUpOpen = post.popupOpen;
              let dueDate: Date;
              let mySubmission: AssignmentSubmission;

              if (isAssignment(post) && post.dueDate) {
                dueDate = new Date(post.dueDate);
              }

              if (isAssignment(post) && post.submissions) {
                mySubmission = post.submissions.find(submission => submission?.author?.id === this.classroomMember?.id);
              }

              return (
                <div class=" post w-3/4 my-8 mx-auto shadow-md rounded-md flex flex-col flex-nowrap">
                  <div
                    class={`post-header shadow-sm flex flex-row flex-nowrap justify-between items-center p-6 ${
                      isAssignment(post) ? 'bg-secondary-shade text-text-heading-inverse' : 'bg-gray-100 text-text-heading'
                    } `}
                  >
                    <div class="flex flex-col justify-center items-start">
                      {isAssignment(post) ? (
                        <div class="due-date-div">
                          <div class="flex flex-row">
                            {mySubmission && mySubmission.grade ? (
                              <h1 class="font-bold bg-primary py-2 px-4 rounded-full text-text-heading-inverse mx-2 my-1">
                                Your Grade: {mySubmission.grade.points}/{post.totalPoints}
                              </h1>
                            ) : null}
                            <h1 class="font-bold bg-gray-50 bg-opacity-60 py-2 px-4 rounded-full text-text-heading mx-2 my-1">Assignment</h1>
                          </div>
                          {dueDate && !mySubmission ? (
                            <p class="font-medium text-sm bg-gray-50 bg-opacity-60 py-2 px-4 rounded-full text-text-heading my-1">
                              Due on {dueDate.getDate()}/{dueDate.getMonth() + 1}/{dueDate.getFullYear()} at {dueDate.getHours().toString().padStart(2, '0')}:
                              {dueDate.getMinutes().toString().padStart(2, '0')}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {!isAssignment(post) ? (
                        <div class="author">
                          <h1 class="font-bold">
                            {post.author.user.firstName} {post.author.user.lastName}
                          </h1>
                        </div>
                      ) : null}
                      <div class="time">
                        <small class="font-semibold">
                          {date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')} {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
                        </small>
                      </div>
                    </div>

                    <div class="relative inline-block text-left">
                      <ion-icon
                        name="ellipsis-horizontal-outline"
                        class={`rounded-full m-2 p-2 text-2xl ${isAssignment(post) ? 'text-text-heading-inverse' : 'text-text-heading'} hover:shadow-md`}
                        onClick={() => {
                          this.classroomPosts = this.classroomPosts.map((classroomPost, index) => {
                            let cPost = classroomPost;
                            if (postIndex === index) {
                              cPost.popupOpen = !popUpOpen;
                              return cPost;
                            }
                            cPost.popupOpen = false;
                            return cPost;
                          });
                        }}
                      ></ion-icon>
                      {popUpOpen ? (
                        <div
                          class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby="options-menu"
                        >
                          {this.classroomMember?.id === post?.author?.id
                            ? [
                                <div class="py-1">
                                  <a
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                    onClick={() => {
                                      if (isAssignment(post)) {
                                        this.editAssignment = post;
                                        this.editClassroomAssignmentModalOpen = true;
                                        return;
                                      }
                                      this.editPost = post;
                                      this.editClassroomPostModalOpen = true;
                                    }}
                                  >
                                    Edit
                                  </a>
                                  <a
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                    onClick={() => {
                                      this.handleDeletePost(post);
                                    }}
                                  >
                                    Delete
                                  </a>
                                </div>,
                                <div class="py-1">
                                  <a
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                    onClick={() => {
                                      this.editPost = post;
                                      this.addAttachmentsToPostModalOpen = true;
                                    }}
                                  >
                                    Add Attachments
                                  </a>
                                </div>,
                              ]
                            : null}
                          {isAssignment(post) && this.classroomMember.role === 'student' ? (
                            !mySubmission ? (
                              <div class="py-1">
                                <a
                                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  role="menuitem"
                                  onClick={() => {
                                    if (isAssignment(post)) {
                                      this.editAssignment = post;
                                      this.addSubmissionsToAssignmentModalOpen = true;
                                      return;
                                    }
                                    this.addSubmissionsToAssignmentModalOpen = true;
                                  }}
                                >
                                  Add Submission
                                </a>
                              </div>
                            ) : (
                              <div class="py-1">
                                <a class="block px-4 py-2 text-sm text-gray-700 " role="menuitem" onClick={() => {}}>
                                  Already Submitted
                                </a>
                              </div>
                            )
                          ) : null}
                          <div class="py-1">
                            <a
                              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                              onClick={() => {
                                this.handleSeePostComments(post);
                              }}
                            >
                              See Comments
                            </a>
                            <a
                              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              role="menuitem"
                              onClick={() => {
                                this.handleAddPostComment(post);
                              }}
                            >
                              Add Comment
                            </a>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div class="post-body flex flex-col px-6">
                    <h1 class="font-bold text-xl my-2">{post.title}</h1>
                    <p>{post.body}</p>
                  </div>
                  {post.attachments.length > 0 ? (
                    <div class="post-attachments  px-6 py-2 overflow-x-auto flex flex-row flex-nowrap">
                      {post.attachments.map(attachment => (
                        <div class="attachment rounded-sm shadow-md bg-gray-50 flex flex-row justify-between items-center p-4">
                          <div
                            class="flex flex-col justify-center bg-white px-4 py-6 rounded-md hover:bg-gray-100 flex-1"
                            onClick={() => {
                              apiService.downloadAttachment(this.classroom?.code, post?.id, attachment);
                            }}
                          >
                            <h1 class="font-semibold">{attachment.title}</h1>
                            <p>
                              <small>{attachment.originalFileName}</small>
                            </p>
                          </div>

                          {this.classroomMember?.id === post?.author?.id ? (
                            <ion-icon
                              name="trash-outline"
                              class=" rounded-full m-2 p-2 text-2xl text-text-heading hover:shadow-md hover:text-primary"
                              onClick={() => {
                                this.handleDeleteAttachment(post, attachment);
                              }}
                            ></ion-icon>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div class="post-footer flex flex-row flex-nowrap justify-start items-center p-6">
                    <button
                      class="bg-gray-500 py-2 px-3 mx-2 rounded-sm text-text-heading-inverse"
                      onClick={() => {
                        this.handleSeePostComments(post);
                      }}
                    >
                      {post.comments?.length ?? 0} Comments
                    </button>
                    {isAssignment(post) && this.classroomMember?.role === 'facilitator' && this.classroomMember?.id == post?.author?.id ? (
                      <button
                        class="bg-gray-500 py-2 px-3 mx-2 rounded-sm text-text-heading-inverse"
                        onClick={() => {
                          this.editAssignment = post;
                          this.showClassroomAssignmentSubmissionsModalOpen = true;
                        }}
                      >
                        {post.submissions?.length ?? 0} Submissions
                      </button>
                    ) : null}
                    {isAssignment(post) && mySubmission ? (
                      <button
                        class={`${mySubmission.grade ? 'bg-primary' : 'bg-gray-500'} py-2 px-3 mx-2 rounded-sm text-text-heading-inverse`}
                        onClick={() => {
                          //this.handleSeePostComments(post);
                        }}
                      >
                        My Submission {mySubmission.grade ? `(${mySubmission.grade.points}/${post.totalPoints})` : null}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div class="mt-8 bg-background flex flex-col justify-center items-center">
            <p class=" text-text-heading font-bold text-2xl">No Posts have been made yet. Be the first</p>
          </div>
        )}

        {this.createNewClassroomPostModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div class="flex flex-col">
                        <label htmlFor="postTitle" class="block text-sm font-medium text-gray-700">
                          Post Title
                        </label>
                        <input
                          type="text"
                          name="postTitle"
                          id="postTitle"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.postTitle}
                          onInput={e => {
                            this.postTitle = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="postBody" class="block text-sm font-medium text-gray-700">
                          Post Body
                        </label>
                        <textarea
                          name="postBody"
                          id="postBody"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          maxlength={2000}
                          value={this.postBody}
                          onInput={e => {
                            this.postBody = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleCreateNewClassroomPostSubmit();
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearVariables();
                      this.createNewClassroomPostModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.editClassroomPostModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div class="flex flex-col">
                        <label htmlFor="postTitle" class="block text-sm font-medium text-gray-700">
                          Post Title
                        </label>
                        <input
                          type="text"
                          name="postTitle"
                          id="postTitle"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editPost?.title}
                          onInput={e => {
                            this.editPost = {
                              ...this.editPost,
                              title: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="postBody" class="block text-sm font-medium text-gray-700">
                          Post Body
                        </label>
                        <textarea
                          name="postBody"
                          id="postBody"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          maxlength={2000}
                          value={this.editPost?.body}
                          onInput={e => {
                            this.editPost = {
                              ...this.editPost,
                              body: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleUpdatePost();
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.editClassroomPostModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.createNewClassroomAssignmentModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div class="flex flex-col">
                        <label htmlFor="assignmentTitle" class="block text-sm font-medium text-gray-700">
                          Assignment Title
                        </label>
                        <input
                          type="text"
                          name="assignmentTitle"
                          id="assignmentTitle"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.assignmentTitle}
                          onInput={e => {
                            this.assignmentTitle = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="assignmentBody" class="block text-sm font-medium text-gray-700">
                          Assignment Body
                        </label>
                        <textarea
                          name="assignmentBody"
                          id="assignmentBody"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          maxlength={2000}
                          value={this.assignmentBody}
                          onInput={e => {
                            this.assignmentBody = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>

                      <div class="flex flex-col">
                        <label htmlFor="assignmentDueDate" class="block text-sm font-medium text-gray-700">
                          Due Date(Optional)
                        </label>
                        <input
                          name="assignmentDueDate"
                          id="assignmentDueDate"
                          type="datetime-local"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          min={toDatetimeLocal(new Date())}
                          value={this.assignmentDueDate ? toDatetimeLocal(this.assignmentDueDate) : null}
                          onInput={e => {
                            this.assignmentDueDate = new Date((e.target as HTMLInputElement).value);
                          }}
                        />
                      </div>

                      <div class="flex flex-col">
                        <label htmlFor="assignmentTotalPoints" class="block text-sm font-medium text-gray-700">
                          Total Possible Percentage
                        </label>
                        <input
                          name="assignmentTotalPoints"
                          id="assignmentTotalPoints"
                          type="number"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          min="0"
                          max="100"
                          value={this.assignmentTotalPoints}
                          onInput={e => {
                            this.assignmentTotalPoints = (e.target as HTMLInputElement).value ? parseInt((e.target as HTMLInputElement).value) : 100;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleCreateNewClassroomAssignment();
                    }}
                  >
                    Add Assignment
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearVariables();
                      this.createNewClassroomAssignmentModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.editClassroomAssignmentModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div class="flex flex-col">
                        <label htmlFor="postTitle" class="block text-sm font-medium text-gray-700">
                          Asignment Title
                        </label>
                        <input
                          type="text"
                          name="postTitle"
                          id="postTitle"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editAssignment?.title}
                          onInput={e => {
                            this.editAssignment = {
                              ...this.editAssignment,
                              title: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="postBody" class="block text-sm font-medium text-gray-700">
                          Asignment Body
                        </label>
                        <textarea
                          name="postBody"
                          id="postBody"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          maxlength={2000}
                          value={this.editAssignment?.body}
                          onInput={e => {
                            this.editAssignment = {
                              ...this.editAssignment,
                              body: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="assignmentDueDate" class="block text-sm font-medium text-gray-700">
                          Due Date(Optional)
                        </label>
                        <input
                          name="assignmentDueDate"
                          id="assignmentDueDate"
                          type="datetime-local"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          min={toDatetimeLocal(new Date())}
                          value={toDatetimeLocal(new Date(this.editAssignment?.dueDate))}
                          onInput={e => {
                            this.editAssignment = {
                              ...this.editAssignment,
                              dueDate: toDatetimeLocal(new Date((e.target as HTMLInputElement).value)),
                            };
                          }}
                        />
                      </div>

                      <div class="flex flex-col">
                        <label htmlFor="assignmentTotalPoints" class="block text-sm font-medium text-gray-700">
                          Total Possible Percentage
                        </label>
                        <input
                          name="assignmentTotalPoints"
                          id="assignmentTotalPoints"
                          type="number"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          min="0"
                          max="100"
                          value={this.editAssignment?.totalPoints}
                          onInput={e => {
                            this.editAssignment = {
                              ...this.editAssignment,
                              totalPoints: (e.target as HTMLInputElement).value ? parseInt((e.target as HTMLInputElement).value) : 100,
                            };
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleUpdateAssignment();
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.editClassroomAssignmentModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.addAttachmentsToPostModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div
                        class="flex flex-col border-2 border-dashed hover:border-primary "
                        onDragEnter={e => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onDragOver={e => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onDrop={e => {
                          e.stopPropagation();
                          e.preventDefault();

                          const dataTransfer = e.dataTransfer;
                          const files = Array.from(dataTransfer.files);

                          this.selectedAttachments = [...this.selectedAttachments, ...files];
                        }}
                      >
                        <label htmlFor="attachments" class="block text-lg font-bold text-gray-700">
                          Select some files to upload
                        </label>
                        <input
                          name="attachments"
                          id="attachments"
                          type="file"
                          multiple
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md opacity-0"
                          onInput={e => {
                            const selectedFiles = Array.from((e.target as HTMLInputElement).files);

                            this.selectedAttachments = [...this.selectedAttachments, ...selectedFiles];
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <h3 class="my-2 font-semibold">{this.selectedAttachments?.length} Attachments Selected</h3>
                      {this.selectedAttachments.map((attachment, attachmentIndex) => (
                        <div class="flex flex-row justify-between items-center border border-solid my-2 rounded-sm h-16 p-2 shadow-sm hover:shadow-md bg-gray-100">
                          <p class="block text-md font-medium text-gray-700 ">{attachment.name}</p>
                          <ion-icon
                            name="trash-outline"
                            class=" rounded-full m-2 p-2 text-2xl text-text-heading hover:shadow-md hover:text-secondary"
                            onClick={() => {
                              this.selectedAttachments.splice(attachmentIndex, 1);
                              this.selectedAttachments = [...this.selectedAttachments];
                            }}
                          ></ion-icon>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleAddPostAttachments(this.editPost);
                    }}
                    disabled={this.selectedAttachments?.length === 0}
                  >
                    Add Attachments
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.addAttachmentsToPostModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.addSubmissionsToAssignmentModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div class="flex flex-col">
                        <label htmlFor="assignmentComment" class="block text-sm font-medium text-gray-700">
                          Assignment Comment(Optional)
                        </label>
                        <textarea
                          name="assignmentComment"
                          id="assignmentComment"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.assignmentComment}
                          maxlength={2000}
                          onInput={e => {
                            this.assignmentComment = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div
                        class="flex flex-col border-2 border-dashed hover:border-primary "
                        onDragEnter={e => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onDragOver={e => {
                          e.stopPropagation();
                          e.preventDefault();
                        }}
                        onDrop={e => {
                          e.stopPropagation();
                          e.preventDefault();

                          const dataTransfer = e.dataTransfer;
                          const files = Array.from(dataTransfer.files);

                          this.selectedAttachments = [...this.selectedAttachments, ...files];
                        }}
                      >
                        <label htmlFor="attachments" class="block text-lg font-bold text-gray-700">
                          Select some files to upload
                        </label>
                        <input
                          name="attachments"
                          id="attachments"
                          type="file"
                          multiple
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md opacity-0"
                          onInput={e => {
                            const selectedFiles = Array.from((e.target as HTMLInputElement).files);

                            this.selectedAttachments = [...this.selectedAttachments, ...selectedFiles];
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <h3 class="my-2 font-semibold">{this.selectedAttachments?.length} Attachments Selected</h3>
                      {this.selectedAttachments.map((attachment, attachmentIndex) => (
                        <div class="flex flex-row justify-between items-center border border-solid my-2 rounded-sm h-16 p-2 shadow-sm hover:shadow-md bg-gray-100">
                          <p class="block text-md font-medium text-gray-700 ">{attachment.name}</p>
                          <ion-icon
                            name="trash-outline"
                            class=" rounded-full m-2 p-2 text-2xl text-text-heading hover:shadow-md hover:text-secondary"
                            onClick={() => {
                              this.selectedAttachments.splice(attachmentIndex, 1);
                              this.selectedAttachments = [...this.selectedAttachments];
                            }}
                          ></ion-icon>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleAddAssignmentSubmission(this.editAssignment);
                    }}
                    disabled={this.selectedAttachments?.length === 0}
                  >
                    Add Submission
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.addSubmissionsToAssignmentModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.showClassroomAssignmentSubmissionsModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto ">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <h1 class="font-bold m-4">Assignment Submissions</h1>
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <div class="mt-8 bg-gray-100 p-2 rounded-md divide-y divide-white">
                        {this.editAssignment.submissions.map(submission => (
                          <div class="py-1">
                            <h2 class=" font-semibold">
                              {submission.author.user.firstName} {submission.author.user.lastName}
                            </h2>
                            <p class="text-sm">{submission.body}</p>
                            <div class="submission-attachments  px-6 py-2 overflow-x-auto flex flex-row flex-nowrap">
                              {submission.attachments.map(attachment => (
                                <div class="attachment rounded-sm shadow-md bg-gray-50 flex flex-row justify-between items-center p-4">
                                  <div
                                    class="flex flex-col justify-center bg-white px-4 py-6 rounded-md hover:bg-gray-100 flex-1"
                                    onClick={async () => {
                                      try {
                                        await apiService.downloadAttachment(this.classroom?.code, submission?.id, attachment);
                                      } catch (error) {
                                        const errorMessage = error?.response?.data?.message;
                                        Swal.fire({ title: 'Error!', text: errorMessage ?? 'Please try again' });
                                      }
                                    }}
                                  >
                                    <h1 class="font-semibold">{attachment.title}</h1>
                                    <p>
                                      <small>{attachment.originalFileName}</small>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {submission.grade ? (
                              <button class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-secondary text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Graded {submission.grade?.points}/{this.editAssignment.totalPoints}
                              </button>
                            ) : (
                              <button
                                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={() => {
                                  this.handleGradeAssignmentSubmission(this.editAssignment, submission);
                                }}
                              >
                                Grade Assignment Submission
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.showClassroomAssignmentSubmissionsModalOpen = false;
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.classroomMembersModalOpen ? (
          <div class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                &#8203;
              </span>

              <div
                class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div class="sm:flex sm:items-start">
                    <div class="flex flex-col w-full">
                      <h1 class="font-bold text-2xl">{this.classroom?.members?.length} Classroom Members</h1>
                      {this.classroom.members?.map(member => (
                        <div class="flex flex-row w-full items-center  p-4 my-2 bg-gray-100 rounded-md">
                          <div class="flex flex-col flex-1 ">
                            <h1 class="font-bold">
                              {member?.user?.firstName} {member?.user?.lastName}
                            </h1>
                            <p>{member?.role}</p>
                          </div>
                          {this.classroomMember.role === 'facilitator' && member.role === 'student' ? (
                            <ion-icon
                              name="trash-outline"
                              class=" rounded-full m-2 p-2 text-2xl text-text-heading hover:shadow-md hover:text-primary"
                              onClick={() => {
                                this.handleDeleteMember(member);
                              }}
                            ></ion-icon>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.classroomMembersModalOpen = false;
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
