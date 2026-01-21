import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ReceiptVoucherDetail } from './receipt-voucher-detail.entity';

@Entity('receipt_voucher')
export class ReceiptVoucher extends BaseEntity {

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

  @OneToMany(() => ReceiptVoucherDetail, (detail) => detail.receiptVoucher, {
    cascade: true,
    eager: true,
  })
  details: ReceiptVoucherDetail[];
}
