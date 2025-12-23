import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishInvoiceDto {
  @ApiProperty({ description: 'ID user phát hành' })
  @IsNotEmpty()
  @IsString()
  publishedBy: string;
}

export class CancelInvoiceDto {
  @ApiProperty({ description: 'ID user hủy' })
  @IsNotEmpty()
  @IsString()
  cancelledBy: string;

  @ApiProperty({ description: 'Lý do hủy' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  cancelReason: string;
}

export class SendInvoiceEmailDto {
  @ApiProperty({ description: 'Email người nhận' })
  @IsNotEmpty()
  @IsString()
  toEmail: string;

  @ApiProperty({ description: 'Tiêu đề email', required: false })
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Nội dung email', required: false })
  @IsString()
  message?: string;
}
