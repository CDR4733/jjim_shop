import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reservation } from './entities/reservation.entity';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import { Point } from 'src/point/entities/point.entity';
import { Place } from 'src/place/entities/place.entity';
import { Show } from 'src/show/entities/show.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Point, Place, Show])],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
