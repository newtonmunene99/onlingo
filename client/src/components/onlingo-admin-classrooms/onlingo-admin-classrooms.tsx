import { Component, h, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { Classroom, ClassroomMember, ClassroomWithPopUpOptions } from '../../interfaces/classroom.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-admin-classrooms',
  styleUrl: 'onlingo-admin-classrooms.scss',
  shadow: false,
})
export class OnlingoAdminClassrooms {
  @State() classrooms: ClassroomWithPopUpOptions[] = [];
  @State() classroomMembersModalOpen = false;
  @State() editClassroomModalOpen = false;

  @State() editClassroom: Classroom;

  componentDidLoad() {
    this.getAllClassrooms();
  }

  async getAllClassrooms() {
    try {
      const classrooms = await apiService.getAllClassrooms();

      this.classrooms = classrooms.map(classroom => {
        return {
          ...classroom,
          popupOpen: false,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }

  private handleUpdateClassroom = async () => {
    const result = await Swal.fire({
      title: 'Are you sure',
      html: 'Do you want to proceed and update this classroom',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: async () => {
        try {
          return await apiService.updateClassroom(this.editClassroom.code, {
            name: this.editClassroom.name,
            description: this.editClassroom.description,
            unitCode: this.editClassroom.unitCode,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.editClassroomModalOpen = false;
      this.clearEditVariables();

      this.classrooms = [];
      this.getAllClassrooms();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Classroom has been updated`,
      });
    }
  };

  private handleDeleteClassroom = async (classroom: Classroom) => {
    const result = await Swal.fire({
      title: 'Delete classroom',
      html: 'Do you want to proceed and delete this classroom?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: async () => {
        try {
          return await apiService.deleteClassroom(classroom.code);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.classrooms = [];
      await this.getAllClassrooms();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Classroom has been deleted`,
      });
    }
  };

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

      await this.getAllClassrooms();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Member has been deleted`,
      });
    }
  };

  clearEditVariables = () => {
    this.editClassroom = null;
  };

  render() {
    return (
      <div class="onlingo-admin-classrooms">
        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">Classroom Code</th>
                      <th scope="col">Unit Code</th>
                      <th scope="col">Name</th>
                      <th scope="col">Members</th>
                      <th scope="col">Facilitator</th>
                      <th scope="col">
                        <span></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.classrooms.map((classroom, classroomIndex) => {
                      const popUpOpen = classroom.popupOpen;
                      const facilitator = classroom.members?.find(member => member.role === 'facilitator');
                      return (
                        <tr>
                          <td>
                            <p>{classroom.code}</p>
                          </td>
                          <td>
                            <p>{classroom.unitCode}</p>
                          </td>
                          <td>
                            <p>{classroom.name}</p>
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
                                target.innerText = classroom.members?.length.toString() ?? 'None';
                              }}
                              onClick={() => {
                                this.editClassroom = classroom;
                                this.classroomMembersModalOpen = true;
                              }}
                            >
                              {classroom.members?.length ?? 'None'}
                            </p>
                          </td>
                          <td>
                            <p>{facilitator ? `${facilitator.user?.firstName} ${facilitator.user?.lastName}` : 'None'}</p>
                          </td>
                          <td>
                            <div class="relative inline-block text-left">
                              <ion-icon
                                name="ellipsis-horizontal-outline"
                                class={`rounded-full m-2 p-2 text-2xl 'text-text-heading' hover:shadow-md`}
                                onClick={() => {
                                  this.classrooms = this.classrooms.map((classroom, index) => {
                                    let c = classroom;
                                    if (classroomIndex === index) {
                                      c.popupOpen = !popUpOpen;
                                      return c;
                                    }
                                    c.popupOpen = false;
                                    return c;
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
                                        this.editClassroom = classroom;
                                        this.editClassroomModalOpen = true;
                                      }}
                                    >
                                      Edit Classroom
                                    </a>
                                    <a
                                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                      role="menuitem"
                                      onClick={() => {
                                        this.handleDeleteClassroom(classroom);
                                      }}
                                    >
                                      Delete Classroom
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
                      <h1 class="font-bold text-2xl">{this.editClassroom?.members?.length} Classroom Members</h1>
                      {this.editClassroom.members?.map(member => (
                        <div class="flex flex-row w-full items-center  p-4 my-2 bg-gray-100 rounded-md">
                          <div class="flex flex-col flex-1 ">
                            <h1 class="font-bold">
                              {member?.user?.firstName} {member?.user?.lastName}
                            </h1>
                            <p>{member?.role}</p>
                          </div>
                          <ion-icon
                            name="trash-outline"
                            class=" rounded-full m-2 p-2 text-2xl text-text-heading hover:shadow-md hover:text-primary"
                            onClick={() => {
                              this.handleDeleteMember(member);
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
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.classroomMembersModalOpen = false;
                      this.clearEditVariables();
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.editClassroomModalOpen ? (
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
                        <label htmlFor="classroomName" class="block text-sm font-medium text-gray-700">
                          Classroom Name
                        </label>
                        <input
                          type="text"
                          name="classroomName"
                          id="classroomName"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editClassroom?.name}
                          onInput={e => {
                            this.editClassroom = {
                              ...this.editClassroom,
                              name: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="unitCode" class="block text-sm font-medium text-gray-700">
                          Unit Code
                        </label>
                        <input
                          type="text"
                          name="unitCode"
                          id="unitCode"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editClassroom?.unitCode}
                          onInput={e => {
                            this.editClassroom = {
                              ...this.editClassroom,
                              unitCode: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="classroomDescription" class="block text-sm font-medium text-gray-700">
                          Classroom Description
                        </label>
                        <textarea
                          name="classroomDescription"
                          id="classroomDescription"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          maxlength={2000}
                          value={this.editClassroom?.description}
                          onInput={e => {
                            this.editClassroom = {
                              ...this.editClassroom,
                              description: (e.target as HTMLInputElement).value,
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
                      this.handleUpdateClassroom();
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.editClassroomModalOpen = false;
                    }}
                  >
                    Cancel
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
