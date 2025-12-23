import { IsEnum, IsUUID, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../entities/inventory-transaction.entity';

export class CreateInventoryTransactionDto {
  @IsUUID()
  itemId: string;

  @IsUUID()
  warehouseId: string;

  @IsEnum(TransactionType)
  transactionType: TransactionType;

  @IsString()
  transactionNo: string;

  @IsDateString()
  transactionDate: Date;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  targetWarehouseId?: string;

  @IsOptional()
  @IsUUID()
  refId?: string;

  @IsOptional()
  @IsString()
  refType?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
