import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessProfileController } from './business-profile.controller';
import { BusinessProfileService } from './business-profile.service';
import { BusinessProfile } from './entities/business-profile.entity';
import { EInvoiceProvider } from './entities/einvoice-provider.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessProfile, EInvoiceProvider])],
  controllers: [BusinessProfileController],
  providers: [BusinessProfileService],
  exports: [BusinessProfileService],
})
export class BusinessProfileModule {}
