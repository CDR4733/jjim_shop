import { Controller, Body, Get, Patch } from '@nestjs/common';

import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from 'src/user/entities/user.entity';

import { UpdatePointDto } from './dto/update-point.dto';
import { PointService } from './point.service';

@Controller('points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  /** 포인트 조회(R-L) API **/
  @Get()
  async findPoint(@UserInfo() user: User) {
    return await this.pointService.findPoint(user.userId);
  }

  /** 포인트 충전(R) API **/
  @Patch()
  async chargePoint(
    @UserInfo() user: User,
    @Body() updatePointDto: UpdatePointDto,
  ) {
    return await this.pointService.chargePoint(user.userId, updatePointDto);
  }
}
