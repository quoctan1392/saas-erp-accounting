import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OutwardVoucher } from './outward-voucher.entity';

@Entity('outward_voucher_detail')
export class OutwardVoucherDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'outward_voucher_id', type: 'uuid' })
  outwardVoucherId: string;

  @ManyToOne(() => OutwardVoucher, (voucher) => voucher.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'outward_voucher_id' })
  outwardVoucher: OutwardVoucher;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  amount: number;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @Column({ name: 'inventory_account_id', type: 'uuid' })
  inventoryAccountId: string;

  @Column({ name: 'cogs_account_id', type: 'uuid' })
  cogsAccountId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;
}
