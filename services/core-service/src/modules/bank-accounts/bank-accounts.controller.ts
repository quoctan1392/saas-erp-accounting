import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto, UpdateBankAccountDto } from './dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';

@ApiTags('Bank Accounts')
@ApiBearerAuth()
@Controller('bank-accounts')
@UseGuards(JwtAuthGuard)
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  findAll(
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
    @Query('isActive') isActive?: string,
  ) {
    return this.bankAccountsService.findAll(tenantId, paginationDto, {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.bankAccountsService.findOne(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản ngân hàng mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 409, description: 'Số tài khoản đã tồn tại' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createDto: CreateBankAccountDto,
  ) {
    return this.bankAccountsService.create(tenantId, userId, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  @ApiResponse({ status: 409, description: 'Số tài khoản đã tồn tại' })
  update(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() updateDto: UpdateBankAccountDto,
  ) {
    return this.bankAccountsService.update(id, tenantId, userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa tài khoản ngân hàng' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  remove(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.bankAccountsService.remove(id, tenantId, userId);
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Lấy sao kê giao dịch của tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  getTransactions(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.bankAccountsService.getTransactions(id, tenantId, paginationDto);
  }

  @Post(':id/reconcile')
  @ApiOperation({ summary: 'Đối soát tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Đối soát thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  reconcile(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Body() reconcileData: { statementBalance: number; statementDate: Date },
  ) {
    return this.bankAccountsService.reconcile(id, tenantId, reconcileData);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Lấy số dư hiện tại của tài khoản ngân hàng' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy' })
  async getCurrentBalance(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    const balance = await this.bankAccountsService.getCurrentBalance(id, tenantId);
    return { balance };
  }
}
