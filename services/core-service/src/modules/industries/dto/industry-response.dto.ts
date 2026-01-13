import { ApiProperty } from '@nestjs/swagger';

export class IndustryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '1' })
  code: string;

  @ApiProperty({ example: 'Dịch vụ chăm sóc sức khỏe, sắc đẹp' })
  name: string;

  @ApiProperty({ example: '1 - Dịch vụ chăm sóc sức khỏe, sắc đẹp' })
  displayText: string;
}
