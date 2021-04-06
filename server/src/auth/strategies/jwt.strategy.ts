import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserPayload } from 'src/users/interfaces/user-payload.interface';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { AppConfigService } from 'src/app-config/app-config.service';
import {
  UserRole,
  UserWithRole,
} from 'src/users/interfaces/user-role.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private appConfigService: AppConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.jwtSecret,
    });
  }

  async validate(payload: UserPayload): Promise<UserWithRole> {
    const user = await this.usersService.findOneById(payload?.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return { ...user, role: user.role, password: null };
  }
}
