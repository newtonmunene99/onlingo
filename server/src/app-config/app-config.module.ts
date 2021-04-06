import { Module } from '@nestjs/common';
import { AppConfigService } from 'src/app-config/app-config.service';

@Module({
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class AppConfigModule {}
