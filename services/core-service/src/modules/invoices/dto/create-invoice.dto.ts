import { 
  IsNotEmpty, 
  IsString, 
  IsDate, 
  IsEnum, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  ValidateNested, 
  IsUUID, 
  Min, 
  Max,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '../entities/invoice.entity';

export class CreateInvoiceDetailDto {
  @ApiProperty({ description: 'ID hàng hóa/dịch vụ' })
  @IsNotEmpty()
  @IsUUID()
  itemId: string;

  @ApiProperty({ description: 'Mã hàng hóa' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  itemCode: string;

  @ApiProperty({ description: 'Tên hàng hóa' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  itemName: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'ID đơn vị tính' })
  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'Tên đơn vị tính' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  unitName: string;

  @ApiProperty({ description: 'Số lượng' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  quantity: number;

  @ApiProperty({ description: 'Đơn giá' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ description: 'Thành tiền (quantity * unitPrice)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Tỷ lệ chiết khấu (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountRate?: number;

  @ApiPropertyOptional({ description: 'Số tiền chiết khấu' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Thuế suất GTGT (%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vatRate?: number;

  @ApiPropertyOptional({ description: 'Tiền thuế GTGT' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  vatAmount?: number;

  @ApiProperty({ description: 'Tổng cộng (sau thuế)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ description: 'Số thứ tự dòng' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  lineNumber: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Mẫu số hóa đơn', example: '01GTKT0/001' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  invoiceForm: string;

  @ApiProperty({ description: 'Ký hiệu hóa đơn', example: 'AA/24E' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  invoiceSign: string;

  @ApiProperty({ description: 'Ngày hóa đơn' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  invoiceDate: Date;

  @ApiPropertyOptional({ description: 'ID chứng từ liên quan (sale_voucher, etc)' })
  @IsOptional()
  @IsUUID()
  refId?: string;

  @ApiPropertyOptional({ description: 'Loại chứng từ liên quan', example: 'sale_voucher' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  refType?: string;

  @ApiProperty({ description: 'ID đối tượng (khách hàng/người mua)' })
  @IsNotEmpty()
  @IsUUID()
  accountObjectId: string;

  @ApiProperty({ description: 'Tên đối tượng' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  accountObjectName: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  accountObjectAddress?: string;

  @ApiPropertyOptional({ description: 'Mã số thuế' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountObjectTaxCode?: string;

  @ApiPropertyOptional({ description: 'CMND/CCCD (nếu cá nhân)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  identityNumber?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phoneNumber?: string;

  @ApiProperty({ 
    description: 'Phương thức thanh toán', 
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'ID loại tiền' })
  @IsNotEmpty()
  @IsUUID()
  currencyId: string;

  @ApiPropertyOptional({ description: 'Tỷ giá', default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @ApiProperty({ description: 'Tổng tiền hàng' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiPropertyOptional({ description: 'Tổng chiết khấu', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalDiscountAmount?: number;

  @ApiPropertyOptional({ description: 'Tổng thuế GTGT', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVatAmount?: number;

  @ApiProperty({ description: 'Tổng thanh toán (sau thuế)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalPayment: number;

  @ApiPropertyOptional({ description: 'ID nhà cung cấp hóa đơn điện tử' })
  @IsOptional()
  @IsUUID()
  einvoiceProviderId?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ 
    description: 'Danh sách chi tiết hóa đơn',
    type: [CreateInvoiceDetailDto],
  })
  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceDetailDto)
  details: CreateInvoiceDetailDto[];
}
