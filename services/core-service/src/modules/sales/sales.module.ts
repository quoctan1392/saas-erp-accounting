import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { SaleVoucher } from './entities/sale-voucher.entity';
import { SaleVoucherDetail } from './entities/sale-voucher-detail.entity';
import { OutwardVoucher } from './entities/outward-voucher.entity';
import { OutwardVoucherDetail } from './entities/outward-voucher-detail.entity';
import { ReceiptVoucher } from './entities/receipt-voucher.entity';
import { ReceiptVoucherDetail } from './entities/receipt-voucher-detail.entity';

// Services
import { SaleVoucherService } from './services/sale-voucher.service';
import { OutwardVoucherService } from './services/outward-voucher.service';
import { ReceiptVoucherService } from './services/receipt-voucher.service';

// Controllers
import { SaleVoucherController } from './controllers/sale-voucher.controller';
import { OutwardVoucherController } from './controllers/outward-voucher.controller';
import { ReceiptVoucherController } from './controllers/receipt-voucher.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SaleVoucher,
      SaleVoucherDetail,
      OutwardVoucher,
      OutwardVoucherDetail,
      ReceiptVoucher,
      ReceiptVoucherDetail,
    ]),
  ],
  controllers: [
    SaleVoucherController,
    OutwardVoucherController,
    ReceiptVoucherController,
  ],
  providers: [
    SaleVoucherService,
    OutwardVoucherService,
    ReceiptVoucherService,
  ],
  exports: [
    SaleVoucherService,
    OutwardVoucherService,
    ReceiptVoucherService,
  ],
})
export class SalesModule {}
