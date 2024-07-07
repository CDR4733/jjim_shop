import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { compare, hash } from 'bcrypt';
import _ from 'lodash';

import { User } from './entities/user.entity';
import { Point } from 'src/point/entities/point.entity';

@Injectable()
export class UserService {
  constructor(
    // 트랜잭션을 위한 준비!
    private dataSource: DataSource,

    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,

    @InjectRepository(Point)
    private pointRepository: Repository<Point>,
  ) {}

  /** 회원 가입(sign-up) API **/
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

    // 트랜잭션!!!!!!!!!!! TypeORM식 트랜잭션 새로 익힌 내용이니 꼭 복습하기!!
    // 4. 해당 정보들로 회원등록 + 포인트 테이블 데이터 생성! (트랜잭션)
    // 4-1. 트랜잭션 시작 가즈아!
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    // 4-2. 트랜잭션 묶기
    // : try(트랜잭션 묶음) - catch(에러=롤백)
    // - finally(트랜잭션 최종완료; try성공하든 에러가 떠서 catch로 걸리든 이후 finally는 항상 실행)
    try {
      // 4-2-1. 신규 회원 데이터 생성 (회원가입)
      const newMember = await queryRunner.manager.save(User, {
        email,
        nickname,
        password: hashedPassword,
      });
      // 4-2-2. 포인트 데이터 생성 (포인트)
      const newPoint = await queryRunner.manager.save(Point, {
        userId: newMember.userId,
        point: 1000000,
      });
      // 4-2-3. 성공 : 트랜잭션 묶음 종료: commit
      await queryRunner.commitTransaction();
      // 4-3-성공시. 트랜잭션 된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
      // 5. 리턴
      return {
        status: 201,
        message: '회원 가입이 완료되었습니다.',
        data: {
          newMember,
          newPoint,
        },
      };
    } catch (err) {
      // 4-2-4. 실패 : 도중에 에러 발생시 롤백하기
      await queryRunner.rollbackTransaction();
      // 4-3-실패시. 롤백된 상태를 release하면서 트랜잭션 최종완료
      await queryRunner.release();
    }
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
      status: 200,
      message: `${user.nickname} 님, 어서오세요!`,
      accessToken: this.jwtService.sign(payload),
    };
  }

  /** 회원 정보 조회(R) API **/
  async myProfile(user: User) {
    const point = await this.pointRepository.findOneBy({ userId: user.userId });
    return {
      status: 200,
      message: '회원 정보 조회가 완료되었습니다.',
      data: {
        email: user.email,
        nickname: user.nickname,
        point: point.point,
      },
    };
  }

  /** email로 사용자 찾기(+) **/
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  /** nickname으로 사용자 찾기(+) **/
  async findByNickname(nickname: string) {
    return await this.userRepository.findOneBy({ nickname });
  }
}
