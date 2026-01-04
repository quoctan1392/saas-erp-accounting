import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingObject } from '../accounting-objects/entities/accounting-object.entity';
import { Item } from '../items/entities/item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';

export interface DeclarationCounts {
  customers: number;
  suppliers: number;
  warehouses: number;
  products: number;
}

@Injectable()
export class DeclarationService {
  constructor(
    @InjectRepository(AccountingObject)
    private accountingObjectRepository: Repository<AccountingObject>,
    @InjectRepository(Item)
    private itemRepository: Repository<Item>,
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async getCounts(tenantId: string): Promise<DeclarationCounts> {
    // Count customers
    const customers = await this.accountingObjectRepository.count({
      where: {
        tenantId,
        isCustomer: true,
        isDeleted: false,
      },
    });

    // Count suppliers (vendors)
    const suppliers = await this.accountingObjectRepository.count({
      where: {
        tenantId,
        isVendor: true,
        isDeleted: false,
      },
    });

    // Count warehouses
    const warehouses = await this.warehouseRepository.count({
      where: {
        tenantId,
        isDeleted: false,
      },
    });

    // Count products/items
    const products = await this.itemRepository.count({
      where: {
        tenantId,
        isDeleted: false,
      },
    });

    return {
      customers,
      suppliers,
      warehouses,
      products,
    };
  }
}
