import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import _ from 'lodash';

import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { Place } from 'src/place/entities/place.entity';
import { Show } from './entities/show.entity';
import { ShowCategory } from './types/show.type';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,

    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,

    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
  ) {}

  /** 공연 목록 조회(R-L) API **/
  async findAllShow(showCategory: ShowCategory) {
    // 1. 만약 카테고리를 설정하지 않았다면 '전체' 조회
    if (!showCategory) {
      const foundAll = await this.showRepository.find({
        order: { createdAt: 'DESC' },
      });
      // 1-1. 데이터 가공
      const AllDatas = foundAll.map((a) => {
        return {
          showName: a.showName,
          showCategory: a.showCategory,
          showPlace: a.showPlace,
          showImage: a.showImage,
          showFee: a.showFee,
          showDate: a.showDate,
        };
      });
      // 1-2. 가공된 데이터 반환
      return AllDatas;
    }
    // 2. 만약 카테고리를 설정했다면 '카테고리' 조회
    const foundCategory = await this.showRepository.find({
      where: { showCategory },
      order: { createdAt: 'DESC' },
    });
    // 2-1. 데이터 가공
    const CategoryDatas = foundCategory.map((c) => {
      return {
        showName: c.showName,
        showCategory: c.showCategory,
        showPlace: c.showPlace,
        showImage: c.showImage,
        showFee: c.showFee,
        showDate: c.showDate,
      };
    });
    // 2-2. 가공된 데이터 반환
    return CategoryDatas;
  }

  /** 공연 검색 조회(R-L) API **/
  async searchAllShow(keyword: string) {
    // 1. 만약 검색어를 입력하지 않았다면 '전체' 조회 (최신순)
    if (!keyword) {
      const noKeyword = await this.showRepository.find({
        order: { createdAt: 'DESC' },
      });
      // 1-1. 데이터 가공
      const nokwData = noKeyword.map((n) => {
        return {
          showName: n.showName,
          showCategory: n.showCategory,
          showPlace: n.showPlace,
          showImage: n.showImage,
          showFee: n.showFee,
          showDate: n.showDate,
        };
      });
      // 1-2. 가공된 데이터 반환
      return nokwData;
    }
    // 2. 만약 검색어를 입력했다면 공연이름에 검색어가 포함된 것들 조회
    const yesKeyword = await this.showRepository.find({
      where: { showName: Like(`%${keyword}%`) },
      order: { createdAt: 'DESC' },
    });
    // 2-1. 데이터 가공
    const yeskwData = yesKeyword.map((y) => {
      return {
        showName: y.showName,
        showCategory: y.showCategory,
        showPlace: y.showPlace,
        showImage: y.showImage,
        showFee: y.showFee,
        showDate: y.showDate,
      };
    });
    // 2-2. 가공된 데이터 반환
    return yeskwData;
  }

  /** 공연 상세 조회(R-D) **/
  // showId
  async findOneShow(showId: number) {
    // 1. 해당 showId를 가진 공연 정보 조회
    const showDetailInfo = await this.findByShowId(showId);

    // // 2. 예매 가능 여부 확인
    // // 2-1. 공연장 자리 정보 검증
    // const placeSeatInfo = await this.placeRepository.findOneBy({
    //   placeId: showDetailInfo.showPlace,
    // });
    // const SeatArray = placeSeatInfo.placeSeatNumber;
    // const SeatCount = SeatArray.reduce((a, c) => a + c, 0); // 공연장 총 좌석 수

    // // 2-2. 예매 좌석 정보 조회
    // const reservationSeatInfo = await this.reservationRepository.findBy({
    //   showId,

    // })

    // // 3. 예매가능 vs 매진 표시 // 시간이슈...ㅠㅠ 마저 만들어 볼 것! ***

    return showDetailInfo;
  }

  /** 공연 등록(C) **/
  async createShow(createShowDto: CreateShowDto) {
    // 1. string으로 받은 string데이터를 array화
    // 1-1. showFee
    const cdtoShowFee = createShowDto.showFee;
    console.log(cdtoShowFee);
    const createdShowFee = cdtoShowFee
      .trim()
      .split(',')
      .map((p) => Number(p))
      .sort((a, b) => b - a); // 높은 등급 순
    console.log(cdtoShowFee, createdShowFee);
    // 1-2. showDate
    const cdtoShowDate = createShowDto.showDate;
    const createdShowDate = cdtoShowDate
      .split(',')
      .map((c) => c.trim())
      .sort();

    // 2. 이미 등록된 공연인가? (이름/장소/시작날짜가 모두 같은 공연인가?)
    const isRegistered = await this.showRepository.findOneBy({
      showName: createShowDto.showName,
      showPlace: createShowDto.showPlace,
      startDate: createdShowDate[0],
    });
    // 2-1. 만약 존재한다면? 에러메시지(409)
    if (isRegistered) {
      throw new ConflictException('이미 등록한 공연입니다.');
    }

    // 3. 요금 데이터에 오류가 있거나, 요금이 5만원을 초과하는 것이 있는지?
    await this.ValidFee(createdShowFee);

    // 4. 해당 공연 정보를 등록함
    return await this.showRepository.save({
      showName: createShowDto.showName,
      showCategory: createShowDto.showCategory,
      showPlace: createShowDto.showPlace,
      showDetail: createShowDto.showDetail,
      showImage: createShowDto.showImage,
      showFee: createdShowFee,
      showDate: createdShowDate,
      startDate: createdShowDate[0],
    });
  }

  /** 공연 정보 수정(U) **/
  async updateShow(showId: number, updateShowDto: UpdateShowDto) {
    // 1. string으로 받은 string데이터를 array화
    // 1-1. showFee
    const udtoShowFee = updateShowDto.showFee;
    const updatedShowFee = udtoShowFee
      .trim()
      .split(',')
      .map((p) => Number(p))
      .sort((a, b) => b - a); // 높은 등급 순
    // 1-2. showDate
    const udtoShowDate = updateShowDto.showDate;
    const updatedShowDate = udtoShowDate
      .split(',')
      .map((u) => u.trim())
      .sort();

    // 2. 요금 데이터에 오류가 있거나, 요금이 5만원을 초과하는 것이 있는지?
    await this.ValidFee(updatedShowFee);

    // 3. 해당 showId를 가진 공연이 있는지 검증
    await this.findByShowId(showId);

    // 4. 해당 showId를 가진 공연 정보를 수정
    return await this.showRepository.update(
      { showId },
      {
        showName: updateShowDto.showName,
        showCategory: updateShowDto.showCategory,
        showPlace: updateShowDto.showPlace,
        showDetail: updateShowDto.showDetail,
        showImage: updateShowDto.showImage,
        showFee: updatedShowFee,
        showDate: updatedShowDate,
        startDate: updatedShowDate[0],
      },
    );
  }

  /** 공연 정보 삭제(D) **/
  // showId
  async deleteShow(showId: number) {
    // 1. 해당 showId를 가진 공연장이 있는지 검증
    await this.findByShowId(showId);

    // 2. 해당 placeId를 가진 공연장 정보를 삭제(소프트)
    return await this.showRepository.softDelete({ showId });
  }

  /** showId로 공연 찾기(+) **/
  async findByShowId(showId: number) {
    // 1. 해당 showId를 가진 공연이 있는지 검색
    const show = await this.showRepository.findOneBy({ showId });
    // 1-1. 존재하지 않으면 에러메시지(404)
    if (_.isNil(show)) {
      throw new NotFoundException('등록되지 않은 공연입니다.');
    }
    // 1-2. 존재한다면 해당 공연 정보를 반환
    return show;
  }

  /** 공연 요금은 5만원을 초과할 수 없습니다(+) **/
  async ValidFee(feeArray: number[]) {
    for (let i = 0; i < feeArray.length; i++) {
      if (_.isNaN(feeArray[i])) {
        throw new BadRequestException(
          '공연 요금 데이터를 잘못 입력하셨습니다.',
        );
      } else if (feeArray[i] > 50000) {
        throw new BadRequestException(
          '공연 요금은 5만원을 초과할 수 없습니다.',
        );
      }
    }
  }
}
