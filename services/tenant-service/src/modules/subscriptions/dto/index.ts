import { IsString, IsNotEmpty, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'uuid-of-tenant' })
  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @ApiProperty({ example: 'starter' })
  @IsString()
  @IsNotEmpty()
  plan: string;

  @ApiProperty({ enum: BillingCycle })
  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @ApiProperty({ example: 29.99 })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
