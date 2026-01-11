import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Industry } from './entities/industry.entity';
import { IndustryResponseDto } from './dto/industry-response.dto';

@Injectable()
export class IndustriesService {
  private readonly logger = new Logger(IndustriesService.name);

  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  async findAll(): Promise<IndustryResponseDto[]> {
    this.logger.log('Fetching all industries');
    
    const industries = await this.industryRepository.find({
      order: { code: 'ASC' },
    });

    return industries.map(industry => ({
      id: industry.id,
      code: industry.code,
      name: industry.name,
      displayText: industry.displayText,
    }));
  }

  async findByCode(code: string): Promise<Industry | null> {
    return this.industryRepository.findOne({ where: { code } });
  }
}
