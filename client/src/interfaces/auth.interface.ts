export interface IAuthPayload {
  email: string;
  password: string;
}

export interface IAdminRegisterPayload {
  name: string;
  email: string;
  msisdn: string;
  password: string;
  masterUsername: string;
  masterPassword: string;
}

export interface IUserRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  gender: 'female' | 'male';
  password: string;
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
