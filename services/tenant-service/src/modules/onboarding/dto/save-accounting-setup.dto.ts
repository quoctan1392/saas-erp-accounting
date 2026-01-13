import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class SaveAccountingSetupDto {
  @IsString()
  @IsOptional()
  dataStartDate?: string;

  // HKD fields
  @IsString()
  @IsOptional()
  taxFilingFrequency?: string;

  @IsBoolean()
  @IsOptional()
  usePOSDevice?: boolean;

  @IsString()
  @IsOptional()
  taxIndustryGroup?: string;

  // DNTN fields
  @IsString()
  @IsOptional()
  accountingRegime?: string;

  @IsString()
  @IsOptional()
  taxCalculationMethod?: string;

  @IsString()
  @IsOptional()
  baseCurrency?: string;

  @IsBoolean()
  @IsOptional()
  hasForeignCurrency?: boolean;

  @IsString()
  @IsOptional()
  inventoryValuationMethod?: string;
}
