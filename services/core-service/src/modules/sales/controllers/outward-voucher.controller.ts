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
import { OutwardVoucherService } from '../services/outward-voucher.service';
import { CreateOutwardVoucherDto } from '../dto/create-outward-voucher.dto';
import { UpdateOutwardVoucherDto } from '../dto/update-outward-voucher.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../../common/decorators/tenant.decorator';

@ApiTags('Sales - Outward Vouchers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales/outward-vouchers')
export class OutwardVoucherController {
  constructor(private readonly outwardVoucherService: OutwardVoucherService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new outward voucher' })
  @ApiResponse({ status: 201, description: 'Outward voucher created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createDto: CreateOutwardVoucherDto,
  ) {
    return this.outwardVoucherService.create(createDto, tenantId, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all outward vouchers' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'posted'] })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Return all outward vouchers' })
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.outwardVoucherService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an outward voucher by ID' })
  @ApiResponse({ status: 200, description: 'Return the outward voucher' })
  @ApiResponse({ status: 404, description: 'Outward voucher not found' })
  findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.outwardVoucherService.findOne(id, tenantId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an outward voucher' })
  @ApiResponse({ status: 200, description: 'Outward voucher updated successfully' })
  @ApiResponse({ status: 400, description: 'Cannot update posted voucher' })
  @ApiResponse({ status: 404, description: 'Outward voucher not found' })
  update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateOutwardVoucherDto,
  ) {
    return this.outwardVoucherService.update(id, updateDto, tenantId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an outward voucher' })
  @ApiResponse({ status: 200, description: 'Outward voucher deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete posted voucher' })
  @ApiResponse({ status: 404, description: 'Outward voucher not found' })
  remove(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.outwardVoucherService.remove(id, tenantId);
  }

  @Post(':id/post')
  @ApiOperation({ summary: 'Post an outward voucher to ledger' })
  @ApiResponse({ status: 200, description: 'Outward voucher posted successfully' })
  @ApiResponse({ status: 400, description: 'Voucher already posted' })
  @ApiResponse({ status: 404, description: 'Outward voucher not found' })
  post(@TenantId() tenantId: string, @UserId() userId: string, @Param('id') id: string) {
    return this.outwardVoucherService.post(id, tenantId, userId);
  }
}
