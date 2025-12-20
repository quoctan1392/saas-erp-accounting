import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UsersService } from '../users/users.service';
import { EmailService } from '../../common/services/email.service';
import { User, AuthProvider, UserRole } from '../users/entities/user.entity';
import { PasswordResetToken } from '../users/entities/password-reset-token.entity';
import { OAuth2Client } from 'google-auth-library';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

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
  private googleClient: OAuth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private httpService: HttpService,
    private emailService: EmailService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
  ) {
    // For verifying ID tokens, we only need the client ID
    this.googleClient = new OAuth2Client(
      this.configService.get('GOOGLE_CLIENT_ID'),
    );
    
    // Debug: Check if JWT secrets are loaded
    console.log('=== AUTH SERVICE CONFIG CHECK ===');
    console.log('JWT_SECRET:', this.configService.get('JWT_SECRET') ? 'LOADED' : 'MISSING');
    console.log('JWT_REFRESH_SECRET:', this.configService.get('JWT_REFRESH_SECRET') ? 'LOADED' : 'MISSING');
    console.log('GOOGLE_CLIENT_ID:', this.configService.get('GOOGLE_CLIENT_ID') ? 'LOADED' : 'MISSING');
  }

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
    try {
      console.log('Creating user with email:', registerDto.email);
      const user = await this.usersService.create({
        ...registerDto,
        provider: AuthProvider.LOCAL,
        role: UserRole.EMPLOYEE,
      });
      console.log('User created successfully:', user.id);

      const authResponse = await this.login(user);
      console.log('Login successful after registration');
      return authResponse;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(user: User): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const jwtSecret = this.configService.get('JWT_SECRET');
    const refreshSecret = this.configService.get('JWT_REFRESH_SECRET');
    
    if (!jwtSecret) {
      console.error('JWT_SECRET is not defined!');
      throw new Error('JWT configuration error');
    }
    
    if (!refreshSecret) {
      console.error('JWT_REFRESH_SECRET is not defined!');
      throw new Error('JWT configuration error');
    }

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
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
          provider: AuthProvider.GOOGLE,
          providerId: profile.id,
          role: UserRole.EMPLOYEE,
        });
        user.isEmailVerified = true;
        await this.usersService.update(user.id, { isEmailVerified: true, avatar: profile.photos?.[0]?.value });
      }
    }

    return await this.login(user);
  }

  async loginWithGoogleToken(idToken: string): Promise<any> {
    try {
      // Verify the Google ID token
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { sub: googleId, email, name, picture } = payload;

      // Check if user exists with this Google ID
      let user = await this.usersService.findByProviderId(AuthProvider.GOOGLE, googleId);
      let isNewUser = false;

      if (!user) {
        // Check if user exists with this email
        user = await this.usersService.findByEmail(email!);

        if (user) {
          // Link Google account to existing user
          await this.usersService.update(user.id, {
            provider: AuthProvider.GOOGLE,
            providerId: googleId,
            avatar: picture,
            isEmailVerified: true,
          });
        } else {
          // Create new user
          const nameParts = name?.split(' ') || [];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          user = await this.usersService.create({
            email: email!,
            firstName,
            lastName,
            provider: AuthProvider.GOOGLE,
            providerId: googleId,
            role: UserRole.EMPLOYEE,
          });
          await this.usersService.update(user.id, { avatar: picture, isEmailVerified: true });
          isNewUser = true;
        }
      }

      // Generate tokens
      const authResponse = await this.login(user);

      // Fetch tenant information from tenant-service
      let tenants = [];
      if (!isNewUser) {
        try {
          const tenantServiceUrl = this.configService.get('TENANT_SERVICE_URL', 'http://localhost:3002');
          const response = await firstValueFrom(
            this.httpService.get(`${tenantServiceUrl}/tenants/my-tenants`, {
              headers: {
                Authorization: `Bearer ${authResponse.accessToken}`,
              },
            }),
          );
          tenants = response.data?.data?.tenants || [];
        } catch (error) {
          console.error('Failed to fetch tenants:', (error as Error).message);
          // Continue without tenant data
        }
      }

      const result: any = {
        success: true,
        isNewUser,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.fullName,
            picture: user.avatar,
            googleId: user.providerId,
            createdAt: user.createdAt,
          },
          tokens: {
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            expiresIn: 3600,
          },
        },
      };

      // Only add tenants if user is not new
      if (!isNewUser && tenants.length > 0) {
        result.data.tenants = tenants;
      }

      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid Google token: ' + (error as Error).message);
    }
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

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    
    // Always return success message for security (don't reveal if email exists)
    if (!user) {
      return { 
        message: 'If the email exists, a password reset link has been sent.' 
      };
    }

    // Don't allow password reset for OAuth users
    if (user.provider !== AuthProvider.LOCAL) {
      return { 
        message: 'If the email exists, a password reset link has been sent.' 
      };
    }

    // Delete any existing unused tokens for this user
    await this.passwordResetTokenRepository.delete({
      userId: user.id,
      used: false,
    });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save token to database
    await this.passwordResetTokenRepository.save({
      token: resetToken,
      userId: user.id,
      expiresAt,
      used: false,
    });

    // Send password reset email
    try {
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to send password reset email:', error);
      
      // In development, still log the token
      if (this.configService.get('NODE_ENV') === 'development') {
        console.log('Password reset token for', email, ':', resetToken);
        console.log('Reset link: http://localhost:5173/reset-password?token=' + resetToken);
      }
    }

    return { 
      message: 'If the email exists, a password reset link has been sent.' 
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Clean up expired tokens
    await this.passwordResetTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });

    // Find valid token
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token, used: false },
      relations: ['user'],
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    await this.usersService.updatePassword(resetToken.userId, newPassword);

    // Mark token as used
    resetToken.used = true;
    await this.passwordResetTokenRepository.save(resetToken);

    return { message: 'Password has been reset successfully' };
  }
}
