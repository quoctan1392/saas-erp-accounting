import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { BusinessProfile } from './business-profile.entity';

@Entity('einvoice_provider')
export class EInvoiceProvider extends BaseEntity {
  @Column({ name: 'provider_name' })
  providerName: string;

  @Column({ name: 'api_endpoint' })
  apiEndpoint: string;

  @Column({ name: 'api_key', nullable: true })
  apiKey?: string;

  @Column({ name: 'api_secret', nullable: true })
  apiSecret?: string;

  @Column({ name: 'username', nullable: true })
  username?: string;

  @Column({ name: 'password', nullable: true })
  password?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'config', type: 'jsonb', nullable: true })
  config?: Record<string, any>;

  @ManyToOne(() => BusinessProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'business_profile_id' })
  businessProfile: BusinessProfile;

  @Column({ name: 'business_profile_id', type: 'uuid' })
  businessProfileId: string;
}
