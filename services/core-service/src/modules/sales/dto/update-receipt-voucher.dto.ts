import { PartialType } from '@nestjs/swagger';
import { CreateReceiptVoucherDto } from './create-receipt-voucher.dto';

export class UpdateReceiptVoucherDto extends PartialType(CreateReceiptVoucherDto) {}
