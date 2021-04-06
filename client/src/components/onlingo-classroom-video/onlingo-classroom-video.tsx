import { Component, h, Prop, State } from '@stencil/core';
import { Classroom, ClassroomMember } from '../../interfaces/classroom.interface';
import { User } from '../../interfaces/user.interface';
import { apiService, classroomsSocketClient } from '../../services/api';
import Peer from 'peerjs';
@Component({
  tag: 'onlingo-classroom-video',
  styleUrl: 'onlingo-classroom-video.scss',
  shadow: false,
})
export class OnlingoClassroomVideo {
  @Prop() classroomCode: string;
  @Prop() videoSessionCode: string;

  @State() classroom: Classroom;
  @State() user: User;
  @State() classroomMember: ClassroomMember;

  myPeer: Peer = new Peer(undefined, { host: '/', port: 3006 });
  peerId: string;
  videoGrid: HTMLDivElement;
  peers: Record<string, Peer.MediaConnection> = {};

  socket: SocketIOClient.Socket;

  componentDidLoad() {
    this.socket = classroomsSocketClient;

    this.myPeer.on('open', peerId => {
      this.peerId = peerId;
      this.getClassroom();
    });
  }

  disconnectedCallback() {
    this.socket?.close();
  }

  getClassroom = async () => {
    try {
      this.classroom = await apiService.getClassroomByCode(this.classroomCode);

      await this.getProfile();

      this.getUserMedia();
    } catch (error) {
      console.error({ ...error });
    }
  };

  getProfile = async () => {
    this.user = await apiService.getProfile();

    this.classroomMember = this.classroom?.members?.find(classroomMember => classroomMember.user?.id === this.user?.id);
  };

  async getUserMedia() {
    this.socket.emit('join classroom', {
      classroom: this.classroom,
      classroomMember: this.classroomMember,
      videoSessionCode: this.videoSessionCode,
      peerId: this.peerId,
    });

    const stream = await window.navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    const myVideo = document.createElement('video');
    myVideo.muted = true;
    this.addVideoStream(myVideo, stream);

    this?.socket?.on('new participant joined', data => {
      this.connectToNewUser(data.peerId, stream);
    });

    this?.socket?.on('participant left', data => {
      if (this.peers[data.peerId]) this.peers[data.peerId].close();
    });

    this.myPeer.on('call', call => {
      call.answer(stream);
      const video = document.createElement('video');
      video.muted = true;

      call.on('stream', userVideoStream => {
        this.addVideoStream(video, userVideoStream);
      });
    });
  }

  connectToNewUser(peerId: string, stream: MediaStream) {
    const call = this.myPeer.call(peerId, stream);
    const video = document.createElement('video');
    video.muted = true;

    call.on('stream', peerVideoStream => {
      this.addVideoStream(video, peerVideoStream);
    });

    call.on('close', () => {
      video.remove();
    });

    this.peers[peerId] = call;
  }

  addVideoStream(video: HTMLVideoElement, stream: MediaStream) {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    });
    this.videoGrid.append(video);
  }

  render() {
    return (
      <div class="onlingo-classroom-video">
        <div
          id="video-grid"
          ref={el => {
            this.videoGrid = el;
          }}
        ></div>
      </div>
    );
  }
}
