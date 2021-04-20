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

  private handleRegister = async (event: Event) => {
    event.preventDefault();

    var data = new FormData(event.target as HTMLFormElement);

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
        firstName: data.get('firstName').toString(),
        lastName: data.get('lastName').toString(),
        email: data.get('email').toString(),
        dob: data.get('dob').toString(),
        gender: data.get('gender').toString() as 'male' | 'female',
        password: data.get('password').toString(),
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
          <input type="text" name="firstName" id="firstName" placeholder="First Name" autocomplete="given-name" required />
          <input type="text" name="lastName" id="lastName" placeholder="Last Name" autocomplete="family-name" required />

          <input type="email" name="email" id="email" placeholder="Your email" autocomplete="email" required />

          <label htmlFor="dob">Date Of Birth?</label>
          <input type="date" name="dob" id="dob" placeholder="Date Of Birth" autocomplete="bday" required />

          <label htmlFor="gender">What gender are you?</label>
          <select name="gender" id="gender" autocomplete="sex" required>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>

          <input type="password" name="password" id="password" placeholder="Your password" autocomplete="new-password" required />
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
