import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountingObjectDto } from './create-accounting-object.dto';

export class UpdateAccountingObjectDto extends PartialType(CreateAccountingObjectDto) {}
