import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('unit')
@Index(['tenantId', 'code'], { unique: true })
export class Unit extends BaseEntity {
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_base_unit', default: false })
  isBaseUnit: boolean;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 15, scale: 4, nullable: true })
  conversionRate?: number; // Tỷ lệ chuyển đổi so với đơn vị cơ bản
}
