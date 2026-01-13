import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('tenant_accounting_setup')
@Index(['tenantId'])
export class TenantAccountingSetup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'data_start_date', type: 'date', nullable: true })
  dataStartDate: Date | null;

  // HKD fields
  @Column({ name: 'tax_filing_frequency', type: 'varchar', nullable: true })
  taxFilingFrequency: string | null;

  @Column({ name: 'use_pos_device', type: 'boolean', default: false })
  usePOSDevice: boolean;

  @Column({ name: 'tax_industry_group', type: 'varchar', nullable: true })
  taxIndustryGroup: string | null;

  // DNTN fields
  @Column({ name: 'accounting_regime', type: 'varchar', nullable: true })
  accountingRegime: string | null;

  @Column({ name: 'tax_calculation_method', type: 'varchar', nullable: true })
  taxCalculationMethod: string | null;

  @Column({ name: 'base_currency', type: 'varchar', nullable: true })
  baseCurrency: string | null;

  @Column({ name: 'has_foreign_currency', type: 'boolean', default: false })
  hasForeignCurrency: boolean;

  @Column({ name: 'inventory_valuation_method', type: 'varchar', nullable: true })
  inventoryValuationMethod: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
