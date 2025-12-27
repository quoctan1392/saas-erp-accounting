import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
  ) {}

  /**
   * Tạo kho mới
   */
  async create(
    tenantId: string,
    createWarehouseDto: CreateWarehouseDto,
    userId: string,
  ): Promise<Warehouse> {
    // Kiểm tra mã kho đã tồn tại chưa
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: {
        tenantId,
        code: createWarehouseDto.code,
        isDeleted: false,
      },
    });

    if (existingWarehouse) {
      throw new ConflictException(`Warehouse with code ${createWarehouseDto.code} already exists`);
    }

    // Nếu có inventoryAccountId, kiểm tra account tồn tại (TODO: validate với ChartOfAccountsService)
    if (createWarehouseDto.inventoryAccountId) {
      // TODO: Gọi ChartOfAccountsService để validate account tồn tại và là tài khoản kho (15x)
    }

    const warehouse = this.warehouseRepository.create({
      ...createWarehouseDto,
      tenantId,
      createdBy: userId,
      updatedBy: userId,
    });

    return await this.warehouseRepository.save(warehouse);
  }

  /**
   * Lấy danh sách kho với filter và pagination
   */
  async findAll(
    tenantId: string,
    isActive?: boolean,
    search?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Warehouse[]; total: number; page: number; limit: number }> {
    const query = this.warehouseRepository
      .createQueryBuilder('warehouse')
      .where('warehouse.tenantId = :tenantId', { tenantId })
      .andWhere('warehouse.isDeleted = :isDeleted', { isDeleted: false });

    if (isActive !== undefined) {
      query.andWhere('warehouse.isActive = :isActive', { isActive });
    }

    if (search) {
      query.andWhere(
        '(warehouse.code ILIKE :search OR warehouse.name ILIKE :search OR warehouse.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    query.orderBy('warehouse.code', 'ASC');

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Lấy chi tiết kho
   */
  async findOne(tenantId: string, id: string): Promise<Warehouse> {
    const warehouse = await this.warehouseRepository.findOne({
      where: {
        id,
        tenantId,
        isDeleted: false,
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with id ${id} not found`);
    }

    return warehouse;
  }

  /**
   * Cập nhật kho
   */
  async update(
    tenantId: string,
    id: string,
    updateWarehouseDto: UpdateWarehouseDto,
    userId: string,
  ): Promise<Warehouse> {
    const warehouse = await this.findOne(tenantId, id);

    // Kiểm tra mã kho nếu thay đổi
    if (updateWarehouseDto.code && updateWarehouseDto.code !== warehouse.code) {
      const existingWarehouse = await this.warehouseRepository.findOne({
        where: {
          tenantId,
          code: updateWarehouseDto.code,
          isDeleted: false,
        },
      });

      if (existingWarehouse && existingWarehouse.id !== id) {
        throw new ConflictException(`Warehouse with code ${updateWarehouseDto.code} already exists`);
      }
    }

    // Nếu có inventoryAccountId, kiểm tra account tồn tại
    if (updateWarehouseDto.inventoryAccountId) {
      // TODO: Gọi ChartOfAccountsService để validate account tồn tại và là tài khoản kho (15x)
    }

    Object.assign(warehouse, updateWarehouseDto);
    warehouse.updatedBy = userId;

    return await this.warehouseRepository.save(warehouse);
  }

  /**
   * Xóa kho (soft delete)
   */
  async remove(tenantId: string, id: string, userId: string): Promise<void> {
    const warehouse = await this.findOne(tenantId, id);

    // TODO: Kiểm tra xem kho có tồn kho không, nếu có thì không cho xóa
    // TODO: Kiểm tra xem kho có phát sinh trong các chứng từ không

    warehouse.isDeleted = true;
    warehouse.deletedAt = new Date();
    warehouse.updatedBy = userId;

    await this.warehouseRepository.save(warehouse);
  }

  /**
   * Lấy tồn kho theo kho
   * TODO: Implement khi có Inventory module
   */
  async getInventoryByWarehouse(
    tenantId: string,
    warehouseId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    // Validate warehouse exists
    await this.findOne(tenantId, warehouseId);

    // TODO: Query inventory_transactions table to calculate stock levels
    // GROUP BY itemId, SUM(quantity) where transactionType = 'in' - SUM(quantity) where transactionType = 'out'
    
    return {
      message: 'TODO: Implement when Inventory module is ready',
      warehouseId,
      data: [],
      total: 0,
      page,
      limit,
    };
  }

  /**
   * Lấy lịch sử xuất nhập kho
   * TODO: Implement khi có Inventory module
   */
  async getTransactionsByWarehouse(
    tenantId: string,
    warehouseId: string,
    itemId?: string,
    transactionType?: 'in' | 'out' | 'transfer',
    fromDate?: Date,
    toDate?: Date,
    page: number = 1,
    limit: number = 20,
  ): Promise<any> {
    // Validate warehouse exists
    await this.findOne(tenantId, warehouseId);

    // TODO: Query inventory_transactions table with filters
    
    return {
      message: 'TODO: Implement when Inventory module is ready',
      warehouseId,
      filters: {
        itemId,
        transactionType,
        fromDate,
        toDate,
      },
      data: [],
      total: 0,
      page,
      limit,
    };
  }
}
