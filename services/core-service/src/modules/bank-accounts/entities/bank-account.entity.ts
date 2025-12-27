import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('bank_account')
@Index(['tenantId', 'accountNumber'], { unique: true })
export class BankAccount extends BaseEntity {
  @Column({ name: 'bank_name' })
  bankName: string;

  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column({ 
    name: 'initial_balance', 
    type: 'decimal', 
    precision: 15, 
    scale: 2, 
    default: 0 
  })
  initialBalance: number;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
