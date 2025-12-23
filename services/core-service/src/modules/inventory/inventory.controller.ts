import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { QueryInventoryTransactionDto } from './dto/query-inventory-transaction.dto';
import { QueryStockLevelDto } from './dto/query-stock-level.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';
import { TenantId } from '../../common/decorators/tenant.decorator';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ==================== INVENTORY TRANSACTIONS ====================

  @Get('transactions')
  async getTransactions(
    @TenantId() tenantId: string,
    @Query() queryDto: QueryInventoryTransactionDto,
  ) {
    return await this.inventoryService.findAllTransactions(tenantId, queryDto);
  }

  @Post('transactions')
  async createTransaction(
    @TenantId() tenantId: string,
    @Body() createDto: CreateInventoryTransactionDto,
  ) {
    return await this.inventoryService.createTransaction(tenantId, createDto);
  }

  @Post('transactions/:id/post')
  @HttpCode(HttpStatus.OK)
  async postTransaction(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return await this.inventoryService.postTransaction(tenantId, id);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTransaction(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.inventoryService.deleteTransaction(tenantId, id);
  }

  // ==================== STOCK LEVELS ====================

  @Get('stock-levels')
  async getStockLevels(
    @TenantId() tenantId: string,
    @Query() queryDto: QueryStockLevelDto,
  ) {
    return await this.inventoryService.findAllStockLevels(tenantId, queryDto);
  }

  @Get('stock-levels/:itemId')
  async getStockLevelByItem(
    @TenantId() tenantId: string,
    @Param('itemId') itemId: string,
  ) {
    return await this.inventoryService.getStockLevelByItem(tenantId, itemId);
  }

  @Get('low-stock')
  async getLowStock(@TenantId() tenantId: string) {
    return await this.inventoryService.findLowStock(tenantId);
  }

  // ==================== INVENTORY OPERATIONS ====================

  @Post('adjust')
  async adjustInventory(
    @TenantId() tenantId: string,
    @Body() adjustDto: AdjustInventoryDto,
  ) {
    return await this.inventoryService.adjustInventory(tenantId, adjustDto);
  }

  @Post('transfer')
  async transferInventory(
    @TenantId() tenantId: string,
    @Body() transferDto: TransferInventoryDto,
  ) {
    return await this.inventoryService.transferInventory(tenantId, transferDto);
  }
}
