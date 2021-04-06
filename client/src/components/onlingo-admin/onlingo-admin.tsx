import { Component, h, State } from '@stencil/core';

@Component({
  tag: 'onlingo-admin',
  styleUrl: 'onlingo-admin.scss',
  shadow: false,
})
export class OnlingoAdmin {
  @State() sidebarOpen = true;
  links = [
    {
      name: 'Home',
      url: '/admin/',
    },
    {
      name: 'Students',
      url: '/admin/students',
    },
    {
      name: 'Facilitators',
      url: '/admin/facilitators',
    },
  ];
  render() {
    return (
      <div class="h-screen w-screen flex flex-row flex-nowrap">
        <nav
          class={`pr-14 z-10 sidenav h-full w-3/4 top-0 absolute ${
            this.sidebarOpen ? 'left-0 md:w-1/4 md:relative' : '-left-3/4'
          } bg-primary flex flex-col justify-center items-end`}
        >
          {this.links.map(link => (
            <stencil-route-link url={link.url}>
              <button class="h-14 w-full font-bold text-text-heading-inverse hover:text-secondary">{link.name}</button>
            </stencil-route-link>
          ))}
        </nav>
        <div class="w-full">
          <ion-icon
            name={this.sidebarOpen ? 'close' : 'menu-outline'}
            class="z-40 md:z-0 bg-background md:bg-primary  shadow-md rounded-full m-2 p-2 relative text-4xl text-text-heading md:text-text-heading-inverse"
            onClick={() => (this.sidebarOpen = !this.sidebarOpen)}
          ></ion-icon>

          <ion-nav class="body flex-1 bg-background relative" id="admin" />
        </div>
      </div>
    );
  }
}
