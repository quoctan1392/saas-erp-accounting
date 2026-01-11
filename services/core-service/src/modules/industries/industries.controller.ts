import { Controller, Get, Logger } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IndustriesService } from './industries.service';
import { IndustryResponseDto } from './dto/industry-response.dto';

@ApiTags('industries')
@Controller('industries')
export class IndustriesController {
  private readonly logger = new Logger(IndustriesController.name);

  constructor(private readonly industriesService: IndustriesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all industries' })
  @ApiResponse({
    status: 200,
    description: 'Returns all industries',
    type: [IndustryResponseDto],
  })
  async findAll(): Promise<IndustryResponseDto[]> {
    this.logger.log('GET /industries');
    return this.industriesService.findAll();
  }
}
