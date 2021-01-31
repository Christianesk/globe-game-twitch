import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  
  app.useStaticAssets(join(__dirname, '../', 'public'));
  app.setBaseViewsDir(join(__dirname, '../', 'public/views'));
  app.setViewEngine('hbs');

  if (configService.get('NODE_ENV') === 'development') {
    logger.debug('Running on development.');
    app.enableCors();
  } else {
    //PRODUCTION
    app.enableCors();
  }


  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
