import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export enum BusinessType {
  BUSINESS = 'business',
  HOUSEHOLD = 'household',
}

export enum AccountingRegime {
  SIMPLE = 'simple',
  STANDARD = 'standard',
}

export enum TaxCalculationMethod {
  DEDUCTION = 'deduction',
  DIRECT = 'direct',
}

export enum TaxFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

export enum InventoryMethod {
  FIFO = 'fifo',
  LIFO = 'lifo',
  AVERAGE = 'average',
}

@Entity('business_profile')
export class BusinessProfile extends BaseEntity {
  @Column({ type: 'enum', enum: BusinessType })
  type: BusinessType;

  @Column({ name: 'tax_number', unique: true })
  taxNumber: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'owner_name' })
  ownerName: string;

  @Column({ name: 'identity_number' })
  identityNumber: string;

  @Column({ name: 'fields_of_operation' })
  fieldsOfOperation: string;

  @Column({ type: 'simple-array' })
  sector: string[];

  @Column({
    name: 'accounting_regime',
    type: 'enum',
    enum: AccountingRegime,
  })
  accountingRegime: AccountingRegime;

  @Column({ name: 'start_data_date', type: 'date' })
  startDataDate: Date;

  @Column({
    name: 'tax_calculation_method',
    type: 'enum',
    enum: TaxCalculationMethod,
  })
  taxCalculationMethod: TaxCalculationMethod;

  @Column({ name: 'accounting_currency', default: 'VND' })
  accountingCurrency: string;

  @Column({
    name: 'tax_frequency',
    type: 'enum',
    enum: TaxFrequency,
  })
  taxFrequency: TaxFrequency;

  @Column({ name: 'use_invoice_machine', default: false })
  useInvoiceMachine: boolean;

  @Column({
    name: 'inventory_method',
    type: 'enum',
    enum: InventoryMethod,
  })
  inventoryMethod: InventoryMethod;

  @Column({ name: 'initial_cash_on_hand', type: 'decimal', precision: 15, scale: 2, default: 0 })
  initialCashOnHand: number;

  @Column({ name: 'initial_bank_balance', type: 'decimal', precision: 15, scale: 2, default: 0 })
  initialBankBalance: number;

  @Column({ name: 'phone', nullable: true })
  phone?: string;

  @Column({ name: 'email', nullable: true })
  email?: string;

  @Column({ name: 'website', nullable: true })
  website?: string;

  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;
}
