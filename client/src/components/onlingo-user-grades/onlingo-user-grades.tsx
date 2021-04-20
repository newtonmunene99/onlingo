import { Component, h, Prop, State } from '@stencil/core';
import { GradeWithPopUpOptions } from '../../interfaces/classroom.interface';
import { User } from '../../interfaces/user.interface';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-user-grades',
  styleUrl: 'onlingo-user-grades.scss',
  shadow: false,
})
export class OnlingoUserGrades {
  @State() user: User;

  @State() grades: GradeWithPopUpOptions[] = [];

  async getProfile() {
    this.user = await apiService.getProfile();

    this.getAllGrades();
  }

  componentDidLoad() {
    this.getProfile();
  }

  async getAllGrades() {
    try {
      const grades = await apiService.getUserGrades(this.user);
      console.log(grades);

      const existingGrades = grades.map(grade => {
        return {
          ...grade,
          popupOpen: false,
        };
      });

      console.log('existingGrades');

      this.grades = [...existingGrades].sort((a, b) =>
        b.assignmentSubmission.assignment.author.classroom.code.localeCompare(a.assignmentSubmission.assignment.author.classroom.code),
      );

      console.log(this.grades);
    } catch (error) {
      console.error({ ...error });
    }
  }

  render() {
    return (
      <div class="onlingo-user-grades">
        <div class="wrapper">
          <div class="inner-wrapper">
            <div class="header-wrapper">
              <div class="table-border">
                <table>
                  <thead class="">
                    <tr>
                      <th scope="col">Classroom</th>
                      <th scope="col">Assignment</th>

                      <th scope="col">Points Scored</th>
                      <th scope="col">Facilitator Comments</th>
                      <th scope="col">Date Graded</th>

                      <th scope="col">
                        <span></span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.grades.map((grade, gradeIndex) => {
                      const popUpOpen = grade.popupOpen;
                      const assignmentDate = new Date(grade.assignmentSubmission?.assignment?.createdAt);
                      const dateGraded = new Date(grade.createdAt);

                      return (
                        <tr>
                          <td>
                            <p>
                              {grade.assignmentSubmission?.author?.classroom?.unitCode} {grade.assignmentSubmission?.author?.classroom?.name}
                            </p>
                          </td>

                          <td>
                            <p>{grade?.assignmentSubmission?.assignment?.title}</p>
                            <small>
                              {assignmentDate?.getDate()}/{assignmentDate?.getMonth() + 1}/{assignmentDate?.getFullYear()}
                            </small>
                          </td>

                          <td>
                            <p>
                              {grade.points}/{grade.assignmentSubmission?.assignment?.totalPoints}
                            </p>
                          </td>

                          <td>
                            <p>{grade.comments ?? 'No Comment'}</p>
                          </td>

                          <td>
                            <p>
                              {dateGraded?.getDate()}/{dateGraded?.getMonth() + 1}/{dateGraded?.getFullYear()}
                            </p>
                          </td>

                          <td>
                            <div class="relative inline-block text-left">
                              <ion-icon
                                name="ellipsis-horizontal-outline"
                                class={`rounded-full m-2 p-2 text-2xl 'text-text-heading' hover:shadow-md`}
                                onClick={() => {
                                  this.grades = this.grades.map((grade, index) => {
                                    let g = grade;
                                    if (gradeIndex === index) {
                                      g.popupOpen = !popUpOpen;
                                      return g;
                                    }
                                    g.popupOpen = false;
                                    return g;
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
                                  {/* <div class="py-1">
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
                                  </div> */}
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
