import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OpeningBalance } from './opening-balance.entity';

@Entity('opening_balance_detail')
@Index(['tenantId'])
@Index(['balanceId'])
export class OpeningBalanceDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId: string;

  @Column({ type: 'uuid', name: 'balance_id' })
  balanceId: string;

  // Các chiều phân tích (optional)
  @Column({ type: 'uuid', nullable: true, name: 'department_id' })
  departmentId: string;

  @Column({ type: 'uuid', nullable: true, name: 'cost_item_id' })
  costItemId: string;

  @Column({ type: 'uuid', nullable: true, name: 'cost_object_id' })
  costObjectId: string;

  @Column({ type: 'uuid', nullable: true, name: 'project_id' })
  projectId: string;

  @Column({ type: 'uuid', nullable: true, name: 'sales_order_id' })
  salesOrderId: string;

  @Column({ type: 'uuid', nullable: true, name: 'purchase_order_id' })
  purchaseOrderId: string;

  @Column({ type: 'uuid', nullable: true, name: 'sales_contract_id' })
  salesContractId: string;

  @Column({ type: 'uuid', nullable: true, name: 'purchase_contract_id' })
  purchaseContractId: string;

  @Column({ type: 'uuid', nullable: true, name: 'statistical_code_id' })
  statisticalCodeId: string;

  @Column({ type: 'uuid', nullable: true, name: 'account_object_id' })
  accountObjectId: string;

  // Giá trị kế toán
  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0, name: 'debit_balance' })
  debitBalance: number;

  @Column({ type: 'decimal', precision: 19, scale: 4, default: 0, name: 'credit_balance' })
  creditBalance: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string;

  @ManyToOne(() => OpeningBalance, (balance) => balance.details)
  @JoinColumn({ name: 'balance_id' })
  balance: OpeningBalance;
}
