import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Item } from '../../items/entities/item.entity';
import { Warehouse } from '../entities/warehouse.entity';

@Entity('warehouse_item')
@Index(['tenantId', 'warehouseId', 'itemId'], { unique: true })
export class WarehouseItem extends BaseEntity {
  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'item_id', type: 'uuid' })
  itemId: string;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'item_id' })
  item: Item;

  @Column({ name: 'min_stock', type: 'decimal', precision: 18, scale: 4, default: 0 })
  minStock: number;

  @Column({ name: 'max_stock', type: 'decimal', precision: 18, scale: 4, nullable: true })
  maxStock?: number;

  @Column({ name: 'reorder_point', type: 'decimal', precision: 18, scale: 4, nullable: true })
  reorderPoint?: number;

  @Column({ name: 'preferred_location', length: 100, nullable: true })
  preferredLocation?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
