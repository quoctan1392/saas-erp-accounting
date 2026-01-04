import { Entity, Column } from 'typeorm';

export enum AccountNature {
  DEBIT = 'debit',
  CREDIT = 'credit',
  BOTH = 'both',
}

@Entity('chart_of_accounts_general')
export class ChartOfAccountsGeneral {
  @Column({ primary: true, name: 'account_number' })
  accountNumber: string;

  @Column({ name: 'account_name' })
  accountName: string;

  @Column({ name: 'account_name_en', nullable: true })
  accountNameEn?: string;

  @Column({
    name: 'account_nature',
    type: 'enum',
    enum: AccountNature,
  })
  accountNature: AccountNature;

  @Column({ name: 'account_level', type: 'int' })
  accountLevel: number;

  @Column({ name: 'parent_account_number', nullable: true })
  parentAccountNumber?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'accounting_regime' })
  accountingRegime: string; // '200' (Circular 200) or '133' (Circular 133)

  @Column({ default: true })
  active: boolean;
}
