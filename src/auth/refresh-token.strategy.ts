import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req.cookies?.refresh_token;
        },
      ]),
      secretOrKey: process.env.JWT_REFRESH_SECRET || 'refresh_secret',
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.refresh_token as string;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return {
      id: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
