import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpeningBalanceDetailDto {
  @ApiProperty({
    description: 'ID số dư tài khoản',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  balanceId: string;

  @ApiProperty({
    description: 'ID đơn vị',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiProperty({
    description: 'ID khoản mục chi phí',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  costItemId?: string;

  @ApiProperty({
    description: 'ID đối tượng tổng hợp chi phí',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  costObjectId?: string;

  @ApiProperty({
    description: 'ID công trình',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({
    description: 'ID đơn đặt hàng',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  salesOrderId?: string;

  @ApiProperty({
    description: 'ID đơn mua hàng',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  purchaseOrderId?: string;

  @ApiProperty({
    description: 'ID hợp đồng bán',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  salesContractId?: string;

  @ApiProperty({
    description: 'ID hợp đồng mua',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  purchaseContractId?: string;

  @ApiProperty({
    description: 'ID mã thống kê',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  statisticalCodeId?: string;

  @ApiProperty({
    description: 'ID đối tượng (KH, NCC, NV)',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  accountObjectId?: string;

  @ApiProperty({
    description: 'Dư Nợ chi tiết (>= 0)',
    example: 5000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debitBalance: number;

  @ApiProperty({
    description: 'Dư Có chi tiết (>= 0)',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditBalance: number;

  @ApiProperty({
    description: 'Diễn giải',
    example: 'Công nợ khách hàng A',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

// Batch Detail DTO
export class BatchCreateOpeningBalanceDetailsDto {
  @ApiProperty({
    description: 'ID số dư tài khoản',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  balanceId: string;

  @ApiProperty({
    description: 'Chế độ xử lý lỗi',
    enum: ['fail-fast', 'continue-on-error'],
    example: 'fail-fast',
    required: false,
  })
  @IsOptional()
  @IsEnum(['fail-fast', 'continue-on-error'])
  mode?: 'fail-fast' | 'continue-on-error';

  @ApiProperty({
    description: 'Danh sách chi tiết số dư',
    type: [CreateOpeningBalanceDetailDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningBalanceDetailDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(200, { message: 'Tối đa 200 records mỗi batch' })
  details: Omit<CreateOpeningBalanceDetailDto, 'balanceId'>[];
}
