import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, In } from 'typeorm';
import { InventoryTransaction, TransactionType } from './entities/inventory-transaction.entity';
import { StockLevelView } from './entities/stock-level.view';
import { Item } from '../items/entities/item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateInventoryTransactionDto } from './dto/create-inventory-transaction.dto';
import { QueryInventoryTransactionDto } from './dto/query-inventory-transaction.dto';
import { QueryStockLevelDto } from './dto/query-stock-level.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { TransferInventoryDto } from './dto/transfer-inventory.dto';
import { PaginationResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryTransaction)
    private inventoryTransactionRepository: Repository<InventoryTransaction>,
    @InjectRepository(StockLevelView)
    private stockLevelViewRepository: Repository<StockLevelView>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  // ==================== INVENTORY TRANSACTIONS ====================
  
  async findAllTransactions(
    tenantId: string,
    queryDto: QueryInventoryTransactionDto,
  ): Promise<PaginationResponseDto<InventoryTransaction>> {
    const { page = 1, limit = 20, warehouseId, itemId, transactionType, fromDate, toDate } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<InventoryTransaction> = {
      tenantId,
      isDeleted: false,
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (itemId) {
      where.itemId = itemId;
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (fromDate && toDate) {
      where.transactionDate = Between(fromDate, toDate);
    } else if (fromDate) {
      where.transactionDate = Between(fromDate, new Date());
    }

    const [transactions, total] = await this.inventoryTransactionRepository.findAndCount({
      where,
      relations: ['item', 'warehouse', 'targetWarehouse'],
      skip,
      take: limit,
      order: {
        transactionDate: 'DESC',
        createdAt: 'DESC',
      },
    });

    return new PaginationResponseDto(transactions, total, page, limit);
  }

  async createTransaction(
    tenantId: string,
    createDto: CreateInventoryTransactionDto,
  ): Promise<InventoryTransaction> {
    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { id: createDto.itemId, tenantId, isDeleted: false },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${createDto.itemId} not found`);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findOne({
      where: { id: createDto.warehouseId, tenantId, isDeleted: false },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${createDto.warehouseId} not found`);
    }

    // Validate target warehouse for transfer
    if (createDto.transactionType === TransactionType.TRANSFER) {
      if (!createDto.targetWarehouseId) {
        throw new BadRequestException('Target warehouse is required for transfer transaction');
      }

      const targetWarehouse = await this.warehouseRepository.findOne({
        where: { id: createDto.targetWarehouseId, tenantId, isDeleted: false },
      });

      if (!targetWarehouse) {
        throw new NotFoundException(`Target warehouse with ID ${createDto.targetWarehouseId} not found`);
      }

      if (createDto.warehouseId === createDto.targetWarehouseId) {
        throw new BadRequestException('Source and target warehouses must be different');
      }
    }

    // For OUT transactions, check available stock
    if (createDto.transactionType === TransactionType.OUT) {
      const stockLevel = await this.getStockLevel(tenantId, createDto.itemId, createDto.warehouseId);
      if (stockLevel && stockLevel.quantityAvailable < createDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${stockLevel.quantityAvailable}, Requested: ${createDto.quantity}`
        );
      }
    }

    // Create transaction
    const transaction = this.inventoryTransactionRepository.create({
      ...createDto,
      tenantId,
      status: 'draft',
    });

    return await this.inventoryTransactionRepository.save(transaction);
  }

  async postTransaction(tenantId: string, id: string): Promise<InventoryTransaction> {
    const transaction = await this.inventoryTransactionRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.status === 'posted') {
      throw new BadRequestException('Transaction is already posted');
    }

    // For OUT transactions, check available stock again before posting
    if (transaction.transactionType === TransactionType.OUT) {
      const stockLevel = await this.getStockLevel(tenantId, transaction.itemId, transaction.warehouseId);
      if (stockLevel && stockLevel.quantityAvailable < transaction.quantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${stockLevel.quantityAvailable}, Requested: ${transaction.quantity}`
        );
      }
    }

    transaction.status = 'posted';
    transaction.postedDate = new Date();

    return await this.inventoryTransactionRepository.save(transaction);
  }

  async deleteTransaction(tenantId: string, id: string): Promise<void> {
    const transaction = await this.inventoryTransactionRepository.findOne({
      where: { id, tenantId, isDeleted: false },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (transaction.status === 'posted') {
      throw new BadRequestException('Cannot delete posted transaction');
    }

    transaction.isDeleted = true;
    await this.inventoryTransactionRepository.save(transaction);
  }

  // ==================== STOCK LEVELS ====================

  async findAllStockLevels(
    tenantId: string,
    queryDto: QueryStockLevelDto,
  ): Promise<PaginationResponseDto<StockLevelView>> {
    const { page = 1, limit = 20, warehouseId, itemId } = queryDto;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<StockLevelView> = {
      tenantId,
    };

    if (warehouseId) {
      where.warehouseId = warehouseId;
    }

    if (itemId) {
      where.itemId = itemId;
    }

    const [stockLevels, total] = await this.stockLevelViewRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: {
        itemCode: 'ASC',
      },
    });

    return new PaginationResponseDto(stockLevels, total, page, limit);
  }

  async getStockLevelByItem(
    tenantId: string,
    itemId: string,
  ): Promise<StockLevelView[]> {
    return await this.stockLevelViewRepository.find({
      where: {
        tenantId,
        itemId,
      },
      order: {
        warehouseName: 'ASC',
      },
    });
  }

  async getStockLevel(
    tenantId: string,
    itemId: string,
    warehouseId: string,
  ): Promise<StockLevelView | null> {
    return await this.stockLevelViewRepository.findOne({
      where: {
        tenantId,
        itemId,
        warehouseId,
      },
    });
  }

  async findLowStock(
    tenantId: string,
  ): Promise<any[]> {
    // Get stock levels
    const stockLevels = await this.stockLevelViewRepository.find({
      where: { tenantId },
    });

    // Get items with minimum stock settings
    const itemIds = [...new Set(stockLevels.map(sl => sl.itemId))];
    const items = await this.itemRepository.find({
      where: {
        id: In(itemIds),
        tenantId,
        isDeleted: false,
      },
    });

    const itemsMap = new Map(items.map(item => [item.id, item]));

    // Filter low stock items
    const lowStockItems = stockLevels
      .filter(stockLevel => {
        const item = itemsMap.get(stockLevel.itemId);
        return item && stockLevel.quantityOnHand < item.minimumStock;
      })
      .map(stockLevel => {
        const item = itemsMap.get(stockLevel.itemId);
        return {
          ...stockLevel,
          minimumStock: item?.minimumStock || 0,
          deficit: item ? item.minimumStock - stockLevel.quantityOnHand : 0,
        };
      });

    return lowStockItems;
  }

  // ==================== INVENTORY OPERATIONS ====================

  async adjustInventory(
    tenantId: string,
    adjustDto: AdjustInventoryDto,
  ): Promise<InventoryTransaction> {
    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { id: adjustDto.itemId, tenantId, isDeleted: false },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${adjustDto.itemId} not found`);
    }

    // Validate warehouse exists
    const warehouse = await this.warehouseRepository.findOne({
      where: { id: adjustDto.warehouseId, tenantId, isDeleted: false },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID ${adjustDto.warehouseId} not found`);
    }

    // Generate transaction number
    const transactionNo = await this.generateTransactionNo(tenantId, 'ADJ');

    // Create adjustment transaction
    const transaction = this.inventoryTransactionRepository.create({
      tenantId,
      itemId: adjustDto.itemId,
      warehouseId: adjustDto.warehouseId,
      transactionType: TransactionType.ADJUST,
      transactionNo,
      transactionDate: new Date(),
      quantity: adjustDto.adjustmentQuantity,
      unitPrice: adjustDto.unitPrice,
      amount: adjustDto.adjustmentQuantity * adjustDto.unitPrice,
      description: adjustDto.reason,
      status: 'posted',
      postedDate: new Date(),
    });

    return await this.inventoryTransactionRepository.save(transaction);
  }

  async transferInventory(
    tenantId: string,
    transferDto: TransferInventoryDto,
  ): Promise<InventoryTransaction[]> {
    // Validate item exists
    const item = await this.itemRepository.findOne({
      where: { id: transferDto.itemId, tenantId, isDeleted: false },
    });

    if (!item) {
      throw new NotFoundException(`Item with ID ${transferDto.itemId} not found`);
    }

    // Validate from warehouse
    const fromWarehouse = await this.warehouseRepository.findOne({
      where: { id: transferDto.fromWarehouseId, tenantId, isDeleted: false },
    });

    if (!fromWarehouse) {
      throw new NotFoundException(`Source warehouse with ID ${transferDto.fromWarehouseId} not found`);
    }

    // Validate to warehouse
    const toWarehouse = await this.warehouseRepository.findOne({
      where: { id: transferDto.toWarehouseId, tenantId, isDeleted: false },
    });

    if (!toWarehouse) {
      throw new NotFoundException(`Target warehouse with ID ${transferDto.toWarehouseId} not found`);
    }

    if (transferDto.fromWarehouseId === transferDto.toWarehouseId) {
      throw new BadRequestException('Source and target warehouses must be different');
    }

    // Check available stock
    const stockLevel = await this.getStockLevel(tenantId, transferDto.itemId, transferDto.fromWarehouseId);
    if (stockLevel && stockLevel.quantityAvailable < transferDto.quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${stockLevel.quantityAvailable}, Requested: ${transferDto.quantity}`
      );
    }

    // Generate transaction number
    const transactionNo = await this.generateTransactionNo(tenantId, 'TRF');

    // Create OUT transaction from source warehouse
    const outTransaction = this.inventoryTransactionRepository.create({
      tenantId,
      itemId: transferDto.itemId,
      warehouseId: transferDto.fromWarehouseId,
      targetWarehouseId: transferDto.toWarehouseId,
      transactionType: TransactionType.TRANSFER,
      transactionNo,
      transactionDate: new Date(),
      quantity: -transferDto.quantity, // Negative for OUT
      unitPrice: transferDto.unitPrice,
      amount: transferDto.quantity * transferDto.unitPrice,
      description: transferDto.reason,
      status: 'posted',
      postedDate: new Date(),
    });

    // Create IN transaction to target warehouse
    const inTransaction = this.inventoryTransactionRepository.create({
      tenantId,
      itemId: transferDto.itemId,
      warehouseId: transferDto.toWarehouseId,
      targetWarehouseId: transferDto.fromWarehouseId,
      transactionType: TransactionType.TRANSFER,
      transactionNo,
      transactionDate: new Date(),
      quantity: transferDto.quantity, // Positive for IN
      unitPrice: transferDto.unitPrice,
      amount: transferDto.quantity * transferDto.unitPrice,
      description: transferDto.reason,
      status: 'posted',
      postedDate: new Date(),
    });

    const savedOut = await this.inventoryTransactionRepository.save(outTransaction);
    const savedIn = await this.inventoryTransactionRepository.save(inTransaction);

    // Link the transactions
    savedOut.refId = savedIn.id;
    savedIn.refId = savedOut.id;
    savedOut.refType = 'transfer_in';
    savedIn.refType = 'transfer_out';

    await this.inventoryTransactionRepository.save([savedOut, savedIn]);

    return [savedOut, savedIn];
  }

  // ==================== HELPERS ====================

  private async generateTransactionNo(tenantId: string, prefix: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    // Find the last transaction number for today
    const lastTransaction = await this.inventoryTransactionRepository.findOne({
      where: {
        tenantId,
        transactionNo: Between(
          `${prefix}${year}${month}${day}0000`,
          `${prefix}${year}${month}${day}9999`,
        ),
      },
      order: {
        transactionNo: 'DESC',
      },
    });

    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionNo.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${year}${month}${day}${String(sequence).padStart(4, '0')}`;
  }

  async recordInventoryOut(
    tenantId: string,
    itemId: string,
    warehouseId: string,
    quantity: number,
    unitPrice: number,
    refId: string,
    refType: string,
    description?: string,
  ): Promise<InventoryTransaction> {
    const transactionNo = await this.generateTransactionNo(tenantId, 'OUT');

    const transaction = this.inventoryTransactionRepository.create({
      tenantId,
      itemId,
      warehouseId,
      transactionType: TransactionType.OUT,
      transactionNo,
      transactionDate: new Date(),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
      refId,
      refType,
      description,
      status: 'posted',
      postedDate: new Date(),
    });

    return await this.inventoryTransactionRepository.save(transaction);
  }

  async recordInventoryIn(
    tenantId: string,
    itemId: string,
    warehouseId: string,
    quantity: number,
    unitPrice: number,
    refId: string,
    refType: string,
    description?: string,
  ): Promise<InventoryTransaction> {
    const transactionNo = await this.generateTransactionNo(tenantId, 'IN');

    const transaction = this.inventoryTransactionRepository.create({
      tenantId,
      itemId,
      warehouseId,
      transactionType: TransactionType.IN,
      transactionNo,
      transactionDate: new Date(),
      quantity,
      unitPrice,
      amount: quantity * unitPrice,
      refId,
      refType,
      description,
      status: 'posted',
      postedDate: new Date(),
    });

    return await this.inventoryTransactionRepository.save(transaction);
  }
}
