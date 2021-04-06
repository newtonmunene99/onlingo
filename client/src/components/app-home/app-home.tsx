import { Component, h, Prop, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { apiService } from '../../services/api';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.scss',
  shadow: false,
})
export class AppHome {
  @Prop() redirectUrl: string;

  @State() email: string;
  @State() password: string;

  router: HTMLIonRouterElement;

  private handleEmailInput = (e: Event) => {
    const target = e.target as HTMLInputElement;

    this.email = target.value;
  };

  private handlePasswordInput = (e: Event) => {
    const target = e.target as HTMLInputElement;

    this.password = target.value;
  };

  private handleLogin = async (event: Event) => {
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
      html: 'Kindly be patient as we log you in',
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
    });

    Swal.disableButtons();
    Swal.showLoading();

    try {
      const { role } = await apiService.login({
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

  componentDidLoad() {
    this.router = document.querySelector('ion-router');

    if (apiService.isAuthorized()) {
      location.replace(`/${apiService.role()}`);
    }
  }
  render() {
    return (
      <div class="app-home">
        <div class="wrapper">
          <div class="start">
            <h1>Onlingo</h1>
          </div>
          <div class="end">
            <h1>
              Onlingo<span>LMS</span>
            </h1>
            <form class="form" onSubmit={this.handleLogin}>
              <input type="email" name="email" id="email" placeholder="Your email" required value={this.email} onInput={this.handleEmailInput} />
              <input type="password" name="password" id="password" placeholder="Your password" required value={this.password} onInput={this.handlePasswordInput} />
              <stencil-route-link url="/register">
                <a class="text-text-paragraph hover:text-primary font-bold">Don't have an account?</a>
              </stencil-route-link>
              <button type="submit" name="login" id="login">
                LOGIN
              </button>
              <stencil-route-link url="/reset-password">
                <a class="text-text-paragraph hover:text-primary font-bold">Forgot password?</a>
              </stencil-route-link>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
