import { Component, h, State } from '@stencil/core';
import Swal from 'sweetalert2';
import { apiService } from '../../services/api';

@Component({
  tag: 'onlingo-reset-password',
  styleUrl: 'onlingo-reset-password.scss',
  shadow: false,
})
export class OnlingoResetPassword {
  @State() email: string = '';
  @State() password: string = '';

  handleResetPassword = async (event: Event) => {
    event.preventDefault();

    if (!this.email || !this.password) {
      Swal.fire({
        icon: 'error',
        text: 'Please fill in all fields',
        showConfirmButton: true,
      });

      return;
    }

    const result = await Swal.queue<{ dismiss?: string; value?: any[] }>([
      {
        title: 'Reset Password',
        text: `Are you sure you want to reset your password`,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        showLoaderOnConfirm: true,
        preConfirm: async () => {
          try {
            await apiService.resetPasswordInitiate(this.email);

            Swal.insertQueueStep({
              title: 'Reset Password',
              text: `We have sent an OTP to your email address`,
              input: 'text',
              inputLabel: 'One Time Password',
              inputPlaceholder: 'OTP',
              inputValidator: value => {
                if (!value) {
                  return 'Please input the OTP sent to your phone';
                }

                return null;
              },
              showCancelButton: true,
              confirmButtonText: 'Reset',
              showLoaderOnConfirm: true,
              preConfirm: async (otp: string) => {
                try {
                  return await apiService.resetPasswordComplete({
                    otp,
                    email: this.email,
                    newPassword: this.password,
                  });
                } catch (error) {
                  const errorMessage = error?.response?.data?.message;
                  Swal.showValidationMessage(errorMessage ?? 'Please try again');
                }
              },
              allowOutsideClick: () => !Swal.isLoading,
              allowEscapeKey: () => !Swal.isLoading,
              allowEnterKey: () => !Swal.isLoading,
            });
          } catch (error) {
            const errorMessage = error?.response?.data?.message;
            Swal.showValidationMessage(errorMessage ?? 'Please try again');
          }
        },
        allowOutsideClick: () => !Swal.isLoading,
        allowEscapeKey: () => !Swal.isLoading,
        allowEnterKey: () => !Swal.isLoading,
      },
    ]);

    const { value } = result;

    if (value) {
      Swal.fire({
        title: `Success`,
        icon: 'success',
        html: `Password has been reset`,
      });
      this.email = '';
      this.password = '';

      window.location.replace('/');
    }
  };
  render() {
    return (
      <div class="onlingo-reset-password">
        <form class="form" onSubmit={this.handleResetPassword}>
          <h1>Reset Password</h1>

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
          <stencil-route-link url="/">
            <a class="text-text-paragraph hover:text-primary font-bold">Go To Login?</a>
          </stencil-route-link>
          <button type="submit" name="reset-password" id="reset-password">
            Reset Password
          </button>
        </form>
      </div>
    );
  }
}
