import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Point } from './entities/point.entity';
import { PointController } from './point.controller';
import { PointService } from './point.service';

@Module({
  imports: [TypeOrmModule.forFeature([Point])],
  controllers: [PointController],
  providers: [PointService],
})
export class PointModule {}
