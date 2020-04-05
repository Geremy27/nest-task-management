import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDTO: AuthCredentialsDTO): Promise<void> {
    return this.userRepository.signUp(authCredentialsDTO);
  }

  async signIn(
    authCredentialsDTO: AuthCredentialsDTO
  ): Promise<{ accessToken: string }> {
    const { username } = authCredentialsDTO;
    const checkUserResult = await this.userRepository.validateUserPassword(
      authCredentialsDTO
    );

    if (!checkUserResult) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username };
    const accessToken = await this.jwtService.sign(payload);

    return { accessToken };
  }
}
