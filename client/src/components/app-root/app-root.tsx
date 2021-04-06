import { Component, h } from '@stencil/core';
import { ProtectedRoute as AdminProtectedRoute } from '../ProtectedRoutes/AdminProtectedRoute';
import { ProtectedRoute as UserProtectedRoute } from '../ProtectedRoutes/UserProtectedRoute';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.scss',
  shadow: false,
})
export class AppRoot {
  render() {
    return (
      <ion-app>
        <ion-router id="root-router" useHash={false}>
          <ion-route
            url="/"
            component="app-home"
            componentProps={{
              pageTitle: 'Admin',
              redirectUrl: '/admin',
            }}
          ></ion-route>
          <ion-route url="/register" component="onlingo-register"></ion-route>
          <ion-route url="/reset-password" component="onlingo-reset-password"></ion-route>

          <AdminProtectedRoute url="/admin" component="onlingo-admin">
            <ion-route url="/" component="onlingo-admin-dashboard"></ion-route>
            <ion-route url="/students" component="onlingo-admin-students"></ion-route>
            <ion-route url="/facilitators" component="onlingo-admin-facilitators"></ion-route>
          </AdminProtectedRoute>

          <UserProtectedRoute url="/user" component="onlingo-user">
            <ion-route url="/" component="onlingo-user-dashboard"></ion-route>
            <ion-route url="/classrooms/:classroomCode" component="onlingo-classroom"></ion-route>
            <ion-route url="/classrooms/:classroomCode/video-sessions/:videoSessionCode" component="onlingo-classroom-video"></ion-route>
          </UserProtectedRoute>
        </ion-router>
        <ion-nav id="root-nav"></ion-nav>
      </ion-app>
    );
  }
}
