import { IsUUID, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferInventoryDto {
  @IsUUID()
  itemId: string;

  @IsUUID()
  fromWarehouseId: string;

  @IsUUID()
  toWarehouseId: string;

  @IsNumber()
  @Min(0.0001)
  @Type(() => Number)
  quantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsString()
  reason: string;
}
