import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { InvoiceDetail } from '../entities/invoice-detail.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { QueryInvoiceDto } from '../dto/query-invoice.dto';
import { CancelInvoiceDto } from '../dto/invoice-actions.dto';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceDetail)
    private readonly invoiceDetailRepository: Repository<InvoiceDetail>,
  ) {}

  /**
   * Tạo hóa đơn mới (trạng thái draft)
   */
  async create(
    tenantId: string,
    createInvoiceDto: CreateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    // Validate details
    if (!createInvoiceDto.details || createInvoiceDto.details.length === 0) {
      throw new BadRequestException('Invoice must have at least one detail line');
    }

    // Create invoice entity
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      tenantId,
      status: InvoiceStatus.DRAFT,
      createdBy: userId,
      updatedBy: userId,
      exchangeRate: createInvoiceDto.exchangeRate || 1,
      totalDiscountAmount: createInvoiceDto.totalDiscountAmount || 0,
      totalVatAmount: createInvoiceDto.totalVatAmount || 0,
    });

    // Create detail entities
    const details = createInvoiceDto.details.map((detail) =>
      this.invoiceDetailRepository.create({
        ...detail,
        discountRate: detail.discountRate || 0,
        discountAmount: detail.discountAmount || 0,
        vatRate: detail.vatRate || 0,
        vatAmount: detail.vatAmount || 0,
      }),
    );

    invoice.details = details;

    // Save invoice with details (cascade)
    return await this.invoiceRepository.save(invoice);
  }

  /**
   * Lấy danh sách hóa đơn với pagination và filters
   */
  async findAll(
    tenantId: string,
    query: QueryInvoiceDto,
  ): Promise<{ data: Invoice[]; total: number; page: number; limit: number }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.details', 'details')
      .where('invoice.tenant_id = :tenantId', { tenantId })
      .orderBy('invoice.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('invoice.status = :status', { status: query.status });
    }

    if (query.fromDate && query.toDate) {
      queryBuilder.andWhere('invoice.invoice_date BETWEEN :fromDate AND :toDate', {
        fromDate: query.fromDate,
        toDate: query.toDate,
      });
    } else if (query.fromDate) {
      queryBuilder.andWhere('invoice.invoice_date >= :fromDate', {
        fromDate: query.fromDate,
      });
    } else if (query.toDate) {
      queryBuilder.andWhere('invoice.invoice_date <= :toDate', {
        toDate: query.toDate,
      });
    }

    if (query.accountObjectId) {
      queryBuilder.andWhere('invoice.account_object_id = :accountObjectId', {
        accountObjectId: query.accountObjectId,
      });
    }

    if (query.invoiceNumber) {
      queryBuilder.andWhere('invoice.invoice_number LIKE :invoiceNumber', {
        invoiceNumber: `%${query.invoiceNumber}%`,
      });
    }

    if (query.invoiceForm) {
      queryBuilder.andWhere('invoice.invoice_form = :invoiceForm', {
        invoiceForm: query.invoiceForm,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Lấy chi tiết một hóa đơn
   */
  async findOne(tenantId: string, id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, tenantId },
      relations: ['details'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  /**
   * Cập nhật hóa đơn (chỉ khi ở trạng thái draft)
   */
  async update(
    tenantId: string,
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);

    // Check if invoice can be edited
    if (!invoice.canEdit) {
      throw new BadRequestException(
        `Invoice with status ${invoice.status} cannot be edited`,
      );
    }

    // Update invoice fields
    Object.assign(invoice, {
      ...updateInvoiceDto,
      updatedBy: userId,
    });

    // Update details if provided
    if (updateInvoiceDto.details) {
      // Remove old details
      await this.invoiceDetailRepository.delete({ invoiceId: id });

      // Create new details
      const details = updateInvoiceDto.details.map((detail, index) =>
        this.invoiceDetailRepository.create({
          ...detail,
          invoiceId: id,
          lineNumber: index + 1,
        }),
      );

      invoice.details = details;
    }

    return await this.invoiceRepository.save(invoice);
  }

  /**
   * Xóa hóa đơn (chỉ khi ở trạng thái draft)
   */
  async remove(tenantId: string, id: string): Promise<void> {
    const invoice = await this.findOne(tenantId, id);

    // Check if invoice can be deleted
    if (!invoice.canDelete) {
      throw new BadRequestException(
        `Invoice with status ${invoice.status} cannot be deleted`,
      );
    }

    await this.invoiceRepository.remove(invoice);
  }

  /**
   * Phát hành hóa đơn
   * - Chuyển trạng thái từ draft -> published
   * - Tự động sinh số hóa đơn
   * - Gọi API nhà cung cấp hóa đơn điện tử (nếu có)
   */
  async publish(
    tenantId: string,
    id: string,
    userId: string,
  ): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);

    // Check if invoice can be published
    if (!invoice.canPublish) {
      throw new BadRequestException(
        `Invoice with status ${invoice.status} cannot be published`,
      );
    }

    // Generate invoice number if not exists
    if (!invoice.invoiceNumber) {
      invoice.invoiceNumber = await this.generateInvoiceNumber(
        tenantId,
        invoice.invoiceForm,
        invoice.invoiceSign,
      );
    }

    // Update status and metadata
    invoice.status = InvoiceStatus.PUBLISHED;
    invoice.publishedBy = userId;
    invoice.publishedAt = new Date();
    invoice.updatedBy = userId;

    // TODO: Call e-invoice provider API if einvoiceProviderId is set
    // if (invoice.einvoiceProviderId) {
    //   const result = await this.publishToEInvoiceProvider(invoice);
    //   invoice.einvoiceTransactionId = result.transactionId;
    //   invoice.einvoiceUrl = result.url;
    // }

    return await this.invoiceRepository.save(invoice);
  }

  /**
   * Hủy hóa đơn (chỉ khi đã published)
   */
  async cancel(
    tenantId: string,
    id: string,
    cancelDto: CancelInvoiceDto,
  ): Promise<Invoice> {
    const invoice = await this.findOne(tenantId, id);

    // Check if invoice can be cancelled
    if (!invoice.canCancel) {
      throw new BadRequestException(
        `Invoice with status ${invoice.status} cannot be cancelled`,
      );
    }

    // Update status and metadata
    invoice.status = InvoiceStatus.CANCELLED;
    invoice.cancelledBy = cancelDto.cancelledBy;
    invoice.cancelledAt = new Date();
    invoice.cancelReason = cancelDto.cancelReason;
    invoice.updatedBy = cancelDto.cancelledBy;

    // TODO: Notify e-invoice provider about cancellation
    // if (invoice.einvoiceProviderId && invoice.einvoiceTransactionId) {
    //   await this.cancelEInvoice(invoice);
    // }

    return await this.invoiceRepository.save(invoice);
  }

  /**
   * Tự động sinh số hóa đơn
   * Format: {invoiceForm}/{invoiceSign}/{sequence}
   * Example: 01GTKT0/001/AA/24E/0000001
   */
  private async generateInvoiceNumber(
    tenantId: string,
    invoiceForm: string,
    invoiceSign: string,
  ): Promise<string> {
    // Get the last invoice number for this form and sign
    const lastInvoice = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.tenant_id = :tenantId', { tenantId })
      .andWhere('invoice.invoice_form = :invoiceForm', { invoiceForm })
      .andWhere('invoice.invoice_sign = :invoiceSign', { invoiceSign })
      .andWhere('invoice.invoice_number IS NOT NULL')
      .orderBy('invoice.invoice_number', 'DESC')
      .getOne();

    let sequence = 1;

    if (lastInvoice && lastInvoice.invoiceNumber) {
      // Extract sequence from last invoice number
      const parts = lastInvoice.invoiceNumber.split('/');
      const lastSequence = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    // Format sequence with leading zeros (7 digits)
    const formattedSequence = sequence.toString().padStart(7, '0');

    return `${invoiceForm}/${invoiceSign}/${formattedSequence}`;
  }

  /**
   * Xuất hóa đơn thành PDF (placeholder)
   */
  async exportPdf(_tenantId: string, _id: string): Promise<Buffer> {
    // TODO: Implement PDF generation using a library like pdfkit or puppeteer
    // For now, return a placeholder
    throw new BadRequestException('PDF export not implemented yet');
  }

  /**
   * Gửi hóa đơn qua email (placeholder)
   */
  async sendEmail(
    tenantId: string,
    id: string,
    _toEmail: string,
    _subject?: string,
    _message?: string,
  ): Promise<void> {
    const invoice = await this.findOne(tenantId, id);

    if (!invoice.isPublished) {
      throw new BadRequestException('Only published invoices can be sent via email');
    }

    // TODO: Implement email sending
    // const pdfBuffer = await this.exportPdf(tenantId, id);
    // await this.emailService.send({
    //   to: toEmail,
    //   subject: subject || `Invoice ${invoice.invoiceNumber}`,
    //   html: message || `Please find attached invoice ${invoice.invoiceNumber}`,
    //   attachments: [
    //     {
    //       filename: `invoice-${invoice.invoiceNumber}.pdf`,
    //       content: pdfBuffer,
    //     },
    //   ],
    // });

    throw new BadRequestException('Email sending not implemented yet');
  }
}
