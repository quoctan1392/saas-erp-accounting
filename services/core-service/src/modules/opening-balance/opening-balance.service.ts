import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { OpeningPeriod } from './entities/opening-period.entity';
import { OpeningBalance } from './entities/opening-balance.entity';
import { OpeningBalanceDetail } from './entities/opening-balance-detail.entity';
import { ChartOfAccountsService } from '../chart-of-accounts/chart-of-accounts.service';
import {
  CreateOpeningPeriodDto,
  UpdateOpeningPeriodDto,
  CreateOpeningBalanceDto,
  UpdateOpeningBalanceDto,
  CreateOpeningBalanceDetailDto,
  BatchCreateOpeningBalanceDto,
  BatchCreateOpeningBalanceResponseDto,
  BatchResultItemDto,
  QueryOpeningBalanceDto,
  BatchCreateOpeningBalanceDetailsDto,
} from './dto';

@Injectable()
export class OpeningBalanceService {
  constructor(
    @InjectRepository(OpeningPeriod)
    private periodRepo: Repository<OpeningPeriod>,
    @InjectRepository(OpeningBalance)
    private balanceRepo: Repository<OpeningBalance>,
    @InjectRepository(OpeningBalanceDetail)
    private detailRepo: Repository<OpeningBalanceDetail>,
    private dataSource: DataSource,
    private chartOfAccountsService: ChartOfAccountsService,
  ) {}

  // ==================== OPENING PERIOD ====================

  async createPeriod(
    tenantId: string,
    userId: string,
    dto: CreateOpeningPeriodDto,
  ): Promise<OpeningPeriod> {
    // Check duplicate period name
    const existing = await this.periodRepo.findOne({
      where: { tenantId, periodName: dto.periodName },
    });

    if (existing) {
      throw new ConflictException(`Period with name "${dto.periodName}" already exists`);
    }

    const period = this.periodRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.periodRepo.save(period);
  }

  async findAllPeriods(tenantId: string): Promise<OpeningPeriod[]> {
    return this.periodRepo.find({
      where: { tenantId },
      order: { openingDate: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOnePeriod(tenantId: string, periodId: string): Promise<OpeningPeriod> {
    const period = await this.periodRepo.findOne({
      where: { id: periodId, tenantId },
    });

    if (!period) {
      throw new NotFoundException(`Period with ID "${periodId}" not found`);
    }

    return period;
  }

  async updatePeriod(
    tenantId: string,
    userId: string,
    periodId: string,
    dto: UpdateOpeningPeriodDto,
  ): Promise<OpeningPeriod> {
    const period = await this.findOnePeriod(tenantId, periodId);

    if (period.isLocked) {
      throw new ForbiddenException('Cannot update locked period');
    }

    Object.assign(period, dto);
    period.updatedBy = userId;

    return this.periodRepo.save(period);
  }

  async deletePeriod(tenantId: string, periodId: string): Promise<void> {
    const period = await this.findOnePeriod(tenantId, periodId);

    if (period.isLocked) {
      throw new ForbiddenException('Cannot delete locked period');
    }

    await this.periodRepo.remove(period);
  }

  async lockPeriod(tenantId: string, userId: string, periodId: string): Promise<OpeningPeriod> {
    const period = await this.findOnePeriod(tenantId, periodId);

    if (period.isLocked) {
      throw new BadRequestException('Period is already locked');
    }

    // Validate all balances before locking
    const validationResult = await this.validatePeriodBalances(tenantId, periodId);

    if (!validationResult.valid) {
      throw new BadRequestException({
        message: 'Cannot lock period: Validation failed',
        errors: validationResult.errors,
      });
    }

    period.isLocked = true;
    period.lockedAt = new Date();
    period.lockedBy = userId;

    return this.periodRepo.save(period);
  }

  async unlockPeriod(tenantId: string, periodId: string): Promise<OpeningPeriod> {
    const period = await this.findOnePeriod(tenantId, periodId);

    if (!period.isLocked) {
      throw new BadRequestException('Period is not locked');
    }

    period.isLocked = false;
    period.lockedAt = null;
    period.lockedBy = null;

    return this.periodRepo.save(period);
  }

  // ==================== OPENING BALANCE ====================

  async createBalance(
    tenantId: string,
    userId: string,
    dto: CreateOpeningBalanceDto,
  ): Promise<OpeningBalance> {
    // Check period exists and not locked
    const period = await this.findOnePeriod(tenantId, dto.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot add balance to locked period');
    }

    // Validate debit/credit rule
    if (dto.debitBalance > 0 && dto.creditBalance > 0) {
      throw new BadRequestException('Cannot have both debit and credit balance greater than 0');
    }

    // Resolve account number and name
    let accountNumber = dto.accountNumber;
    let accountName = '';
    let accountId = dto.accountId;

    if (accountNumber && !accountId) {
      // Lookup account by number from chart of accounts (assuming regime 200)
      const account = await this.chartOfAccountsService.findByAccountNumber(
        accountNumber,
        '200',
      );
      if (account) {
        accountName = account.accountName;
        // accountId remains null as we use accountNumber as primary identifier
      } else {
        // Account not found in general chart, use the provided number
        accountName = `Account ${accountNumber}`;
      }
    } else if (accountId && !accountNumber) {
      throw new BadRequestException('accountNumber is required when accountId is provided');
    }

    // Check for existing balance - if exists, UPDATE instead of throwing error (upsert pattern)
    const existing = await this.balanceRepo.findOne({
      where: {
        tenantId,
        periodId: dto.periodId,
        accountNumber,
        currencyId: dto.currencyId,
      },
    });

    if (existing) {
      // Update existing balance instead of throwing conflict error
      existing.debitBalance = dto.debitBalance;
      existing.creditBalance = dto.creditBalance;
      existing.hasDetails = dto.hasDetails ?? existing.hasDetails;
      existing.note = dto.note ?? existing.note;
      existing.updatedBy = userId;
      
      // If hasDetails changed to true and there are old details, keep them
      // If hasDetails changed to false, optionally clean up details (not implemented here)
      
      return this.balanceRepo.save(existing);
    }

    const balance = this.balanceRepo.create({
      tenantId,
      periodId: dto.periodId,
      currencyId: dto.currencyId,
      accountId: accountId || null,
      accountNumber,
      accountName,
      debitBalance: dto.debitBalance,
      creditBalance: dto.creditBalance,
      hasDetails: dto.hasDetails || false,
      note: dto.note,
      createdBy: userId,
    });

    return this.balanceRepo.save(balance);
  }

  async findAllBalances(
    tenantId: string,
    query: QueryOpeningBalanceDto,
  ): Promise<{ data: OpeningBalance[]; total: number }> {
    const { periodId, currencyId, accountNumber, hasDetails, page, limit } = query;

    const qb = this.balanceRepo
      .createQueryBuilder('balance')
      .where('balance.tenant_id = :tenantId', { tenantId });

    if (periodId) {
      qb.andWhere('balance.period_id = :periodId', { periodId });
    }

    if (currencyId) {
      qb.andWhere('balance.currency_id = :currencyId', { currencyId });
    }

    if (accountNumber) {
      qb.andWhere('balance.account_number ILIKE :accountNumber', {
        accountNumber: `%${accountNumber}%`,
      });
    }

    if (hasDetails !== undefined) {
      qb.andWhere('balance.has_details = :hasDetails', { hasDetails });
    }

    qb.orderBy('balance.account_number', 'ASC');

    const total = await qb.getCount();

    if (page && limit) {
      qb.skip((page - 1) * limit).take(limit);
    }

    const data = await qb.getMany();

    return { data, total };
  }

  async findOneBalance(tenantId: string, balanceId: string): Promise<OpeningBalance> {
    const balance = await this.balanceRepo.findOne({
      where: { id: balanceId, tenantId },
      relations: ['details'],
    });

    if (!balance) {
      throw new NotFoundException(`Balance with ID "${balanceId}" not found`);
    }

    return balance;
  }

  async updateBalance(
    tenantId: string,
    userId: string,
    balanceId: string,
    dto: UpdateOpeningBalanceDto,
  ): Promise<OpeningBalance> {
    const balance = await this.findOneBalance(tenantId, balanceId);

    // Check if period is locked
    const period = await this.findOnePeriod(tenantId, balance.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot update balance in locked period');
    }

    // Validate debit/credit rule
    const newDebit = dto.debitBalance ?? balance.debitBalance;
    const newCredit = dto.creditBalance ?? balance.creditBalance;

    if (newDebit > 0 && newCredit > 0) {
      throw new BadRequestException('Cannot have both debit and credit balance greater than 0');
    }

    Object.assign(balance, dto);
    balance.updatedBy = userId;

    return this.balanceRepo.save(balance);
  }

  async deleteBalance(tenantId: string, balanceId: string): Promise<void> {
    const balance = await this.findOneBalance(tenantId, balanceId);

    // Check if period is locked
    const period = await this.findOnePeriod(tenantId, balance.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot delete balance in locked period');
    }

    await this.balanceRepo.remove(balance);
  }

  // ==================== BATCH OPERATIONS ====================

  async batchCreateOrUpdate(
    tenantId: string,
    userId: string,
    dto: BatchCreateOpeningBalanceDto,
  ): Promise<BatchCreateOpeningBalanceResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const results: BatchResultItemDto[] = [];
    let created = 0,
      updated = 0,
      failed = 0;
    const errors: any[] = [];

    try {
      // 1. Validate period exists and not locked
      const period = await queryRunner.manager.findOne(OpeningPeriod, {
        where: { id: dto.periodId, tenantId, isLocked: false },
      });

      if (!period) {
        throw new BadRequestException('Period not found or locked');
      }

      // 2. Fetch all accounts to validate
      const accountNumbers = dto.balances
        .map((b) => b.accountNumber)
        .filter((n): n is string => !!n);
      const accountMap = new Map<string, { accountNumber: string; accountName: string }>();

      // Fetch account info from chart of accounts
      for (const accNum of accountNumbers) {
        const account = await this.chartOfAccountsService.findByAccountNumber(accNum, '200');
        if (account) {
          accountMap.set(accNum, {
            accountNumber: account.accountNumber,
            accountName: account.accountName,
          });
        } else {
          // Use provided name or default
          accountMap.set(accNum, {
            accountNumber: accNum,
            accountName: `Account ${accNum}`,
          });
        }
      }

      // 3. Process each balance
      for (const item of dto.balances) {
        try {
          if (!item.accountNumber) {
            throw new Error('accountNumber is required');
          }

          const account = accountMap.get(item.accountNumber);

          if (!account) {
            throw new Error(`Account ${item.accountNumber} not found`);
          }

          // Validate debit/credit rules
          if (item.debitBalance > 0 && item.creditBalance > 0) {
            throw new Error('Cannot have both debit and credit balance');
          }

          // Check if exists (by accountNumber and currencyId)
          let balance = await queryRunner.manager.findOne(OpeningBalance, {
            where: {
              tenantId,
              periodId: dto.periodId,
              accountNumber: item.accountNumber,
              currencyId: dto.currencyId,
            },
          });

          if (balance) {
            // Update existing
            balance.debitBalance = item.debitBalance;
            balance.creditBalance = item.creditBalance;
            balance.hasDetails = item.hasDetails || false;
            balance.note = item.note;
            balance.updatedBy = userId;
            balance.updatedAt = new Date();

            await queryRunner.manager.save(balance);

            results.push({
              accountNumber: account.accountNumber,
              accountName: account.accountName,
              status: 'updated',
              balanceId: balance.id,
            });
            updated++;
          } else {
            // Create new
            balance = queryRunner.manager.create(OpeningBalance, {
              tenantId,
              periodId: dto.periodId,
              currencyId: dto.currencyId,
              accountId: null,
              accountNumber: account.accountNumber,
              accountName: account.accountName,
              debitBalance: item.debitBalance,
              creditBalance: item.creditBalance,
              hasDetails: item.hasDetails || false,
              note: item.note,
              createdBy: userId,
            });

            await queryRunner.manager.save(balance);

            results.push({
              accountNumber: account.accountNumber,
              accountName: account.accountName,
              status: 'created',
              balanceId: balance.id,
            });
            created++;
          }

          // 4. Process details if provided
          if (item.details && item.details.length > 0) {
            // Delete existing details
            await queryRunner.manager.delete(OpeningBalanceDetail, {
              balanceId: balance.id,
            });

            // Create new details
            const details = item.details.map((d) =>
              queryRunner.manager.create(OpeningBalanceDetail, {
                ...d,
                tenantId,
                balanceId: balance.id,
                createdBy: userId,
              }),
            );

            await queryRunner.manager.save(details);

            // Validate sum
            const sumDebit = details.reduce((sum, d) => sum + Number(d.debitBalance), 0);
            const sumCredit = details.reduce((sum, d) => sum + Number(d.creditBalance), 0);

            if (
              Math.abs(sumDebit - Number(balance.debitBalance)) > 0.01 ||
              Math.abs(sumCredit - Number(balance.creditBalance)) > 0.01
            ) {
              throw new Error('Detail sum does not match balance total');
            }
          }
        } catch (error) {
          failed++;
          results.push({
            accountNumber: item.accountNumber || 'unknown',
            accountName: item.accountName || 'unknown',
            status: 'failed',
            error: error.message,
          });
          errors.push({
            field: 'balances',
            message: error.message,
            accountNumber: item.accountNumber,
          });

          if (dto.mode === 'fail-fast') {
            throw error;
          }
        }
      }

      // 5. Commit transaction
      await queryRunner.commitTransaction();

      return {
        success: failed === 0,
        created,
        updated,
        failed,
        total: dto.balances.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== OPENING BALANCE DETAILS ====================

  async findBalanceDetails(tenantId: string, balanceId: string): Promise<OpeningBalanceDetail[]> {
    // Verify balance exists
    await this.findOneBalance(tenantId, balanceId);

    return this.detailRepo.find({
      where: { tenantId, balanceId },
      order: { createdAt: 'ASC' },
    });
  }

  async createBalanceDetail(
    tenantId: string,
    userId: string,
    dto: CreateOpeningBalanceDetailDto,
  ): Promise<OpeningBalanceDetail> {
    const balance = await this.findOneBalance(tenantId, dto.balanceId);

    // Check if period is locked
    const period = await this.findOnePeriod(tenantId, balance.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot add detail to locked period');
    }

    // Validate debit/credit rule
    if (dto.debitBalance > 0 && dto.creditBalance > 0) {
      throw new BadRequestException('Cannot have both debit and credit balance in detail');
    }

    const detail = this.detailRepo.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.detailRepo.save(detail);
  }

  async batchCreateBalanceDetails(
    tenantId: string,
    userId: string,
    balanceId: string,
    dto: BatchCreateOpeningBalanceDetailsDto,
  ): Promise<OpeningBalanceDetail[]> {
    const balance = await this.findOneBalance(tenantId, balanceId);

    // Check if period is locked
    const period = await this.findOnePeriod(tenantId, balance.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot add details to locked period');
    }

    // Upsert pattern: update existing by accountObjectId, add new ones
    const results: OpeningBalanceDetail[] = [];
    
    for (const item of dto.details) {
      // Validate debit/credit rule
      if (item.debitBalance > 0 && item.creditBalance > 0) {
        throw new BadRequestException('Cannot have both debit and credit balance in detail');
      }

      // Check if detail already exists for this accountObjectId
      let existing: OpeningBalanceDetail | null = null;
      if (item.accountObjectId) {
        existing = await this.detailRepo.findOne({
          where: { balanceId, tenantId, accountObjectId: item.accountObjectId },
        });
      }

      if (existing) {
        // Update existing detail
        existing.debitBalance = item.debitBalance;
        existing.creditBalance = item.creditBalance;
        existing.description = item.description;
        existing.updatedBy = userId;
        results.push(await this.detailRepo.save(existing));
      } else {
        // Create new detail
        const detail = this.detailRepo.create({
          balanceId,
          tenantId,
          accountObjectId: item.accountObjectId,
          departmentId: item.departmentId,
          costItemId: item.costItemId,
          costObjectId: item.costObjectId,
          projectId: item.projectId,
          salesOrderId: item.salesOrderId,
          purchaseOrderId: item.purchaseOrderId,
          salesContractId: item.salesContractId,
          purchaseContractId: item.purchaseContractId,
          statisticalCodeId: item.statisticalCodeId,
          debitBalance: item.debitBalance,
          creditBalance: item.creditBalance,
          description: item.description,
          createdBy: userId,
        });
        results.push(await this.detailRepo.save(detail));
      }
    }

    return results;
  }

  async updateBalanceDetail(
    tenantId: string,
    userId: string,
    detailId: string,
    dto: Partial<CreateOpeningBalanceDetailDto>,
  ): Promise<OpeningBalanceDetail> {
    const detail = await this.detailRepo.findOne({
      where: { id: detailId, tenantId },
      relations: ['balance'],
    });

    if (!detail) {
      throw new NotFoundException(`Detail with ID "${detailId}" not found`);
    }

    // Check if period is locked
    const period = await this.findOnePeriod(tenantId, detail.balance.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot update detail in locked period');
    }

    Object.assign(detail, dto);
    detail.updatedBy = userId;

    return this.detailRepo.save(detail);
  }

  async deleteBalanceDetail(tenantId: string, detailId: string): Promise<void> {
    const detail = await this.detailRepo.findOne({
      where: { id: detailId, tenantId },
      relations: ['balance'],
    });

    if (!detail) {
      throw new NotFoundException(`Detail with ID "${detailId}" not found`);
    }

    // Check if period is locked
    const period = await this.findOnePeriod(tenantId, detail.balance.periodId);
    if (period.isLocked) {
      throw new ForbiddenException('Cannot delete detail in locked period');
    }

    await this.detailRepo.remove(detail);
  }

  // ==================== VALIDATION ====================

  async validatePeriodBalances(
    tenantId: string,
    periodId: string,
  ): Promise<{ valid: boolean; errors: any[] }> {
    const balances = await this.balanceRepo.find({
      where: { tenantId, periodId, hasDetails: true },
      relations: ['details'],
    });

    const errors = [];

    for (const balance of balances) {
      const sumDebit = balance.details.reduce((sum, d) => sum + Number(d.debitBalance), 0);
      const sumCredit = balance.details.reduce((sum, d) => sum + Number(d.creditBalance), 0);

      if (Math.abs(sumDebit - Number(balance.debitBalance)) > 0.01) {
        errors.push({
          balanceId: balance.id,
          accountNumber: balance.accountNumber,
          errorType: 'sum_mismatch',
          message: 'Debit detail sum does not match balance total',
          expected: balance.debitBalance,
          actual: sumDebit,
        });
      }

      if (Math.abs(sumCredit - Number(balance.creditBalance)) > 0.01) {
        errors.push({
          balanceId: balance.id,
          accountNumber: balance.accountNumber,
          errorType: 'sum_mismatch',
          message: 'Credit detail sum does not match balance total',
          expected: balance.creditBalance,
          actual: sumCredit,
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async getSummary(
    tenantId: string,
    periodId: string,
  ): Promise<{
    totalDebit: number;
    totalCredit: number;
    totalBalances: number;
    isBalanced: boolean;
  }> {
    const balances = await this.balanceRepo.find({
      where: { tenantId, periodId },
    });

    const totalDebit = balances.reduce((sum, b) => sum + Number(b.debitBalance), 0);
    const totalCredit = balances.reduce((sum, b) => sum + Number(b.creditBalance), 0);

    return {
      totalDebit,
      totalCredit,
      totalBalances: balances.length,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }
}
