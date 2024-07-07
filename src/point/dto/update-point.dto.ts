import { IsNotEmpty, IsNumber } from 'class-validator';
export class UpdatePointDto {
  @IsNumber()
  @IsNotEmpty({ message: '충전할 포인트를 입력해 주세요.' })
  pointCharge: number;
}
