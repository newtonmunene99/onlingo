import { Component, h, Prop, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-register',
  styleUrl: 'onlingo-register.scss',
  shadow: false,
})
export class OnlingoLogin {
  @Prop() redirectUrl: string;

  @State() firstName: string;
  @State() lastName: string;
  @State() email: string;
  @State() password: string;

  private handleRegister = async (event: Event) => {
    event.preventDefault();

    if (!this.email || !this.password) {
      Swal.fire({
        title: 'Fill in all fields',
        html: 'Please fill in all required fields',
        icon: 'error',
      });
      return;
    }

    Swal.fire({
      title: 'Please wait!',
      html: 'Kindly be patient as we register you',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });

    Swal.disableButtons();
    Swal.showLoading();
    try {
      const { role } = await apiService.register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
      });

      Swal.close();

      location.replace(this.redirectUrl ?? `/${role}`);
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

  render() {
    return (
      <div class="onlingo-register">
        <form class="form" onSubmit={this.handleRegister}>
          <h1>Register</h1>
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="First Name"
            value={this.firstName}
            autocomplete="given-name"
            onInput={e => {
              const target = e.target as HTMLInputElement;

              this.firstName = target.value;
            }}
          />
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="Last Name"
            value={this.lastName}
            autocomplete="family-name"
            onInput={e => {
              const target = e.target as HTMLInputElement;

              this.lastName = target.value;
            }}
          />

          <input
            type="email"
            name="email"
            id="email"
            placeholder="Your email"
            value={this.email}
            autocomplete="email"
            onInput={e => {
              const target = e.target as HTMLInputElement;

              this.email = target.value;
            }}
          />
          <input
            type="password"
            name="password"
            id="password"
            placeholder="Your password"
            value={this.password}
            autocomplete="new-password"
            onInput={e => {
              const target = e.target as HTMLInputElement;

              this.password = target.value;
            }}
          />
          <stencil-route-link url="/">
            <a class="text-text-paragraph hover:text-primary font-bold">Already have an account?</a>
          </stencil-route-link>
          <button type="submit" name="login" id="login">
            REGISTER
          </button>
        </form>
      </div>
    );
  }
}
