import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OpeningBalanceService } from './opening-balance.service';
import {
  CreateOpeningPeriodDto,
  UpdateOpeningPeriodDto,
  CreateOpeningBalanceDto,
  UpdateOpeningBalanceDto,
  CreateOpeningBalanceDetailDto,
  BatchCreateOpeningBalanceDto,
  BatchCreateOpeningBalanceResponseDto,
  QueryOpeningBalanceDto,
  BatchCreateOpeningBalanceDetailsDto,
} from './dto';
import { OpeningPeriod } from './entities/opening-period.entity';
import { OpeningBalance } from './entities/opening-balance.entity';
import { OpeningBalanceDetail } from './entities/opening-balance-detail.entity';

// TODO: Import your auth guards
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { TenantId } from '../common/decorators/tenant-id.decorator';
// import { UserId } from '../common/decorators/user-id.decorator';

@ApiTags('Opening Balance')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // TODO: Uncomment when guards are ready
@Controller('opening-balance')
export class OpeningBalanceController {
  constructor(private readonly service: OpeningBalanceService) {}

  // ==================== OPENING PERIOD ENDPOINTS ====================

  @Post('periods')
  @ApiOperation({ summary: 'Tạo kỳ khởi tạo mới' })
  @ApiResponse({
    status: 201,
    description: 'Kỳ khởi tạo đã được tạo',
    type: OpeningPeriod,
  })
  async createPeriod(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Body() dto: CreateOpeningPeriodDto,
  ): Promise<OpeningPeriod> {
    // TODO: Replace with actual tenant and user ID from auth
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.createPeriod(tenantId, userId, dto);
  }

  @Get('periods')
  @ApiOperation({ summary: 'Lấy danh sách các kỳ khởi tạo' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách kỳ khởi tạo',
    type: [OpeningPeriod],
  })
  async findAllPeriods() // @TenantId() tenantId: string,
  : Promise<OpeningPeriod[]> {
    const tenantId = 'temp-tenant-id';
    return this.service.findAllPeriods(tenantId);
  }

  @Get('periods/:periodId')
  @ApiOperation({ summary: 'Lấy chi tiết kỳ khởi tạo' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết kỳ khởi tạo',
    type: OpeningPeriod,
  })
  async findOnePeriod(
    // @TenantId() tenantId: string,
    @Param('periodId') periodId: string,
  ): Promise<OpeningPeriod> {
    const tenantId = 'temp-tenant-id';
    return this.service.findOnePeriod(tenantId, periodId);
  }

  @Put('periods/:periodId')
  @ApiOperation({ summary: 'Cập nhật kỳ khởi tạo' })
  @ApiResponse({
    status: 200,
    description: 'Kỳ khởi tạo đã được cập nhật',
    type: OpeningPeriod,
  })
  async updatePeriod(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Param('periodId') periodId: string,
    @Body() dto: UpdateOpeningPeriodDto,
  ): Promise<OpeningPeriod> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.updatePeriod(tenantId, userId, periodId, dto);
  }

  @Delete('periods/:periodId')
  @ApiOperation({ summary: 'Xóa kỳ khởi tạo (nếu chưa lock)' })
  @ApiResponse({
    status: 200,
    description: 'Kỳ khởi tạo đã được xóa',
  })
  async deletePeriod(
    // @TenantId() tenantId: string,
    @Param('periodId') periodId: string,
  ): Promise<{ message: string }> {
    const tenantId = 'temp-tenant-id';
    await this.service.deletePeriod(tenantId, periodId);
    return { message: 'Period deleted successfully' };
  }

  @Post('periods/:periodId/lock')
  @ApiOperation({ summary: 'Chốt kỳ khởi tạo' })
  @ApiResponse({
    status: 200,
    description: 'Kỳ khởi tạo đã được chốt',
    type: OpeningPeriod,
  })
  async lockPeriod(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Param('periodId') periodId: string,
  ): Promise<OpeningPeriod> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.lockPeriod(tenantId, userId, periodId);
  }

  @Post('periods/:periodId/unlock')
  @ApiOperation({ summary: 'Mở chốt kỳ khởi tạo (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Kỳ khởi tạo đã được mở chốt',
    type: OpeningPeriod,
  })
  async unlockPeriod(
    // @TenantId() tenantId: string,
    @Param('periodId') periodId: string,
  ): Promise<OpeningPeriod> {
    const tenantId = 'temp-tenant-id';
    return this.service.unlockPeriod(tenantId, periodId);
  }

  // ==================== OPENING BALANCE ENDPOINTS ====================

  @Post()
  @ApiOperation({ summary: 'Tạo số dư tài khoản đơn lẻ' })
  @ApiResponse({
    status: 201,
    description: 'Số dư đã được tạo',
    type: OpeningBalance,
  })
  async createBalance(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Body() dto: CreateOpeningBalanceDto,
  ): Promise<OpeningBalance> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.createBalance(tenantId, userId, dto);
  }

  @Post('batch')
  @ApiOperation({ summary: 'Tạo/cập nhật nhiều số dư cùng lúc (batch)' })
  @ApiResponse({
    status: 200,
    description: 'Batch operation completed',
    type: BatchCreateOpeningBalanceResponseDto,
  })
  async batchCreateOrUpdate(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Body() dto: BatchCreateOpeningBalanceDto,
  ): Promise<BatchCreateOpeningBalanceResponseDto> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.batchCreateOrUpdate(tenantId, userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách số dư tài khoản' })
  @ApiQuery({ name: 'periodId', required: false })
  @ApiQuery({ name: 'currencyId', required: false })
  @ApiQuery({ name: 'accountNumber', required: false })
  @ApiQuery({ name: 'hasDetails', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({
    status: 200,
    description: 'Danh sách số dư tài khoản',
  })
  async findAllBalances(
    // @TenantId() tenantId: string,
    @Query() query: QueryOpeningBalanceDto,
  ): Promise<{ data: OpeningBalance[]; total: number }> {
    const tenantId = 'temp-tenant-id';
    return this.service.findAllBalances(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết số dư tài khoản' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết số dư tài khoản',
    type: OpeningBalance,
  })
  async findOneBalance(
    // @TenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<OpeningBalance> {
    const tenantId = 'temp-tenant-id';
    return this.service.findOneBalance(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật số dư tài khoản' })
  @ApiResponse({
    status: 200,
    description: 'Số dư đã được cập nhật',
    type: OpeningBalance,
  })
  async updateBalance(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOpeningBalanceDto,
  ): Promise<OpeningBalance> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.updateBalance(tenantId, userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa số dư tài khoản' })
  @ApiResponse({
    status: 200,
    description: 'Số dư đã được xóa',
  })
  async deleteBalance(
    // @TenantId() tenantId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const tenantId = 'temp-tenant-id';
    await this.service.deleteBalance(tenantId, id);
    return { message: 'Balance deleted successfully' };
  }

  // ==================== OPENING BALANCE DETAILS ====================

  @Get(':balanceId/details')
  @ApiOperation({ summary: 'Lấy danh sách chi tiết số dư' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách chi tiết số dư',
    type: [OpeningBalanceDetail],
  })
  async findBalanceDetails(
    // @TenantId() tenantId: string,
    @Param('balanceId') balanceId: string,
  ): Promise<OpeningBalanceDetail[]> {
    const tenantId = 'temp-tenant-id';
    return this.service.findBalanceDetails(tenantId, balanceId);
  }

  @Post(':balanceId/details')
  @ApiOperation({ summary: 'Tạo chi tiết số dư đơn lẻ' })
  @ApiResponse({
    status: 201,
    description: 'Chi tiết số dư đã được tạo',
    type: OpeningBalanceDetail,
  })
  async createBalanceDetail(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Body() dto: CreateOpeningBalanceDetailDto,
  ): Promise<OpeningBalanceDetail> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.createBalanceDetail(tenantId, userId, dto);
  }

  @Put(':balanceId/details/:detailId')
  @ApiOperation({ summary: 'Cập nhật chi tiết số dư' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết số dư đã được cập nhật',
    type: OpeningBalanceDetail,
  })
  async updateBalanceDetail(
    // @TenantId() tenantId: string,
    // @UserId() userId: string,
    @Param('detailId') detailId: string,
    @Body() dto: Partial<CreateOpeningBalanceDetailDto>,
  ): Promise<OpeningBalanceDetail> {
    const tenantId = 'temp-tenant-id';
    const userId = 'temp-user-id';
    return this.service.updateBalanceDetail(tenantId, userId, detailId, dto);
  }

  @Delete(':balanceId/details/:detailId')
  @ApiOperation({ summary: 'Xóa chi tiết số dư' })
  @ApiResponse({
    status: 200,
    description: 'Chi tiết số dư đã được xóa',
  })
  async deleteBalanceDetail(
    // @TenantId() tenantId: string,
    @Param('detailId') detailId: string,
  ): Promise<{ message: string }> {
    const tenantId = 'temp-tenant-id';
    await this.service.deleteBalanceDetail(tenantId, detailId);
    return { message: 'Detail deleted successfully' };
  }

  // ==================== VALIDATION & REPORTS ====================

  @Post('validate')
  @ApiOperation({ summary: 'Kiểm tra tính hợp lệ của số dư' })
  @ApiResponse({
    status: 200,
    description: 'Kết quả validation',
  })
  async validatePeriodBalances(
    // @TenantId() tenantId: string,
    @Body() body: { periodId: string },
  ): Promise<{ valid: boolean; errors: any[] }> {
    const tenantId = 'temp-tenant-id';
    return this.service.validatePeriodBalances(tenantId, body.periodId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Tổng hợp số dư (trial balance)' })
  @ApiQuery({ name: 'periodId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Tổng hợp số dư',
  })
  async getSummary(
    // @TenantId() tenantId: string,
    @Query('periodId') periodId: string,
  ): Promise<{
    totalDebit: number;
    totalCredit: number;
    totalBalances: number;
    isBalanced: boolean;
  }> {
    const tenantId = 'temp-tenant-id';
    return this.service.getSummary(tenantId, periodId);
  }
}
