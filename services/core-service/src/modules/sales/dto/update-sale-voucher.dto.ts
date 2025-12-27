import { PartialType } from '@nestjs/swagger';
import { CreateSaleVoucherDto } from './create-sale-voucher.dto';

export class UpdateSaleVoucherDto extends PartialType(CreateSaleVoucherDto) {}
