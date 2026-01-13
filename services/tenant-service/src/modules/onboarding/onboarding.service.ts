import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant, BusinessType } from '../tenants/entities/tenant.entity';
import { TenantBusinessInfo } from '../tenants/entities/tenant-business-info.entity';
import { TenantAccountingSetup } from '../tenants/entities/tenant-accounting-setup.entity';
import { TenantBusinessSector } from '../tenants/entities/tenant-business-sector.entity';
import { TenantAdvancedSetup } from '../tenants/entities/tenant-advanced-setup.entity';
import { OnboardingAuditLog, OnboardingAction } from '../tenants/entities/onboarding-audit-log.entity';
import { SaveBusinessInfoDto } from './dto/save-business-info.dto';
import { SaveAccountingSetupDto } from './dto/save-accounting-setup.dto';
import { SaveBusinessSectorDto } from './dto/save-business-sector.dto';
import { SaveAdvancedSetupDto } from './dto/save-advanced-setup.dto';
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

  async getOnboardingStatus(tenantId: string): Promise<OnboardingStatusResponseDto & { businessInfo?: any; businessSector?: any; accountingSetup?: any; advancedSetup?: any }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Get business info if it exists
    let businessInfo = null;
    if (tenant.businessType) {
      const tenantBusinessInfo = await this.dataSource.getRepository('TenantBusinessInfo').findOne({
        where: { tenantId },
      });
      
      if (tenantBusinessInfo) {
        businessInfo = {
          id: tenantBusinessInfo.id,
          businessType: tenantBusinessInfo.businessType,
          taxId: tenantBusinessInfo.taxId,
          businessName: tenantBusinessInfo.businessName,
          registeredAddress: tenantBusinessInfo.registeredAddress,
          ownerName: tenantBusinessInfo.ownerName,
          nationalId: tenantBusinessInfo.nationalId,
          businessCode: tenantBusinessInfo.businessCode,
          establishmentDate: tenantBusinessInfo.establishmentDate,
          employeeCount: tenantBusinessInfo.employeeCount,
          taxInfoAutoFilled: tenantBusinessInfo.taxInfoAutoFilled,
        };
      }
    }

    // Get business sector if it exists
    let businessSector = null;
    const tenantBusinessSector = await this.dataSource.getRepository(TenantBusinessSector).findOne({
      where: { tenantId },
    });
    if (tenantBusinessSector) {
      businessSector = {
        sector: tenantBusinessSector.sector,
        industryCode: tenantBusinessSector.industryCode,
        industryName: tenantBusinessSector.industryName,
      };
    }

    // Get accounting setup if it exists
    let accountingSetup = null;
    const tenantAccountingSetup = await this.dataSource.getRepository(TenantAccountingSetup).findOne({
      where: { tenantId },
    });
    if (tenantAccountingSetup) {
      accountingSetup = {
        dataStartDate: tenantAccountingSetup.dataStartDate,
        taxFilingFrequency: tenantAccountingSetup.taxFilingFrequency,
        usePOSDevice: tenantAccountingSetup.usePOSDevice,
        taxIndustryGroup: tenantAccountingSetup.taxIndustryGroup,
        accountingRegime: tenantAccountingSetup.accountingRegime,
        taxCalculationMethod: tenantAccountingSetup.taxCalculationMethod,
        baseCurrency: tenantAccountingSetup.baseCurrency,
        hasForeignCurrency: tenantAccountingSetup.hasForeignCurrency,
        inventoryValuationMethod: tenantAccountingSetup.inventoryValuationMethod,
      };
    }

    // Get advanced setup if it exists
    let advancedSetup = null;
    const tenantAdvancedSetup = await this.dataSource.getRepository(TenantAdvancedSetup).findOne({
      where: { tenantId },
    });
    if (tenantAdvancedSetup) {
      advancedSetup = {
        eInvoiceEnabled: tenantAdvancedSetup.eInvoiceEnabled,
        eInvoiceProvider: tenantAdvancedSetup.eInvoiceProvider,
        eInvoiceProviderName: tenantAdvancedSetup.eInvoiceProviderName,
        eInvoiceTaxCode: tenantAdvancedSetup.eInvoiceTaxCode,
        eInvoiceUsername: tenantAdvancedSetup.eInvoiceUsername,
        eInvoiceAutoIssue: tenantAdvancedSetup.eInvoiceAutoIssue,
        eInvoiceConnectedAt: tenantAdvancedSetup.eInvoiceConnectedAt,
      };
    }

    return {
      tenantId: tenant.id,
      onboardingCompleted: tenant.onboardingCompleted,
      currentStep: tenant.onboardingStep,
      totalSteps: 3,
      businessType: tenant.businessType,
      startedAt: tenant.onboardingStartedAt,
      completedAt: tenant.onboardingCompletedAt,
      businessInfo,
      businessSector,
      accountingSetup,
      advancedSetup,
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

  async saveBusinessSector(
    tenantId: string,
    userId: string,
    dto: SaveBusinessSectorDto,
  ): Promise<any> {
    console.log('[saveBusinessSector] Called with:', { tenantId, userId, dto });
    
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      console.error('[saveBusinessSector] Tenant not found:', tenantId);
      throw new NotFoundException('Tenant not found');
    }

    // Upsert business sector
    let businessSector = await this.dataSource.getRepository(TenantBusinessSector).findOne({
      where: { tenantId },
    });
    
    console.log('[saveBusinessSector] Existing businessSector:', businessSector);

    if (businessSector) {
      // Update existing
      businessSector.sector = dto.sector;
      businessSector.industryCode = dto.industryCode || null;
      businessSector.industryName = dto.industryName || null;
    } else {
      // Create new
      businessSector = new TenantBusinessSector();
      businessSector.tenantId = tenantId;
      businessSector.sector = dto.sector;
      businessSector.industryCode = dto.industryCode || null;
      businessSector.industryName = dto.industryName || null;
    }

    businessSector = await this.dataSource.getRepository(TenantBusinessSector).save(businessSector);

    console.log('[saveBusinessSector] Saved businessSector:', businessSector);

    // Log audit
    await this.logAudit(tenantId, userId, 'business_sector', OnboardingAction.COMPLETED, dto);

    return {
      id: businessSector.id,
      tenantId: businessSector.tenantId,
      sector: businessSector.sector,
      industryCode: businessSector.industryCode,
      industryName: businessSector.industryName,
    };
  }

  async saveAccountingSetup(
    tenantId: string,
    userId: string,
    dto: SaveAccountingSetupDto,
  ): Promise<any> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Upsert accounting setup
    let accountingSetup = await this.dataSource.getRepository(TenantAccountingSetup).findOne({
      where: { tenantId },
    });

    if (accountingSetup) {
      // Update existing
      if (dto.dataStartDate) accountingSetup.dataStartDate = new Date(dto.dataStartDate);
      if (dto.taxFilingFrequency !== undefined) accountingSetup.taxFilingFrequency = dto.taxFilingFrequency || null;
      if (dto.usePOSDevice !== undefined) accountingSetup.usePOSDevice = dto.usePOSDevice;
      if (dto.taxIndustryGroup !== undefined) accountingSetup.taxIndustryGroup = dto.taxIndustryGroup || null;
      if (dto.accountingRegime !== undefined) accountingSetup.accountingRegime = dto.accountingRegime || null;
      if (dto.taxCalculationMethod !== undefined) accountingSetup.taxCalculationMethod = dto.taxCalculationMethod || null;
      if (dto.baseCurrency !== undefined) accountingSetup.baseCurrency = dto.baseCurrency || null;
      if (dto.hasForeignCurrency !== undefined) accountingSetup.hasForeignCurrency = dto.hasForeignCurrency;
      if (dto.inventoryValuationMethod !== undefined) accountingSetup.inventoryValuationMethod = dto.inventoryValuationMethod || null;
    } else {
      // Create new
      accountingSetup = new TenantAccountingSetup();
      accountingSetup.tenantId = tenantId;
      accountingSetup.dataStartDate = dto.dataStartDate ? new Date(dto.dataStartDate) : null;
      accountingSetup.taxFilingFrequency = dto.taxFilingFrequency || null;
      accountingSetup.usePOSDevice = dto.usePOSDevice || false;
      accountingSetup.taxIndustryGroup = dto.taxIndustryGroup || null;
      accountingSetup.accountingRegime = dto.accountingRegime || null;
      accountingSetup.taxCalculationMethod = dto.taxCalculationMethod || null;
      accountingSetup.baseCurrency = dto.baseCurrency || null;
      accountingSetup.hasForeignCurrency = dto.hasForeignCurrency || false;
      accountingSetup.inventoryValuationMethod = dto.inventoryValuationMethod || null;
    }

    accountingSetup = await this.dataSource.getRepository(TenantAccountingSetup).save(accountingSetup);

    // Log audit
    await this.logAudit(tenantId, userId, 'accounting_setup', OnboardingAction.COMPLETED, dto);

    return {
      id: accountingSetup.id,
      tenantId: accountingSetup.tenantId,
      dataStartDate: accountingSetup.dataStartDate,
      taxFilingFrequency: accountingSetup.taxFilingFrequency,
      usePOSDevice: accountingSetup.usePOSDevice,
      taxIndustryGroup: accountingSetup.taxIndustryGroup,
      accountingRegime: accountingSetup.accountingRegime,
      taxCalculationMethod: accountingSetup.taxCalculationMethod,
      baseCurrency: accountingSetup.baseCurrency,
      hasForeignCurrency: accountingSetup.hasForeignCurrency,
      inventoryValuationMethod: accountingSetup.inventoryValuationMethod,
    };
  }

  async saveAdvancedSetup(
    tenantId: string,
    userId: string,
    dto: SaveAdvancedSetupDto,
  ): Promise<any> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    // Upsert advanced setup
    let advancedSetup = await this.dataSource.getRepository(TenantAdvancedSetup).findOne({
      where: { tenantId },
    });

    if (advancedSetup) {
      // Update existing
      if (dto.eInvoiceEnabled !== undefined) advancedSetup.eInvoiceEnabled = dto.eInvoiceEnabled;
      if (dto.eInvoiceProvider !== undefined) advancedSetup.eInvoiceProvider = dto.eInvoiceProvider || null;
      if (dto.eInvoiceProviderName !== undefined) advancedSetup.eInvoiceProviderName = dto.eInvoiceProviderName || null;
      if (dto.eInvoiceTaxCode !== undefined) advancedSetup.eInvoiceTaxCode = dto.eInvoiceTaxCode || null;
      if (dto.eInvoiceUsername !== undefined) advancedSetup.eInvoiceUsername = dto.eInvoiceUsername || null;
      if (dto.eInvoiceAutoIssue !== undefined) advancedSetup.eInvoiceAutoIssue = dto.eInvoiceAutoIssue;
      if (dto.eInvoiceConnectedAt !== undefined) advancedSetup.eInvoiceConnectedAt = dto.eInvoiceConnectedAt ? new Date(dto.eInvoiceConnectedAt) : null;
    } else {
      // Create new
      advancedSetup = new TenantAdvancedSetup();
      advancedSetup.tenantId = tenantId;
      advancedSetup.eInvoiceEnabled = dto.eInvoiceEnabled || false;
      advancedSetup.eInvoiceProvider = dto.eInvoiceProvider || null;
      advancedSetup.eInvoiceProviderName = dto.eInvoiceProviderName || null;
      advancedSetup.eInvoiceTaxCode = dto.eInvoiceTaxCode || null;
      advancedSetup.eInvoiceUsername = dto.eInvoiceUsername || null;
      advancedSetup.eInvoiceAutoIssue = dto.eInvoiceAutoIssue || false;
      advancedSetup.eInvoiceConnectedAt = dto.eInvoiceConnectedAt ? new Date(dto.eInvoiceConnectedAt) : null;
    }

    advancedSetup = await this.dataSource.getRepository(TenantAdvancedSetup).save(advancedSetup);

    // Log audit
    await this.logAudit(tenantId, userId, 'advanced_setup', OnboardingAction.COMPLETED, dto);

    return {
      id: advancedSetup.id,
      tenantId: advancedSetup.tenantId,
      eInvoiceEnabled: advancedSetup.eInvoiceEnabled,
      eInvoiceProvider: advancedSetup.eInvoiceProvider,
      eInvoiceProviderName: advancedSetup.eInvoiceProviderName,
      eInvoiceTaxCode: advancedSetup.eInvoiceTaxCode,
      eInvoiceUsername: advancedSetup.eInvoiceUsername,
      eInvoiceAutoIssue: advancedSetup.eInvoiceAutoIssue,
      eInvoiceConnectedAt: advancedSetup.eInvoiceConnectedAt,
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
