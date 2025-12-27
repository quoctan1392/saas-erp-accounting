import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
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
    const skip = (page - 1) * limit;

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

    const queryBuilder = this.accountingObjectRepository.createQueryBuilder('object').where(where);

    if (search) {
      queryBuilder.andWhere(
        '(object.accountObjectCode ILIKE :search OR object.accountObjectName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [objects, total] = await queryBuilder
      .leftJoinAndSelect('object.subjectGroup', 'subjectGroup')
      .skip(skip)
      .take(limit)
      .orderBy(sortBy ? `object.${sortBy}` : 'object.createdAt', sortOrder || 'DESC')
      .getManyAndCount();

    return new PaginationResponseDto(objects, total, page, limit);
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

  /**
   * Generate next available object code
   * Pattern: KH0001, KH0002, ..., KH9999, KH10000, ...
   * Maintains character count consistency until exceeding 9999
   */
  async getNextObjectCode(
    tenantId: string,
    type: 'customer' | 'vendor' | 'employee',
  ): Promise<string> {
    // Determine prefix based on type
    const prefixMap = {
      customer: 'KH',
      vendor: 'NCC',
      employee: 'NV',
    };
    const prefix = prefixMap[type];

    // Build where clause based on type
    const where: FindOptionsWhere<AccountingObject> = {
      tenantId,
      isDeleted: false,
    };

    if (type === 'customer') {
      where.isCustomer = true;
    } else if (type === 'vendor') {
      where.isVendor = true;
    } else if (type === 'employee') {
      where.isEmployee = true;
    }

    // Get all codes with this prefix, ordered by code
    const objects = await this.accountingObjectRepository.find({
      where,
      order: { accountObjectCode: 'DESC' },
      select: ['accountObjectCode'],
    });

    if (objects.length === 0) {
      // First object: KH0001, NCC0001, or NV0001
      return `${prefix}0001`;
    }

    // Extract numeric parts from codes with matching prefix
    const numbers = objects
      .map((obj) => obj.accountObjectCode)
      .filter((code) => code.startsWith(prefix))
      .map((code) => {
        const numStr = code.substring(prefix.length);
        const num = parseInt(numStr, 10);
        return isNaN(num) ? 0 : num;
      })
      .filter((num) => num > 0);

    if (numbers.length === 0) {
      return `${prefix}0001`;
    }

    // Find the maximum number
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;

    // Determine padding: keep 4 digits until exceeding 9999
    let paddingLength = 4;
    if (nextNumber > 9999) {
      paddingLength = nextNumber.toString().length;
    }

    // Pad with zeros
    const paddedNumber = nextNumber.toString().padStart(paddingLength, '0');
    return `${prefix}${paddedNumber}`;
  }
}
