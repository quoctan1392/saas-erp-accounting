import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingObjectsController, SubjectGroupsController } from './accounting-objects.controller';
import { AccountingObjectsService } from './accounting-objects.service';
import { AccountingObject } from './entities/accounting-object.entity';
import { SubjectGroup } from './entities/subject-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountingObject, SubjectGroup])],
  controllers: [AccountingObjectsController, SubjectGroupsController],
  providers: [AccountingObjectsService],
  exports: [AccountingObjectsService],
})
export class AccountingObjectsModule {}
