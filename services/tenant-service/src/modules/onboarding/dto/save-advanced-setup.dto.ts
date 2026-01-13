import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class SaveAdvancedSetupDto {
  @IsBoolean()
  eInvoiceEnabled: boolean;

  @IsString()
  @IsOptional()
  eInvoiceProvider?: string;

  @IsString()
  @IsOptional()
  eInvoiceProviderName?: string;

  @IsString()
  @IsOptional()
  eInvoiceTaxCode?: string;

  @IsString()
  @IsOptional()
  eInvoiceUsername?: string;

  @IsBoolean()
  @IsOptional()
  eInvoiceAutoIssue?: boolean;

  @IsString()
  @IsOptional()
  eInvoiceConnectedAt?: string;
}
