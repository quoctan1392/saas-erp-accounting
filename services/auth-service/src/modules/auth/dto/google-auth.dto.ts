import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFkYzBmMTcyZThkNmVmMzgyZDZkM2EyMzM4NTY3MDRlODJiOGEwMzkiLCJ0eXAiOiJKV1QifQ...',
  })
  @IsNotEmpty()
  @IsString()
  idToken: string;

  @ApiProperty({
    description: 'Google access token (optional)',
    required: false,
    example: 'ya29.a0AfB_byBqXxYZ...',
  })
  @IsOptional()
  @IsString()
  accessToken?: string;
}

export class GoogleAuthResponse {
  success: boolean;
  isNewUser: boolean;
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      picture: string;
      googleId: string;
      createdAt: Date;
    };
    tenants?: Array<{
      id: string;
      name: string;
      role: string;
      createdAt: Date;
    }>;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
  };
}
