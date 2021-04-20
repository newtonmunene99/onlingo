import { Component, h, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { Classroom, ClassroomMember } from '../../interfaces/classroom.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-user-dashboard',
  styleUrl: 'onlingo-user-dashboard.scss',
  shadow: false,
})
export class OnlingoUserDashboard {
  @State() enrollClassroomModalOpen = false;
  @State() createNewClassroomModalOpen = false;
  @State() editClassroomModalOpen = false;

  @State() classroomName = '';
  @State() unitCode = '';
  @State() classroomDescription = '';

  @State() classroomCode = '';

  @State() classrooms: ClassroomMember[] = [];

  @State() editClassroom: Classroom;

  componentDidLoad() {
    this.getClassroomMemberships();
  }

  private handleEnrollSubmit = async () => {
    if (!this.classroomCode) {
      Swal.fire({
        title: 'Fill in all fields',
        html: 'Please fill in all required fields',
        icon: 'error',
      });
      return;
    }

    Swal.fire({
      title: 'Please wait!',
      html: 'Kindly be patient as we enroll you',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });

    Swal.disableButtons();
    Swal.showLoading();

    try {
      await apiService.enrollToClassroom(this.classroomCode);

      Swal.close();
      this.enrollClassroomModalOpen = false;
      this.clearEnrollVariables();
      await this.getClassroomMemberships();
    } catch (error) {
      const errorMessage = error?.response?.data?.message;

      Swal.close();
      Swal.fire({
        title: 'Error!',
        html: errorMessage ?? 'There was a problem with the request',
        icon: 'error',
      });
    }
  };

  private handleCreateNewClassroomSubmit = async () => {
    if (!this.classroomName) {
      Swal.fire({
        title: 'Fill in all fields',
        html: 'Please fill in all required fields',
        icon: 'error',
      });
      return;
    }

    Swal.fire({
      title: 'Please wait!',
      html: 'Kindly be patient as we create your classroom',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });

    Swal.disableButtons();
    Swal.showLoading();

    try {
      await apiService.createNewClassroom({
        name: this.classroomName,
        description: this.classroomDescription,
        unitCode: this.unitCode,
      });

      Swal.close();
      this.createNewClassroomModalOpen = false;
      this.clearVariables();
      await this.getClassroomMemberships();
    } catch (error) {
      const errorMessage = error?.response?.data?.message;

      Swal.close();
      Swal.fire({
        title: 'Error!',
        html: errorMessage ?? 'There was a problem with the request',
        icon: 'error',
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
      await this.getClassroomMemberships();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Classroom has been deleted`,
      });
    }
  };

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
      this.getClassroomMemberships();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Classroom has been updated`,
      });
    }
  };

  clearVariables = () => {
    this.classroomName = '';
    this.classroomDescription = '';
    this.unitCode = '';
  };

  clearEnrollVariables = () => {
    this.classroomCode = null;
  };

  clearEditVariables = () => {
    this.editClassroom = null;
  };

  getClassroomMemberships = async () => {
    try {
      this.classrooms = await apiService.getClassroomMemberships();
    } catch (error) {
      console.error({ ...error });
    }
  };

  render() {
    return (
      <div class="classroom-memberships h-full flex flex-col overflow-y-auto bg-background ">
        <div class=" h-36 flex flex-row justify-center items-center p-4">
          <button
            class=" bg-gray-200 shadow-sm p-8 rounded-md font-bold text-text-heading hover:bg-primary hover:text-text-heading-inverse hover:shadow-md mr-2"
            onClick={() => (this.createNewClassroomModalOpen = true)}
          >
            Create A New Classroom
          </button>
          <button
            class=" bg-gray-200 shadow-sm p-8 rounded-md font-bold text-text-heading hover:bg-primary hover:text-text-heading-inverse hover:shadow-md ml-2"
            onClick={() => (this.enrollClassroomModalOpen = true)}
          >
            Enroll Into A Classroom
          </button>
        </div>
        <div class="classrooms grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
          {this.classrooms.map(classroomMembership => (
            <div class="classroom flex flex-col rounded-md shadow-md hover:shadow-lg bg-white">
              <div class={`h-1/3 ${classroomMembership?.role === 'facilitator' ? 'bg-secondary' : 'bg-secondary-shade'} rounded-t-md p-8 flex flex-col justify-end`}>
                <h1 class="font-bold text-2xl text-text-heading-inverse">{classroomMembership?.classroom?.code}</h1>
                <p class="text-text-paragraph-inverse ">{classroomMembership?.role}</p>
              </div>
              <div class="flex flex-col flex-1 p-8">
                <div class="flex-1">
                  <stencil-route-link url={`/user/classrooms/${classroomMembership?.classroom?.code}`}>
                    <a class="font-bold text-text-heading hover:text-primary">
                      <span class="font-extrabold text-lg text-primary">{classroomMembership?.classroom?.unitCode}</span> {classroomMembership?.classroom?.name}
                    </a>
                  </stencil-route-link>
                  <p>{classroomMembership?.classroom?.description}</p>
                </div>
                {classroomMembership.role === 'facilitator' ? (
                  <div>
                    <button
                      class="bg-primary rounded-sm py-2 px-6 text-text-heading-inverse hover:shadow-md mx-1"
                      onClick={() => {
                        this.editClassroom = classroomMembership.classroom;
                        this.editClassroomModalOpen = true;
                      }}
                    >
                      Edit
                    </button>
                    <button
                      class="bg-primary rounded-sm py-2 px-6 text-text-heading-inverse hover:shadow-md mx-1"
                      onClick={() => {
                        this.handleDeleteClassroom(classroomMembership.classroom);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {this.enrollClassroomModalOpen ? (
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
                        <label htmlFor="classroomCode" class="block text-sm font-medium text-gray-700">
                          Classroom Code
                        </label>
                        <input
                          type="text"
                          name="classroomCode"
                          id="classroomCode"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.classroomCode}
                          onInput={e => {
                            this.classroomCode = (e.target as HTMLInputElement).value;
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
                      this.handleEnrollSubmit();
                    }}
                  >
                    Enroll
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEnrollVariables();
                      this.enrollClassroomModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.createNewClassroomModalOpen ? (
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
                          value={this.classroomName}
                          onInput={e => {
                            this.classroomName = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="classroomDescription" class="block text-sm font-medium text-gray-700">
                          Unit Code
                        </label>
                        <input
                          type="text"
                          name="unitCode"
                          id="unitCode"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.unitCode}
                          onInput={e => {
                            this.unitCode = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="classroomDescription" class="block text-sm font-medium text-gray-700">
                          Classroom Description
                        </label>
                        <input
                          type="text"
                          name="classroomDescription"
                          id="classroomDescription"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.classroomDescription}
                          onInput={e => {
                            this.classroomDescription = (e.target as HTMLInputElement).value;
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
                      this.handleCreateNewClassroomSubmit();
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearVariables();
                      this.createNewClassroomModalOpen = false;
                    }}
                  >
                    Cancel
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
