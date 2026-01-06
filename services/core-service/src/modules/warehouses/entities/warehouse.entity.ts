import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('warehouse')
@Index(['tenantId', 'code'], { unique: true })
export class Warehouse extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'inventory_account_id', type: 'uuid', nullable: true })
  inventoryAccountId: string; // Link to chart_of_accounts_custom (TK 15x)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'manager_name', type: 'varchar', length: 100, nullable: true })
  managerName: string; // Người quản lý kho

  @Column({ name: 'manager_phone', type: 'varchar', length: 20, nullable: true })
  managerPhone: string;
}
