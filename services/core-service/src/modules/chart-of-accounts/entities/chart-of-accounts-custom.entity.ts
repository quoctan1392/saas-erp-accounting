import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { AccountNature } from './chart-of-accounts-general.entity';

@Entity('chart_of_accounts_custom')
@Index(['tenantId', 'accountNumber'], { unique: true })
export class ChartOfAccountsCustom extends BaseEntity {
  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({
    name: 'account_nature',
    type: 'enum',
    enum: AccountNature,
  })
  accountNature: AccountNature;

  @Column({ name: 'account_level', type: 'int' })
  accountLevel: number;

  @Column({ name: 'parent_account_number', nullable: true })
  parentAccountNumber?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'source', default: 'custom' })
  source: string; // 'general' or 'custom'

  @Column({ name: 'characteristics', type: 'text', nullable: true })
  characteristics?: string;

  @Column({ name: 'has_transactions', default: false })
  hasTransactions: boolean;
}
