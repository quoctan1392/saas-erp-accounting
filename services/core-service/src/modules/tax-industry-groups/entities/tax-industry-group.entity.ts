import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tax_industry_groups')
export class TaxIndustryGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, unique: true })
  code: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'group_name', length: 255 })
  groupName: string;

  @Column({ name: 'vat_rate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  vatRate: number | null;

  @Column({ name: 'pit_rate', type: 'numeric', precision: 5, scale: 2, nullable: true })
  pitRate: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
