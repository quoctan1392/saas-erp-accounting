import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBankAccountDto {
  @ApiProperty({ description: 'Tên ngân hàng' })
  @IsString()
  bankName: string;

  @ApiProperty({ description: 'Số tài khoản' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'Số dư ban đầu', default: 0 })
  @IsNumber()
  @Min(0)
  initialBalance: number;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
