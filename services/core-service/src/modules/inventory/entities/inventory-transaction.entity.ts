import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Item } from '../../items/entities/item.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum TransactionType {
  IN = 'in',
  OUT = 'out',
  TRANSFER = 'transfer',
  ADJUST = 'adjust',
}

@Entity('inventory_transaction')
@Index(['tenantId', 'transactionNo'])
@Index(['tenantId', 'itemId', 'warehouseId'])
@Index(['tenantId', 'transactionDate'])
export class InventoryTransaction extends BaseEntity {
  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ name: 'transaction_no', length: 50 })
  transactionNo: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ name: 'posted_date', type: 'timestamp', nullable: true })
  postedDate?: Date;

  @Column({ type: 'decimal', precision: 15, scale: 4 })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  // For transfer transactions
  @Column({ name: 'target_warehouse_id', type: 'uuid', nullable: true })
  targetWarehouseId?: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'target_warehouse_id' })
  targetWarehouse?: Warehouse;

  // Reference to source document
  @Column({ name: 'ref_id', type: 'uuid', nullable: true })
  refId?: string;

  @Column({ name: 'ref_type', length: 50, nullable: true })
  refType?: string;

  @Column({ name: 'employee_id', type: 'uuid', nullable: true })
  employeeId?: string;

  @Column({ default: 'draft' })
  status: string;
}
