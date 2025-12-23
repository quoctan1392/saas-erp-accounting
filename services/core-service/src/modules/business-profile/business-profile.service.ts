import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessProfile } from './entities/business-profile.entity';
import { EInvoiceProvider } from './entities/einvoice-provider.entity';
import { CreateBusinessProfileDto } from './dto/create-business-profile.dto';
import { UpdateBusinessProfileDto } from './dto/update-business-profile.dto';
import { CreateEInvoiceProviderDto } from './dto/create-einvoice-provider.dto';

@Injectable()
export class BusinessProfileService {
  constructor(
    @InjectRepository(BusinessProfile)
    private businessProfileRepository: Repository<BusinessProfile>,
    @InjectRepository(EInvoiceProvider)
    private einvoiceProviderRepository: Repository<EInvoiceProvider>,
  ) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateBusinessProfileDto,
  ): Promise<BusinessProfile> {
    // Check if profile already exists for tenant
    const existing = await this.businessProfileRepository.findOne({
      where: { tenantId, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Business profile already exists for this tenant');
    }

    const profile = this.businessProfileRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.businessProfileRepository.save(profile);
  }

  async findByTenant(tenantId: string): Promise<BusinessProfile> {
    const profile = await this.businessProfileRepository.findOne({
      where: { tenantId, isDeleted: false },
    });

    if (!profile) {
      throw new NotFoundException('Business profile not found');
    }

    return profile;
  }

  async update(
    tenantId: string,
    userId: string,
    dto: UpdateBusinessProfileDto,
  ): Promise<BusinessProfile> {
    const profile = await this.findByTenant(tenantId);

    Object.assign(profile, dto);
    profile.updatedBy = userId;

    return this.businessProfileRepository.save(profile);
  }

  async getSettings(tenantId: string): Promise<any> {
    const profile = await this.findByTenant(tenantId);

    return {
      accountingRegime: profile.accountingRegime,
      accountingCurrency: profile.accountingCurrency,
      taxFrequency: profile.taxFrequency,
      inventoryMethod: profile.inventoryMethod,
      startDataDate: profile.startDataDate,
    };
  }

  // E-Invoice Provider methods
  async createEInvoiceProvider(
    tenantId: string,
    userId: string,
    dto: CreateEInvoiceProviderDto,
  ): Promise<EInvoiceProvider> {
    const profile = await this.findByTenant(tenantId);

    const provider = this.einvoiceProviderRepository.create({
      ...dto,
      tenantId,
      businessProfileId: profile.id,
      createdBy: userId,
    });

    return this.einvoiceProviderRepository.save(provider);
  }

  async findEInvoiceProviders(tenantId: string): Promise<EInvoiceProvider[]> {
    const profile = await this.findByTenant(tenantId);

    return this.einvoiceProviderRepository.find({
      where: { 
        tenantId, 
        businessProfileId: profile.id,
        isDeleted: false 
      },
    });
  }

  async updateEInvoiceProvider(
    id: string,
    tenantId: string,
    userId: string,
    dto: Partial<CreateEInvoiceProviderDto>,
  ): Promise<EInvoiceProvider> {
    const provider = await this.einvoiceProviderRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!provider) {
      throw new NotFoundException('E-Invoice provider not found');
    }

    Object.assign(provider, dto);
    provider.updatedBy = userId;

    return this.einvoiceProviderRepository.save(provider);
  }

  async deleteEInvoiceProvider(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const provider = await this.einvoiceProviderRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!provider) {
      throw new NotFoundException('E-Invoice provider not found');
    }

    provider.isDeleted = true;
    provider.deletedAt = new Date();
    provider.updatedBy = userId;

    await this.einvoiceProviderRepository.save(provider);
  }
}
