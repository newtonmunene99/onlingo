import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get mailService(): string {
    return this.configService.get<string>('mail.service');
  }

  get mailHost(): string {
    return this.configService.get<string>('mail.host');
  }
  get mailUsername(): string {
    return this.configService.get<string>('mail.username');
  }
  get mailPassword(): string {
    return this.configService.get<string>('mail.password');
  }

  get appName(): string {
    return this.configService.get<string>('app.name');
  }

  get masterPassword(): string {
    return this.configService.get<string>('app.masterPassword');
  }

  get userPasswordResetTimeout(): number {
    return this.configService.get<number>('app.userPasswordResetTimeout');
  }

  get jwtSecret(): string {
    return this.configService.get<string>('app.secret');
  }

  get uploadDestination(): string {
    return this.configService.get<string>('app.uploadDestination');
  }

  get baseUrl(): string {
    return this.configService.get<string>('server.host');
  }

  get serverPort(): string {
    return this.configService.get<string>('server.port');
  }

  get dbName(): string {
    return this.configService.get<string>('database.name');
  }

  get dbHost(): string {
    return this.configService.get<string>('database.host');
  }

  get dbPort(): number {
    return this.configService.get<number>('database.port');
  }

  get dbUserName(): string {
    return this.configService.get<string>('database.username');
  }

  get dbPassword(): string {
    return this.configService.get<string>('database.password');
  }
}
