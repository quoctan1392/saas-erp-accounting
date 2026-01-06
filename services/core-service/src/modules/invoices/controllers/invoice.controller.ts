import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { QueryInvoiceDto } from '../dto/query-invoice.dto';
import { CancelInvoiceDto, SendInvoiceEmailDto } from '../dto/invoice-actions.dto';
import { Invoice } from '../entities/invoice.entity';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { TenantId, UserId } from '../../../common/decorators/tenant.decorator';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  /**
   * POST /invoices - Tạo hóa đơn mới
   */
  @Post()
  @ApiOperation({ summary: 'Tạo hóa đơn mới (draft)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice created successfully',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  async create(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ): Promise<Invoice> {
    return await this.invoiceService.create(tenantId, createInvoiceDto, userId);
  }

  /**
   * GET /invoices - Lấy danh sách hóa đơn
   */
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách hóa đơn với filters và pagination' })
  @ApiQuery({ type: QueryInvoiceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of invoices retrieved successfully',
  })
  async findAll(
    @TenantId() tenantId: string,
    @Query() query: QueryInvoiceDto,
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    return await this.invoiceService.findAll(tenantId, query);
  }

  /**
   * GET /invoices/:id - Lấy chi tiết hóa đơn
   */
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một hóa đơn' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice details retrieved successfully',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async findOne(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Invoice> {
    return await this.invoiceService.findOne(tenantId, id);
  }

  /**
   * PUT /invoices/:id - Cập nhật hóa đơn
   */
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật hóa đơn (chỉ draft)' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice updated successfully',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invoice cannot be updated (not in draft status)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async update(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    return await this.invoiceService.update(tenantId, id, updateInvoiceDto, userId);
  }

  /**
   * DELETE /invoices/:id - Xóa hóa đơn
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa hóa đơn (chỉ draft)' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Invoice deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invoice cannot be deleted (not in draft status)',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async remove(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.invoiceService.remove(tenantId, id);
  }

  /**
   * POST /invoices/:id/publish - Phát hành hóa đơn
   */
  @Post(':id/publish')
  @ApiOperation({ summary: 'Phát hành hóa đơn (draft -> published)' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice published successfully',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invoice cannot be published',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async publish(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Invoice> {
    return await this.invoiceService.publish(tenantId, id, userId);
  }

  /**
   * POST /invoices/:id/cancel - Hủy hóa đơn
   */
  @Post(':id/cancel')
  @ApiOperation({ summary: 'Hủy hóa đơn (published -> cancelled)' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice cancelled successfully',
    type: Invoice,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invoice cannot be cancelled',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async cancel(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() cancelDto: CancelInvoiceDto,
  ): Promise<Invoice> {
    return await this.invoiceService.cancel(tenantId, id, cancelDto);
  }

  /**
   * GET /invoices/:id/pdf - Xuất hóa đơn thành PDF
   */
  @Get(':id/pdf')
  @ApiOperation({ summary: 'Xuất hóa đơn thành PDF' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PDF generated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async exportPdf(
    @TenantId() _tenantId: string,
    @Param('id', ParseUUIDPipe) _id: string,
  ): Promise<any> {
    // TODO: implement PDF export; placeholder for now
    return { message: 'PDF export not implemented yet' };
  }

  /**
   * POST /invoices/:id/send-email - Gửi hóa đơn qua email
   */
  @Post(':id/send-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi hóa đơn qua email' })
  @ApiParam({ name: 'id', description: 'Invoice ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email sent successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Only published invoices can be sent via email',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invoice not found',
  })
  async sendEmail(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() sendEmailDto: SendInvoiceEmailDto,
  ): Promise<{ message: string }> {
    await this.invoiceService.sendEmail(
      tenantId,
      id,
      sendEmailDto.toEmail,
      sendEmailDto.subject,
      sendEmailDto.message,
    );

    return { message: 'Email sent successfully' };
  }
}
