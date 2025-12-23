import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleVoucher } from '../entities/sale-voucher.entity';
import { SaleVoucherDetail } from '../entities/sale-voucher-detail.entity';
import { CreateSaleVoucherDto } from '../dto/create-sale-voucher.dto';
import { UpdateSaleVoucherDto } from '../dto/update-sale-voucher.dto';

@Injectable()
export class SaleVoucherService {
  constructor(
    @InjectRepository(SaleVoucher)
    private readonly saleVoucherRepository: Repository<SaleVoucher>,
    @InjectRepository(SaleVoucherDetail)
    private readonly saleVoucherDetailRepository: Repository<SaleVoucherDetail>,
  ) {}

  async create(
    createDto: CreateSaleVoucherDto,
    tenantId: string,
    userId: string,
  ): Promise<SaleVoucher> {
    const saleVoucher = this.saleVoucherRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
      status: 'draft',
    });

    return await this.saleVoucherRepository.save(saleVoucher);
  }

  async findAll(
    tenantId: string,
    query: {
      status?: string;
      fromDate?: string;
      toDate?: string;
      objectId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: SaleVoucher[]; total: number; page: number; limit: number }> {
    const { status, fromDate, toDate, objectId, page = 1, limit = 20 } = query;

    const queryBuilder = this.saleVoucherRepository
      .createQueryBuilder('sv')
      .where('sv.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('sv.details', 'details')
      .orderBy('sv.transactionDate', 'DESC')
      .addOrderBy('sv.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('sv.status = :status', { status });
    }

    if (fromDate) {
      queryBuilder.andWhere('sv.transactionDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('sv.transactionDate <= :toDate', { toDate });
    }

    if (objectId) {
      queryBuilder.andWhere('sv.accountObjectId = :objectId', { objectId });
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

  async findOne(id: string, tenantId: string): Promise<SaleVoucher> {
    const saleVoucher = await this.saleVoucherRepository.findOne({
      where: { id, tenantId },
      relations: ['details'],
    });

    if (!saleVoucher) {
      throw new NotFoundException(`Sale voucher with ID ${id} not found`);
    }

    return saleVoucher;
  }

  async update(
    id: string,
    updateDto: UpdateSaleVoucherDto,
    tenantId: string,
    userId: string,
  ): Promise<SaleVoucher> {
    const saleVoucher = await this.findOne(id, tenantId);

    if (saleVoucher.status === 'posted') {
      throw new BadRequestException('Cannot update a posted sale voucher');
    }

    // Remove old details
    if (updateDto.details) {
      await this.saleVoucherDetailRepository.delete({ saleVoucherId: id });
    }

    Object.assign(saleVoucher, updateDto);
    saleVoucher.updatedBy = userId;

    return await this.saleVoucherRepository.save(saleVoucher);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const saleVoucher = await this.findOne(id, tenantId);

    if (saleVoucher.status === 'posted') {
      throw new BadRequestException('Cannot delete a posted sale voucher');
    }

    await this.saleVoucherRepository.remove(saleVoucher);
  }

  async post(id: string, tenantId: string, userId: string): Promise<SaleVoucher> {
    const saleVoucher = await this.findOne(id, tenantId);

    if (saleVoucher.status === 'posted') {
      throw new BadRequestException('Sale voucher is already posted');
    }

    saleVoucher.status = 'posted';
    saleVoucher.postedDate = new Date();
    saleVoucher.updatedBy = userId;

    // TODO: Create accounting entries (journal entries)
    // TODO: If isSaleWithOutward, create outward voucher
    // TODO: If isSaleWithInvoice, create invoice
    // TODO: Publish event: sale.created, sale.posted

    return await this.saleVoucherRepository.save(saleVoucher);
  }
}
