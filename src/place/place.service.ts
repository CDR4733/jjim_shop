import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';

import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './entities/place.entity';

@Injectable()
export class PlaceService {
  constructor(
    @InjectRepository(Place)
    private readonly placeRepository: Repository<Place>,
  ) {}

  /** 공연장 목록 조회(R-L) API **/
  async findAllPlaceInfo(): Promise<Place[]> {
    // 1. 공연장 목록 조회
    return await this.placeRepository.find();
  }

  /** 공연장 상세 조회(R-D) **/
  // placeId
  async findOnePlaceInfo(placeId: number) {
    // 1. 해당 placeId를 가진 공연장 정보 조회
    return await this.findByPlaceId(placeId);
  }

  /** 공연장 정보 등록(C) **/
  // placeName, placeImage, placeAddress, placeSeatInfo
  async registerPlaceInfo(createPlaceDto: CreatePlaceDto) {
    // 1. 이미 등록된 공연장인지 검색 (이름, 주소 모두 겹치는 경우)
    const isExistingPlace = await this.placeRepository.find({
      where: {
        placeName: createPlaceDto.placeName,
        placeAddress: createPlaceDto.placeAddress,
      },
    });
    // 1-1. 이미 존재한다면 에러메시지(409)
    if (isExistingPlace) {
      throw new ConflictException(`이미 등록된 공연장입니다!`);
    }

    // 2. string으로 받은 string데이터를 array화
    // 2-1. seatSection
    const cdtoSeatSection = createPlaceDto.placeSeatSection;
    const createdSeatSection = cdtoSeatSection.trim().split(',');
    // 2-2. seatNumber
    const cdtoSeatNumber = createPlaceDto.placeSeatNumber;
    const createdSeatNumber = cdtoSeatNumber
      .trim()
      .split(',')
      .map((e) => Number(e));

    // 3. 해당 공연장 정보를 등록함
    return await this.placeRepository.save({
      placeName: createPlaceDto.placeName,
      placeImage: createPlaceDto.placeImage,
      placeAddress: createPlaceDto.placeAddress,
      placeSeatSection: createdSeatSection,
      placeSeatNumber: createdSeatNumber,
    });
  }

  /** 공연장 정보 수정(U) **/
  // placeId, placeName, placeImage, placeAddress, placeSeatInfo
  async updatePlaceInfo(placeId: number, updatePlaceDto: UpdatePlaceDto) {
    // 1. 해당 placeId를 가진 공연장이 있는지 검증
    await this.findByPlaceId(placeId);

    // 2. string으로 받은 string데이터를 array화
    // 2-1. seatSection
    const udtoSeatSection = updatePlaceDto.placeSeatSection;
    const updatedSeatSection = udtoSeatSection.trim().split(',');
    // 2-2. seatNumber
    const udtoSeatNumber = updatePlaceDto.placeSeatNumber;
    const updatedSeatNumber = udtoSeatNumber
      .trim()
      .split(',')
      .map((e) => Number(e));

    // 3. 해당 placeId를 가진 공연장 정보를 수정
    return await this.placeRepository.update(
      { placeId },
      {
        placeName: updatePlaceDto.placeName,
        placeImage: updatePlaceDto.placeImage,
        placeAddress: updatePlaceDto.placeAddress,
        placeSeatSection: updatedSeatSection,
        placeSeatNumber: updatedSeatNumber,
      },
    );
  }

  /** 공연장 정보 삭제(D) **/
  // placeId
  async deletePlaceInfo(placeId: number) {
    // 1. 해당 placeId를 가진 공연장이 있는지 검증
    await this.findByPlaceId(placeId);

    // 2. 해당 placeId를 가진 공연장 정보를 삭제(소프트)
    return await this.placeRepository.softDelete({ placeId });
  }

  /** placeId로 공연장 찾기(+) **/
  async findByPlaceId(placeId: number) {
    // 1. 해당 placeId를 가진 공연장이 있는지 검색
    const place = await this.placeRepository.findOneBy({ placeId });
    // 1-1. 존재하지 않으면 에러메시지(404)
    if (_.isNil(place)) {
      throw new NotFoundException('등록되지 않은 공연장입니다.');
    }
    // 1-2. 존재한다면 해당 공연장 정보를 반환
    return place;
  }
}
