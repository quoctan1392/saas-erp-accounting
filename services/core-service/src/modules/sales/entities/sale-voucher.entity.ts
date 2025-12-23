import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { SaleVoucherDetail } from './sale-voucher-detail.entity';

@Entity('sale_voucher')
export class SaleVoucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  @Column({ length: 50 })
  code: string;

  @Column({ name: 'transaction_no', length: 50 })
  transactionNo: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'posted_date', type: 'date', nullable: true })
  postedDate: Date;

  @Column({ name: 'transaction_code', length: 50 })
  transactionCode: string;

  @Column({
    name: 'payment_type',
    type: 'enum',
    enum: ['pay_later', 'pay_now'],
    default: 'pay_later',
  })
  paymentType: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: ['cash', 'bank_transfer'],
    default: 'cash',
  })
  paymentMethod: string;

  @Column({ name: 'is_sale_with_outward', type: 'boolean', default: false })
  isSaleWithOutward: boolean;

  @Column({ name: 'is_sale_with_invoice', type: 'boolean', default: false })
  isSaleWithInvoice: boolean;

  @Column({ name: 'account_object_id', type: 'uuid' })
  accountObjectId: string;

  @Column({ name: 'account_object_name', length: 255 })
  accountObjectName: string;

  @Column({ name: 'account_object_address', type: 'text', nullable: true })
  accountObjectAddress: string;

  @Column({ name: 'account_object_tax_code', length: 50, nullable: true })
  accountObjectTaxCode: string;

  @Column({ name: 'currency_id', type: 'uuid' })
  currencyId: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 })
  exchangeRate: number;

  @Column({ name: 'total_sale_amount_oc', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalSaleAmountOc: number;

  @Column({ name: 'total_sale_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalSaleAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'total_discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalDiscountAmount: number;

  @Column({
    name: 'discount_type',
    type: 'enum',
    enum: ['not_discount', 'by_item', 'by_invoice_amount', 'by_percent'],
    default: 'not_discount',
  })
  discountType: string;

  @Column({ name: 'total_vat_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalVatAmount: number;

  @Column({ name: 'total_export_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalExportTaxAmount: number;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId: string;

  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountRate: number;

  @Column({ name: 'attached_file_ids', type: 'text', array: true, nullable: true })
  attachedFileIds: string[];

  @Column({
    type: 'enum',
    enum: ['draft', 'posted'],
    default: 'draft',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => SaleVoucherDetail, (detail) => detail.saleVoucher, {
    cascade: true,
    eager: true,
  })
  details: SaleVoucherDetail[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;
}
