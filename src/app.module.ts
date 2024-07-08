import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import Joi from 'joi';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';
import { Point } from './point/entities/point.entity';
import { PointModule } from './point/point.module';
import { Place } from './place/entities/place.entity';
import { PlaceModule } from './place/place.module';
import { Show } from './show/entities/show.entity';
import { ShowModule } from './show/show.module';
import { Reservation } from './reservation/entities/reservation.entity';
import { ReservationModule } from './reservation/reservation.module';

const typeOrmModuleOptions = {
  // useFactory : 원래 설정이라는 것은 정적 옵션으로 주로 쓰이는데
  // 이건 .env라는 설정파일을 동적으로 가져와야하므로 useFactory 사용
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    namingStrategy: new SnakeNamingStrategy(),
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [User, Point, Place, Show, Reservation], // 엔터티는 여기에다가!!
    synchronize: configService.get('DB_SYNC'),
    logging: false,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      // 전역으로 선언
      isGlobal: true,
      // Joi를 통해 .env에서 넘어오는 애들 검사
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    // 위에서 선언한 useFactory 동적으로(forRootAsync) 가져오기
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UserModule,
    PointModule,
    PlaceModule,
    ShowModule,
    ReservationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
