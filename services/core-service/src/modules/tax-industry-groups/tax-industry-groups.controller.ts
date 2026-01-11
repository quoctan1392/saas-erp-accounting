import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { TaxIndustryGroupsService } from './tax-industry-groups.service';
import { TaxIndustryGroupResponseDto } from './dto/tax-industry-group-response.dto';

@ApiTags('tax-industry-groups')
@Controller('tax-industry-groups')
export class TaxIndustryGroupsController {
  private readonly logger = new Logger(TaxIndustryGroupsController.name);

  constructor(private readonly svc: TaxIndustryGroupsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all tax industry groups' })
  @ApiResponse({ status: 200, description: 'Returns all tax industry groups', type: [TaxIndustryGroupResponseDto] })
  async findAll(): Promise<TaxIndustryGroupResponseDto[]> {
    this.logger.log('GET /tax-industry-groups');
    return this.svc.findAll();
  }
}
