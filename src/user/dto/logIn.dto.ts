import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LogInDto {
  @IsEmail()
  @IsNotEmpty({ message: '이메일을 입력해 주세요.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요.' })
  password: string;
}
