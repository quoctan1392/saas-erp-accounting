import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ReceiptVoucher } from './receipt-voucher.entity';

@Entity('receipt_voucher_detail')
export class ReceiptVoucherDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_voucher_id', type: 'uuid' })
  receiptVoucherId: string;

  @ManyToOne(() => ReceiptVoucher, (voucher) => voucher.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receipt_voucher_id' })
  receiptVoucher: ReceiptVoucher;

  @Column({ name: 'debit_account_id', type: 'uuid' })
  debitAccountId: string;

  @Column({ name: 'credit_account_id', type: 'uuid' })
  creditAccountId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
