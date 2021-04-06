import {
  BadRequestException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ClassroomMemberRole } from 'src/classroom-members/interfaces/classroom-member.interface';
import { ClassroomsService } from './classrooms.service';
import { JoinVideoSessionDTO, VideoSessionDTO } from './dto/classroom.dto';
import { Classroom } from './entities/classroom.entity';

@WebSocketGateway({ namespace: 'virtual-classrooms' })
export class ClassroomsGateway {
  private logger = new Logger(ClassroomsGateway.name);

  constructor(private classroomsService: ClassroomsService) {}

  @SubscribeMessage('subscribe-classroom-events')
  handleSubscribeClassroomEvents(
    @MessageBody() classroom: Classroom,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`${classroom.code}-events`, (err) => {
      if (err) {
        console.log(err);
        return;
      }

      this.logger.debug('subsscribe classroom events');
    });
    return {};
  }

  @SubscribeMessage('create classroom')
  async createVirtualClassroom(
    @MessageBody()
    data: VideoSessionDTO,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { classroom, classroomMember } = data;

    if (!classroom || !classroomMember) {
      throw new BadRequestException(
        `Classroom and Classroom Member cannot be empty`,
      );
    }

    const existingClassroomMember = classroom.members.find(
      (member) => member.id === classroomMember.id,
    );

    if (
      !existingClassroomMember ||
      existingClassroomMember.role === ClassroomMemberRole.STUDENT
    ) {
      throw new ForbiddenException(
        `You are not authorized to create a new video session`,
      );
    }

    const videoSession = await this.classroomsService.createNewVideoSession(
      classroom,
      classroomMember,
    );

    client.join(classroom.code);
    client
      .to(`${classroom.code}-events`)
      .broadcast.emit('new virtual classroom', {
        classroom,
        code: videoSession.code,
      });

    return {
      classroom,
      code: videoSession.code,
    };
  }

  @SubscribeMessage('join classroom')
  async joinVirtualClassroom(
    @MessageBody()
    data: JoinVideoSessionDTO,
    @ConnectedSocket() client: Socket,
  ): Promise<any> {
    const { classroom, classroomMember, videoSessionCode, peerId } = data;

    if (!classroom || !classroomMember || !videoSessionCode || !peerId) {
      throw new BadRequestException(
        `Classroom, Classroom Member and Video Session Code cannot be empty`,
      );
    }

    const existingClassroomMember = classroom.members.find(
      (member) => member.id === classroomMember.id,
    );

    if (!existingClassroomMember) {
      throw new ForbiddenException(`You are not e member of this classroom`);
    }

    const videoSession = await this.classroomsService.findVideoSessionByCode(
      videoSessionCode,
    );

    if (!videoSession) {
      throw new NotFoundException(
        `Video Session with code ${videoSessionCode} is not available`,
      );
    }

    client.join(videoSession.code);

    client.to(videoSession.code).broadcast.emit('new participant joined', {
      ...data,
      videoSession,
    });

    client.on('disconnect', () => {
      console.log('disconnected client ');
      client.to(videoSession.code).broadcast.emit('participant left', {
        ...data,
        videoSession,
      });
    });

    return {
      ...data,
      videoSession,
    };
  }
}
