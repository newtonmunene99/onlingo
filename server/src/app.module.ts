import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  CacheInterceptorOptions,
  configOptions,
  connectionOptions,
} from 'src/app.constants';
import { AppController } from 'src/app.controller';
import { AppService } from 'src/app.service';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { AppConfigService } from 'src/app-config/app-config.service';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { ClassroomsModule } from 'src/classrooms/classrooms.module';
import { ClassroomMembersModule } from 'src/classroom-members/classroom-members.module';
import { ClassroomsGateway } from './classrooms/classrooms.gateway';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: connectionOptions,
    }),

    CacheModule.register(),
    AppConfigModule,
    AuthModule,
    MailModule,
    UsersModule,
    ClassroomsModule,
    ClassroomMembersModule,
  ],
  controllers: [AppController],
  providers: [CacheInterceptorOptions, AppService],
})
export class AppModule {}
