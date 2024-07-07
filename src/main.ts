import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe : dto를 사용하기 위해서 필요
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 데이터 json을 dto 형태로 변환
    }),
  );

  // 포트 3000으로 서버 실행!
  await app.listen(3000);
}
bootstrap();
