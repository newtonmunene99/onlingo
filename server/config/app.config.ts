import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME,
  secret: process.env.SECRET_KEY,
  masterPassword: process.env.MASTER_PASSWORD,
  userPasswordResetTimeout: process.env.USER_PASSWORD_RESET_TIMEOUT,
  uploadDestination: process.env.UPLOAD_DESTINATION,
}));
