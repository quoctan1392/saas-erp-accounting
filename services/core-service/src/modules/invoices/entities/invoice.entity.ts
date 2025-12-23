import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvoiceDetail } from './invoice-detail.entity';

export enum InvoiceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  BOTH = 'both',
}

@Entity('invoice')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId: string;

  // Invoice Information
  @Column({ name: 'invoice_form', length: 50 })
  invoiceForm: string;

  @Column({ name: 'invoice_sign', length: 50 })
  invoiceSign: string;

  @Column({ name: 'invoice_number', length: 50, nullable: true })
  invoiceNumber: string;

  @Column({ name: 'invoice_date', type: 'date' })
  invoiceDate: Date;

  // Status
  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  // Reference to source document
  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId: string;

  @Column({ name: 'ref_type', length: 50, nullable: true })
  refType: string;

  // Customer/Buyer Information
  @Column({ name: 'account_object_id', type: 'uuid' })
  accountObjectId: string;

  @Column({ name: 'account_object_name', length: 255 })
  accountObjectName: string;

  @Column({ name: 'account_object_address', type: 'text', nullable: true })
  accountObjectAddress: string;

  @Column({ name: 'account_object_tax_code', length: 50, nullable: true })
  accountObjectTaxCode: string;

  @Column({ name: 'identity_number', length: 50, nullable: true })
  identityNumber: string;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  // Payment Information
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  // Currency Information
  @Column({ name: 'currency_id', type: 'uuid' })
  currencyId: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1 })
  exchangeRate: number;

  // Amounts
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'total_discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalDiscountAmount: number;

  @Column({ name: 'total_vat_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalVatAmount: number;

  @Column({ name: 'total_payment', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalPayment: number;

  // Electronic Invoice Provider Info
  @Column({ name: 'einvoice_provider_id', type: 'uuid', nullable: true })
  einvoiceProviderId: string;

  @Column({ name: 'einvoice_transaction_id', length: 255, nullable: true })
  einvoiceTransactionId: string;

  @Column({ name: 'einvoice_url', type: 'text', nullable: true })
  einvoiceUrl: string;

  // Metadata
  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: 'published_by', type: 'uuid', nullable: true })
  publishedBy: string;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt: Date;

  @Column({ name: 'cancelled_by', type: 'uuid', nullable: true })
  cancelledBy: string;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ name: 'cancel_reason', type: 'text', nullable: true })
  cancelReason: string;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToMany(() => InvoiceDetail, (detail) => detail.invoice, {
    cascade: true,
    eager: false,
  })
  details: InvoiceDetail[];

  // Computed properties
  get isDraft(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  get isPublished(): boolean {
    return this.status === InvoiceStatus.PUBLISHED;
  }

  get isCancelled(): boolean {
    return this.status === InvoiceStatus.CANCELLED;
  }

  get canEdit(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  get canDelete(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  get canPublish(): boolean {
    return this.status === InvoiceStatus.DRAFT;
  }

  get canCancel(): boolean {
    return this.status === InvoiceStatus.PUBLISHED;
  }
}
