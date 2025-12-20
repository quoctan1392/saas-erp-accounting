import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { BusinessType } from '../../tenants/entities/tenant.entity';

export class SaveBusinessInfoDto {
  @IsEnum(BusinessType)
  @IsNotEmpty()
  businessType: BusinessType;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10}$|^[0-9]{13}$/, {
    message: 'Mã số thuế phải là 10 hoặc 13 chữ số',
  })
  taxId: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Tên doanh nghiệp phải có ít nhất 2 ký tự' })
  @MaxLength(255, { message: 'Tên doanh nghiệp không được quá 255 ký tự' })
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Địa chỉ phải có ít nhất 10 ký tự' })
  @MaxLength(500, { message: 'Địa chỉ không được quá 500 ký tự' })
  registeredAddress: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Tên chủ hộ/giám đốc không được quá 100 ký tự' })
  ownerName?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[0-9]{12}$/, {
    message: 'CCCD phải là 12 chữ số',
  })
  nationalId?: string;

  // DNTN specific fields
  @IsString()
  @IsOptional()
  @MaxLength(13, { message: 'Mã doanh nghiệp không được quá 13 ký tự' })
  businessCode?: string;

  @IsDateString()
  @IsOptional()
  establishmentDate?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  employeeCount?: number;

  @IsBoolean()
  @IsOptional()
  taxInfoAutoFilled?: boolean;
}
