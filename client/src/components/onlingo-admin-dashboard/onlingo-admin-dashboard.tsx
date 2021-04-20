import { Component, h, State } from '@stencil/core';
import { Attachment, Classroom, Post } from '../../interfaces/classroom.interface';
import { User } from '../../interfaces/user.interface';
import { apiService } from '../../services/api';

interface MonthAndYearOf<K> {
  month: number;
  year: number;
  of: K[];
}
@Component({
  tag: 'onlingo-admin-dashboard',
  styleUrl: 'onlingo-admin-dashboard.scss',
  shadow: false,
})
export class OnlingoAdminDashboard {
  @State() user: User;

  @State() users: MonthAndYearOf<User>[] = [];
  @State() currentUserYearFilter = new Date().getFullYear();

  @State() classrooms: MonthAndYearOf<Classroom>[] = [];
  @State() currentClassroomYearFilter = new Date().getFullYear();

  @State() posts: MonthAndYearOf<Post>[] = [];
  @State() currentPostYearFilter = new Date().getFullYear();

  @State() attachments: MonthAndYearOf<Attachment>[] = [];
  @State() currentAttachmentYearFilter = new Date().getFullYear();

  componentDidLoad() {
    this.getAllUsers();
    this.getAllClassrooms();
    this.getAllPosts();
    this.getAllAttachments();
  }

  async getAllUsers() {
    try {
      const users = await apiService.getAllUsers();

      const usersPerYearAndMonth = users.reduce<MonthAndYearOf<User>[]>((current, user) => {
        const createdAt = new Date(user.createdAt);

        const existingUser = current.find(user => user.month === createdAt.getMonth() + 1 && user.year === createdAt.getFullYear());

        if (!existingUser) {
          current.push({
            month: createdAt.getMonth() + 1,
            year: createdAt.getFullYear(),
            of: [user],
          });

          return current;
        }

        existingUser.of.push(user);

        return current;
      }, []);

      this.users = usersPerYearAndMonth;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllClassrooms() {
    try {
      const classrooms = await apiService.getAllClassrooms();

      const classroomsPerYearAndMonth = classrooms.reduce<MonthAndYearOf<Classroom>[]>((current, classroom) => {
        const createdAt = new Date(classroom.createdAt);

        const existingClassroom = current.find(classroom => classroom.month === createdAt.getMonth() + 1 && classroom.year === createdAt.getFullYear());

        if (!existingClassroom) {
          current.push({
            month: createdAt.getMonth() + 1,
            year: createdAt.getFullYear(),
            of: [classroom],
          });

          return current;
        }

        existingClassroom.of.push(classroom);

        return current;
      }, []);

      this.classrooms = classroomsPerYearAndMonth;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllPosts() {
    try {
      const posts = await apiService.getAllPosts();

      const postsPerYearAndMonth = posts.reduce<MonthAndYearOf<Post>[]>((current, post) => {
        const createdAt = new Date(post.createdAt);

        const existingPost = current.find(post => post.month === createdAt.getMonth() + 1 && post.year === createdAt.getFullYear());

        if (!existingPost) {
          current.push({
            month: createdAt.getMonth() + 1,
            year: createdAt.getFullYear(),
            of: [post],
          });

          return current;
        }

        existingPost.of.push(post);

        return current;
      }, []);

      this.posts = postsPerYearAndMonth;
    } catch (error) {
      console.error(error);
    }
  }

  async getAllAttachments() {
    try {
      const attachments = await apiService.getAllAttachments();

      const attachmentsPerYearAndMonth = attachments.reduce<MonthAndYearOf<Attachment>[]>((current, attachment) => {
        const createdAt = new Date(attachment.createdAt);

        const existingAttachment = current.find(attachment => attachment.month === createdAt.getMonth() + 1 && attachment.year === createdAt.getFullYear());

        if (!existingAttachment) {
          current.push({
            month: createdAt.getMonth() + 1,
            year: createdAt.getFullYear(),
            of: [attachment],
          });

          return current;
        }

        existingAttachment.of.push(attachment);

        return current;
      }, []);

      this.attachments = attachmentsPerYearAndMonth;
    } catch (error) {
      console.error(error);
    }
  }

  async getProfile() {
    this.user = await apiService.getProfile();
  }

  render() {
    return (
      <div class="onlingo-admin-dashboard h-screen overflow-y-auto">
        <div class="dashboard-items flex flex-row flex-wrap p-4">
          <div class="dashboard-item shadow-md rounded text-lg flex flex-col">
            <div>
              <select
                name="yearClassroomCreated"
                id="yearClassroomCreated"
                onInput={event => {
                  this.currentClassroomYearFilter = parseInt((event.target as HTMLSelectElement).value);
                }}
              >
                {[...new Set(this.classrooms.map(classroom => classroom.year))].map(year => (
                  <option value={year}>{year}</option>
                ))}
              </select>
              <p>
                <span class="font-bold">
                  {this.classrooms
                    .filter(classroom => classroom.year === this.currentClassroomYearFilter)
                    .reduce((value, classroom) => {
                      return (value = value + classroom.of.length);
                    }, 0)}
                </span>{' '}
                classroom(s) created in {this.currentClassroomYearFilter}
              </p>
            </div>
            <div class="flex-1">
              <apex-chart
                type="bar"
                series={[
                  {
                    name: 'classrooms',
                    data: Array(12)
                      .fill(0)
                      .map((_, index) => {
                        const monthlyClassrooms = this.classrooms
                          .filter(classroom => classroom.year === this.currentClassroomYearFilter)
                          .find(classroom => classroom.month === index + 1);

                        if (monthlyClassrooms) {
                          return monthlyClassrooms.of.length;
                        }

                        return 0;
                      }),
                  },
                ]}
                options={{
                  xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  },
                }}
              />
            </div>
          </div>

          <div class="dashboard-item shadow-md rounded text-lg flex flex-col">
            <div>
              <select
                name="yearUserCreated"
                id="yearUserCreated"
                onInput={event => {
                  this.currentUserYearFilter = parseInt((event.target as HTMLSelectElement).value);
                }}
              >
                {[...new Set(this.users.map(user => user.year))].map(year => (
                  <option value={year}>{year}</option>
                ))}
              </select>
              <p>
                <span class="font-bold">
                  {this.users
                    .filter(user => user.year === this.currentUserYearFilter)
                    .reduce((value, user) => {
                      return (value = value + user.of.length);
                    }, 0)}
                </span>{' '}
                users(s) registered in {this.currentUserYearFilter}
              </p>
            </div>
            <div class="flex-1">
              <apex-chart
                type="bar"
                series={[
                  {
                    name: 'users',
                    data: Array(12)
                      .fill(0)
                      .map((_, index) => {
                        const monthlyUsers = this.users.filter(user => user.year === this.currentUserYearFilter).find(user => user.month === index + 1);

                        if (monthlyUsers) {
                          return monthlyUsers.of.length;
                        }

                        return 0;
                      }),
                  },
                ]}
                options={{
                  xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  },
                  yaxis: {
                    floating: false,
                  },
                }}
              />
            </div>
          </div>

          <div class="dashboard-item shadow-md rounded text-lg flex flex-col">
            <div>
              <select
                name="yearPostCreated"
                id="yearPostCreated"
                onInput={event => {
                  this.currentPostYearFilter = parseInt((event.target as HTMLSelectElement).value);
                }}
              >
                {[...new Set(this.posts.map(post => post.year))].map(year => (
                  <option value={year}>{year}</option>
                ))}
              </select>
              <p>
                <span class="font-bold">
                  {this.posts
                    .filter(post => post.year === this.currentPostYearFilter)
                    .reduce((value, post) => {
                      return (value = value + post.of.length);
                    }, 0)}
                </span>{' '}
                posts(s) and assignment(s) posted in {this.currentPostYearFilter}
              </p>
            </div>
            <div class="flex-1">
              <apex-chart
                type="pie"
                series={[
                  this.posts
                    .filter(post => post.year === this.currentPostYearFilter)
                    .reduce((value, post) => {
                      return [...value, ...post.of];
                    }, [])
                    .filter(post => post.type === 'Post').length,
                  this.posts
                    .filter(post => post.year === this.currentPostYearFilter)
                    .reduce((value, post) => {
                      return [...value, ...post.of];
                    }, [])
                    .filter(post => post.type === 'Assignment').length,
                ]}
                options={{
                  chart: {
                    width: 380,
                    type: 'pie',
                  },
                  labels: ['Posts', 'Assignments'],
                  responsive: [
                    {
                      breakpoint: 480,
                      options: {
                        chart: {
                          width: 200,
                        },
                        legend: {
                          position: 'bottom',
                        },
                      },
                    },
                  ],
                }}
              />
            </div>
          </div>

          <div class="dashboard-item shadow-md rounded text-lg flex flex-col">
            <div>
              <select
                name="yearAttachmentCreated"
                id="yearAttachmentCreated"
                onInput={event => {
                  this.currentAttachmentYearFilter = parseInt((event.target as HTMLSelectElement).value);
                }}
              >
                {[...new Set(this.attachments.map(attachment => attachment.year))].map(year => (
                  <option value={year}>{year}</option>
                ))}
              </select>
              <p>
                <span class="font-bold">
                  {this.attachments
                    .filter(attachment => attachment.year === this.currentAttachmentYearFilter)
                    .reduce((value, attachment) => {
                      return (value = value + attachment.of.length);
                    }, 0)}
                </span>{' '}
                assignment(s) posted in {this.currentPostYearFilter}
              </p>
            </div>
            <div class="flex-1">
              <apex-chart
                type="line"
                series={[
                  {
                    name: 'Post Attachment',
                    type: 'column',
                    data: Array(12)
                      .fill(0)
                      .map((_, index) => {
                        const monthlyAttachments = this.attachments
                          .filter(attachment => attachment.year === this.currentAttachmentYearFilter)
                          .find(attachment => attachment.month === index + 1);

                        if (monthlyAttachments) {
                          return monthlyAttachments.of.filter(attachment => attachment.type === 'PostAttachment').length;
                        }

                        return 0;
                      }),
                  },
                  {
                    name: 'Assignment Submission Attachment',
                    type: 'line',
                    data: Array(12)
                      .fill(0)
                      .map((_, index) => {
                        const monthlyAttachments = this.attachments
                          .filter(attachment => attachment.year === this.currentAttachmentYearFilter)
                          .find(attachment => attachment.month === index + 1);

                        if (monthlyAttachments) {
                          return monthlyAttachments.of.filter(attachment => attachment.type === 'AssignmentSubmissionAttachment').length;
                        }

                        return 0;
                      }),
                  },
                ]}
                options={{
                  chart: {
                    height: 350,
                    type: 'line',
                  },
                  stroke: {
                    width: [0, 4],
                  },
                  title: {
                    text: 'Post Attachments/Assignment Submission Attachments',
                  },
                  dataLabels: {
                    enabled: true,
                    enabledOnSeries: [1],
                  },
                  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  xaxis: {
                    type: 'category',
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  },
                  yaxis: [
                    {
                      title: {
                        text: 'Post Attachment',
                      },
                    },
                    {
                      opposite: true,
                      title: {
                        text: 'Assignment Submission Attachment',
                      },
                    },
                  ],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
