import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AccountingObject } from './entities/accounting-object.entity';
import { SubjectGroup } from './entities/subject-group.entity';
import { CreateAccountingObjectDto } from './dto/create-accounting-object.dto';
import { UpdateAccountingObjectDto } from './dto/update-accounting-object.dto';
import { CreateSubjectGroupDto } from './dto/create-subject-group.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class AccountingObjectsService {
  constructor(
    @InjectRepository(AccountingObject)
    private accountingObjectRepository: Repository<AccountingObject>,
    @InjectRepository(SubjectGroup)
    private subjectGroupRepository: Repository<SubjectGroup>,
  ) {}

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
    filters?: {
      type?: 'customer' | 'vendor' | 'employee';
      isActive?: boolean;
    },
  ): Promise<PaginationResponseDto<AccountingObject>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const p = page ?? 1;
    const l = limit ?? 20;
    const skip = (p - 1) * l;

    const where: FindOptionsWhere<AccountingObject> = {
      tenantId,
      isDeleted: false,
    };

    if (filters?.type === 'customer') {
      where.isCustomer = true;
    } else if (filters?.type === 'vendor') {
      where.isVendor = true;
    } else if (filters?.type === 'employee') {
      where.isEmployee = true;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const queryBuilder = this.accountingObjectRepository
      .createQueryBuilder('object')
      .where(where);

    if (search) {
      queryBuilder.andWhere(
        '(object.accountObjectCode ILIKE :search OR object.accountObjectName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [objects, total] = await queryBuilder
      .leftJoinAndSelect('object.subjectGroup', 'subjectGroup')
      .skip(skip)
      .take(l)
      .orderBy(
        sortBy ? `object.${sortBy}` : 'object.createdAt',
        sortOrder || 'DESC',
      )
      .getManyAndCount();

    return new PaginationResponseDto(objects, total, p, l);
  }

  async findOne(id: string, tenantId: string): Promise<AccountingObject> {
    const object = await this.accountingObjectRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['subjectGroup'],
    });

    if (!object) {
      throw new NotFoundException('Accounting object not found');
    }

    return object;
  }

  async create(
    tenantId: string,
    userId: string,
    dto: CreateAccountingObjectDto,
  ): Promise<AccountingObject> {
    // Check if code already exists
    const existing = await this.accountingObjectRepository.findOne({
      where: { tenantId, accountObjectCode: dto.accountObjectCode, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Object code already exists');
    }

    const object = this.accountingObjectRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.accountingObjectRepository.save(object);
  }

  async update(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateAccountingObjectDto,
  ): Promise<AccountingObject> {
    const object = await this.findOne(id, tenantId);

    // Check if code is being changed and if it conflicts
    if (dto.accountObjectCode && dto.accountObjectCode !== object.accountObjectCode) {
      const existing = await this.accountingObjectRepository.findOne({
        where: { tenantId, accountObjectCode: dto.accountObjectCode, isDeleted: false },
      });

      if (existing) {
        throw new ConflictException('Object code already exists');
      }
    }

    Object.assign(object, dto);
    object.updatedBy = userId;

    return this.accountingObjectRepository.save(object);
  }

  async delete(id: string, tenantId: string, userId: string): Promise<void> {
    const object = await this.findOne(id, tenantId);

    object.isDeleted = true;
    object.deletedAt = new Date();
    object.updatedBy = userId;

    await this.accountingObjectRepository.save(object);
  }

  // Subject Group methods
  async findAllGroups(tenantId: string): Promise<SubjectGroup[]> {
    return this.subjectGroupRepository.find({
      where: { tenantId, isDeleted: false },
      order: { code: 'ASC' },
    });
  }

  async createGroup(
    tenantId: string,
    userId: string,
    dto: CreateSubjectGroupDto,
  ): Promise<SubjectGroup> {
    const existing = await this.subjectGroupRepository.findOne({
      where: { tenantId, code: dto.code, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Group code already exists');
    }

    const group = this.subjectGroupRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.subjectGroupRepository.save(group);
  }

  async updateGroup(
    id: string,
    tenantId: string,
    userId: string,
    dto: Partial<CreateSubjectGroupDto>,
  ): Promise<SubjectGroup> {
    const group = await this.subjectGroupRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    Object.assign(group, dto);
    group.updatedBy = userId;

    return this.subjectGroupRepository.save(group);
  }

  async deleteGroup(id: string, tenantId: string, userId: string): Promise<void> {
    const group = await this.subjectGroupRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Check if group has objects
    const objectCount = await this.accountingObjectRepository.count({
      where: { tenantId, subjectGroupId: id, isDeleted: false },
    });

    if (objectCount > 0) {
      throw new ConflictException('Cannot delete group with objects');
    }

    group.isDeleted = true;
    group.deletedAt = new Date();
    group.updatedBy = userId;

    await this.subjectGroupRepository.save(group);
  }

  // Get next code for customer/vendor
  async getNextCode(tenantId: string, type: 'customer' | 'vendor'): Promise<string> {
    const prefix = type === 'customer' ? 'KH' : 'NCC';
    const whereCondition = type === 'customer' ? { isCustomer: true } : { isVendor: true };

    // Find the latest code with the prefix
    const latestObject = await this.accountingObjectRepository
      .createQueryBuilder('object')
      .where('object.tenantId = :tenantId', { tenantId })
      .andWhere('object.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('object.accountObjectCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('object.accountObjectCode', 'DESC')
      .getOne();

    if (!latestObject) {
      return `${prefix}00001`;
    }

    // Extract number from code
    const codeNumber = parseInt(latestObject.accountObjectCode.replace(prefix, ''), 10);
    const nextNumber = (codeNumber + 1).toString().padStart(5, '0');
    return `${prefix}${nextNumber}`;
  }
}
