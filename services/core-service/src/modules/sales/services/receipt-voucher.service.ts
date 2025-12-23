import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReceiptVoucher } from '../entities/receipt-voucher.entity';
import { ReceiptVoucherDetail } from '../entities/receipt-voucher-detail.entity';
import { CreateReceiptVoucherDto } from '../dto/create-receipt-voucher.dto';
import { UpdateReceiptVoucherDto } from '../dto/update-receipt-voucher.dto';

@Injectable()
export class ReceiptVoucherService {
  constructor(
    @InjectRepository(ReceiptVoucher)
    private readonly receiptVoucherRepository: Repository<ReceiptVoucher>,
    @InjectRepository(ReceiptVoucherDetail)
    private readonly receiptVoucherDetailRepository: Repository<ReceiptVoucherDetail>,
  ) {}

  async create(
    createDto: CreateReceiptVoucherDto,
    tenantId: string,
    userId: string,
  ): Promise<ReceiptVoucher> {
    const receiptVoucher = this.receiptVoucherRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
      status: 'draft',
    });

    return await this.receiptVoucherRepository.save(receiptVoucher);
  }

  async findAll(
    tenantId: string,
    query: {
      status?: string;
      fromDate?: string;
      toDate?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: ReceiptVoucher[]; total: number; page: number; limit: number }> {
    const { status, fromDate, toDate, page = 1, limit = 20 } = query;

    const queryBuilder = this.receiptVoucherRepository
      .createQueryBuilder('rv')
      .where('rv.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('rv.details', 'details')
      .orderBy('rv.transactionDate', 'DESC')
      .addOrderBy('rv.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('rv.status = :status', { status });
    }

    if (fromDate) {
      queryBuilder.andWhere('rv.transactionDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('rv.transactionDate <= :toDate', { toDate });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findOne(id: string, tenantId: string): Promise<ReceiptVoucher> {
    const receiptVoucher = await this.receiptVoucherRepository.findOne({
      where: { id, tenantId },
      relations: ['details'],
    });

    if (!receiptVoucher) {
      throw new NotFoundException(`Receipt voucher with ID ${id} not found`);
    }

    return receiptVoucher;
  }

  async update(
    id: string,
    updateDto: UpdateReceiptVoucherDto,
    tenantId: string,
    userId: string,
  ): Promise<ReceiptVoucher> {
    const receiptVoucher = await this.findOne(id, tenantId);

    if (receiptVoucher.status === 'posted') {
      throw new BadRequestException('Cannot update a posted receipt voucher');
    }

    // Remove old details
    if (updateDto.details) {
      await this.receiptVoucherDetailRepository.delete({ receiptVoucherId: id });
    }

    Object.assign(receiptVoucher, updateDto);
    receiptVoucher.updatedBy = userId;

    return await this.receiptVoucherRepository.save(receiptVoucher);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const receiptVoucher = await this.findOne(id, tenantId);

    if (receiptVoucher.status === 'posted') {
      throw new BadRequestException('Cannot delete a posted receipt voucher');
    }

    await this.receiptVoucherRepository.remove(receiptVoucher);
  }

  async post(id: string, tenantId: string, userId: string): Promise<ReceiptVoucher> {
    const receiptVoucher = await this.findOne(id, tenantId);

    if (receiptVoucher.status === 'posted') {
      throw new BadRequestException('Receipt voucher is already posted');
    }

    receiptVoucher.status = 'posted';
    receiptVoucher.postedDate = new Date();
    receiptVoucher.updatedBy = userId;

    // TODO: Create accounting entries
    // TODO: Update customer balance (reduce debt)
    // TODO: Publish event: payment.received

    return await this.receiptVoucherRepository.save(receiptVoucher);
  }
}
