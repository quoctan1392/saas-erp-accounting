import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SaleVoucher } from './sale-voucher.entity';

@Entity('sale_voucher_detail')
export class SaleVoucherDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sale_voucher_id', type: 'uuid' })
  saleVoucherId: string;

  @ManyToOne(() => SaleVoucher, (voucher) => voucher.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sale_voucher_id' })
  saleVoucher: SaleVoucher;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price_oc', type: 'decimal', precision: 18, scale: 2 })
  unitPriceOc: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ name: 'amount_oc', type: 'decimal', precision: 18, scale: 2 })
  amountOc: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountRate: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatRate: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  vatAmount: number;

  @Column({ name: 'export_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  exportTaxRate: number;

  @Column({ name: 'export_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  exportTaxAmount: number;

  @Column({ name: 'revenue_account_id', type: 'uuid' })
  revenueAccountId: string;

  @Column({ name: 'discount_account_id', type: 'uuid', nullable: true })
  discountAccountId: string;

  @Column({ name: 'vat_account_id', type: 'uuid', nullable: true })
  vatAccountId: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
