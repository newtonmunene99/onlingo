import { Component, h, Prop, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { User } from '../../interfaces/user.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-user',
  styleUrl: 'onlingo-user.scss',
  shadow: false,
})
export class OnlingoUser {
  @State() user: User;
  @State() popUpOpen = false;
  @State() sidebarOpen = true;
  @State() editUserModalOpen = false;
  @State() editUser: User;

  links = [
    {
      name: 'Classrooms',
      url: '/user/',
    },
  ];

  componentDidLoad() {
    this.getProfile();
  }

  async getProfile() {
    this.user = await apiService.getProfile();
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

      this.getProfile();

      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `User has been updated`,
      });
    }
  };

  clearEditVariables = () => {
    this.editUser = null;
  };

  render() {
    return (
      <div class="onlingo-user h-screen w-screen flex flex-row flex-nowrap">
        <nav
          class={`pr-14 z-10 sidenav h-full w-3/4 top-0 absolute ${
            this.sidebarOpen ? 'left-0 md:w-1/4 md:relative' : '-left-3/4'
          } bg-primary flex flex-col justify-center items-center`}
        >
          {this.links.map(link => (
            <stencil-route-link url={link.url}>
              <button class="h-14 w-full font-bold text-text-heading-inverse hover:text-secondary">{link.name}</button>
            </stencil-route-link>
          ))}
        </nav>
        <div class="w-full">
          <div class="header w-full flex flex-row justify-between items-center">
            <div class="ml-4">
              <ion-icon
                name={this.sidebarOpen ? 'close' : 'menu-outline'}
                class="z-40 md:z-0 bg-background md:bg-primary  shadow-md rounded-full m-2 p-2 text-4xl text-text-heading md:text-text-heading-inverse"
                onClick={() => (this.sidebarOpen = !this.sidebarOpen)}
              ></ion-icon>
            </div>
            <div class="p-2">
              <h1 class=" font-bold text-lg text-primary">Onlingo | User</h1>
            </div>
            <div class="mr-8 p-2">
              {this.user ? (
                <div
                  class="relative inline-block text-left"
                  onClick={() => {
                    this.popUpOpen = !this.popUpOpen;
                  }}
                >
                  <button class="border-2 border-primary rounded-sm p-2 text-text-heading bg-transparent hover:bg-primary hover:text-text-heading-inverse">
                    {this.user.firstName} {this.user.lastName}
                  </button>
                  {this.popUpOpen ? (
                    <div
                      class="origin-top-right absolute z-50 right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <div class="py-1">
                        <stencil-route-link url={`/user/grades/`}>
                          <a class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                            View Grades
                          </a>
                        </stencil-route-link>
                      </div>
                      <div class="py-1">
                        <a
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            this.editUser = this.user;
                            this.editUserModalOpen = true;
                          }}
                        >
                          Edit Profile
                        </a>
                        <stencil-route-link url={'/user/change-password'}>
                          <a class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
                            Change Password
                          </a>
                        </stencil-route-link>
                      </div>
                      <div class="py-1">
                        <a
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                          role="menuitem"
                          onClick={() => {
                            apiService.logout();
                            apiService.logout();
                            location.replace(`/`);
                          }}
                        >
                          Logout
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <ion-nav class="body flex-1 bg-background relative" id="user" />
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
