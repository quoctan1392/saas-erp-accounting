import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpeningBalanceController } from './opening-balance.controller';
import { OpeningBalanceService } from './opening-balance.service';
import { OpeningPeriod } from './entities/opening-period.entity';
import { OpeningBalance } from './entities/opening-balance.entity';
import { OpeningBalanceDetail } from './entities/opening-balance-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OpeningPeriod, OpeningBalance, OpeningBalanceDetail])],
  controllers: [OpeningBalanceController],
  providers: [OpeningBalanceService],
  exports: [OpeningBalanceService],
})
export class OpeningBalanceModule {}
