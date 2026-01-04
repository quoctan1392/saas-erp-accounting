import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  ParseBoolPipe,
} from '@nestjs/common';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { UserId } from '../../common/decorators/tenant.decorator';

@Controller('warehouses')
@UseGuards(JwtAuthGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  /**
   * Tạo kho mới
   */
  @Post()
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createWarehouseDto: CreateWarehouseDto,
  ) {
    return this.warehousesService.create(tenantId, createWarehouseDto, userId);
  }

  /**
   * Lấy mã kho tiếp theo
   */
  @Get('next-code')
  getNextCode(@TenantId() tenantId: string) {
    return this.warehousesService.getNextWarehouseCode(tenantId);
  }

  /**
   * Lấy danh sách kho
   */
  @Get()
  findAll(
    @TenantId() tenantId: string,
    @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.warehousesService.findAll(
      tenantId,
      isActive,
      search,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Lấy chi tiết kho
   */
  @Get(':id')
  findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.warehousesService.findOne(tenantId, id);
  }

  /**
   * Cập nhật kho
   */
  @Patch(':id')
  update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(tenantId, id, updateWarehouseDto, userId);
  }

  /**
   * Xóa kho (soft delete)
   */
  @Delete(':id')
  remove(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.warehousesService.remove(tenantId, id, userId);
  }

  /**
   * Lấy tồn kho theo kho
   */
  @Get(':id/inventory')
  getInventory(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.warehousesService.getInventoryByWarehouse(
      tenantId,
      id,
      page || 1,
      limit || 20,
    );
  }

  /**
   * Lấy lịch sử xuất nhập kho
   */
  @Get(':id/transactions')
  getTransactions(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('itemId', new ParseUUIDPipe({ optional: true })) itemId?: string,
    @Query('transactionType') transactionType?: 'in' | 'out' | 'transfer',
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.warehousesService.getTransactionsByWarehouse(
      tenantId,
      id,
      itemId,
      transactionType,
      fromDate ? new Date(fromDate) : undefined,
      toDate ? new Date(toDate) : undefined,
      page || 1,
      limit || 20,
    );
  }
}
