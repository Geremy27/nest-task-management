import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule);

  const port = process.env.SERVER_PORT;
  await app.listen(port);
  logger.log(`Application listening on port ${port}...`);
}
bootstrap();
