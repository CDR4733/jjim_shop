import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UpdatePointDto } from './dto/update-point.dto';
import { Point } from './entities/point.entity';

@Injectable()
export class PointService {
  constructor(
    @InjectRepository(Point)
    private readonly pointRepository: Repository<Point>,
  ) {}

  /** 포인트 조회(R-L) API **/
  async findPoint(userId: number) {
    // 1. userId로 포인트 조회
    const point = await this.pointRepository.findOneBy({ userId });

    // 2. 포인트 조회 결과를 반환
    return {
      status: 200,
      message: '포인트가 조회되었습니다.',
      data: {
        point: point.point,
      },
    };
  }

  /** 포인트 충전(R) API **/
  async chargePoint(userId: number, updatePointDto: UpdatePointDto) {
    // 1. 기존 포인트 조회
    const pointNow = await this.findPoint(userId);

    // 2. 충전 포인트 합산
    const chargedPoint = pointNow.data.point + updatePointDto.pointCharge;

    // 3. 포인트 충전
    await this.pointRepository.update({ userId }, { point: chargedPoint });

    // 4. 포인트 충전 결과를 반환
    return {
      status: 200,
      message: '포인트가 충전되었습니다.',
      data: {
        before: pointNow.data.point,
        after: chargedPoint,
      },
    };
  }
}
