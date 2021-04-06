import { registerAs } from '@nestjs/config';

export const serverConfig = registerAs('server', () => ({
  host: process.env.BASE_URL,
  port: parseInt(process.env.SERVER_PORT, 10) || 5000,
}));
