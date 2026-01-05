import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateIf,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateOpeningBalanceDetailDto } from './create-opening-balance-detail.dto';

export class CreateOpeningBalanceDto {
  @ApiProperty({
    description: 'ID kỳ khởi tạo',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  periodId: string;

  @ApiProperty({
    description: 'ID loại tiền',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  currencyId: string;

  @ApiProperty({
    description: 'ID tài khoản kế toán',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({
    description: 'Dư Nợ (>= 0)',
    example: 10000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debitBalance: number;

  @ApiProperty({
    description: 'Dư Có (>= 0)',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditBalance: number;

  @ApiProperty({
    description: 'Có chi tiết hay không',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hasDetails?: boolean;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Tiền mặt đầu kỳ',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

// Batch DTO
export class BatchOpeningBalanceItemDto {
  @ApiProperty({
    description: 'ID tài khoản kế toán',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  accountId: string;

  @ApiProperty({
    description: 'Số tài khoản (optional - auto fetch)',
    example: '111',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    description: 'Tên tài khoản (optional - auto fetch)',
    example: 'Tiền mặt',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountName?: string;

  @ApiProperty({
    description: 'Dư Nợ (>= 0)',
    example: 10000000,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debitBalance: number;

  @ApiProperty({
    description: 'Dư Có (>= 0)',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  creditBalance: number;

  @ApiProperty({
    description: 'Có chi tiết hay không',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hasDetails?: boolean;

  @ApiProperty({
    description: 'Ghi chú',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Chi tiết số dư',
    type: [CreateOpeningBalanceDetailDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOpeningBalanceDetailDto)
  details?: Omit<CreateOpeningBalanceDetailDto, 'balanceId'>[];
}

export class BatchCreateOpeningBalanceDto {
  @ApiProperty({
    description: 'ID kỳ khởi tạo',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  periodId: string;

  @ApiProperty({
    description: 'ID loại tiền',
    example: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  currencyId: string;

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
    description: 'Danh sách số dư cần tạo/cập nhật',
    type: [BatchOpeningBalanceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchOpeningBalanceItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(100, { message: 'Tối đa 100 records mỗi batch' })
  balances: BatchOpeningBalanceItemDto[];
}

// Response DTO
export class BatchResultItemDto {
  @ApiProperty()
  accountNumber: string;

  @ApiProperty()
  accountName: string;

  @ApiProperty({
    enum: ['created', 'updated', 'failed'],
  })
  status: 'created' | 'updated' | 'failed';

  @ApiProperty({
    required: false,
  })
  balanceId?: string;

  @ApiProperty({
    required: false,
  })
  error?: string;
}

export class BatchCreateOpeningBalanceResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  created: number;

  @ApiProperty()
  updated: number;

  @ApiProperty()
  failed: number;

  @ApiProperty()
  total: number;

  @ApiProperty({
    type: [BatchResultItemDto],
  })
  results: BatchResultItemDto[];

  @ApiProperty({
    required: false,
    type: [Object],
  })
  errors?: Array<{
    field: string;
    message: string;
    accountNumber?: string;
  }>;
}
