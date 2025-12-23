import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateInvoiceDto, CreateInvoiceDetailDto } from './create-invoice.dto';

export class UpdateInvoiceDetailDto extends PartialType(CreateInvoiceDetailDto) {}

export class UpdateInvoiceDto extends PartialType(
  OmitType(CreateInvoiceDto, ['details'] as const)
) {
  details?: UpdateInvoiceDetailDto[];
}
