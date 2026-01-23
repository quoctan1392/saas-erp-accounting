import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehousesService } from './warehouses.service';
import { WarehousesController } from './warehouses.controller';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseItem } from './entities/warehouse-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, WarehouseItem])],
  controllers: [WarehousesController],
  providers: [WarehousesService],
  exports: [WarehousesService, TypeOrmModule],
})
export class WarehousesModule {}
