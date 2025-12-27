import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_detail')
export class InvoiceDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'invoice_id', type: 'uuid' })
  invoiceId: string;

  // Item Information
  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @Column({ name: 'item_code', length: 50 })
  itemCode: string;

  @Column({ name: 'item_name', length: 255 })
  itemName: string;

  // Description
  @Column({ type: 'text', nullable: true })
  description: string;

  // Unit Information
  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ name: 'unit_name', length: 50 })
  unitName: string;

  // Quantity and Price
  @Column({ type: 'decimal', precision: 18, scale: 3 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  // Discount
  @Column({ name: 'discount_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discountRate: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  discountAmount: number;

  // VAT
  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatRate: number;

  @Column({ name: 'vat_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  vatAmount: number;

  // Total
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2 })
  totalAmount: number;

  // Display Order
  @Column({ name: 'line_number', type: 'int' })
  lineNumber: number;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Invoice, (invoice) => invoice.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;
}
