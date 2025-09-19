import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() { email, username, password }: RegisterDto) {
    return this.authService.register(email, username, password);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() { email, password }: LoginDto) {
    return this.authService.login(email, password);
  }
}