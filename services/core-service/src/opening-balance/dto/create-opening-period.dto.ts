import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOpeningPeriodDto {
  @ApiProperty({
    description: 'Tên kỳ khởi tạo',
    example: 'Kỳ đầu năm 2024',
  })
  @IsNotEmpty()
  @IsString()
  periodName: string;

  @ApiProperty({
    description: 'Ngày khởi tạo số dư',
    example: '2024-01-01',
  })
  @IsNotEmpty()
  @IsDateString()
  openingDate: string;

  @ApiProperty({
    description: 'Mô tả kỳ khởi tạo',
    required: false,
    example: 'Số dư đầu năm 2024',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
