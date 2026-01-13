import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('tenant_advanced_setup')
@Index(['tenantId'])
export class TenantAdvancedSetup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId: string;

  @Column({ name: 'e_invoice_enabled', type: 'boolean', default: false })
  eInvoiceEnabled: boolean;

  @Column({ name: 'e_invoice_provider', type: 'varchar', nullable: true })
  eInvoiceProvider: string | null;

  @Column({ name: 'e_invoice_provider_name', type: 'varchar', nullable: true })
  eInvoiceProviderName: string | null;

  @Column({ name: 'e_invoice_tax_code', type: 'varchar', nullable: true })
  eInvoiceTaxCode: string | null;

  @Column({ name: 'e_invoice_username', type: 'varchar', nullable: true })
  eInvoiceUsername: string | null;

  @Column({ name: 'e_invoice_auto_issue', type: 'boolean', default: true })
  eInvoiceAutoIssue: boolean;

  @Column({ name: 'e_invoice_connected_at', type: 'timestamp', nullable: true })
  eInvoiceConnectedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
