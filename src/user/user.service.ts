import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { compare, hash } from 'bcrypt';
import _ from 'lodash';

import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRpository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /** 회원등록(sign-up) API **/
  // email, nickname, password
  async signUp(email: string, nickname: string, password: string) {
    // 1. 해당 email로 가입한 user가 존재하는지?
    const isExistingEmail = await this.findByEmail(email);
    // 1-1. 이미 존재한다면 에러메시지(409)
    if (isExistingEmail) {
      throw new ConflictException(
        `이미 해당 이메일(${email})로 가입된 사용자가 있습니다!`,
      );
    }

    // 2. 해당 nickname으로 가입한 user가 존재하는지?
    const isExistingNickname = await this.findByNickname(nickname);
    // 2-1. 이미 존재한다면 에러메시지(409)
    if (isExistingNickname) {
      throw new ConflictException(
        `이미 해당 닉네임(${nickname})으로 가입된 사용자가 있습니다!`,
      );
    }

    // 3. 비밀번호는 hash할 것
    const hashedPassword = await hash(password, 10);

    // 4. 해당 정보들로 회원등록 완료
    await this.userRpository.save({
      email,
      nickname,
      password: hashedPassword,
    });
  }

  /** 로그인(log-in) API **/
  // email, password
  async logIn(email: string, password: string) {
    // 1. 해당 email로 가입된 사용자가 있는지 확인
    const user = await this.findByEmail(email);

    // 2. 해당 user가 없다면 에러메시지(404)
    if (_.isNil(user)) {
      throw new NotFoundException(
        `해당 이메일(${email})로 가입된 사용자를 찾을 수 없습니다.`,
      );
    }

    // 3. 비밀번호가 일치하지 않는다면 에러메시지(401)
    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    // 4. 페이로드
    const payload = { email, sub: user.userId };

    // 5. Access Token 발급
    return {
      message: `${user.nickname} 님, 어서오세요!`,
      accessToken: this.jwtService.sign(payload),
    };
  }

  /** email로 사용자 찾기 **/
  async findByEmail(email: string) {
    return await this.userRpository.findOneBy({ email });
  }

  /** nickname으로 사용자 찾기 **/
  async findByNickname(nickname: string) {
    return await this.userRpository.findOneBy({ nickname });
  }
}
