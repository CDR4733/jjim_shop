import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlaceDto {
  @IsString()
  @IsNotEmpty({ message: '공연장 이름을 입력해 주세요.' })
  placeName: string;

  @IsString()
  @IsNotEmpty({ message: '공연장 이미지 url을 등록해 주세요.' })
  placeImage: string;

  @IsString()
  @IsNotEmpty({ message: '공연장 주소를 입력해 주세요.' })
  placeAddress: string;

  @IsString()
  @IsNotEmpty({ message: '공연장 좌석 구역 정보를 입력해 주세요.' })
  placeSeatSection: string;

  @IsString()
  @IsNotEmpty({ message: '공연장 좌석 번호 정보를 입력해 주세요.' })
  placeSeatNumber: string;
}
