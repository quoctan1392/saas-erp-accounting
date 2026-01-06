import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SaleVoucherService } from '../services/sale-voucher.service';
import { CreateSaleVoucherDto } from '../dto/create-sale-voucher.dto';
import { UpdateSaleVoucherDto } from '../dto/update-sale-voucher.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../../common/decorators/tenant.decorator';

@ApiTags('Sales - Sale Vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/vouchers')
export class SaleVoucherController {
  constructor(private readonly saleVoucherService: SaleVoucherService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sale voucher' })
  @ApiResponse({ status: 201, description: 'Sale voucher created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createDto: CreateSaleVoucherDto,
  ) {
    return this.saleVoucherService.create(createDto, tenantId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sale vouchers' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'posted'] })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'objectId', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all sale vouchers' })
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.saleVoucherService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sale voucher by ID' })
  @ApiResponse({ status: 200, description: 'Return the sale voucher' })
  @ApiResponse({ status: 404, description: 'Sale voucher not found' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.saleVoucherService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sale voucher' })
  @ApiResponse({ status: 200, description: 'Sale voucher updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update posted voucher' })
  @ApiResponse({ status: 404, description: 'Sale voucher not found' })
  update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateSaleVoucherDto,
  ) {
    return this.saleVoucherService.update(id, updateDto, tenantId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sale voucher' })
  @ApiResponse({ status: 200, description: 'Sale voucher deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete posted voucher' })
  @ApiResponse({ status: 404, description: 'Sale voucher not found' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.saleVoucherService.remove(id, tenantId);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post a sale voucher to ledger' })
  @ApiResponse({ status: 200, description: 'Sale voucher posted successfully' })
  @ApiResponse({ status: 400, description: 'Voucher already posted' })
  @ApiResponse({ status: 404, description: 'Sale voucher not found' })
  post(@TenantId() tenantId: string, @UserId() userId: string, @Param('id') id: string) {
    return this.saleVoucherService.post(id, tenantId, userId);
  }
}
