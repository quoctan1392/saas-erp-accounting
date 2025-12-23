import { IsUUID, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdjustInventoryDto {
  @IsUUID()
  itemId: string;

  @IsUUID()
  warehouseId: string;

  @IsNumber()
  @Type(() => Number)
  adjustmentQuantity: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitPrice: number;

  @IsString()
  reason: string;
}
