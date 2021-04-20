import { Component, h, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { User, UserWithPopUpOptions } from '../../interfaces/user.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-admin-users',
  styleUrl: 'onlingo-admin-users.scss',
  shadow: false,
})
export class OnlingoAdminUsers {
  @State() users: UserWithPopUpOptions[] = [];
  @State() editUserModalOpen = false;

  @State() editUser: User;

  componentDidLoad() {
    this.getAllUsers();
  }

  async getAllUsers() {
    try {
      const users = await apiService.getAllUsers();

      this.users = users.map(user => {
        return {
          ...user,
          popupOpen: false,
        };
      });
    } catch (error) {
      console.error(error);
    }
  }

  private handleUpdateUser = async () => {
    const result = await Swal.fire({
      title: 'Are you sure',
      html: 'Do you want to proceed and update this user',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Update',
      preConfirm: async () => {
        try {
          return await apiService.updateUser(this.editUser.id, {
            firstName: this.editUser.firstName,
            lastName: this.editUser.lastName,
            gender: this.editUser.gender,
            dob: this.editUser.dob,
          });
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.editUserModalOpen = false;
      this.clearEditVariables();

      this.users = [];
      this.getAllUsers();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `User has been updated`,
      });
    }
  };

  private handleDeleteUser = async (user: User) => {
    const result = await Swal.fire({
      title: 'Delete User',
      html: 'Do you want to proceed and delete this user?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      preConfirm: async () => {
        try {
          return await apiService.deleteUser(user.id);
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
    });

    if (result.isConfirmed) {
      this.users = [];
      await this.getAllUsers();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `User has been deleted`,
      });
    }
  };

  clearEditVariables = () => {
    this.editUser = null;
  };

  render() {
    return (
      <div class="onlingo-admin-users">
        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">DOB</th>
                      <th scope="col">Gender</th>
                      <th scope="col">Role</th>
                      <th scope="col">
                        <span></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.users.map((user, userIndex) => {
                      const popUpOpen = user.popupOpen;
                      const dob = new Date(user.dob);

                      return (
                        <tr>
                          <td>
                            <p>
                              {user.firstName} {user.lastName}
                            </p>
                          </td>
                          <td>
                            <p>{user.email}</p>
                          </td>
                          <td>
                            <p>
                              {dob?.getDate()}/{dob?.getMonth() + 1}/{dob?.getFullYear()}
                            </p>
                          </td>
                          <td>
                            <p>{user.gender}</p>
                          </td>
                          <td>
                            <p>{user.role}</p>
                          </td>
                          <td>
                            <div class="relative inline-block text-left">
                              <ion-icon
                                name="ellipsis-horizontal-outline"
                                class={`rounded-full m-2 p-2 text-2xl 'text-text-heading' hover:shadow-md`}
                                onClick={() => {
                                  this.users = this.users.map((user, index) => {
                                    let u = user;
                                    if (userIndex === index) {
                                      u.popupOpen = !popUpOpen;
                                      return u;
                                    }
                                    u.popupOpen = false;
                                    return u;
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
                                        this.editUser = user;
                                        this.editUserModalOpen = true;
                                      }}
                                    >
                                      Edit User
                                    </a>
                                    <a
                                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                      role="menuitem"
                                      onClick={() => {
                                        this.handleDeleteUser(user);
                                      }}
                                    >
                                      Delete User
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
        {this.editUserModalOpen ? (
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
                        <label htmlFor="firstName" class="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          id="firstName"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editUser?.firstName}
                          autocomplete="given-name"
                          onInput={e => {
                            this.editUser = {
                              ...this.editUser,
                              firstName: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>

                      <div class="flex flex-col">
                        <label htmlFor="lastName" class="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          id="lastName"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editUser?.lastName}
                          autocomplete="family-name"
                          onInput={e => {
                            this.editUser = {
                              ...this.editUser,
                              lastName: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="dob" class="block text-sm font-medium text-gray-700">
                          Date Of Birth
                        </label>
                        <input
                          type="date"
                          name="dob"
                          id="dob"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          placeholder="Date Of Birth"
                          autocomplete="bday"
                          value={this.editUser?.dob}
                          onInput={e => {
                            this.editUser = {
                              ...this.editUser,
                              dob: (e.target as HTMLInputElement).value,
                            };
                          }}
                        />
                      </div>
                      <div class="flex flex-col">
                        <label htmlFor="gender" class="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <select
                          name="gender"
                          id="gender"
                          autocomplete="sex"
                          required
                          onInput={e => {
                            this.editUser = {
                              ...this.editUser,
                              gender: (e.target as HTMLInputElement).value as 'male' | 'female',
                            };
                          }}
                        >
                          <option value="male" selected={this.editUser.gender === 'male'}>
                            Male
                          </option>
                          <option value="female" selected={this.editUser.gender === 'female'}>
                            Female
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleUpdateUser();
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.editUserModalOpen = false;
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
