import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as slug from 'slug';
import { Tenant, TenantStatus, TenantPlan } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: {
    name: string;
    ownerId: string;
    plan?: TenantPlan;
    description?: string;
    website?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    taxId?: string;
  }): Promise<Tenant> {
    // Generate slug from name
    const tenantSlug = slug(createTenantDto.name, { lower: true });

    // Check if slug already exists
    const existingTenant = await this.findBySlug(tenantSlug);
    if (existingTenant) {
      throw new ConflictException(`Tenant with name "${createTenantDto.name}" already exists`);
    }

    // Set trial period (14 days)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const tenant = this.tenantsRepository.create({
      ...createTenantDto,
      slug: tenantSlug,
      status: TenantStatus.TRIAL,
      plan: createTenantDto.plan || TenantPlan.FREE,
      trialEndsAt,
      maxUsers: this.getMaxUsersForPlan(createTenantDto.plan || TenantPlan.FREE),
      features: this.getFeaturesForPlan(createTenantDto.plan || TenantPlan.FREE),
    });

    return await this.tenantsRepository.save(tenant);
  }

  async findAll(filters?: { status?: TenantStatus; plan?: TenantPlan }): Promise<Tenant[]> {
    const query = this.tenantsRepository.createQueryBuilder('tenant');

    if (filters?.status) {
      query.andWhere('tenant.status = :status', { status: filters.status });
    }

    if (filters?.plan) {
      query.andWhere('tenant.plan = :plan', { plan: filters.plan });
    }

    return await query.orderBy('tenant.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantsRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    return await this.tenantsRepository.findOne({ where: { slug } });
  }

  async findByOwnerId(ownerId: string): Promise<Tenant[]> {
    return await this.tenantsRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Tenant>): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // If name is being updated, regenerate slug
    if (updateData.name && updateData.name !== tenant.name) {
      const newSlug = slug(updateData.name, { lower: true });
      const existingTenant = await this.findBySlug(newSlug);
      if (existingTenant && existingTenant.id !== id) {
        throw new ConflictException(`Tenant with name "${updateData.name}" already exists`);
      }
      updateData.slug = newSlug;
    }

    Object.assign(tenant, updateData);
    return await this.tenantsRepository.save(tenant);
  }

  async updateStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.status = status;
    return await this.tenantsRepository.save(tenant);
  }

  async upgradePlan(id: string, plan: TenantPlan): Promise<Tenant> {
    const tenant = await this.findOne(id);
    tenant.plan = plan;
    tenant.maxUsers = this.getMaxUsersForPlan(plan);
    tenant.features = this.getFeaturesForPlan(plan);
    return await this.tenantsRepository.save(tenant);
  }

  async incrementUserCount(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    if (tenant.currentUsers >= tenant.maxUsers) {
      throw new BadRequestException('Maximum user limit reached for this plan');
    }
    tenant.currentUsers += 1;
    await this.tenantsRepository.save(tenant);
  }

  async decrementUserCount(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    if (tenant.currentUsers > 0) {
      tenant.currentUsers -= 1;
      await this.tenantsRepository.save(tenant);
    }
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantsRepository.remove(tenant);
  }

  private getMaxUsersForPlan(plan: TenantPlan): number {
    const limits = {
      [TenantPlan.FREE]: 5,
      [TenantPlan.STARTER]: 20,
      [TenantPlan.BUSINESS]: 100,
      [TenantPlan.ENTERPRISE]: 999999,
    };
    return limits[plan];
  }

  private getFeaturesForPlan(plan: TenantPlan): string[] {
    const features = {
      [TenantPlan.FREE]: ['basic_accounting', 'invoicing'],
      [TenantPlan.STARTER]: [
        'basic_accounting',
        'invoicing',
        'inventory',
        'basic_reports',
      ],
      [TenantPlan.BUSINESS]: [
        'basic_accounting',
        'invoicing',
        'inventory',
        'advanced_reports',
        'multi_currency',
        'api_access',
      ],
      [TenantPlan.ENTERPRISE]: [
        'basic_accounting',
        'invoicing',
        'inventory',
        'advanced_reports',
        'multi_currency',
        'api_access',
        'custom_workflows',
        'dedicated_support',
        'sso',
      ],
    };
    return features[plan];
  }
}
