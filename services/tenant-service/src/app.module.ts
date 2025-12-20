import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { TenantsModule } from './modules/tenants/tenants.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { HealthModule } from './modules/health/health.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { Tenant } from './modules/tenants/entities/tenant.entity';
import { TenantMember } from './modules/tenants/entities/tenant-member.entity';
import { TenantBusinessInfo } from './modules/tenants/entities/tenant-business-info.entity';
import { OnboardingAuditLog } from './modules/tenants/entities/onboarding-audit-log.entity';
import { Subscription } from './modules/subscriptions/entities/subscription.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [Tenant, TenantMember, TenantBusinessInfo, OnboardingAuditLog, Subscription],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
    }),

    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),

    PassportModule.register({ defaultStrategy: 'jwt' }),
    HttpModule,

    TenantsModule,
    SubscriptionsModule,
    HealthModule,
    OnboardingModule,
  ],
})
export class AppModule {}
