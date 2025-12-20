import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus, BillingCycle } from './entities/subscription.entity';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    private tenantsService: TenantsService,
  ) {}

  async create(createSubscriptionDto: {
    tenantId: string;
    plan: string;
    billingCycle: BillingCycle;
    amount: number;
  }): Promise<Subscription> {
    // Validate tenant exists
    await this.tenantsService.findOne(createSubscriptionDto.tenantId);

    const startDate = new Date();
    const endDate = new Date();
    if (createSubscriptionDto.billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = this.subscriptionsRepository.create({
      ...createSubscriptionDto,
      startDate,
      endDate,
      nextBillingDate: endDate,
      status: SubscriptionStatus.ACTIVE,
    });

    return await this.subscriptionsRepository.save(subscription);
  }

  async findAll(tenantId?: string): Promise<Subscription[]> {
    const query = this.subscriptionsRepository.createQueryBuilder('subscription');

    if (tenantId) {
      query.where('subscription.tenantId = :tenantId', { tenantId });
    }

    return await query.orderBy('subscription.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  async findByTenantId(tenantId: string): Promise<Subscription[]> {
    return await this.subscriptionsRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async getActiveSubscription(tenantId: string): Promise<Subscription | null> {
    return await this.subscriptionsRepository.findOne({
      where: {
        tenantId,
        status: SubscriptionStatus.ACTIVE,
      },
    });
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = status;
    return await this.subscriptionsRepository.save(subscription);
  }

  async cancel(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;
    return await this.subscriptionsRepository.save(subscription);
  }

  async renew(id: string): Promise<Subscription> {
    const oldSubscription = await this.findOne(id);

    const startDate = oldSubscription.endDate;
    const endDate = new Date(startDate);

    if (oldSubscription.billingCycle === BillingCycle.MONTHLY) {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const newSubscription = this.subscriptionsRepository.create({
      tenantId: oldSubscription.tenantId,
      plan: oldSubscription.plan,
      billingCycle: oldSubscription.billingCycle,
      amount: oldSubscription.amount,
      startDate,
      endDate,
      nextBillingDate: endDate,
      status: SubscriptionStatus.ACTIVE,
      autoRenew: oldSubscription.autoRenew,
    });

    return await this.subscriptionsRepository.save(newSubscription);
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionsRepository.remove(subscription);
  }
}
