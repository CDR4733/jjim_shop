import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ValidationPipe : dto를 사용하기 위해서 필요
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // 데이터 json을 dto 형태로 변환
    }),
  );

  await app.listen(3000);
}
bootstrap();
