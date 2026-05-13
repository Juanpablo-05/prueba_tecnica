import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
  ExtractJwt,
  Strategy,
  StrategyOptionsWithRequest,
} from 'passport-jwt';
import { Request } from 'express';
import { RefreshTokenUser } from './types/refresh-token-user.type';

function extractRefreshToken(request: Request) {
  if (typeof request?.body?.refreshToken === 'string') {
    return request.body.refreshToken;
  }

  const authorization = request?.headers?.authorization;

  if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return null;
}

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromExtractors([extractRefreshToken]),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    };

    super(options);
  }

  validate(request: Request, payload: Omit<RefreshTokenUser, 'refreshToken'>) {
    const refreshToken = extractRefreshToken(request);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return {
      ...payload,
      refreshToken,
    };
  }
}
