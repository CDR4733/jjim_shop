import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { User } from 'src/user/entities/user.entity';
import { UserInfo } from 'src/utils/userInfo.decorator';

import { CreateReservationDto } from './dto/create-reservation.dto';
// import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationService } from './reservation.service';

@UseGuards(AuthGuard('jwt'))
@Controller('reservations')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  /** 예매 목록 조회(R-L) API **/
  @Get()
  async findAllReservation(@UserInfo() user: User) {
    const foundAll = await this.reservationService.findAllReservation(user);
    return {
      status: 200,
      message: '예약 목록 조회가 완료되었습니다.',
      data: foundAll,
    };
  }

  /** 예약 상세 조회(R-D) **/
  @Get(':reservationId')
  async findOneReservation(
    @UserInfo() user: User,
    @Param('reservationId') reservationId: number,
  ) {
    const foundOne = await this.reservationService.findOneReservation(
      user,
      reservationId,
    );
    return {
      status: 200,
      message: '예약 상세 조회가 완료되었습니다.',
      data: foundOne,
    };
  }

  /** 예약 하기(C) **/
  @Post()
  async makeReservation(
    @UserInfo() user: User,
    @Body() createReservationDto: CreateReservationDto,
  ) {
    const reservation = await this.reservationService.makeReservation(
      user,
      createReservationDto,
    );
    return {
      status: 201,
      message: '예약이 완료되었습니다.',
      data: reservation,
    };
  }

  //   /** 예약 내용 수정(U) **/
  //   @Patch(':reservationId')
  //   async changeReservation(
  //     @UserInfo() user: User,
  //     @Param('reservationId') reservationId: number,
  //     @Body() updateReservationDto: UpdateReservationDto,
  //   ) {
  //     const changed = await this.reservationService.changeReservation(
  //       user,
  //       reservationId,
  //       updateReservationDto,
  //     );
  //     return {
  //       status: 200,
  //       message: '예약이 변경되었습니다.',
  //       data: changed,
  //     };
  //   } // 시간부족이슈...ㅠㅠ 나중에 마저 만들어보기!! *****

  /** 예약 취소(D) **/
  @Delete(':reservationId')
  async cancelReservation(
    @UserInfo() user: User,
    @Param('reservationId') reservationId: number,
  ) {
    const cancel = await this.reservationService.cancelReservation(
      user,
      reservationId,
    );
    return {
      status: 200,
      message: '예약이 취소되었습니다.',
      data: cancel,
    };
  }

  //   /** 예매가능 좌석조회(R) API **/
  //   @Get()
  //   async availableSeat() {
  //     const available = await this.reservationService.availableSeat();
  //     return {
  //       status: 200,
  //       message: '예매가능 좌석조회가 완료되었습니다.',
  //       data: available,
  //     };
  //   } // 시간부족이슈...ㅠㅠ 나중에 마저 만들어보기!! *****
}
