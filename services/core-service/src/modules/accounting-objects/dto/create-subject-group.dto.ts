import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubjectGroupDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
