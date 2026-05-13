import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RefreshAuthGuard } from '../common/guards/refresh-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { RefreshTokenUser } from './types/refresh-token-user.type';
import type { TokenPayload } from './types/token-payload.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refresh(@CurrentUser() user: RefreshTokenUser) {
    return this.authService.refreshTokens(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: TokenPayload) {
    return this.authService.getProfile(user.sub);
  }
}
