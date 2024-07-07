import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateReservationDto {
  @IsString()
  @IsNotEmpty({ message: '좌석 구역을 입력해 주세요.' })
  seatSection: string;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해 주세요.' })
  seatNumber: number;
}
