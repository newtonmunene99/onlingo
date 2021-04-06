export interface IAuthPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  name: string;
  email: string;
  msisdn: string;
  password: string;
  masterUsername: string;
  masterPassword: string;
}

export interface IChangePasswordPayload {
  password: string;
  newPassword: string;
}

export interface IResetPasswordPayload {
  email: string;
  newPassword: string;
  otp: string;
}
