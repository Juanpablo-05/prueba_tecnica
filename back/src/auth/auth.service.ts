import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import type { StringValue } from 'ms';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenUser } from './types/refresh-token-user.type';
import { TokenPayload } from './types/token-payload.type';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.usersService.toProfile(user),
    };
  }

  async refreshTokens(refreshUser: RefreshTokenUser) {
    const user = await this.usersService.findById(refreshUser.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User is no longer available');
    }

    const storedToken = await this.usersService.findRefreshTokenById(
      refreshUser.jti,
    );

    if (
      !storedToken ||
      storedToken.userId !== user.id ||
      storedToken.revokedAt ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Refresh token is no longer valid');
    }

    const isTokenMatch = await bcrypt.compare(
      refreshUser.refreshToken,
      storedToken.tokenHash,
    );

    if (!isTokenMatch) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    await this.usersService.revokeRefreshToken(storedToken.id);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.usersService.toProfile(user),
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }

    return this.usersService.toProfile(user);
  }

  private async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const refreshTokenId = randomUUID();
    const accessPayload: TokenPayload = this.buildAccessPayload(user);
    const refreshPayload = {
      ...accessPayload,
      jti: refreshTokenId,
    };

    const accessTokenTtl =
      this.configService.get<string>('JWT_ACCESS_TTL') ?? '900s';
    const refreshTokenTtl =
      this.configService.get<string>('JWT_REFRESH_TTL') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
        expiresIn: accessTokenTtl as StringValue,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
        expiresIn: refreshTokenTtl as StringValue,
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.usersService.createRefreshToken({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: this.getRefreshTokenExpiration(refreshTokenTtl),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private buildAccessPayload(user: User): TokenPayload {
    return {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
  }

  private getRequiredConfig(key: string) {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`Missing environment variable: ${key}`);
    }

    return value;
  }

  private getRefreshTokenExpiration(ttl: string) {
    const unit = ttl.at(-1);
    const rawValue = Number.parseInt(ttl, 10);

    if (Number.isNaN(rawValue)) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const multipliers: Record<string, number> = {
      d: 24 * 60 * 60 * 1000,
      h: 60 * 60 * 1000,
      m: 60 * 1000,
      s: 1000,
    };

    const multiplier = unit ? multipliers[unit] : undefined;

    if (!multiplier) {
      return new Date(Date.now() + rawValue * 1000);
    }

    return new Date(Date.now() + rawValue * multiplier);
  }
}
