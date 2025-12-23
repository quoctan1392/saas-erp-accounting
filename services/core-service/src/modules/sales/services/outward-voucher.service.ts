import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OutwardVoucher } from '../entities/outward-voucher.entity';
import { OutwardVoucherDetail } from '../entities/outward-voucher-detail.entity';
import { CreateOutwardVoucherDto } from '../dto/create-outward-voucher.dto';
import { UpdateOutwardVoucherDto } from '../dto/update-outward-voucher.dto';

@Injectable()
export class OutwardVoucherService {
  constructor(
    @InjectRepository(OutwardVoucher)
    private readonly outwardVoucherRepository: Repository<OutwardVoucher>,
    @InjectRepository(OutwardVoucherDetail)
    private readonly outwardVoucherDetailRepository: Repository<OutwardVoucherDetail>,
  ) {}

  async create(
    createDto: CreateOutwardVoucherDto,
    tenantId: string,
    userId: string,
  ): Promise<OutwardVoucher> {
    const outwardVoucher = this.outwardVoucherRepository.create({
      ...createDto,
      tenantId,
      createdBy: userId,
      status: 'draft',
    });

    return await this.outwardVoucherRepository.save(outwardVoucher);
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
  ): Promise<{ data: OutwardVoucher[]; total: number; page: number; limit: number }> {
    const { status, fromDate, toDate, page = 1, limit = 20 } = query;

    const queryBuilder = this.outwardVoucherRepository
      .createQueryBuilder('ov')
      .where('ov.tenantId = :tenantId', { tenantId })
      .leftJoinAndSelect('ov.details', 'details')
      .orderBy('ov.transactionDate', 'DESC')
      .addOrderBy('ov.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('ov.status = :status', { status });
    }

    if (fromDate) {
      queryBuilder.andWhere('ov.transactionDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('ov.transactionDate <= :toDate', { toDate });
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

  async findOne(id: string, tenantId: string): Promise<OutwardVoucher> {
    const outwardVoucher = await this.outwardVoucherRepository.findOne({
      where: { id, tenantId },
      relations: ['details'],
    });

    if (!outwardVoucher) {
      throw new NotFoundException(`Outward voucher with ID ${id} not found`);
    }

    return outwardVoucher;
  }

  async update(
    id: string,
    updateDto: UpdateOutwardVoucherDto,
    tenantId: string,
    userId: string,
  ): Promise<OutwardVoucher> {
    const outwardVoucher = await this.findOne(id, tenantId);

    if (outwardVoucher.status === 'posted') {
      throw new BadRequestException('Cannot update a posted outward voucher');
    }

    // Remove old details
    if (updateDto.details) {
      await this.outwardVoucherDetailRepository.delete({ outwardVoucherId: id });
    }

    Object.assign(outwardVoucher, updateDto);
    outwardVoucher.updatedBy = userId;

    return await this.outwardVoucherRepository.save(outwardVoucher);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const outwardVoucher = await this.findOne(id, tenantId);

    if (outwardVoucher.status === 'posted') {
      throw new BadRequestException('Cannot delete a posted outward voucher');
    }

    await this.outwardVoucherRepository.remove(outwardVoucher);
  }

  async post(id: string, tenantId: string, userId: string): Promise<OutwardVoucher> {
    const outwardVoucher = await this.findOne(id, tenantId);

    if (outwardVoucher.status === 'posted') {
      throw new BadRequestException('Outward voucher is already posted');
    }

    outwardVoucher.status = 'posted';
    outwardVoucher.postedDate = new Date();
    outwardVoucher.updatedBy = userId;

    // TODO: Create inventory transactions (reduce stock)
    // TODO: Create accounting entries
    // TODO: Publish event: inventory.out

    return await this.outwardVoucherRepository.save(outwardVoucher);
  }
}
