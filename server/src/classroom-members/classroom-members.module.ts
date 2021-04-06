import { Module } from '@nestjs/common';
import { ClassroomMembersService } from 'src/classroom-members/classroom-members.service';
import { ClassroomMembersController } from 'src/classroom-members/classroom-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassroomMember } from 'src/classroom-members/entities/classroom-member.entity';
import { UsersModule } from 'src/users/users.module';
import { ClassroomsModule } from 'src/classrooms/classrooms.module';
import { MulterModule } from '@nestjs/platform-express';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { AppConfigService } from 'src/app-config/app-config.service';
import { diskStorage } from 'multer';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassroomMember]),
    UsersModule,
    ClassroomsModule,
    MulterModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            cb(null, appConfigService.uploadDestination);
          },
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, file.fieldname + '-' + uniqueSuffix);
          },
        }),
      }),
    }),
  ],
  controllers: [ClassroomMembersController],
  providers: [ClassroomMembersService],
  exports: [ClassroomMembersService, TypeOrmModule],
})
export class ClassroomMembersModule {}
