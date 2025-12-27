import { IsString, IsNotEmpty, IsEnum, IsInt, IsOptional, IsBoolean, Min, Max } from 'class-validator';
import { AccountNature } from '../entities/chart-of-accounts-general.entity';

export class CreateCustomAccountDto {
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @IsString()
  @IsNotEmpty()
  accountName: string;

  @IsEnum(AccountNature)
  @IsNotEmpty()
  accountNature: AccountNature;

  @IsInt()
  @Min(1)
  @Max(4)
  accountLevel: number;

  @IsString()
  @IsOptional()
  parentAccountNumber?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  active?: boolean = true;

  @IsString()
  @IsOptional()
  characteristics?: string;
}
