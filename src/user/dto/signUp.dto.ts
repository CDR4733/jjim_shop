import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignUpDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해 주세요.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해 주세요.' })
  nickname: string;

  @IsString()
  @Exclude({ toPlainOnly: true })
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  password: string;
}
