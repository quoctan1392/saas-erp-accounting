import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { OpeningPeriod } from './opening-period.entity';
import { OpeningBalanceDetail } from './opening-balance-detail.entity';

@Entity('opening_balance')
@Index(['tenantId'])
@Index(['periodId'])
@Index(['accountId'])
@Index(['currencyId'])
@Index(['tenantId', 'hasDetails'])
@Index(['tenantId', 'accountNumber'])
export class OpeningBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', name: 'period_id' })
  periodId: string;

  @Column({ type: 'varchar', length: 10, name: 'currency_id' })
  currencyId: string;

  @Column({ type: 'uuid', name: 'account_id', nullable: true })
  accountId: string;

  @Column({ type: 'varchar', length: 50, name: 'account_number' })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255, name: 'account_name' })
  accountName: string;

  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0, name: 'debit_balance' })
  debitBalance: number;

  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0, name: 'credit_balance' })
  creditBalance: number;

  @Column({ type: 'boolean', default: false, name: 'has_details' })
  hasDetails: boolean;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @ManyToOne(() => OpeningPeriod, (period) => period.balances)
  @JoinColumn({ name: 'period_id' })
  period: OpeningPeriod;

  @OneToMany(() => OpeningBalanceDetail, (detail) => detail.balance, {
    cascade: true,
  })
  details: OpeningBalanceDetail[];
}
