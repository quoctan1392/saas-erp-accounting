import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { BusinessType } from './tenant.entity';

@Entity('tenant_business_info')
export class TenantBusinessInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  tenantId: string;

  @OneToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  // Legal Information
  @Column({
    type: 'enum',
    enum: BusinessType,
  })
  businessType: BusinessType;

  @Column({ length: 13 })
  @Index()
  taxId: string;

  @Column({ length: 255 })
  businessName: string;

  @Column({ type: 'text' })
  registeredAddress: string;

  // Owner/Director Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerName: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  nationalId: string;

  // DNTN specific
  @Column({ type: 'varchar', length: 13, nullable: true })
  businessCode: string;

  @Column({ type: 'date', nullable: true })
  establishmentDate: Date;

  @Column({ type: 'int', nullable: true })
  employeeCount: number;

  // Metadata
  @Column({ default: false })
  taxInfoAutoFilled: boolean;

  @Column({ default: false })
  taxInfoVerified: boolean;

  @Column({ nullable: true })
  taxInfoLastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
