import { Component, h, State } from '@stencil/core';
import { Student } from '../../interfaces/student.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-admin-students',
  styleUrl: 'onlingo-admin-students.scss',
  shadow: false,
})
export class OnlingoAdminStudents {
  @State() students: Student[] = [];
  @State() addStudentModalOpen = false;
  @State() editStudentModalOpen = false;

  @State() studentEmail = '';
  @State() studentId = '';
  @State() studentFirstName = '';
  @State() studentLastName = '';

  @State() editStudent: Student;

  componentDidLoad() {
    this.getAllStudents();
  }

  private handleSubmit = async () => {
    try {
      // await apiService.addNewStudent({
      //   user: {
      //     email: this.studentEmail,
      //     firstName: this.studentFirstName,
      //     lastName: this.studentLastName,
      //   },
      //   studentId: this.studentId,
      // });

      this.addStudentModalOpen = false;
      this.clearVariables();
      await this.getAllStudents();
    } catch (error) {
      console.log({ ...error });
      console.error(error);
    }
  };

  private handleStudentDelete = async () => {
    try {
      // await apiService.deleteStudent(this.editStudent);

      this.editStudentModalOpen = false;
      this.clearEditVariables();
      await this.getAllStudents();
    } catch (error) {
      console.log({ ...error });
      console.error(error);
    }
  };

  private handleStudentUpdate = async () => {
    try {
      // await apiService.updateStudent(this.editStudent.id, this.editStudent);

      this.editStudentModalOpen = false;
      this.clearEditVariables();
      await this.getAllStudents();
    } catch (error) {
      console.log({ ...error });
      console.error(error);
    }
  };

  clearVariables = () => {
    this.studentEmail = '';
    this.studentFirstName = '';
    this.studentLastName = '';
    this.studentId = '';
  };

  clearEditVariables = () => {
    this.editStudent = null;
  };

  async getAllStudents() {
    try {
      // const students = await apiService.getAllStudents();
      //this.students = students;
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <div class="onlingo-admin-students">
        <div class="buttons-row">
          <button onClick={() => (this.addStudentModalOpen = true)}>Add Student</button>
        </div>
        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">Student Id</th>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">
                        <span>Edit</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.students.map(student => (
                      <tr>
                        <td>{student.studentId}</td>
                        <td>
                          {student.user.firstName} {student.user.lastName}
                        </td>
                        <td>{student.user.email}</td>
                        <td>
                          <a
                            onClick={() => {
                              this.editStudent = student;
                              this.editStudentModalOpen = true;
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

        {this.addStudentModalOpen ? (
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
                          Student Id
                        </label>
                        <input
                          type="text"
                          name="student_id"
                          id="student_id"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.studentId}
                          onInput={e => {
                            this.studentId = (e.target as HTMLInputElement).value;
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
                          value={this.studentFirstName}
                          onInput={e => {
                            this.studentFirstName = (e.target as HTMLInputElement).value;
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
                          value={this.studentLastName}
                          onInput={e => {
                            this.studentLastName = (e.target as HTMLInputElement).value;
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
                          value={this.studentEmail}
                          onInput={e => {
                            this.studentEmail = (e.target as HTMLInputElement).value;
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
                    Add Student
                  </button>
                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearVariables();
                      this.addStudentModalOpen = false;
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {this.editStudentModalOpen ? (
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
                          Student Id
                        </label>
                        <input
                          type="text"
                          name="student_id"
                          id="student_id"
                          class="w-full h-12 appearance-none border-2 border-gray-300 my-3 px-4 shadow-sm text-base hover:border-primary focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent rounded-md"
                          value={this.editStudent.studentId}
                          onInput={e => {
                            this.editStudent = {
                              ...this.editStudent,
                              studentId: (e.target as HTMLInputElement).value,
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
                          value={this.editStudent.user.firstName}
                          onInput={e => {
                            this.editStudent = {
                              ...this.editStudent,
                              user: { ...this.editStudent.user, firstName: (e.target as HTMLInputElement).value },
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
                          value={this.editStudent.user.lastName}
                          onInput={e => {
                            this.editStudent = {
                              ...this.editStudent,
                              user: { ...this.editStudent.user, lastName: (e.target as HTMLInputElement).value },
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
                          value={this.editStudent.user.email}
                          onInput={e => {
                            this.editStudent = {
                              ...this.editStudent,
                              user: { ...this.editStudent.user, email: (e.target as HTMLInputElement).value },
                            };
                          }}
                          disabled
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-shade text-base font-medium text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleStudentUpdate();
                    }}
                  >
                    Update Student
                  </button>

                  <button
                    type="button"
                    class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-secondary-shade text-base font-medium text-white hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.handleStudentDelete();
                    }}
                  >
                    Delete Student
                  </button>

                  <button
                    type="button"
                    class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      this.clearEditVariables();
                      this.editStudentModalOpen = false;
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
