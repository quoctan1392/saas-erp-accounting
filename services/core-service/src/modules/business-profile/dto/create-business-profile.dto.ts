import { IsEnum, IsString, IsNotEmpty, IsArray, IsDate, IsBoolean, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessType, AccountingRegime, TaxCalculationMethod, TaxFrequency, InventoryMethod } from '../entities/business-profile.entity';

export class CreateBusinessProfileDto {
  @IsEnum(BusinessType)
  @IsNotEmpty()
  type: BusinessType;

  @IsString()
  @IsNotEmpty()
  taxNumber: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  identityNumber: string;

  @IsString()
  @IsNotEmpty()
  fieldsOfOperation: string;

  @IsArray()
  @IsString({ each: true })
  sector: string[];

  @IsEnum(AccountingRegime)
  @IsNotEmpty()
  accountingRegime: AccountingRegime;

  @IsDate()
  @Type(() => Date)
  startDataDate: Date;

  @IsEnum(TaxCalculationMethod)
  @IsNotEmpty()
  taxCalculationMethod: TaxCalculationMethod;

  @IsString()
  @IsOptional()
  accountingCurrency?: string = 'VND';

  @IsEnum(TaxFrequency)
  @IsNotEmpty()
  taxFrequency: TaxFrequency;

  @IsBoolean()
  @IsOptional()
  useInvoiceMachine?: boolean = false;

  @IsEnum(InventoryMethod)
  @IsNotEmpty()
  inventoryMethod: InventoryMethod;

  @IsNumber()
  @IsOptional()
  initialCashOnHand?: number = 0;

  @IsNumber()
  @IsOptional()
  initialBankBalance?: number = 0;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
