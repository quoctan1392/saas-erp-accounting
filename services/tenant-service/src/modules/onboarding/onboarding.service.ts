import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant, BusinessType } from '../tenants/entities/tenant.entity';
import { TenantBusinessInfo } from '../tenants/entities/tenant-business-info.entity';
import { OnboardingAuditLog, OnboardingAction } from '../tenants/entities/onboarding-audit-log.entity';
import { SaveBusinessInfoDto } from './dto/save-business-info.dto';
import {
  OnboardingStatusResponseDto,
  BusinessTypeResponseDto,
  BusinessInfoResponseDto,
  TaxInfoResponseDto,
  CompleteOnboardingResponseDto,
} from './dto/response.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(OnboardingAuditLog)
    private readonly auditLogRepository: Repository<OnboardingAuditLog>,
    private readonly dataSource: DataSource,
  ) {}

  async getOnboardingStatus(tenantId: string): Promise<OnboardingStatusResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return {
      tenantId: tenant.id,
      onboardingCompleted: tenant.onboardingCompleted,
      currentStep: tenant.onboardingStep,
      totalSteps: 3,
      businessType: tenant.businessType,
      startedAt: tenant.onboardingStartedAt,
      completedAt: tenant.onboardingCompletedAt,
    };
  }

  async updateBusinessType(
    tenantId: string,
    userId: string,
    businessType: BusinessType,
  ): Promise<BusinessTypeResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Update tenant
    tenant.businessType = businessType;
    tenant.onboardingStep = 1;
    
    if (!tenant.onboardingStartedAt) {
      tenant.onboardingStartedAt = new Date();
    }

    await this.tenantRepository.save(tenant);

    // Log audit
    await this.logAudit(tenantId, userId, 'business_type_selection', OnboardingAction.COMPLETED, {
      businessType,
    });

    return {
      tenantId: tenant.id,
      businessType: tenant.businessType,
      onboardingStep: tenant.onboardingStep,
    };
  }

  async getTaxInfo(taxId: string): Promise<TaxInfoResponseDto> {
    // Validate format
    this.validateTaxId(taxId);

    // TODO: Integrate with external tax info service
    // For now, return mock data
    return this.getMockTaxInfo(taxId);
  }

  async saveBusinessInfo(
    tenantId: string,
    userId: string,
    dto: SaveBusinessInfoDto,
  ): Promise<BusinessInfoResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Start transaction
    const result = await this.dataSource.transaction(async (manager) => {
      // Update tenant
      tenant.businessType = dto.businessType;
      tenant.onboardingStep = 2;
      await manager.save(tenant);

      // Upsert business info
      let businessInfo = await manager.findOne(TenantBusinessInfo, {
        where: { tenantId },
      });

      if (businessInfo) {
        // Update existing
        Object.assign(businessInfo, {
          businessType: dto.businessType,
          taxId: dto.taxId,
          businessName: dto.businessName,
          registeredAddress: dto.registeredAddress,
          ownerName: dto.ownerName,
          nationalId: dto.nationalId,
          businessCode: dto.businessCode,
          establishmentDate: dto.establishmentDate ? new Date(dto.establishmentDate) : null,
          employeeCount: dto.employeeCount,
          taxInfoAutoFilled: dto.taxInfoAutoFilled || false,
          taxInfoLastUpdated: new Date(),
        });
      } else {
        // Create new
        businessInfo = new TenantBusinessInfo();
        businessInfo.tenantId = tenantId;
        businessInfo.businessType = dto.businessType;
        businessInfo.taxId = dto.taxId;
        businessInfo.businessName = dto.businessName;
        businessInfo.registeredAddress = dto.registeredAddress;
        if (dto.ownerName) businessInfo.ownerName = dto.ownerName;
        if (dto.nationalId) businessInfo.nationalId = dto.nationalId;
        if (dto.businessCode) businessInfo.businessCode = dto.businessCode;
        if (dto.establishmentDate) businessInfo.establishmentDate = new Date(dto.establishmentDate);
        if (dto.employeeCount) businessInfo.employeeCount = dto.employeeCount;
        businessInfo.taxInfoAutoFilled = dto.taxInfoAutoFilled || false;
        businessInfo.taxInfoLastUpdated = new Date();
      }

      businessInfo = await manager.save(businessInfo);

      // Log audit
      const auditLog = new OnboardingAuditLog();
      auditLog.tenantId = tenantId;
      auditLog.userId = userId;
      auditLog.stepName = 'business_info';
      auditLog.action = OnboardingAction.COMPLETED;
      auditLog.data = dto as any;
      await manager.save(auditLog);

      return businessInfo;
    });

    return {
      id: result.id,
      tenantId: result.tenantId,
      businessType: result.businessType,
      taxId: result.taxId,
      businessName: result.businessName,
      onboardingStep: tenant.onboardingStep,
      onboardingCompleted: tenant.onboardingCompleted,
      createdAt: result.createdAt,
    };
  }

  async completeOnboarding(
    tenantId: string,
    userId: string,
  ): Promise<CompleteOnboardingResponseDto> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Update tenant
    tenant.onboardingCompleted = true;
    tenant.onboardingCompletedAt = new Date();
    await this.tenantRepository.save(tenant);

    // Log audit
    await this.logAudit(tenantId, userId, 'onboarding', OnboardingAction.COMPLETED, null);

    return {
      tenantId: tenant.id,
      onboardingCompleted: tenant.onboardingCompleted,
      completedAt: tenant.onboardingCompletedAt,
    };
  }

  private validateTaxId(taxId: string): void {
    const regex = /^[0-9]{10}$|^[0-9]{13}$/;
    if (!regex.test(taxId)) {
      throw new BadRequestException('Mã số thuế phải là 10 hoặc 13 chữ số');
    }
  }

  private async logAudit(
    tenantId: string,
    userId: string,
    stepName: string,
    action: OnboardingAction,
    data: any,
  ): Promise<void> {
    const auditLog = this.auditLogRepository.create({
      tenantId,
      userId,
      stepName,
      action,
      data,
    });

    await this.auditLogRepository.save(auditLog);
  }

  // Mock tax info service - Replace with real implementation
  private getMockTaxInfo(taxId: string): TaxInfoResponseDto {
    // Simulate different responses based on tax ID
    if (taxId === '0000000000') {
      throw new NotFoundException('Không tìm thấy thông tin với mã số thuế này');
    }

    return {
      taxId,
      businessName: 'Cửa hàng tạp hóa Minh An',
      registeredAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
      ownerName: 'Nguyễn Văn A',
      businessType: 'HOUSEHOLD_BUSINESS',
      status: 'ACTIVE',
      registrationDate: '2020-01-15',
    };
  }
}
