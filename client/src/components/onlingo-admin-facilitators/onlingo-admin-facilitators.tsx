import { Component, h, State } from '@stencil/core';
import { Facilitator } from '../../interfaces/facilitator.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-admin-facilitators',
  styleUrl: 'onlingo-admin-facilitators.scss',
  shadow: false,
})
export class OnlingoAdminFacilitators {
  @State() facilitators: Facilitator[] = [];
  @State() addFacilitatorModalOpen = false;
  @State() editFacilitatorModalOpen = false;

  @State() facilitatorEmail = '';
  @State() employeeId = '';
  @State() facilitatorFirstName = '';
  @State() facilitatorLastName = '';
  @State() facilitatorDepartment = '';

  @State() editFacilitator: Facilitator;

  componentDidLoad() {
    this.getAllFacilitators();
  }

  private handleSubmit = async () => {
    try {
      // await apiService.addNewFacilitator({
      //   user: {
      //     email: this.facilitatorEmail,
      //     firstName: this.facilitatorFirstName,
      //     lastName: this.facilitatorLastName,
      //   },
      //   employeeId: this.employeeId,
      //   department: this.facilitatorDepartment,
      // });

      this.addFacilitatorModalOpen = false;
      this.clearVariables();
      await this.getAllFacilitators();
    } catch (error) {
      console.log({ ...error });
      console.error(error);
    }
  };

  private handleFacilitatorDelete = async () => {
    try {
      // await apiService.deleteFacilitator(this.editFacilitator);

      this.editFacilitatorModalOpen = false;
      this.clearEditVariables();
      await this.getAllFacilitators();
    } catch (error) {
      console.log({ ...error });
      console.error(error);
    }
  };

  private handleFacilitatorUpdate = async () => {
    try {
      //await apiService.updateFacilitator(this.editFacilitator.id, this.editFacilitator);

      this.editFacilitatorModalOpen = false;
      this.clearEditVariables();
      await this.getAllFacilitators();
    } catch (error) {
      console.log({ ...error });
      console.error(error);
    }
  };

  clearVariables = () => {
    this.facilitatorEmail = '';
    this.employeeId = '';
    this.facilitatorFirstName = '';
    this.facilitatorLastName = '';
    this.facilitatorDepartment = '';
  };

  clearEditVariables = () => {
    this.editFacilitator = null;
  };

  async getAllFacilitators() {
    try {
      // const facilitators = await apiService.getAllFacilitators();
      // this.facilitators = facilitators;
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <div class="onlingo-admin-facilitators">
        <div class="buttons-row">
          <button onClick={() => (this.addFacilitatorModalOpen = true)}>Add Facilitator</button>
        </div>

        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">Employee Id</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Department</th>
                      <th scope="col">
                        <span>Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.facilitators.map(facilitator => (
                      <tr>
                        <td>{facilitator.employeeId}</td>
                        <td>
                          {facilitator.user.firstName} {facilitator.user.lastName}
                        </td>
                        <td>{facilitator.user.email}</td>
                        <td>{facilitator.department}</td>
                        <td>
                          <a
                            onClick={() => {
                              this.editFacilitator = facilitator;
                              this.editFacilitatorModalOpen = true;
                            }}
                          >
                            Edit
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {this.addFacilitatorModalOpen ? (
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
                        <label htmlFor="student_id" class="block text-sm font-medium text-gray-700">
                          Facilitator Id
                        </label>
                        <input
                          type="text"
                          name="student_id"
                          id="student_id"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.employeeId}
                          onInput={e => {
                            this.employeeId = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col w-full">
                        <label htmlFor="first_name" class="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          autocomplete="given-name"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.facilitatorFirstName}
                          onInput={e => {
                            this.facilitatorFirstName = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="last_name" class="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          autocomplete="family-name"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.facilitatorLastName}
                          onInput={e => {
                            this.facilitatorLastName = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="email" class="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          autocomplete="email"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.facilitatorEmail}
                          onInput={e => {
                            this.facilitatorEmail = (e.target as HTMLInputElement).value;
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="email" class="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          id="department"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.facilitatorDepartment}
                          onInput={e => {
                            this.facilitatorDepartment = (e.target as HTMLInputElement).value;
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
                      this.handleSubmit();
                    }}
                  >
                    Add Facilitator
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearVariables();
                      this.addFacilitatorModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.editFacilitatorModalOpen ? (
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
                        <label htmlFor="student_id" class="block text-sm font-medium text-gray-700">
                          Facilitator Id
                        </label>
                        <input
                          type="text"
                          name="student_id"
                          id="student_id"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editFacilitator.employeeId}
                          onInput={e => {
                            this.editFacilitator = {
                              ...this.editFacilitator,
                              employeeId: (e.target as HTMLInputElement).value,
                            };
                          }}
                          disabled
                        />
                      </div>
                      <div class="flex flex-col w-full">
                        <label htmlFor="first_name" class="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          autocomplete="given-name"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editFacilitator.user.firstName}
                          onInput={e => {
                            this.editFacilitator = {
                              ...this.editFacilitator,
                              user: { ...this.editFacilitator.user, firstName: (e.target as HTMLInputElement).value },
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="last_name" class="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          autocomplete="family-name"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editFacilitator.user.lastName}
                          onInput={e => {
                            this.editFacilitator = {
                              ...this.editFacilitator,
                              user: { ...this.editFacilitator.user, lastName: (e.target as HTMLInputElement).value },
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="email" class="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          autocomplete="email"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editFacilitator.user.email}
                          onInput={e => {
                            this.editFacilitator = {
                              ...this.editFacilitator,
                              user: { ...this.editFacilitator.user, email: (e.target as HTMLInputElement).value },
                            };
                          }}
                          disabled
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="email" class="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <input
                          type="text"
                          name="department"
                          id="department"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editFacilitator.department}
                          onInput={e => {
                            this.editFacilitator = {
                              ...this.editFacilitator,
                              department: (e.target as HTMLInputElement).value,
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
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-shade dark:text-base font-medium text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleFacilitatorUpdate();
                    }}
                  >
                    Update Facilitator
                  </button>

                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-secondary-shade text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleFacilitatorDelete();
                    }}
                  >
                    Delete Facilitator
                  </button>

                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.editFacilitatorModalOpen = false;
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
