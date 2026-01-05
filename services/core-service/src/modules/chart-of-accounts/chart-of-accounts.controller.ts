import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { CreateCustomAccountDto } from './dto/create-custom-account.dto';
import { UpdateCustomAccountDto } from './dto/update-custom-account.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../common/decorators/tenant.decorator';

@Controller('chart-of-accounts')
@UseGuards(JwtAuthGuard)
export class ChartOfAccountsController {
  constructor(private readonly chartOfAccountsService: ChartOfAccountsService) {}

  @Get('general')
  findGeneralAccounts(@Query('regime') regime: '200' | '133' = '200') {
    return this.chartOfAccountsService.findGeneralAccounts(regime);
  }

  @Get('custom')
  findCustomAccounts(@TenantId() tenantId: string) {
    return this.chartOfAccountsService.findCustomAccounts(tenantId);
  }

  @Post('custom')
  createCustomAccount(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: CreateCustomAccountDto,
  ) {
    return this.chartOfAccountsService.createCustomAccount(tenantId, userId, dto);
  }

  @Put('custom/:id')
  updateCustomAccount(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() dto: UpdateCustomAccountDto,
  ) {
    return this.chartOfAccountsService.updateCustomAccount(id, tenantId, userId, dto);
  }

  @Delete('custom/:id')
  deleteCustomAccount(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.chartOfAccountsService.deleteCustomAccount(id, tenantId, userId);
  }

  @Post('initialize')
  initializeAccounts(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body('regime') regime: '200' | '133',
  ) {
    return this.chartOfAccountsService.initializeAccountsFromGeneral(tenantId, userId, regime);
  }
}
