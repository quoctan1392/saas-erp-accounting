import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('tenant_business_sector')
@Index(['tenantId'])
export class TenantBusinessSector {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId: string;

  @Column({ name: 'sector', type: 'varchar' })
  sector: string;

  @Column({ name: 'industry_code', type: 'varchar', nullable: true })
  industryCode: string | null;

  @Column({ name: 'industry_name', type: 'varchar', nullable: true })
  industryName: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
