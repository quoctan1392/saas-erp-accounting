import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto, RefreshTokenDto, GoogleAuthDto } from './dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    try {
      console.log('Register attempt:', { email: registerDto.email });
      const result = await this.authService.register(registerDto);
      console.log('Register successful:', { userId: result.user.id });
      return result;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  async login(@Request() req: any) {
    return await this.authService.login(req.user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login with Google (Web OAuth redirect)' })
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Request() req: any) {
    return await this.authService.loginWithGoogle(req.user);
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login/Signup with Google (Mobile - ID Token)' })
  @ApiBody({ type: GoogleAuthDto })
  async googleAuthMobile(@Body() googleAuthDto: GoogleAuthDto) {
    return await this.authService.loginWithGoogleToken(googleAuthDto.idToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    // TODO: Extract userId from refresh token
    const decoded = this.authService['jwtService'].verify(refreshTokenDto.refreshToken, {
      secret: this.authService['configService'].get('JWT_REFRESH_SECRET'),
    });
    return await this.authService.refreshTokens(decoded.sub, refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req: any) {
    await this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user with tenant information' })
  async getProfile(@Request() req: any) {
    const user = req.user;
    
    // Fetch tenant information
    let tenants = [];
    try {
      const { HttpService } = require('@nestjs/axios');
      const { ConfigService } = require('@nestjs/config');
      const httpService = new HttpService();
      const configService = new ConfigService();
      
      const tenantServiceUrl = configService.get('TENANT_SERVICE_URL', 'http://localhost:3002');
      const token = req.headers.authorization?.split(' ')[1];
      
      const { firstValueFrom } = require('rxjs');
      const response = await firstValueFrom(
        httpService.get(`${tenantServiceUrl}/tenants/my-tenants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );
      tenants = response.data?.data?.tenants || [];
    } catch (error) {
      console.error('Failed to fetch tenants:', (error as Error).message);
    }

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.fullName || user.name,
          picture: user.avatar,
        },
        tenants,
      },
    };
  }
}
