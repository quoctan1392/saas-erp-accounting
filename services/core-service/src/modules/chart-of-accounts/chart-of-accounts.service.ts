import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChartOfAccountsGeneral } from './entities/chart-of-accounts-general.entity';
import { ChartOfAccountsCustom } from './entities/chart-of-accounts-custom.entity';
import { CreateCustomAccountDto } from './dto/create-custom-account.dto';
import { UpdateCustomAccountDto } from './dto/update-custom-account.dto';

@Injectable()
export class ChartOfAccountsService {
  constructor(
    @InjectRepository(ChartOfAccountsGeneral)
    private generalAccountRepository: Repository<ChartOfAccountsGeneral>,
    @InjectRepository(ChartOfAccountsCustom)
    private customAccountRepository: Repository<ChartOfAccountsCustom>,
  ) {}

  async findGeneralAccounts(regime: '200' | '133'): Promise<ChartOfAccountsGeneral[]> {
    return this.generalAccountRepository.find({
      where: { accountingRegime: regime, active: true },
      order: { accountNumber: 'ASC' },
    });
  }

  async findByAccountNumber(
    accountNumber: string,
    regime: '200' | '133',
  ): Promise<ChartOfAccountsGeneral | null> {
    return this.generalAccountRepository.findOne({
      where: { accountNumber, accountingRegime: regime, active: true },
    });
  }

  async findCustomAccounts(tenantId: string): Promise<ChartOfAccountsCustom[]> {
    return this.customAccountRepository.find({
      where: { tenantId, isDeleted: false },
      order: { accountNumber: 'ASC' },
    });
  }

  async createCustomAccount(
    tenantId: string,
    userId: string,
    dto: CreateCustomAccountDto,
  ): Promise<ChartOfAccountsCustom> {
    // Check if account number already exists
    const existing = await this.customAccountRepository.findOne({
      where: { tenantId, accountNumber: dto.accountNumber, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Account number already exists');
    }

    // Validate parent account if specified
    if (dto.parentAccountNumber) {
      const parent = await this.findAccountByNumber(tenantId, dto.parentAccountNumber);
      if (!parent) {
        throw new BadRequestException('Parent account not found');
      }

      // Validate account level hierarchy
      if (dto.accountLevel !== parent.accountLevel + 1) {
        throw new BadRequestException('Invalid account level for the specified parent');
      }
    }

    const account = this.customAccountRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
      source: 'custom',
    });

    return this.customAccountRepository.save(account);
  }

  async updateCustomAccount(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateCustomAccountDto,
  ): Promise<ChartOfAccountsCustom> {
    const account = await this.customAccountRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.source === 'general') {
      throw new BadRequestException('Cannot update general account');
    }

    // Check if account number is being changed and if it conflicts
    if (dto.accountNumber && dto.accountNumber !== account.accountNumber) {
      const existing = await this.customAccountRepository.findOne({
        where: { tenantId, accountNumber: dto.accountNumber, isDeleted: false },
      });

      if (existing) {
        throw new ConflictException('Account number already exists');
      }
    }

    Object.assign(account, dto);
    account.updatedBy = userId;

    return this.customAccountRepository.save(account);
  }

  async deleteCustomAccount(id: string, tenantId: string, userId: string): Promise<void> {
    const account = await this.customAccountRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    if (account.source === 'general') {
      throw new BadRequestException('Cannot delete general account');
    }

    if (account.hasTransactions) {
      throw new BadRequestException('Cannot delete account with transactions');
    }

    account.isDeleted = true;
    account.deletedAt = new Date();
    account.updatedBy = userId;

    await this.customAccountRepository.save(account);
  }

  async initializeAccountsFromGeneral(
    tenantId: string,
    userId: string,
    regime: '200' | '133',
  ): Promise<void> {
    // Check if accounts already initialized
    const existing = await this.customAccountRepository.count({
      where: { tenantId, isDeleted: false },
    });

    if (existing > 0) {
      throw new ConflictException('Accounts already initialized');
    }

    // Get general accounts for the regime
    const generalAccounts = await this.findGeneralAccounts(regime);

    // Create custom accounts from general
    const customAccounts = generalAccounts.map((ga) =>
      this.customAccountRepository.create({
        accountNumber: ga.accountNumber,
        accountName: ga.accountName,
        accountNature: ga.accountNature,
        accountLevel: ga.accountLevel,
        parentAccountNumber: ga.parentAccountNumber,
        description: ga.description,
        active: ga.active,
        source: 'general',
        tenantId,
        createdBy: userId,
      }),
    );

    await this.customAccountRepository.save(customAccounts);
  }

  private async findAccountByNumber(
    tenantId: string,
    accountNumber: string,
  ): Promise<ChartOfAccountsCustom | null> {
    return this.customAccountRepository.findOne({
      where: { tenantId, accountNumber, isDeleted: false },
    });
  }
}
