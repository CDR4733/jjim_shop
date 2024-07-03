import { Controller, Body, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { SignUpDto } from './dto/signUp.dto';
import { LogInDto } from './dto/logIn.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserInfo } from 'src/utils/userInfo.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** 회원등록(sign-up) API **/
  @Post('sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return await this.userService.signUp(
      signUpDto.email,
      signUpDto.nickname,
      signUpDto.password,
    );
  }

  /** 로그인(log-in) API **/
  @Post('log-in')
  async logIn(@Body() logInDto: LogInDto) {
    return await this.userService.logIn(logInDto.email, logInDto.password);
  }

  /** 회원 정보 조회 API **/
  @UseGuards(AuthGuard('jwt'))
  @Get('user-info')
  getEmail(@UserInfo() user: User) {
    return { email: user.email };
  }
}
