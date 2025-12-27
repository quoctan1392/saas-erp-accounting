import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Item } from './entities/item.entity';
import { ItemCategory } from './entities/item-category.entity';
import { Unit } from './entities/unit.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateItemCategoryDto } from './dto/create-item-category.dto';
import { UpdateItemCategoryDto } from './dto/update-item-category.dto';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationDto, PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(ItemCategory)
    private categoryRepository: Repository<ItemCategory>,
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  // ==================== ITEMS ====================
  async findAllItems(
    tenantId: string,
    paginationDto: PaginationDto,
    filters?: {
      type?: string;
      categoryId?: string;
      isActive?: boolean;
    },
  ): Promise<PaginationResponseDto<Item>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const p = page ?? 1;
    const l = limit ?? 20;
    const skip = (p - 1) * l;

    const where: FindOptionsWhere<Item> = {
      tenantId,
      isDeleted: false,
    };

    if (filters?.type) {
      where.type = filters.type as any;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .where(where);

    if (search) {
      queryBuilder.andWhere(
        '(item.code ILIKE :search OR item.name ILIKE :search OR item.barcode ILIKE :search OR item.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Filter by category
    if (filters?.categoryId) {
      queryBuilder.andWhere(
        ':categoryId = ANY(item.listItemCategoryId)',
        { categoryId: filters.categoryId },
      );
    }

    const [items, total] = await queryBuilder
      .leftJoinAndSelect('item.unit', 'unit')
      .skip(skip)
      .take(l)
      .orderBy(
        sortBy ? `item.${sortBy}` : 'item.createdAt',
        sortOrder || 'DESC',
      )
      .getManyAndCount();

    return new PaginationResponseDto(items, total, p, l);
  }

  async findOneItem(id: string, tenantId: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id, tenantId, isDeleted: false },
      relations: ['unit'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async createItem(
    tenantId: string,
    userId: string,
    dto: CreateItemDto,
  ): Promise<Item> {
    // Check if code already exists
    const existing = await this.itemRepository.findOne({
      where: { tenantId, code: dto.code, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Item code already exists');
    }

    // Validate unit exists
    const unit = await this.unitRepository.findOne({
      where: { id: dto.unitId, tenantId, isDeleted: false },
    });

    if (!unit) {
      throw new BadRequestException('Unit not found');
    }

    // Validate categories if provided
    if (dto.listItemCategoryId && dto.listItemCategoryId.length > 0) {
      const categories = await this.categoryRepository.find({
        where: {
          id: In(dto.listItemCategoryId),
          tenantId,
          isDeleted: false,
        },
      });

      if (categories.length !== dto.listItemCategoryId.length) {
        throw new BadRequestException('One or more categories not found');
      }
    }

    const item = this.itemRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.itemRepository.save(item);
  }

  async updateItem(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateItemDto,
  ): Promise<Item> {
    const item = await this.findOneItem(id, tenantId);

    // Check if code is being changed and if it conflicts
    if (dto.code && dto.code !== item.code) {
      const existing = await this.itemRepository.findOne({
        where: { tenantId, code: dto.code, isDeleted: false },
      });

      if (existing) {
        throw new ConflictException('Item code already exists');
      }
    }

    // Validate unit if changed
    if (dto.unitId && dto.unitId !== item.unitId) {
      const unit = await this.unitRepository.findOne({
        where: { id: dto.unitId, tenantId, isDeleted: false },
      });

      if (!unit) {
        throw new BadRequestException('Unit not found');
      }
    }

    // Validate categories if changed
    if (dto.listItemCategoryId && dto.listItemCategoryId.length > 0) {
      const categories = await this.categoryRepository.find({
        where: {
          id: In(dto.listItemCategoryId),
          tenantId,
          isDeleted: false,
        },
      });

      if (categories.length !== dto.listItemCategoryId.length) {
        throw new BadRequestException('One or more categories not found');
      }
    }

    Object.assign(item, dto);
    item.updatedBy = userId;

    return this.itemRepository.save(item);
  }

  async deleteItem(id: string, tenantId: string, userId: string): Promise<void> {
    const item = await this.findOneItem(id, tenantId);

    // TODO: Check if item has transactions (sales, purchases, inventory)
    // For now, we allow soft delete

    item.isDeleted = true;
    item.deletedAt = new Date();
    item.updatedBy = userId;

    await this.itemRepository.save(item);
  }

  // ==================== CATEGORIES ====================
  async findAllCategories(tenantId: string): Promise<ItemCategory[]> {
    return this.categoryRepository.find({
      where: { tenantId, isDeleted: false },
      order: { sortOrder: 'ASC', code: 'ASC' },
    });
  }

  async findOneCategory(id: string, tenantId: string): Promise<ItemCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async createCategory(
    tenantId: string,
    userId: string,
    dto: CreateItemCategoryDto,
  ): Promise<ItemCategory> {
    const existing = await this.categoryRepository.findOne({
      where: { tenantId, code: dto.code, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Category code already exists');
    }

    // Validate parent if provided
    if (dto.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId, tenantId, isDeleted: false },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    const category = this.categoryRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.categoryRepository.save(category);
  }

  async updateCategory(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateItemCategoryDto,
  ): Promise<ItemCategory> {
    const category = await this.findOneCategory(id, tenantId);

    // Check if code is being changed and if it conflicts
    if (dto.code && dto.code !== category.code) {
      const existing = await this.categoryRepository.findOne({
        where: { tenantId, code: dto.code, isDeleted: false },
      });

      if (existing) {
        throw new ConflictException('Category code already exists');
      }
    }

    // Validate parent if changed
    if (dto.parentId && dto.parentId !== category.parentId) {
      // Prevent circular reference
      if (dto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parent = await this.categoryRepository.findOne({
        where: { id: dto.parentId, tenantId, isDeleted: false },
      });

      if (!parent) {
        throw new BadRequestException('Parent category not found');
      }
    }

    Object.assign(category, dto);
    category.updatedBy = userId;

    return this.categoryRepository.save(category);
  }

  async deleteCategory(
    id: string,
    tenantId: string,
    userId: string,
  ): Promise<void> {
    const category = await this.findOneCategory(id, tenantId);

    // Check if category has items
    const itemCount = await this.itemRepository
      .createQueryBuilder('item')
      .where('item.tenantId = :tenantId', { tenantId })
      .andWhere(':categoryId = ANY(item.listItemCategoryId)', { categoryId: id })
      .andWhere('item.isDeleted = false')
      .getCount();

    if (itemCount > 0) {
      throw new ConflictException('Cannot delete category with items');
    }

    // Check if category has children
    const childCount = await this.categoryRepository.count({
      where: { tenantId, parentId: id, isDeleted: false },
    });

    if (childCount > 0) {
      throw new ConflictException('Cannot delete category with sub-categories');
    }

    category.isDeleted = true;
    category.deletedAt = new Date();
    category.updatedBy = userId;

    await this.categoryRepository.save(category);
  }

  // ==================== UNITS ====================
  async findAllUnits(tenantId: string): Promise<Unit[]> {
    return this.unitRepository.find({
      where: { tenantId, isDeleted: false },
      order: { code: 'ASC' },
    });
  }

  async findOneUnit(id: string, tenantId: string): Promise<Unit> {
    const unit = await this.unitRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }

  async createUnit(
    tenantId: string,
    userId: string,
    dto: CreateUnitDto,
  ): Promise<Unit> {
    const existing = await this.unitRepository.findOne({
      where: { tenantId, code: dto.code, isDeleted: false },
    });

    if (existing) {
      throw new ConflictException('Unit code already exists');
    }

    const unit = this.unitRepository.create({
      ...dto,
      tenantId,
      createdBy: userId,
    });

    return this.unitRepository.save(unit);
  }

  async updateUnit(
    id: string,
    tenantId: string,
    userId: string,
    dto: UpdateUnitDto,
  ): Promise<Unit> {
    const unit = await this.findOneUnit(id, tenantId);

    // Check if code is being changed and if it conflicts
    if (dto.code && dto.code !== unit.code) {
      const existing = await this.unitRepository.findOne({
        where: { tenantId, code: dto.code, isDeleted: false },
      });

      if (existing) {
        throw new ConflictException('Unit code already exists');
      }
    }

    Object.assign(unit, dto);
    unit.updatedBy = userId;

    return this.unitRepository.save(unit);
  }

  async deleteUnit(id: string, tenantId: string, userId: string): Promise<void> {
    const unit = await this.findOneUnit(id, tenantId);

    // Check if unit is being used by items
    const itemCount = await this.itemRepository.count({
      where: { tenantId, unitId: id, isDeleted: false },
    });

    if (itemCount > 0) {
      throw new ConflictException('Cannot delete unit being used by items');
    }

    unit.isDeleted = true;
    unit.deletedAt = new Date();
    unit.updatedBy = userId;

    await this.unitRepository.save(unit);
  }
}
