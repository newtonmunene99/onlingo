import { createTransport } from 'nodemailer';
import { Injectable, Logger } from '@nestjs/common';
import Mail from 'nodemailer/lib/mailer';
import { AppConfigService } from 'src/app-config/app-config.service';
import { UserWithAssignedPassword } from 'src/users/interfaces/user-role.interface';
import { MailResponse } from 'src/mail/interfaces/mail.interface';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);
  private transporter: Mail;

  constructor(private appConfigService: AppConfigService) {
    this.transporter = createTransport({
      service: appConfigService.mailService,
      host: appConfigService.mailHost,
      auth: {
        user: appConfigService.mailUsername,
        pass: appConfigService.mailPassword,
      },
    });
  }

  async sendNewUserEmail({ firstName, email }: User): Promise<MailResponse> {
    const mailOptions: Mail.Options = {
      from: this.appConfigService.mailUsername,
      to: email,
      subject: `Welcome to ${this.appConfigService.appName}`,
      html: `Dear ${firstName}, Thank you for chosing to be part of ${this.appConfigService.appName}. Use this email to log into your account. You can create your own classrooms or enroll into existing classrooms using a classroom code.`,
    };

    const mailResult: MailResponse = await this.transporter.sendMail(
      mailOptions,
    );

    return mailResult;
  }

  async sendPasswordChangedEmail({
    firstName,
    email,
  }: User): Promise<MailResponse> {
    const mailOptions: Mail.Options = {
      from: this.appConfigService.mailUsername,
      to: email,
      subject: `Password Changed`,
      html: `Dear ${firstName}, Your password has just been changed a few moments ago. If this was not you, kindly change your password immediately.`,
    };

    const mailResult: MailResponse = await this.transporter.sendMail(
      mailOptions,
    );

    return mailResult;
  }

  async sendInitiatePasswordResetEmail({
    user: { firstName, email },
    assignedPassword,
  }: UserWithAssignedPassword): Promise<MailResponse> {
    const mailOptions: Mail.Options = {
      from: this.appConfigService.mailUsername,
      to: email,
      subject: `Password Reset Request`,
      html: `Dear ${firstName}, you requested a password reset. Your one time pin is <b>${assignedPassword}</b>, it expires in ${this.appConfigService.userPasswordResetTimeout} minutes. If this was not you, kindly change your password immediately.`,
    };

    const mailResult: MailResponse = await this.transporter.sendMail(
      mailOptions,
    );

    return mailResult;
  }

  async sendPasswordResetEmail({
    firstName,
    email,
  }: User): Promise<MailResponse> {
    const mailOptions: Mail.Options = {
      from: this.appConfigService.mailUsername,
      to: email,
      subject: `Password Reset Success`,
      html: `Dear ${firstName}, Your password has just been reset a few moments ago. If this was not you, kindly change your password immediately.`,
    };

    const mailResult: MailResponse = await this.transporter.sendMail(
      mailOptions,
    );

    return mailResult;
  }
}
