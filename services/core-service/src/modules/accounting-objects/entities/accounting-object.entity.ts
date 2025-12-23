import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SubjectGroup } from './subject-group.entity';

@Entity('object')
@Index(['tenantId', 'accountObjectCode'], { unique: true })
export class AccountingObject extends BaseEntity {
  @Column({ name: 'account_object_code' })
  accountObjectCode: string;

  @Column({ name: 'account_object_name' })
  accountObjectName: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'is_customer', default: false })
  isCustomer: boolean;

  @Column({ name: 'is_vendor', default: false })
  isVendor: boolean;

  @Column({ name: 'is_employee', default: false })
  isEmployee: boolean;

  @Column({ name: 'is_local_object', default: true })
  isLocalObject: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'subject_group_id', type: 'uuid', nullable: true })
  subjectGroupId?: string;

  @ManyToOne(() => SubjectGroup, { nullable: true })
  @JoinColumn({ name: 'subject_group_id' })
  subjectGroup?: SubjectGroup;

  @Column({ name: 'legal_representative', nullable: true })
  legalRepresentative?: string;

  @Column({ name: 'company_tax_code', nullable: true })
  companyTaxCode?: string;

  @Column({ name: 'pay_account_id', type: 'uuid', nullable: true })
  payAccountId?: string; // TK công nợ phải trả

  @Column({ name: 'receive_account_id', type: 'uuid', nullable: true })
  receiveAccountId?: string; // TK công nợ phải thu

  @Column({ name: 'contact_name', nullable: true })
  contactName?: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone?: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail?: string;

  @Column({ name: 'list_bank_account_ids', type: 'simple-array', nullable: true })
  listBankAccountIds?: string[];

  @Column({ name: 'identity_number', nullable: true })
  identityNumber?: string; // CMND/CCCD

  @Column({ type: 'text', nullable: true })
  note?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ name: 'tax_code', nullable: true })
  taxCode?: string;
}
