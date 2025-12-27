import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChartOfAccountsController } from './chart-of-accounts.controller';
import { ChartOfAccountsService } from './chart-of-accounts.service';
import { ChartOfAccountsGeneral } from './entities/chart-of-accounts-general.entity';
import { ChartOfAccountsCustom } from './entities/chart-of-accounts-custom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChartOfAccountsGeneral, ChartOfAccountsCustom])],
  controllers: [ChartOfAccountsController],
  providers: [ChartOfAccountsService],
  exports: [ChartOfAccountsService],
})
export class ChartOfAccountsModule {}
