import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController, TaxInfoController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { TenantBusinessInfo } from '../tenants/entities/tenant-business-info.entity';
import { OnboardingAuditLog } from '../tenants/entities/onboarding-audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Tenant,
      TenantBusinessInfo,
      OnboardingAuditLog,
    ]),
  ],
  controllers: [OnboardingController, TaxInfoController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
