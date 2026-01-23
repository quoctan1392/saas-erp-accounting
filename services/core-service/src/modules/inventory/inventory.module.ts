import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { Item } from '../items/entities/item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { ItemsModule } from '../items/items.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryTransaction,
      Item,
      Warehouse,
    ]),
    forwardRef(() => ItemsModule),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
