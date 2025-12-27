import { PartialType } from '@nestjs/swagger';
import { CreateOutwardVoucherDto } from './create-outward-voucher.dto';

export class UpdateOutwardVoucherDto extends PartialType(CreateOutwardVoucherDto) {}
