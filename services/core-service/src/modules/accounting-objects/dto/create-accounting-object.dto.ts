import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsArray, IsEmail } from 'class-validator';

export class CreateAccountingObjectDto {
  @IsString()
  @IsNotEmpty()
  accountObjectCode: string;

  @IsString()
  @IsNotEmpty()
  accountObjectName: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  isCustomer?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isVendor?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isEmployee?: boolean = false;

  @IsBoolean()
  @IsOptional()
  isLocalObject?: boolean = true;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;

  @IsString()
  @IsOptional()
  subjectGroupId?: string;

  @IsString()
  @IsOptional()
  legalRepresentative?: string;

  @IsString()
  @IsOptional()
  companyTaxCode?: string;

  @IsString()
  @IsOptional()
  payAccountId?: string;

  @IsString()
  @IsOptional()
  receiveAccountId?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;

  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  listBankAccountIds?: string[];

  @IsString()
  @IsOptional()
  identityNumber?: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  taxCode?: string;
}
