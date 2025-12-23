import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Unit } from './unit.entity';

export enum ItemType {
  GOODS = 'goods',
  SERVICE = 'service',
  MATERIAL = 'material',
  FINISHED_GOODS = 'finished_goods',
  TOOL_AND_EQUIPMENT = 'tool_and_equipment',
}

@Entity('item')
@Index(['tenantId', 'code'], { unique: true })
export class Item extends BaseEntity {
  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ItemType })
  type: ItemType;

  @Column({ name: 'list_item_category_id', type: 'simple-array', nullable: true })
  listItemCategoryId?: string[];

  @Column({ name: 'minimum_stock', type: 'decimal', precision: 15, scale: 4, default: 0 })
  minimumStock: number;

  @Column({ name: 'maximum_stock', type: 'decimal', precision: 15, scale: 4, nullable: true })
  maximumStock?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Unit relationship
  @Column({ name: 'unit_id', type: 'uuid' })
  unitId: string;

  @ManyToOne(() => Unit)
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  // Pricing
  @Column({ name: 'sell_price', type: 'decimal', precision: 15, scale: 2, default: 0 })
  sellPrice: number;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 15, scale: 2, nullable: true })
  purchasePrice?: number;

  // Tax rates
  @Column({ name: 'import_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  importTaxRate: number;

  @Column({ name: 'export_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  exportTaxRate: number;

  @Column({ name: 'vat_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vatRate: number;

  @Column({ name: 'special_consumption_tax_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  specialConsumptionTaxRate: number;

  // Account IDs
  @Column({ name: 'discount_account_id', type: 'uuid', nullable: true })
  discountAccountId?: string;

  @Column({ name: 'sale_off_account_id', type: 'uuid', nullable: true })
  saleOffAccountId?: string;

  @Column({ name: 'inventory_account_id', type: 'uuid', nullable: true })
  inventoryAccountId?: string;

  @Column({ name: 'revenue_account_id', type: 'uuid', nullable: true })
  revenueAccountId?: string;

  @Column({ name: 'cogs_account_id', type: 'uuid', nullable: true })
  cogsAccountId?: string;

  @Column({ name: 'purchase_account_id', type: 'uuid', nullable: true })
  purchaseAccountId?: string;

  // Descriptions
  @Column({ name: 'purchase_description', type: 'text', nullable: true })
  purchaseDescription?: string;

  @Column({ name: 'sale_description', type: 'text', nullable: true })
  saleDescription?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  // Images
  @Column({ name: 'list_image_url', type: 'simple-array', nullable: true })
  listImageUrl?: string[];

  @Column({ name: 'default_image_url', nullable: true })
  defaultImageUrl?: string;

  // Barcode/SKU
  @Column({ nullable: true })
  barcode?: string;

  @Column({ nullable: true })
  sku?: string;

  // Weight/Dimensions
  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  weight?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  length?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  width?: number;

  @Column({ type: 'decimal', precision: 15, scale: 4, nullable: true })
  height?: number;

  // Warranty
  @Column({ name: 'warranty_period', type: 'int', nullable: true })
  warrantyPeriod?: number; // in months

  @Column({ name: 'warranty_type', nullable: true })
  warrantyType?: string;
}
