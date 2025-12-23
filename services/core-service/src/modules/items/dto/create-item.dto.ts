import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, IsEnum, IsArray, Min } from 'class-validator';
import { ItemType } from '../entities/item.entity';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ItemType)
  @IsNotEmpty()
  type: ItemType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  listItemCategoryId?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  minimumStock?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maximumStock?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsString()
  @IsNotEmpty()
  unitId: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sellPrice?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  importTaxRate?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  exportTaxRate?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  vatRate?: number = 0;

  @IsNumber()
  @Min(0)
  @IsOptional()
  specialConsumptionTaxRate?: number = 0;

  @IsString()
  @IsOptional()
  discountAccountId?: string;

  @IsString()
  @IsOptional()
  saleOffAccountId?: string;

  @IsString()
  @IsOptional()
  inventoryAccountId?: string;

  @IsString()
  @IsOptional()
  revenueAccountId?: string;

  @IsString()
  @IsOptional()
  cogsAccountId?: string;

  @IsString()
  @IsOptional()
  purchaseAccountId?: string;

  @IsString()
  @IsOptional()
  purchaseDescription?: string;

  @IsString()
  @IsOptional()
  saleDescription?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  listImageUrl?: string[];

  @IsString()
  @IsOptional()
  defaultImageUrl?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsNumber()
  @IsOptional()
  length?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  warrantyPeriod?: number;

  @IsString()
  @IsOptional()
  warrantyType?: string;
}
