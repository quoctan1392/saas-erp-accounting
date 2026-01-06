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
import { ReceiptVoucherService } from '../services/receipt-voucher.service';
import { CreateReceiptVoucherDto } from '../dto/create-receipt-voucher.dto';
import { UpdateReceiptVoucherDto } from '../dto/update-receipt-voucher.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../../common/decorators/tenant.decorator';

@ApiTags('Sales - Receipt Vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/receipt-vouchers')
export class ReceiptVoucherController {
  constructor(private readonly receiptVoucherService: ReceiptVoucherService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new receipt voucher' })
  @ApiResponse({ status: 201, description: 'Receipt voucher created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createDto: CreateReceiptVoucherDto,
  ) {
    return this.receiptVoucherService.create(createDto, tenantId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all receipt vouchers' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'posted'] })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all receipt vouchers' })
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.receiptVoucherService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a receipt voucher by ID' })
  @ApiResponse({ status: 200, description: 'Return the receipt voucher' })
  @ApiResponse({ status: 404, description: 'Receipt voucher not found' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.receiptVoucherService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a receipt voucher' })
  @ApiResponse({ status: 200, description: 'Receipt voucher updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update posted voucher' })
  @ApiResponse({ status: 404, description: 'Receipt voucher not found' })
  update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateReceiptVoucherDto,
  ) {
    return this.receiptVoucherService.update(id, updateDto, tenantId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a receipt voucher' })
  @ApiResponse({ status: 200, description: 'Receipt voucher deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete posted voucher' })
  @ApiResponse({ status: 404, description: 'Receipt voucher not found' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.receiptVoucherService.remove(id, tenantId);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post a receipt voucher to ledger' })
  @ApiResponse({ status: 200, description: 'Receipt voucher posted successfully' })
  @ApiResponse({ status: 400, description: 'Voucher already posted' })
  @ApiResponse({ status: 404, description: 'Receipt voucher not found' })
  post(@TenantId() tenantId: string, @UserId() userId: string, @Param('id') id: string) {
    return this.receiptVoucherService.post(id, tenantId, userId);
  }
}
