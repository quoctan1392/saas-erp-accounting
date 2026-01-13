import { IsString, IsOptional } from 'class-validator';

export class SaveBusinessSectorDto {
  @IsString()
  sector: string;

  @IsString()
  @IsOptional()
  industryCode?: string;

  @IsString()
  @IsOptional()
  industryName?: string;
}
