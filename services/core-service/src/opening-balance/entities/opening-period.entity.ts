import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { OpeningBalance } from './opening-balance.entity';

@Entity('opening_period')
@Index(['tenantId'])
@Index(['tenantId', 'openingDate'])
@Index(['tenantId', 'isLocked'])
export class OpeningPeriod {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ type: 'varchar', length: 255, name: 'period_name' })
  periodName: string;

  @Column({ type: 'date', name: 'opening_date' })
  openingDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: false, name: 'is_locked' })
  isLocked: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_at' })
  lockedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'locked_by' })
  lockedBy: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @OneToMany(() => OpeningBalance, (balance) => balance.period)
  balances: OpeningBalance[];
}
