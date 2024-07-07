import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsNumber()
  @IsNotEmpty({ message: '공연 ID를 입력해 주세요.' })
  showId: number;

  @IsString()
  @IsNotEmpty({ message: '공연 날짜/시간을 입력해 주세요.' })
  showDate: string;

  @IsString()
  @IsNotEmpty({ message: '좌석 구역을 입력해 주세요.' })
  seatSection: string;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해 주세요.' })
  seatNumber: number;
}
