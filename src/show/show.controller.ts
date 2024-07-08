import {
  Controller,
  Body,
  Param,
  Query,
  Get,
  Post,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { Role } from 'src/user/types/userRole.type';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { ShowService } from './show.service';
import { ShowCategory } from './types/show.type';

@Controller('shows')
export class ShowController {
  constructor(private readonly showService: ShowService) {}

  /** 공연 목록 조회(R-L) API **/
  @Get()
  async findAllShow(@Query('showCategory') showCategory: ShowCategory) {
    const foundAll = await this.showService.findAllShow(showCategory);
    return {
      status: 200,
      message: '공연 목록 조회가 완료되었습니다.',
      data: foundAll,
    };
  }

  /** 공연 검색 조회(R-L) API **/
  @Get('search')
  async searchAllShow(@Body('keyword') keyword: string) {
    const searchAll = await this.showService.searchAllShow(keyword);
    return {
      status: 200,
      message: '공연 검색 조회가 완료되었습니다.',
      data: searchAll,
    };
  }

  /** 공연 상세 조회(R-D) API **/
  @Get(':showId')
  async findOneShow(@Param('showId') showId: number) {
    const foundOne = await this.showService.findOneShow(showId);
    return {
      status: 200,
      message: '공연 상세 조회가 완료되었습니다.',
      data: foundOne,
    };
  }

  /** 공연 등록(C) API **/
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  async createShow(@Body() createShowDto: CreateShowDto) {
    const created = await this.showService.createShow(createShowDto);
    return {
      status: 201,
      message: '공연 등록이 완료되었습니다.',
      data: created,
    };
  }

  /** 공연 정보 수정(U) API **/
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':showId')
  async updateShow(
    @Param('showId') showId: number,
    @Body() updateShowDto: UpdateShowDto,
  ) {
    await this.showService.updateShow(showId, updateShowDto);
    return {
      status: 200,
      message: '공연 정보 수정이 완료되었습니다.',
    };
  }

  /** 공연 정보 삭제(D) API **/
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':showId')
  async deleteShow(@Param('showId') showId: number) {
    await this.showService.deleteShow(showId);
    return {
      status: 200,
      message: '공연 정보 삭제가 완료되었습니다.',
    };
  }
}
