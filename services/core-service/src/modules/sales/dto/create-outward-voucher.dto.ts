import { IsNotEmpty, IsString, IsDate, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOutwardVoucherDetailDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

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
  unitPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  inventoryAccountId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  cogsAccountId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateOutwardVoucherDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

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

  @ApiProperty({ type: [CreateOutwardVoucherDetailDto] })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOutwardVoucherDetailDto)
  details: CreateOutwardVoucherDetailDto[];
}
