import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxIndustryGroup } from './entities/tax-industry-group.entity';
import { TaxIndustryGroupsService } from './tax-industry-groups.service';
import { TaxIndustryGroupsController } from './tax-industry-groups.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TaxIndustryGroup])],
  providers: [TaxIndustryGroupsService],
  controllers: [TaxIndustryGroupsController],
  exports: [TaxIndustryGroupsService],
})
export class TaxIndustryGroupsModule {}
