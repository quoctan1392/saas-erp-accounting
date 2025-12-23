import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsController, ItemCategoriesController, UnitsController } from './items.controller';
import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { ItemCategory } from './entities/item-category.entity';
import { Unit } from './entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, ItemCategory, Unit])],
  controllers: [ItemsController, ItemCategoriesController, UnitsController],
  providers: [ItemsService],
  exports: [ItemsService],
})
export class ItemsModule {}
