import { IsOptional, IsUUID, IsString, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryOpeningBalanceDto {
  @ApiProperty({
    description: 'ID kỳ khởi tạo (required)',
    example: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  periodId?: string;

  @ApiProperty({
    description: 'ID hoặc mã loại tiền (VND, USD, etc.)',
    example: 'VND',
    required: false,
  })
  @IsOptional()
  @IsString()
  currencyId?: string;

  @ApiProperty({
    description: 'Số tài khoản',
    example: '111',
    required: false,
  })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({
    description: 'Lọc theo có chi tiết hay không',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasDetails?: boolean;

  @ApiProperty({
    description: 'Trang hiện tại',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng mỗi trang',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;
}
