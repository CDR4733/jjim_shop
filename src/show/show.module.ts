import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Show } from './entities/show.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { ShowController } from './show.controller';
import { ShowService } from './show.service';
import { Place } from 'src/place/entities/place.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Show, Place, Reservation])],
  controllers: [ShowController],
  providers: [ShowService],
})
export class ShowModule {}
