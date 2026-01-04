import { PartialType } from '@nestjs/swagger';
import { CreateOpeningPeriodDto } from './create-opening-period.dto';

export class UpdateOpeningPeriodDto extends PartialType(CreateOpeningPeriodDto) {}
