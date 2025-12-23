import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OutwardVoucherDetail } from './outward-voucher-detail.entity';

@Entity('outward_voucher')
export class OutwardVoucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ name: 'sale_voucher_ref_id', type: 'uuid', nullable: true })
  saleVoucherRefId: string;

  @Column({ name: 'transaction_no', length: 50 })
  transactionNo: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'posted_date', type: 'date', nullable: true })
  postedDate: Date;

  @Column({ name: 'account_object_id', type: 'uuid' })
  accountObjectId: string;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'posted'],
    default: 'draft',
  })
  status: string;

  @OneToMany(() => OutwardVoucherDetail, (detail) => detail.outwardVoucher, {
    cascade: true,
    eager: true,
  })
  details: OutwardVoucherDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;
}
