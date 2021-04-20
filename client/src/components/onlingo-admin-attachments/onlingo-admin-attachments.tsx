import { Component, h, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { Attachment, AttachmentWithPopUpOptions } from '../../interfaces/classroom.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-admin-attachments',
  styleUrl: 'onlingo-admin-attachments.scss',
  shadow: false,
})
export class OnlingoAdminAttachments {
  @State() attachments: AttachmentWithPopUpOptions[] = [];

  componentDidLoad() {
    this.getAllAttachments();
  }

  async getAllAttachments() {
    try {
      const attachments = await apiService.getAllAttachments();

      const existingAttachments = attachments.map(attachment => {
        return {
          ...attachment,
          popupOpen: false,
        };
      });

      this.attachments = existingAttachments.sort((a, b) => new Date(b.createdAt).getTime() / 1000 - new Date(a.createdAt).getTime() / 1000);
    } catch (error) {
      console.error(error);
    }
  }

  private handleDeleteAttachment = async (attachment: Attachment) => {
    const result = await Swal.fire({
      title: 'Delete Attachment',
      html: 'Do you want to proceed and delete this attachment?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: async () => {
        try {
          return await apiService.deleteAttachment(attachment.id);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.attachments = [];
      await this.getAllAttachments();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Attachment has been deleted`,
      });
    }
  };

  render() {
    return (
      <div class="onlingo-admin-attachments">
        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">File Name</th>
                      <th scope="col">Original File Name</th>
                      <th scope="col">Author</th>
                      <th scope="col">Author Role</th>
                      <th scope="col">Size </th>
                      <th scope="col">Type</th>
                      <th scope="col">Mime Type</th>
                      <th scope="col">Created At</th>
                      <th scope="col">
                        <span></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.attachments.map((attachment, attachmentIndex) => {
                      const popUpOpen = attachment.popupOpen;
                      const createdAt = new Date(attachment.createdAt);

                      return (
                        <tr>
                          <td>
                            <p>{attachment.fileName}</p>
                          </td>
                          <td>
                            <p>{attachment.originalFileName}</p>
                          </td>
                          <td>
                            <p>
                              {attachment.post
                                ? `${attachment.post.author.user.firstName} ${attachment.post.author.user.lastName}`
                                : `${attachment.assignmentSubmission.author.user.firstName} ${attachment.assignmentSubmission.author.user.lastName}`}
                            </p>
                          </td>
                          <td>
                            <p
                              class={`${
                                attachment.post
                                  ? attachment.post.author.role === `facilitator`
                                    ? `bg-secondary text-text-heading-inverse`
                                    : `bg-gray-100 text-text-heading`
                                  : `bg-gray-100 text-text-heading`
                              } text-center font-semibold py-1 px-2 rounded-full shadow-sm`}
                            >
                              {attachment.post ? `${attachment.post.author.role}` : `${attachment.assignmentSubmission.author.role}`}
                            </p>
                          </td>

                          <td>
                            <p>{attachment.size}</p>
                          </td>

                          <td>
                            <p class={`bg-gray-100 text-text-heading text-center font-semibold py-1 px-2 rounded-full shadow-sm`}>{attachment.type}</p>
                          </td>
                          <td>
                            <p>{attachment.mimeType}</p>
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
                                  this.attachments = this.attachments.map((attachment, index) => {
                                    let a = attachment;
                                    if (attachmentIndex === index) {
                                      a.popupOpen = !popUpOpen;
                                      return a;
                                    }
                                    a.popupOpen = false;
                                    return a;
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
                                        apiService.downloadAttachment(attachment);
                                      }}
                                    >
                                      Download Attachment
                                    </a>
                                  </div>
                                  <div class="py-1">
                                    <a
                                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                      role="menuitem"
                                      onClick={() => {
                                        this.handleDeleteAttachment(attachment);
                                      }}
                                    >
                                      Delete Attachment
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
