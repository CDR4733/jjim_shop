import {
  Injectable,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { CreateReservationDto } from './dto/create-reservation.dto';
// import { UpdateReservationDto } from './dto/update-reservation.dto';

import { Reservation } from './entities/reservation.entity';
import { User } from 'src/user/entities/user.entity';
import { Point } from 'src/point/entities/point.entity';
import { Place } from 'src/place/entities/place.entity';
import { Show } from 'src/show/entities/show.entity';

@Injectable()
export class ReservationService {
  constructor(
    // 트랜잭션을 위한 준비!
    private dataSource: DataSource,

    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,

    @InjectRepository(Point)
    private pointRepository: Repository<Point>,

    @InjectRepository(Place)
    private placeRepository: Repository<Place>,

    @InjectRepository(Show)
    private showRepository: Repository<Show>,
  ) {}

  /** 예매 목록 조회(R-L) API **/
  async findAllReservation(user: User) {
    // 1. user에서 userId 추출
    const userId = user.userId;

    // 2. 예약 목록 조회 (최신순 정렬 디폴트)
    const reservationList = await this.reservationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    // 3. 데이터 가공
    // [공연이름] [날짜시간] [좌석정보(좌석섹션+좌석번호)]
    const datas = reservationList.map((e) => {
      return {
        showName: e.showName,
        showDate: e.showDate,
        seatSection: e.seatSection,
        seatNumber: e.seatNumber,
      };
    });

    // 4. 가공된 데이터 반환
    return datas;
  }

  /** 예약 상세 조회(R-D) API **/
  async findOneReservation(user, reservationId) {
    // 1. user에서 userId 추출
    const userId = user.userId;

    // 2. 해당 reservationId의 예약 조회 [예매번호] ~ [요금]
    const reservation = await this.reservationRepository.findOne({
      where: { userId, reservationId },
    });

    // 3. 공연장소 정보도 조회 [장소이름], [장소주소]
    const place = await this.placeRepository.findOne({
      where: { placeId: reservation.placeId },
    });

    // 4. 데이터 가공
    // [예매번호] [공연이름] [장소이름] [장소주소]
    // [날짜시간] [좌석정보(좌석섹션+좌석번호)] [요금]
    const data = {
      reservationId: reservation.reservationId,
      showName: reservation.showName,
      placeName: place.placeName,
      placeAddress: place.placeAddress,
      showDate: reservation.showDate,
      seatSection: reservation.seatSection,
      seatNumber: reservation.seatNumber,
      showFee: reservation.showFee,
    };

    // 5. 가공된 데이터 반환
    return data;
  }

  /** 예약 하기(C) API **/
  // 예매(보유P차감) 트랜잭션 (트랜잭션 직전에 동시성 검증(이미 해당 좌석이 예매됐는지) 하기)
  async makeReservation(user, createReservationDto: CreateReservationDto) {
    // 1. 필요한 데이터 추출
    const userId = user.userId;
    const { showId, showDate, seatSection, seatNumber } = createReservationDto;

    // 2. showId로 placeId, showFee 조회해오기
    const show = await this.showRepository.findOne({
      where: { showId },
    });
    const placeId = show.showPlace;
    const showFeeArray = show.showFee;
    const showDateArray = show.showDate;
    const showName = show.showName;

    // 3. showDate가 showDateArray에 포함되어있는지 검증
    if (!showDateArray.includes(showDate)) {
      throw new BadRequestException(
        '해당 날짜/시간에 진행되는 공연이 없습니다.',
      );
    }

    // 4. placeId로 placeSeatSection, placeSeatNumber 조회해오기
    const place = await this.placeRepository.findOne({
      where: { placeId },
    });
    const { placeSeatSection, placeSeatNumber } = place;
    const sectionIndex = placeSeatSection.indexOf(seatSection);
    const showFee = showFeeArray[sectionIndex];

    // 5. seatSection, seatNumber 검증(공연장에 존재하는지)
    if (!placeSeatSection.includes(seatSection)) {
      throw new BadRequestException('존재하지 않는 좌석 구역입니다.');
    }
    if (seatNumber > 0 && seatNumber > placeSeatNumber[sectionIndex]) {
      throw new BadRequestException('존재하지 않는 좌석 번호입니다.');
    }

    // 6. 내 보유 포인트 조회해오기
    const myPoint = await this.pointRepository.findOneBy({ userId });
    const pointWillBe = myPoint.point - showFee;

    // 7. 내 보유 포인트가 showFee 보다 많으면 가능! 적으면 에러메시지(400)
    if (pointWillBe < 0) {
      throw new BadRequestException('잔여 포인트가 부족합니다.');
    }

    // 8. 좌석조회(동시성) + 예매완료하기 + 포인트차감
    // 8-1. 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // 8-2. 트랜잭션 묶기
    // : try(트랜잭션 묶음) - catch(에러=롤백)
    // - finally(트랜잭션 최종완료; try성공하든 에러가 떠서 catch로 걸리든 이후 finally는 항상 실행)
    try {
      // 8-2-1. 좌석조회 (이미 예약된 좌석인지?)
      const seat = await queryRunner.manager.findOneBy(Reservation, {
        seatSection,
        seatNumber,
      });
      if (seat) {
        throw new ConflictException('이미 예약된 좌석입니다.');
      }
      // 8-2-2. 예매 완료하기
      const reservationDone = await queryRunner.manager.save(Reservation, {
        userId,
        placeId,
        showId,
        showName,
        showFee,
        showDate,
        seatSection,
        seatNumber,
      });
      // 8-2-3. 포인트 차감하기
      await queryRunner.manager.update(
        Point,
        { userId },
        { point: pointWillBe },
      );
      // 8-2-4. 성공 : 트랜잭션 묶음 종료: commit
      await queryRunner.commitTransaction();
      // 8-3-성공시. 트랜잭션 된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
      // 8-4. 리턴
      return reservationDone;
    } catch (err) {
      // 8-2-4. 실패 : 도중에 에러 발생시 롤백하기
      await queryRunner.rollbackTransaction();
      // 8-3-실패시. 롤백된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
      throw new ConflictException('이미 예약된 좌석입니다.');
    }
  }

  /** 예약 내용 수정(U) API **/
  // 예매 내용 수정은 날짜시간 변경, 좌석변경만 가능
  // 만약 좌석섹션이 바뀌는 경우 기존 예매P를 환불하고 새로 예매P 차감 (트랜잭션)
  // 예매(환불/차감) 트랜잭션 (트랜잭션 직전에 동시성 검증)
  //   async changeReservation(
  //     user,
  //     reservationId,
  //     updateReservationDto: UpdateReservationDto,
  //   ) {
  //     // 1.
  //   } // 시간부족이슈...ㅠㅠ 나중에 마저 만들어보기!! *****

  /** 예약 취소(D) API **/
  // 공연시작 3시간 전까지만 + 취소할 때 환불(트랜잭션)
  async cancelReservation(user, reservationId) {
    // 1. userId 추출해오기
    const userId = user.userId;

    // 2. 예약 가져오기
    const reservation = await this.reservationRepository.findOneBy({
      reservationId,
    });

    // 3. 내가 예매한 것이 아닌 경우
    if (userId !== reservation.userId) {
      throw new UnauthorizedException('잘못된 접근입니다.');
    }

    // 4. 공연시작 3시간 전이 아닌 경우
    const now = new Date();
    const start = new Date(reservation.showDate);
    const condition = Math.floor(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60),
    );
    if (condition < 3) {
      throw new BadRequestException(
        '공연까지 남은 시간이 3시간 이내인 경우에는 예매를 취소할 수 없습니다.',
      );
    }

    // 5. 예매 취소 + 환불 (트랜잭션)
    // 5-1. 트랜잭션 시작
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // 5-2. 트랜잭션 묶기
    // : try(트랜잭션 묶음) - catch(에러=롤백)
    // - finally(트랜잭션 최종완료; try성공하든 에러가 떠서 catch로 걸리든 이후 finally는 항상 실행)
    try {
      // 5-2-0. 예매 확인
      const reservation = await queryRunner.manager.findOneBy(Reservation, {
        reservationId,
      });
      // 5-2-1. 예매 취소
      await queryRunner.manager.delete(Reservation, {
        reservationId,
      });
      // 5-2-2. 지금 내 포인트 조회
      const myPoint = await queryRunner.manager.findOneBy(Point, { userId });
      const pointWillBe = myPoint.point + reservation.showFee;
      // 5-2-3. 포인트 환불
      await queryRunner.manager.update(
        Point,
        { userId },
        { point: pointWillBe },
      );
      // 5-2-4. 성공 : 트랜잭션 묶음 종료: commit
      await queryRunner.commitTransaction();
      // 5-3-성공시. 트랜잭션 된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
      // 5-4. 리턴
      return {
        deleted: reservationId,
        pointBefore: myPoint.point,
        pointAfter: pointWillBe,
      };
    } catch (err) {
      // 5-2-4. 실패 : 도중에 에러 발생시 롤백하기
      await queryRunner.rollbackTransaction();
      // 5-3-실패시. 롤백된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
    }
  }

  //   /** 예매가능 좌석조회 2종류 API **/
  //   // 간단요약조회(단일객체): {VIP: 7, S: 13, A: 27 ... }
  //   // 상세목록조회(객체배열): [{seatNum: 32, grade: B, price: 30000}, {seatNum: 181, grade: VIP, price: 50000}... ]
  //   async availableSeat() {
  //     // 1.
  //   } // 시간부족이슈...ㅠㅠ 나중에 마저 만들어보기!! *****
}
