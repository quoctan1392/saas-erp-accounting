import { IsNotEmpty, IsString, IsDate, IsEnum, IsBoolean, IsNumber, IsOptional, IsArray, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSaleVoucherDetailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPriceOc: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amountOc: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatRate?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exportTaxRate?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exportTaxAmount?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  revenueAccountId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  discountAccountId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  vatAccountId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateSaleVoucherDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  transactionNo: string;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  transactionDate: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  transactionCode: string;

  @ApiProperty({ enum: ['pay_later', 'pay_now'], default: 'pay_later' })
  @IsNotEmpty()
  @IsEnum(['pay_later', 'pay_now'])
  paymentType: string;

  @ApiProperty({ enum: ['cash', 'bank_transfer'], default: 'cash' })
  @IsNotEmpty()
  @IsEnum(['cash', 'bank_transfer'])
  paymentMethod: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSaleWithOutward?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isSaleWithInvoice?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  accountObjectId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  accountObjectName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountObjectAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountObjectTaxCode?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  currencyId: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalSaleAmountOc: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalSaleAmount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscountAmount?: number;

  @ApiProperty({ enum: ['not_discount', 'by_item', 'by_invoice_amount', 'by_percent'], default: 'not_discount' })
  @IsNotEmpty()
  @IsEnum(['not_discount', 'by_item', 'by_invoice_amount', 'by_percent'])
  discountType: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVatAmount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalExportTaxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountRate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachedFileIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateSaleVoucherDetailDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleVoucherDetailDto)
  details: CreateSaleVoucherDetailDto[];
}
