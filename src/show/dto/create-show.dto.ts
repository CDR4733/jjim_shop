import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

import { ShowCategory } from '../types/show.type';

export class CreateShowDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력해 주세요.' })
  showName: string;

  @IsString()
  @IsNotEmpty({ message: '공연 카테고리를 입력해 주세요.' })
  showCategory: ShowCategory;

  @IsString()
  showDetail: string;

  @IsNumber()
  @IsNotEmpty({ message: '공연장 id를 입력해 주세요.' })
  showPlace: number;

  @IsString()
  @IsNotEmpty({ message: '공연 요금 정보를 입력해 주세요.' })
  showFee: string;

  @IsString()
  showImage: string;

  @IsString()
  @IsNotEmpty({ message: '공연 날짜/시간 정보를 입력해 주세요.' })
  showDate: string;
}
