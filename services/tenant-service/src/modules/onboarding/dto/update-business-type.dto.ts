import { IsEnum, IsNotEmpty } from 'class-validator';
import { BusinessType } from '../../tenants/entities/tenant.entity';

export class UpdateBusinessTypeDto {
  @IsEnum(BusinessType)
  @IsNotEmpty()
  businessType: BusinessType;
}
