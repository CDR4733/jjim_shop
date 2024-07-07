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
import { Show } from './entities/show.entity';
import { ShowCategory } from './types/show.type';

@Injectable()
export class ShowService {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}

  /** 공연 목록 조회(R-L) API **/
  async findAllShow(showCategory: ShowCategory): Promise<Show[]> {
    // 1. 만약 카테고리를 설정하지 않았다면 '전체' 조회
    if (_.isNull(showCategory)) {
      return await this.showRepository.find({
        order: { createdAt: 'DESC' },
      });
    }
    // 2. 만약 카테고리를 설정했다면 '카테고리' 조회
    return await this.showRepository.find({
      where: { showCategory },
      order: { createdAt: 'DESC' },
    });
  }

  /** 공연 검색 조회(R-L) API **/
  async searchAllShow(keyword: string) {
    // 1. 만약 검색어를 입력하지 않았다면 '전체' 조회 (최신순)
    if (_.isNull(keyword)) {
      return await this.showRepository.find({
        order: { createdAt: 'DESC' },
      });
    }
    // 2. 만약 검색어를 입력했다면 공연이름에 검색어가 포함된 것들 조회
    return await this.showRepository.find({
      where: { showName: Like(`%${keyword}%`) },
      order: { createdAt: 'DESC' },
    });
  }

  /** 공연 상세 조회(R-D) **/
  // showId
  async findOneShow(showId: number) {
    // 1. 해당 showId를 가진 공연 정보 조회
    return await this.findByShowId(showId);
  }

  /** 공연 등록(C) **/
  async createShow(createShowDto: CreateShowDto) {
    // 1. string으로 받은 string데이터를 array화
    // 1-1. showFee
    const cdtoShowFee = createShowDto.showFee;
    const createdShowFee = cdtoShowFee
      .trim()
      .split(',')
      .map((p) => Number(p))
      .sort((a, b) => b - a); // 높은 등급 순
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
