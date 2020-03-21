import { AuthService } from './auth.service';
import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/sign-up')
  signUp(
    @Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO
  ): Promise<void> {
    return this.authService.signUp(authCredentialsDTO);
  }

  @Post('/sign-in')
  signIn(
    @Body(ValidationPipe) authCredentialsDTO: AuthCredentialsDTO
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(authCredentialsDTO);
  }
}
