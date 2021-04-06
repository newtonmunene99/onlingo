import { Component, h, State } from '@stencil/core';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-user',
  styleUrl: 'onlingo-user.scss',
  shadow: false,
})
export class OnlingoUser {
  @State() sidebarOpen = true;

  links = [
    {
      name: 'Classrooms',
      url: '/user/',
    },
  ];

  render() {
    return (
      <div class="h-screen w-screen flex flex-row flex-nowrap">
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
          <button
            class="h-14 w-full font-bold text-text-heading-inverse hover:text-secondary"
            onClick={() => {
              apiService.logout();
              apiService.logout();
              location.replace(`/`);
            }}
          >
            Logout
          </button>
        </nav>
        <div class="w-full relative">
          <ion-icon
            name={this.sidebarOpen ? 'close' : 'menu-outline'}
            class="z-40 bg-primary  shadow-md rounded-full m-2 p-2 absolute top-0 left-0 text-4xl text-text-heading-inverse"
            onClick={() => (this.sidebarOpen = !this.sidebarOpen)}
          ></ion-icon>

          <ion-nav class="body flex-1 bg-background relative bg-yellow-500" id="user" />
        </div>
      </div>
    );
  }
}
