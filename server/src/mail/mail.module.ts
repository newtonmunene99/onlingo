import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [AppConfigModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
