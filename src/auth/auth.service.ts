import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessToken } from '@tutorify/shared';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
  ) { }

  public validateAccessToken(token: string): AccessToken {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException("ExpiredToken");
    }
  }
}
