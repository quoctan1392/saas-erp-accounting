import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { BankAccount } from './entities/bank-account.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';
import { ChartOfAccountsService } from '../chart-of-accounts/chart-of-accounts.service';
import { AccountNature } from '../chart-of-accounts/entities/chart-of-accounts-general.entity';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
    private chartOfAccountsService: ChartOfAccountsService,
  ) {}

  /**
   * Lấy danh sách tài khoản ngân hàng với phân trang và tìm kiếm
   */
  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
    filters?: {
      isActive?: boolean;
    },
  ): Promise<PaginationResponseDto<BankAccount>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<BankAccount> = {
      tenantId,
      isDeleted: false,
    };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const queryBuilder = this.bankAccountRepository
      .createQueryBuilder('bankAccount')
      .where(where);

    if (search) {
      queryBuilder.andWhere(
        '(bankAccount.bankName ILIKE :search OR bankAccount.accountNumber ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy(
        sortBy ? `bankAccount.${sortBy}` : 'bankAccount.createdAt',
        sortOrder || 'DESC',
      )
      .getManyAndCount();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết một tài khoản ngân hàng
   */
  async findOne(id: string, tenantId: string): Promise<BankAccount> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    return bankAccount;
  }

  /**
   * Tạo tài khoản ngân hàng mới
   * - Tự động tạo tài khoản trong chart_of_accounts_custom (112x)
   */
  async create(
    tenantId: string,
    userId: string,
    dto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    // Kiểm tra số tài khoản đã tồn tại chưa
    const existing = await this.bankAccountRepository.findOne({
      where: { 
        tenantId, 
        accountNumber: dto.accountNumber, 
        isDeleted: false 
      },
    });

    if (existing) {
      throw new ConflictException('Bank account number already exists');
    }

    // Tạo tài khoản kế toán tương ứng trong chart_of_accounts_custom
    // Tài khoản ngân hàng thuộc nhóm 112 (Tiền gửi ngân hàng)
    const accountName = `TK ${dto.bankName} - ${dto.accountNumber}`;
    
    // Lấy số thứ tự tiếp theo cho tài khoản 112x
    const nextAccountNumber = await this.getNextBankAccountNumber(tenantId);

    const chartAccount = await this.chartOfAccountsService.createCustomAccount(
      tenantId,
      userId,
      {
        accountNumber: nextAccountNumber,
        accountName: accountName,
        accountNature: AccountNature.DEBIT,
        accountLevel: 2,
        parentAccountNumber: '112',
        active: true,
        characteristics: `Tài khoản ngân hàng: ${dto.bankName}`,
      },
    );

    // Tạo bank account với accountId link đến chart_of_accounts
    const bankAccount = this.bankAccountRepository.create({
      ...dto,
      tenantId,
      accountId: chartAccount.id,
      createdBy: userId,
      isActive: dto.isActive ?? true,
    });

    return this.bankAccountRepository.save(bankAccount);
  }

  /**
   * Cập nhật tài khoản ngân hàng
   */
  async update(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateBankAccountDto,
  ): Promise<BankAccount> {
    const bankAccount = await this.findOne(id, tenantId);

    // Cập nhật thông tin
    // Note: Không cho phép thay đổi accountNumber vì đã liên kết với chart of accounts
    Object.assign(bankAccount, dto);
    bankAccount.updatedBy = userId;

    return this.bankAccountRepository.save(bankAccount);
  }

  /**
   * Xóa tài khoản ngân hàng (soft delete)
   */
  async remove(id: string, tenantId: string, userId: string): Promise<void> {
    const bankAccount = await this.findOne(id, tenantId);

    // TODO: Kiểm tra xem tài khoản có phát sinh nghiệp vụ chưa
    // Nếu đã phát sinh, không cho xóa

    bankAccount.isDeleted = true;
    bankAccount.updatedBy = userId;

    await this.bankAccountRepository.save(bankAccount);
  }

  /**
   * Lấy số tài khoản tiếp theo cho tài khoản ngân hàng (112x)
   */
  private async getNextBankAccountNumber(tenantId: string): Promise<string> {
    // Lấy tất cả tài khoản custom bắt đầu bằng 112
    const customAccounts = await this.chartOfAccountsService.findCustomAccounts(tenantId);
    
    const bankAccountNumbers = customAccounts
      .filter(acc => acc.accountNumber.startsWith('112') && acc.accountNumber.length === 4)
      .map(acc => parseInt(acc.accountNumber.substring(3), 10))
      .filter(num => !isNaN(num));

    if (bankAccountNumbers.length === 0) {
      return '1121'; // Tài khoản ngân hàng đầu tiên
    }

    const maxNumber = Math.max(...bankAccountNumbers);
    const nextNumber = maxNumber + 1;

    if (nextNumber > 9) {
      throw new BadRequestException('Maximum number of bank accounts (1129) reached');
    }

    return `112${nextNumber}`;
  }

  /**
   * Tính số dư hiện tại của tài khoản ngân hàng
   * Số dư hiện tại = Số dư ban đầu + Sum(transactions)
   */
  async getCurrentBalance(id: string, tenantId: string): Promise<number> {
    const bankAccount = await this.findOne(id, tenantId);
    
    // TODO: Khi implement module transactions, tính sum từ các giao dịch
    // const transactions = await this.getTransactions(id, tenantId);
    // const transactionsSum = transactions.reduce((sum, t) => sum + t.amount, 0);
    // return Number(bankAccount.initialBalance) + transactionsSum;

    // Hiện tại chỉ trả về số dư ban đầu
    return Number(bankAccount.initialBalance);
  }

  /**
   * Lấy danh sách giao dịch của tài khoản ngân hàng
   * TODO: Implement khi có module bank transactions
   */
  async getTransactions(
    id: string,
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<any>> {
    await this.findOne(id, tenantId); // Validate bank account exists

    // TODO: Query từ bảng bank_transactions hoặc accounting_entries
    // WHERE account_id = bankAccount.accountId

    return {
      data: [],
      total: 0,
      page: paginationDto.page,
      limit: paginationDto.limit,
      totalPages: 0,
    };
  }

  /**
   * Đối soát tài khoản ngân hàng
   * TODO: Implement logic đối soát với sao kê ngân hàng
   */
  async reconcile(
    id: string,
    tenantId: string,
    reconcileData: {
      statementBalance: number;
      statementDate: Date;
    },
  ): Promise<{
    bankBalance: number;
    bookBalance: number;
    difference: number;
  }> {
    const bankAccount = await this.findOne(id, tenantId);
    const bookBalance = await this.getCurrentBalance(id, tenantId);

    return {
      bankBalance: reconcileData.statementBalance,
      bookBalance,
      difference: reconcileData.statementBalance - bookBalance,
    };
  }
}
