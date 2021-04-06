import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { AppConfigService } from 'src/app-config/app-config.service';

async function bootstrap() {
  if (!existsSync('public')) {
    mkdirSync('public');
  }

  if (!existsSync('repository')) {
    mkdirSync('repository');
  }

  if (!existsSync('repository/images')) {
    mkdirSync('repository/images');
  }

  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const appConfigService = app.get(AppConfigService);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  app.setViewEngine('hbs');

  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors();

    // IMPORTANT - Only allow certain urls
    // app.enableCors({
    //   origin: serverConfig.origin,
    // });
  }

  app.setGlobalPrefix('api');

  /// Set security headers
  app.use(helmet());

  /// Prevent XSS attacks
  app.use(xss());

  /// Prevent http param pollution
  app.use(hpp());

  app.use(cookieParser());

  app.use(compression());

  const port = appConfigService.serverPort;

  await app.listen(port);

  logger.log(
    `${appConfigService.appName} ${process.env.NODE_ENV} on port ${port}`,
  );
}
bootstrap();
