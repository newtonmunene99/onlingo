import { Component, h, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { Post } from '../../interfaces/classroom.interface';
import { PostWithPopUpOptions } from '../../interfaces/classroom.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-admin-posts',
  styleUrl: 'onlingo-admin-posts.scss',
  shadow: false,
})
export class OnlingoAdminPosts {
  @State() postCommentsModalOpen = false;
  @State() posts: PostWithPopUpOptions[] = [];
  @State() editPostModalOpen = false;

  @State() editPost: Post;

  componentDidLoad() {
    this.getAllPosts();
  }

  async getAllPosts() {
    try {
      const posts = await apiService.getAllPosts();

      const existingPosts = posts.map(classroomPost => {
        return {
          ...classroomPost,
          popupOpen: false,
        };
      });

      this.posts = [...existingPosts].sort((a, b) => new Date(b.createdAt).getTime() / 1000 - new Date(a.createdAt).getTime() / 1000);
    } catch (error) {
      console.error(error);
    }
  }

  private handleDeletePost = async (post: Post) => {
    const result = await Swal.fire({
      title: 'Delete Post',
      html: 'Do you want to proceed and delete this post?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: async () => {
        try {
          return await apiService.deletePost(post.id);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.posts = [];
      await this.getAllPosts();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Post has been deleted`,
      });
    }
  };

  clearEditVariables = () => {
    this.editPost = null;
  };

  render() {
    return (
      <div class="onlingo-admin-posts">
        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Body</th>
                      <th scope="col">Author</th>
                      <th scope="col">Author Role</th>
                      <th scope="col">Type</th>
                      <th scope="col">Comments</th>
                      <th scope="col">Created At</th>
                      <th scope="col">
                        <span></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.posts.map((post, postIndex) => {
                      const popUpOpen = post.popupOpen;
                      const createdAt = new Date(post.createdAt);

                      return (
                        <tr>
                          <td>
                            <p>{post.title}</p>
                          </td>
                          <td>
                            <p>{post.body}</p>
                          </td>
                          <td>
                            <p>
                              {post.author.user.firstName} {post.author.user.lastName}
                            </p>
                          </td>
                          <td>
                            <p
                              class={`${
                                post.author.role === `facilitator` ? `bg-secondary text-text-heading-inverse` : `bg-gray-100 text-text-heading`
                              } text-center font-semibold py-1 px-2 rounded-full shadow-sm`}
                            >
                              {post.author.role}
                            </p>
                          </td>
                          <td>
                            <p
                              class={`${
                                post.type === `Assignment` ? `bg-primary text-text-heading-inverse` : `bg-gray-100 text-text-heading`
                              } text-center font-semibold py-1 px-2 rounded-full shadow-sm`}
                            >
                              {post.type}
                            </p>
                          </td>
                          <td>
                            <p
                              onMouseEnter={e => {
                                const target = e.target as HTMLParagraphElement;

                                target.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
                                target.style.fontWeight = 'bold';
                                target.innerText = 'View';
                              }}
                              onMouseLeave={e => {
                                const target = e.target as HTMLParagraphElement;

                                target.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text-paragraph-color');
                                target.style.fontWeight = 'normal';
                                target.innerText = post.comments?.length.toString() ?? 'None';
                              }}
                              onClick={() => {
                                this.editPost = post;
                                this.postCommentsModalOpen = true;
                              }}
                            >
                              {post.comments?.length ?? 'None'}
                            </p>
                          </td>
                          <td>
                            <p>
                              {createdAt?.getDate()}/{createdAt?.getMonth() + 1}/{createdAt?.getFullYear()}
                            </p>
                          </td>
                          <td>
                            <div class="relative inline-block text-left">
                              <ion-icon
                                name="ellipsis-horizontal-outline"
                                class={`rounded-full m-2 p-2 text-2xl 'text-text-heading' hover:shadow-md`}
                                onClick={() => {
                                  this.posts = this.posts.map((post, index) => {
                                    let p = post;
                                    if (postIndex === index) {
                                      p.popupOpen = !popUpOpen;
                                      return p;
                                    }
                                    p.popupOpen = false;
                                    return p;
                                  });
                                }}
                              ></ion-icon>
                              {popUpOpen ? (
                                <div
                                  class="origin-top-right absolute z-50 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                                  role="menu"
                                  aria-orientation="vertical"
                                  aria-labelledby="options-menu"
                                >
                                  <div class="py-1">
                                    <a
                                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                      role="menuitem"
                                      onClick={() => {
                                        this.handleDeletePost(post);
                                      }}
                                    >
                                      Delete Post
                                    </a>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
