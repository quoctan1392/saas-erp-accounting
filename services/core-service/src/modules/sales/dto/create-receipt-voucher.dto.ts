import { IsNotEmpty, IsString, IsDate, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReceiptVoucherDetailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  debitAccountId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  creditAccountId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateReceiptVoucherDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  saleVoucherRefId?: string;

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
  @IsUUID()
  accountObjectId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [CreateReceiptVoucherDetailDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReceiptVoucherDetailDto)
  details: CreateReceiptVoucherDetailDto[];
}
