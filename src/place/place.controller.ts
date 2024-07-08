import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { Role } from 'src/user/types/userRole.type';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { PlaceService } from './place.service';

@UseGuards(RolesGuard)
@Controller('places')
export class PlaceController {
  constructor(private readonly placeService: PlaceService) {}

  /** 공연장 목록 조회(R-L) API **/
  @Get()
  async findAllPlace() {
    const foundAll = await this.placeService.findAllPlaceInfo();
    return {
      status: 200,
      message: '공연장 목록 조회가 완료되었습니다.',
      data: foundAll,
    };
  }

  /** 공연장 상세 조회(R-D) **/
  @Get(':placeId')
  async findOnePlace(@Param('placeId') placeId: number) {
    const foundOne = await this.placeService.findOnePlaceInfo(placeId);
    return {
      status: 200,
      message: '공연장 상세 조회가 완료되었습니다.',
      data: foundOne,
    };
  }

  /** 공연장 정보 등록(C) **/
  @Roles(Role.ADMIN)
  @Post()
  async registerPlaceInfo(@Body() createPlaceDto: CreatePlaceDto) {
    const registered =
      await this.placeService.registerPlaceInfo(createPlaceDto);
    return {
      status: 201,
      message: '공연장 정보 등록이 완료되었습니다.',
      data: registered,
    };
  }

  /** 공연장 정보 수정(U) **/
  @Roles(Role.ADMIN)
  @Patch(':placeId')
  async updatePlaceInfo(
    @Param('placeId') placeId: number,
    @Body() updatePlaceDto: UpdatePlaceDto,
  ) {
    await this.placeService.updatePlaceInfo(placeId, updatePlaceDto);
    return {
      status: 200,
      message: '공연장 정보 수정이 완료되었습니다.',
    };
  }

  /** 공연장 정보 삭제(D) **/
  @Roles(Role.ADMIN)
  @Delete(':placeId')
  async deletePlaceInfo(@Param('placeId') placeId: number) {
    await this.placeService.deletePlaceInfo(placeId);
    return {
      status: 200,
      message: '공연장 정보 삭제가 완료되었습니다.',
    };
  }
}
