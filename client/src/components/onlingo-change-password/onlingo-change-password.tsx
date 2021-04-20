import { Component, h, Prop, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-change-password',
  styleUrl: 'onlingo-change-password.scss',
  shadow: false,
})
export class OnlingoChangePassword {
  @Prop() redirectUrl: string;
  @State() currentPassword: string = '';
  @State() password: string = '';

  handleChangePassword = async (event: Event) => {
    event.preventDefault();

    if (!this.currentPassword || !this.password) {
      Swal.fire({
        icon: 'error',
        text: 'Please fill in all fields',
        showConfirmButton: true,
      });

      return;
    }

    const result = await Swal.fire({
      title: 'Reset Password',
      text: `Are you sure you want to change your password`,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          await apiService.changePassword({
            newPassword: this.password,
            password: this.currentPassword,
          });
          return true;
        } catch (error) {
          const errorMessage = error?.response?.data?.message;
          Swal.showValidationMessage(errorMessage ?? 'Please try again');
        }
      },
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
    });

    const { value } = result;

    if (value) {
      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Password has been changed`,
      });
      this.currentPassword = '';
      this.password = '';

      window.location.replace(this.redirectUrl);
    }
  };

  render() {
    return (
      <div class="onlingo-change-password">
        <form class="form" onSubmit={this.handleChangePassword}>
          <h1>Change Password</h1>

          <input
            type="password"
            name="password"
            id="password"
            placeholder="Your current password"
            value={this.currentPassword}
            autocomplete="current-password"
            onInput={e => {
              const target = e.target as HTMLInputElement;

              this.currentPassword = target.value;
            }}
          />
          <input
            type="password"
            name="new-password"
            id="new-password"
            placeholder="New password"
            value={this.password}
            autocomplete="new-password"
            onInput={e => {
              const target = e.target as HTMLInputElement;

              this.password = target.value;
            }}
          />

          <button type="submit" name="change-password" id="change-password">
            Change Password
          </button>
        </form>
      </div>
    );
  }
}
