import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomAccountDto } from './create-custom-account.dto';

export class UpdateCustomAccountDto extends PartialType(CreateCustomAccountDto) {}
