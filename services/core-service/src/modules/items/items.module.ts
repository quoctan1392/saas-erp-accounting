import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController, ItemCategoriesController, UnitsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { ItemCategory } from './entities/item-category.entity';
import { Unit } from './entities/unit.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Item, ItemCategory, Unit]),
    forwardRef(() => InventoryModule),
    WarehousesModule,
  ],
  controllers: [ItemsController, ItemCategoriesController, UnitsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
