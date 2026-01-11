import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxIndustryGroup } from './entities/tax-industry-group.entity';
import { TaxIndustryGroupResponseDto } from './dto/tax-industry-group-response.dto';

@Injectable()
export class TaxIndustryGroupsService {
  private readonly logger = new Logger(TaxIndustryGroupsService.name);

  constructor(
    @InjectRepository(TaxIndustryGroup)
    private readonly repo: Repository<TaxIndustryGroup>,
  ) {}

  async findAll(): Promise<TaxIndustryGroupResponseDto[]> {
    this.logger.log('Fetching all tax industry groups');
    const rows = await this.repo.find({ order: { code: 'ASC' } });
    return rows.map(r => ({
      id: r.id,
      code: r.code,
      name: r.name,
      groupName: r.groupName,
      vatRate: r.vatRate ? Number(r.vatRate) : null,
      pitRate: r.pitRate ? Number(r.pitRate) : null,
    }));
  }

  async findByCode(code: string): Promise<TaxIndustryGroup | null> {
    return this.repo.findOne({ where: { code } });
  }
}
