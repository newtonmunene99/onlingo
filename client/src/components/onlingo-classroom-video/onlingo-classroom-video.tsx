import { Component, h, Prop, State } from '@stencil/core';
import { Classroom, ClassroomMember } from '../../interfaces/classroom.interface';
import { User } from '../../interfaces/user.interface';
import { apiService, classroomsSocketClient } from '../../services/api';
import Peer from 'peerjs';
import Swal from 'sweetalert2';
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
      console.log('new participant connected');
      this.connectToNewUser(data.peerId, stream);
    });

    this?.socket?.on('participant left', data => {
      console.log(' participant left');
      if (this.peers[data.peerId]) this.peers[data.peerId].close();
    });

    this.myPeer.on('call', call => {
      console.log('my peer is being called');
      call.answer(stream);
      const video = document.createElement('video');
      video.muted = true;

      call.on('stream', userVideoStream => {
        console.log('my peer call has a video stream');
        this.addVideoStream(video, userVideoStream);
      });
    });
  }

  connectToNewUser(peerId: string, stream: MediaStream) {
    console.log('calling a new user');
    const call = this.myPeer.call(peerId, stream);
    const video = document.createElement('video');
    video.muted = true;

    call.on('stream', peerVideoStream => {
      console.log('The call i made has a stream');
      this.addVideoStream(video, peerVideoStream);
    });

    call.on('close', () => {
      console.log('call has been closed');
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

  async leaveMeeting() {
    const result = await Swal.fire({
      title: 'Are you sure',
      html: 'Do you want to proceed and leave this meeting?',
      allowOutsideClick: () => !Swal.isLoading,
      allowEscapeKey: () => !Swal.isLoading,
      allowEnterKey: () => !Swal.isLoading,
      showLoaderOnConfirm: true,
      showCancelButton: true,
      confirmButtonText: 'Leave',
    });

    if (result.isConfirmed) {
      location.replace(`/user/classrooms/${this.classroom.code}`);
    }
  }

  render() {
    return (
      <div class="onlingo-classroom-video relative">
        <div
          id="video-grid"
          ref={el => {
            this.videoGrid = el;
          }}
        ></div>
        <button
          class="absolute bottom-32 right-5 p-4 bg-primary hover:bg-primary-shade rounded-sm text-text-heading-inverse font-bold shadow-md hover:shadow-lg"
          onClick={() => {
            this.leaveMeeting();
          }}
        >
          Leave Meeting
        </button>
      </div>
    );
  }
}
