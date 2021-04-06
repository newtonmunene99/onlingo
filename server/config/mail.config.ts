import { registerAs } from '@nestjs/config';

export const mailConfig = registerAs('mail', () => ({
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  username: process.env.MAIL_USERNAME,
  password: process.env.MAIL_PASSWORD,
}));
