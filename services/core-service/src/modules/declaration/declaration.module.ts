import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeclarationController } from './declaration.controller';
import { DeclarationService } from './declaration.service';
import { AccountingObject } from '../accounting-objects/entities/accounting-object.entity';
import { Item } from '../items/entities/item.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountingObject, Item, Warehouse]),
  ],
  controllers: [DeclarationController],
  providers: [DeclarationService],
  exports: [DeclarationService],
})
export class DeclarationModule {}
