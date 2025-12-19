import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User, AuthProvider, UserRole } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return user;
  }

  async register(registerDto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResponse> {
    const user = await this.usersService.create({
      ...registerDto,
      provider: AuthProvider.LOCAL,
      role: UserRole.EMPLOYEE,
    });

    return await this.login(user);
  }

  async login(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    // Update refresh token and last login
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    await this.usersService.updateLastLogin(user.id);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async loginWithGoogle(profile: any): Promise<AuthResponse> {
    // Check if user exists with this Google ID
    let user = await this.usersService.findByProviderId(AuthProvider.GOOGLE, profile.id);

    if (!user) {
      // Check if user exists with this email
      user = await this.usersService.findByEmail(profile.emails[0].value);

      if (user) {
        // Link Google account to existing user
        await this.usersService.update(user.id, {
          provider: AuthProvider.GOOGLE,
          providerId: profile.id,
          isEmailVerified: true,
        });
      } else {
        // Create new user
        user = await this.usersService.create({
          email: profile.emails[0].value,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          avatar: profile.photos?.[0]?.value,
          provider: AuthProvider.GOOGLE,
          providerId: profile.id,
          role: UserRole.EMPLOYEE,
        });
        user.isEmailVerified = true;
        await this.usersService.update(user.id, { isEmailVerified: true });
      }
    }

    return await this.login(user);
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<AuthResponse> {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await this.usersService.validatePassword(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return await this.login(user);
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  async validateJwtPayload(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
}
